import type { Currency } from "../../../core/money/money";
import { readJsonFile, writeJsonFile } from "../../../core/storage/json-file";
import type { ChargeRepository } from "../application/ports";
import type { Charge } from "../domain/charge";

/** A charge as stored on disk: the bigint amount travels as a decimal string. */
type StoredCharge = Omit<Charge, "amount"> & { amount: { amount: string; currency: Currency } };

function toStored(charge: Charge): StoredCharge {
  return { ...charge, amount: { amount: charge.amount.amount.toString(), currency: charge.amount.currency } };
}

function fromStored(stored: StoredCharge): Charge {
  return { ...stored, amount: { amount: BigInt(stored.amount.amount), currency: stored.amount.currency } };
}

/**
 * Keeps charges in a JSON file so the agent and the web app (separate processes) share them.
 * For local demos only: Vercel has no persistent disk. Postgres replaces it when we deploy.
 */
export class FileChargeRepository implements ChargeRepository {
  constructor(private readonly path: string) {}

  async findById(id: string): Promise<Charge | undefined> {
    return (await this.list()).find((charge) => charge.id === id);
  }

  async findByIdempotencyKey(key: string): Promise<Charge | undefined> {
    return (await this.list()).find((charge) => charge.idempotencyKey === key);
  }

  async list(): Promise<readonly Charge[]> {
    return (await readJsonFile<StoredCharge[]>(this.path, [])).map(fromStored);
  }

  async save(charge: Charge): Promise<void> {
    const charges = [...(await this.list())];
    const index = charges.findIndex((existing) => existing.id === charge.id);
    if (index === -1) {
      charges.push(charge);
    } else {
      charges[index] = charge;
    }
    await writeJsonFile(this.path, charges.map(toStored));
  }
}
