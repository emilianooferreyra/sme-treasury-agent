import type { Money } from "../../../core/money/money";
import type { PaymentSimulator } from "../application/ports";
import type { IncomingTransfer } from "../domain/charge";

/**
 * Stands in for the chain in tests: no wallet, no real money.
 * Ids start with "simulated-" so a simulated payment can never pass for a real one.
 */
export class SimulatedTransferSource implements PaymentSimulator {
  readonly #transfers: IncomingTransfer[] = [];
  readonly #now: () => Date;

  constructor(options: { now?: () => Date } = {}) {
    this.#now = options.now ?? (() => new Date());
  }

  async simulatePayment(amount: Money): Promise<IncomingTransfer> {
    const transfer = {
      id: `simulated-${this.#transfers.length + 1}`,
      amount,
      receivedAt: this.#now().toISOString(),
    };
    this.#transfers.push(transfer);
    return transfer;
  }

  async listIncoming(): Promise<readonly IncomingTransfer[]> {
    return [...this.#transfers];
  }
}
