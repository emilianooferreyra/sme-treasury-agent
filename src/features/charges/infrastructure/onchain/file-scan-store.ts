import type { Currency } from "../../../../core/money/money";
import { readJsonFile, writeJsonFile } from "../../../../core/storage/json-file";
import type { ScanState, ScanStore } from "./onchain-transfer-source";

/** On disk, bigints travel as decimal strings. */
type StoredScan = {
  lastBlock?: string;
  transfers: Array<{ id: string; amount: { amount: string; currency: Currency }; receivedAt: string }>;
};

/** Keeps the on-chain scan progress in a JSON file, so a restart resumes where it stopped. */
export class FileScanStore implements ScanStore {
  constructor(private readonly path: string) {}

  async load(): Promise<ScanState> {
    const stored = await readJsonFile<StoredScan>(this.path, { transfers: [] });
    const transfers = stored.transfers.map(({ id, amount, receivedAt }) => ({
      id,
      amount: { amount: BigInt(amount.amount), currency: amount.currency },
      receivedAt,
    }));
    return stored.lastBlock === undefined ? { transfers } : { lastBlock: BigInt(stored.lastBlock), transfers };
  }

  async save(state: ScanState): Promise<void> {
    const stored: StoredScan = {
      ...(state.lastBlock === undefined ? {} : { lastBlock: state.lastBlock.toString() }),
      transfers: state.transfers.map(({ id, amount, receivedAt }) => ({
        id,
        amount: { amount: amount.amount.toString(), currency: amount.currency },
        receivedAt,
      })),
    };
    await writeJsonFile(this.path, stored);
  }
}
