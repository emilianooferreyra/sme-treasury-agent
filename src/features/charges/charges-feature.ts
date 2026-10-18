import { fromDecimalString, toDecimalString } from "../../core/money/money";
import { createChargeUseCase } from "./application/create-charge";
import type { ChargeRepository, PaymentLinkBuilder, PaymentSimulator } from "./application/ports";
import { reconcilePaymentsUseCase } from "./application/reconcile-payments";
import type { Charge, ChargeStatus } from "./domain/charge";

export class ChargeNotFoundError extends Error {
  constructor(id: string) {
    super(`Charge ${id} does not exist`);
    this.name = "ChargeNotFoundError";
  }
}

export class PaymentSimulationUnavailableError extends Error {
  constructor() {
    super("Payments can only be simulated in simulated mode");
    this.name = "PaymentSimulationUnavailableError";
  }
}

/** A charge as plain JSON: amounts are decimal strings, never bigint. */
export type ChargeView = Readonly<{
  id: string;
  customer: string;
  description: string;
  amount: string;
  currency: string;
  status: ChargeStatus;
  createdAt: string;
  paymentLink: string;
  /** When the charge was paid, for the receipt. */
  paidAt?: string;
  /** The transfer that paid the charge: the receipt's operation number. */
  paidBy?: string;
  /** Only on creation: false when the same request already created it (a safe retry). */
  created?: boolean;
}>;

export type SimulatedPaymentOutcome = "paid" | "already-paid" | "ambiguous";

/** Wires the charges feature. Phase 1 charges in wARS only. */
export function createChargesFeature(deps: {
  charges: ChargeRepository;
  buildPaymentLink: PaymentLinkBuilder;
  now?: () => Date;
  /** Present only in simulated mode. */
  simulator?: PaymentSimulator;
}) {
  const createCharge = createChargeUseCase({
    charges: deps.charges,
    buildPaymentLink: deps.buildPaymentLink,
    now: deps.now ?? (() => new Date()),
  });

  function toView(charge: Charge): ChargeView {
    return {
      id: charge.id,
      customer: charge.customer,
      description: charge.description,
      amount: toDecimalString(charge.amount),
      currency: charge.amount.currency,
      status: charge.status,
      createdAt: charge.createdAt,
      paymentLink: deps.buildPaymentLink(charge),
      ...(charge.paidAt === undefined ? {} : { paidAt: charge.paidAt }),
      ...(charge.paidBy === undefined ? {} : { paidBy: charge.paidBy }),
    };
  }

  async function findOrFail(id: string): Promise<Charge> {
    const charge = await deps.charges.findById(id);
    if (!charge) {
      throw new ChargeNotFoundError(id);
    }
    return charge;
  }

  return {
    async createCharge(input: {
      requestId: string;
      customer: string;
      description: string;
      /** Whole pesos as a decimal string, e.g. "85000". */
      amount: string;
    }): Promise<ChargeView> {
      const result = await createCharge({ ...input, amount: fromDecimalString(input.amount, "wARS") });
      return { ...toView(result.charge), created: result.created };
    },

    async getCharge(id: string): Promise<ChargeView | undefined> {
      const charge = await deps.charges.findById(id);
      return charge && toView(charge);
    },

    /** Fakes the payer's transfer, then runs the same reconciliation real transfers go through. */
    async simulatePayment(id: string): Promise<{ charge: ChargeView; outcome: SimulatedPaymentOutcome }> {
      const simulator = deps.simulator;
      if (!simulator) {
        throw new PaymentSimulationUnavailableError();
      }

      const charge = await findOrFail(id);
      if (charge.status === "paid") {
        return { charge: toView(charge), outcome: "already-paid" };
      }

      await simulator.simulatePayment(charge.amount);
      const report = await reconcilePaymentsUseCase({ charges: deps.charges, transfers: simulator })();
      const updated = await findOrFail(id);
      return { charge: toView(updated), outcome: report.paid.includes(id) ? "paid" : "ambiguous" };
    },
  };
}

export type ChargesFeature = ReturnType<typeof createChargesFeature>;
