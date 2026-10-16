import { CurrencyMismatchError, money } from "#core/money/money";
import { describe, expect, it } from "vitest";
import { applyPayment, createCharge } from "./charge";

// wARS has 18 decimals; amounts are bigint in base units.
const WARS = 10n ** 18n;
const wars = (units: bigint) => money(units * WARS, "wARS");

describe("Charge", () => {
  it("starts as pending", () => {
    const charge = createCharge({ id: "order-123", amount: wars(85_000n) });

    expect(charge.status).toBe("pending");
  });

  it("becomes paid when the exact amount arrives", () => {
    const charge = createCharge({ id: "order-123", amount: wars(85_000n) });

    const result = applyPayment(charge, wars(85_000n));

    expect(result.status).toBe("paid");
  });

  it("stays pending when a different amount arrives", () => {
    const charge = createCharge({ id: "order-123", amount: wars(85_000n) });

    const result = applyPayment(charge, wars(90_000n));

    expect(result.status).toBe("pending");
  });

  it("does not modify the original charge", () => {
    const charge = createCharge({ id: "order-123", amount: wars(85_000n) });

    applyPayment(charge, wars(85_000n));

    expect(charge.status).toBe("pending");
  });

  it("rejects a payment in another currency", () => {
    const charge = createCharge({ id: "order-123", amount: wars(85_000n) });

    expect(() => applyPayment(charge, money(85_000n * WARS, "wBRL"))).toThrow(
      CurrencyMismatchError,
    );
  });
});
