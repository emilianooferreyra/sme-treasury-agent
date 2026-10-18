import { describe, expect, it } from "vitest";
import { InvalidAmountError } from "../../core/money/money";
import type { PaymentLinkBuilder } from "./application/ports";
import {
  ChargeNotFoundError,
  createChargesFeature,
  PaymentSimulationUnavailableError,
} from "./charges-feature";
import { InMemoryChargeRepository } from "./infrastructure/in-memory-charge-repository";
import { SimulatedTransferSource } from "./infrastructure/simulated-transfer-source";

const fakeLink: PaymentLinkBuilder = (charge) => `https://pay.test/${charge.id}`;
const CREATED_AT = new Date("2026-10-17T15:00:00.000Z");
const PAID_AT = new Date("2026-10-17T15:05:00.000Z");

function feature(options: { simulated?: boolean } = { simulated: true }) {
  return createChargesFeature({
    charges: new InMemoryChargeRepository(),
    buildPaymentLink: fakeLink,
    now: () => CREATED_AT,
    ...(options.simulated ? { simulator: new SimulatedTransferSource({ now: () => PAID_AT }) } : {}),
  });
}

const request = {
  requestId: "session-1:turn-1",
  customer: "Juan Pérez",
  description: "2 docenas de medialunas",
  amount: "85000",
};

describe("charges feature", () => {
  it("creates a wARS charge and returns a plain view with its reference and link", async () => {
    const view = await feature().createCharge(request);

    expect(view).toEqual({
      id: "C-0001",
      customer: "Juan Pérez",
      description: "2 docenas de medialunas",
      amount: "85000",
      currency: "wARS",
      status: "pending",
      createdAt: "2026-10-17T15:00:00.000Z",
      paymentLink: "https://pay.test/C-0001",
      created: true,
    });
  });

  it("returns a view that survives a JSON round trip (eve tool outputs must be serializable)", async () => {
    const view = await feature().createCharge({ ...request, amount: "85000.5" });

    expect(JSON.parse(JSON.stringify(view))).toEqual(view);
  });

  it("does not duplicate the charge when the agent retries the same request", async () => {
    const charges = feature();
    await charges.createCharge(request);

    const retry = await charges.createCharge(request);

    expect(retry).toMatchObject({ id: "C-0001", created: false });
  });

  it("rejects an amount that is not a decimal number", async () => {
    await expect(feature().createCharge({ ...request, amount: "85.000,50" })).rejects.toThrow(InvalidAmountError);
  });

  it("finds a charge by reference for the payment page and the card's status", async () => {
    const charges = feature();
    await charges.createCharge(request);

    expect(await charges.getCharge("C-0001")).toMatchObject({ id: "C-0001", status: "pending" });
    expect(await charges.getCharge("C-9999")).toBeUndefined();
  });

  describe("simulated payments", () => {
    it("pays the charge through the same reconciliation real payments use, with receipt data", async () => {
      const charges = feature();
      await charges.createCharge(request);

      const result = await charges.simulatePayment("C-0001");

      expect(result.outcome).toBe("paid");
      expect(result.charge).toMatchObject({
        status: "paid",
        paidAt: "2026-10-17T15:05:00.000Z",
        paidBy: "simulated-1",
      });
      expect(await charges.getCharge("C-0001")).toMatchObject({ status: "paid" });
    });

    it("does not pay twice when the payer presses the button again", async () => {
      const charges = feature();
      await charges.createCharge(request);
      await charges.simulatePayment("C-0001");

      expect((await charges.simulatePayment("C-0001")).outcome).toBe("already-paid");
    });

    it("leaves the charge pending when another pending charge has the same amount", async () => {
      const charges = feature();
      await charges.createCharge(request);
      await charges.createCharge({ ...request, customer: "Ana Gómez" });

      const result = await charges.simulatePayment("C-0002");

      expect(result.outcome).toBe("ambiguous");
      expect(result.charge.status).toBe("pending");
    });

    it("fails for a charge that does not exist", async () => {
      await expect(feature().simulatePayment("C-9999")).rejects.toThrow(ChargeNotFoundError);
    });

    it("is unavailable when the feature runs without a simulator (real payments)", async () => {
      const charges = feature({ simulated: false });
      await charges.createCharge(request);

      await expect(charges.simulatePayment("C-0001")).rejects.toThrow(PaymentSimulationUnavailableError);
    });
  });
});
