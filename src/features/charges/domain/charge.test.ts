import { describe, expect, it } from "vitest";
import { CurrencyMismatchError, money } from "../../../core/money/money";
import { aCharge, aTransfer, UNIT, wars } from "../testing/fixtures";
import {
  applyPayment,
  InvalidChargeAmountError,
  InvalidChargeDetailsError,
  matchTransfer,
  nextChargeReference,
} from "./charge";

describe("Charge", () => {
  it("starts as pending, with who pays, what for and when it was created", () => {
    const charge = aCharge();

    expect(charge).toMatchObject({
      id: "C-0001",
      customer: "Juan Pérez",
      description: "2 docenas de medialunas",
      createdAt: "2026-10-17T15:00:00.000Z",
      status: "pending",
    });
  });

  it("trims the customer and the description", () => {
    expect(aCharge({ customer: "  Juan Pérez ", description: " medialunas  " })).toMatchObject({
      customer: "Juan Pérez",
      description: "medialunas",
    });
  });

  it.each([
    ["customer", { customer: "  " }],
    ["description", { description: "" }],
  ])("rejects a blank %s", (_field, overrides) => {
    expect(() => aCharge(overrides)).toThrow(InvalidChargeDetailsError);
  });

  it("rejects a zero amount", () => {
    expect(() => aCharge({ amount: wars(0n) })).toThrow(InvalidChargeAmountError);
  });

  it("rejects a negative amount", () => {
    expect(() => aCharge({ amount: money(-1n, "wARS") })).toThrow(InvalidChargeAmountError);
  });
});

describe("applyPayment", () => {
  it("marks the charge paid with the transfer that paid it and when it arrived", () => {
    const result = applyPayment(aCharge(), aTransfer({ id: "tx-1", receivedAt: "2026-10-17T15:05:00.000Z" }));

    expect(result).toMatchObject({ status: "paid", paidBy: "tx-1", paidAt: "2026-10-17T15:05:00.000Z" });
  });

  it("stays pending when a different amount arrives", () => {
    const result = applyPayment(aCharge(), aTransfer({ amount: wars(90_000n) }));

    expect(result.status).toBe("pending");
    expect(result.paidBy).toBeUndefined();
  });

  it("keeps the first payment when a paid charge receives another transfer", () => {
    const paid = applyPayment(aCharge(), aTransfer({ id: "tx-1" }));

    expect(applyPayment(paid, aTransfer({ id: "tx-2" })).paidBy).toBe("tx-1");
  });

  it("does not modify the original charge", () => {
    const charge = aCharge();

    applyPayment(charge, aTransfer());

    expect(charge.status).toBe("pending");
  });

  it("rejects a payment in another currency", () => {
    expect(() => applyPayment(aCharge(), aTransfer({ amount: money(85_000n * UNIT, "wBRL") }))).toThrow(
      CurrencyMismatchError,
    );
  });
});

describe("matchTransfer", () => {
  it("matches the only pending charge with the exact amount", () => {
    const charges = [aCharge({ id: "C-0001" }), aCharge({ id: "C-0002", amount: wars(90_000n) })];

    expect(matchTransfer(charges, aTransfer({ amount: wars(90_000n) }))).toEqual({
      kind: "matched",
      charge: charges[1],
    });
  });

  it("reports an unmatched transfer when no pending charge has that amount", () => {
    expect(matchTransfer([aCharge()], aTransfer({ amount: wars(1n) }))).toEqual({ kind: "unmatched" });
  });

  it("never guesses: two pending charges with the same amount make the transfer ambiguous", () => {
    const charges = [aCharge({ id: "C-0001" }), aCharge({ id: "C-0002" })];

    expect(matchTransfer(charges, aTransfer())).toEqual({ kind: "ambiguous", candidates: charges });
  });

  it("ignores charges that are already paid", () => {
    const paid = applyPayment(aCharge(), aTransfer({ id: "tx-0" }));

    expect(matchTransfer([paid], aTransfer({ id: "tx-1" }))).toEqual({ kind: "unmatched" });
  });

  it("treats a transfer in another currency as unmatched instead of failing", () => {
    const transfer = aTransfer({ amount: money(85_000n * UNIT, "wBRL") });

    expect(matchTransfer([aCharge()], transfer)).toEqual({ kind: "unmatched" });
  });
});

describe("nextChargeReference", () => {
  it("starts at C-0001", () => {
    expect(nextChargeReference([])).toBe("C-0001");
  });

  it("follows the highest existing reference, even when charges are out of order", () => {
    const charges = [aCharge({ id: "C-0007" }), aCharge({ id: "C-0002" })];

    expect(nextChargeReference(charges)).toBe("C-0008");
  });

  it("ignores ids that are not charge references", () => {
    expect(nextChargeReference([aCharge({ id: "order-123" })])).toBe("C-0001");
  });

  it("keeps counting past four digits", () => {
    expect(nextChargeReference([aCharge({ id: "C-9999" })])).toBe("C-10000");
  });
});
