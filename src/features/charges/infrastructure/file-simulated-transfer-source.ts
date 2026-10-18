import type { Currency, Money } from "../../../core/money/money";
import { readJsonFile, writeJsonFile } from "../../../core/storage/json-file";
import type { PaymentSimulator } from "../application/ports";
import type { IncomingTransfer } from "../domain/charge";

type StoredTransfer = { id: string; amount: { amount: string; currency: Currency }; receivedAt: string };

/**
 * Simulated payments kept in a JSON file, so the payment page and the reconciliation share
 * them across processes and reloads. Ids start with "simulated-": never mistaken for real ones.
 */
export class FileSimulatedTransferSource implements PaymentSimulator {
  readonly #now: () => Date;

  constructor(
    private readonly path: string,
    options: { now?: () => Date } = {},
  ) {
    this.#now = options.now ?? (() => new Date());
  }

  async simulatePayment(amount: Money): Promise<IncomingTransfer> {
    const stored = await readJsonFile<StoredTransfer[]>(this.path, []);
    const transfer = { id: `simulated-${stored.length + 1}`, amount, receivedAt: this.#now().toISOString() };
    stored.push({
      id: transfer.id,
      amount: { amount: amount.amount.toString(), currency: amount.currency },
      receivedAt: transfer.receivedAt,
    });
    await writeJsonFile(this.path, stored);
    return transfer;
  }

  async listIncoming(): Promise<readonly IncomingTransfer[]> {
    const stored = await readJsonFile<StoredTransfer[]>(this.path, []);
    return stored.map(({ id, amount, receivedAt }) => ({
      id,
      amount: { amount: BigInt(amount.amount), currency: amount.currency },
      receivedAt,
    }));
  }
}
