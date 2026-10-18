import { describe, expect, it } from "vitest";
import { InvalidChargeAmountError, InvalidChargeDetailsError } from "../domain/charge";
import { InMemoryChargeRepository } from "../infrastructure/in-memory-charge-repository";
import { wars } from "../testing/fixtures";
import { createChargeUseCase } from "./create-charge";
import type { PaymentLinkBuilder } from "./ports";

// Test doubles: isolate the use case from Ripio's URL format and from the real clock.
const fakeLink: PaymentLinkBuilder = (charge) => `https://pay.test/${charge.id}`;
const NOW = new Date("2026-10-17T15:00:00.000Z");

function setup() {
  const charges = new InMemoryChargeRepository();
  const createCharge = createChargeUseCase({ charges, buildPaymentLink: fakeLink, now: () => NOW });
  return { charges, createCharge };
}

const request = {
  requestId: "session-1:turn-1",
  customer: "Juan Pérez",
  description: "2 docenas de medialunas",
  amount: wars(85_000n),
};

describe("createCharge use case", () => {
  it("creates the first charge as C-0001, stores it and returns its payment link", async () => {
    const { charges, createCharge } = setup();

    const result = await createCharge(request);

    expect(result.created).toBe(true);
    expect(result.charge).toMatchObject({
      id: "C-0001",
      customer: "Juan Pérez",
      description: "2 docenas de medialunas",
      status: "pending",
      createdAt: "2026-10-17T15:00:00.000Z",
    });
    expect(result.paymentLink).toBe("https://pay.test/C-0001");
    expect(await charges.findById("C-0001")).toEqual(result.charge);
  });

  it("gives each new charge the next reference", async () => {
    const { createCharge } = setup();
    await createCharge(request);

    const second = await createCharge({ ...request, requestId: "session-1:turn-2" });

    expect(second.charge.id).toBe("C-0002");
  });

  it("is safe to retry: the same request returns the same charge instead of a duplicate", async () => {
    const { charges, createCharge } = setup();
    const first = await createCharge(request);

    const retry = await createCharge(request);

    expect(retry.created).toBe(false);
    expect(retry.charge).toEqual(first.charge);
    expect(await charges.list()).toHaveLength(1);
  });

  it("creates two charges when one message asks to charge two customers", async () => {
    const { charges, createCharge } = setup();
    await createCharge(request);

    await createCharge({ ...request, customer: "Ana Gómez" });

    expect(await charges.list()).toHaveLength(2);
  });

  it("creates a new charge when the owner asks again in a new message", async () => {
    const { charges, createCharge } = setup();
    await createCharge(request);

    const again = await createCharge({ ...request, requestId: "session-1:turn-2" });

    expect(again.created).toBe(true);
    expect(await charges.list()).toHaveLength(2);
  });

  it("stores nothing when the amount is invalid", async () => {
    const { charges, createCharge } = setup();

    await expect(createCharge({ ...request, amount: wars(0n) })).rejects.toThrow(InvalidChargeAmountError);
    expect(await charges.list()).toEqual([]);
  });

  it("stores nothing when the customer is missing", async () => {
    const { charges, createCharge } = setup();

    await expect(createCharge({ ...request, customer: " " })).rejects.toThrow(InvalidChargeDetailsError);
    expect(await charges.list()).toEqual([]);
  });
});
