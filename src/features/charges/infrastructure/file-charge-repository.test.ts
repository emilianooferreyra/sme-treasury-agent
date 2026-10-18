import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyPayment } from "../domain/charge";
import { aCharge, aTransfer, UNIT } from "../testing/fixtures";
import { FileChargeRepository } from "./file-charge-repository";

describe("FileChargeRepository", () => {
  let dir: string;
  let file: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "charges-"));
    file = join(dir, "charges.json");
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("starts empty when the file does not exist yet", async () => {
    const repository = new FileChargeRepository(file);

    expect(await repository.list()).toEqual([]);
    expect(await repository.findById("C-0001")).toBeUndefined();
  });

  it("keeps every field, including the exact amount in base units that JSON cannot hold as a number", async () => {
    const charge = aCharge({ amount: { amount: 85_000n * UNIT + 1n, currency: "wARS" }, idempotencyKey: "key-1" });
    const paid = applyPayment(charge, aTransfer({ amount: charge.amount }));

    await new FileChargeRepository(file).save(paid);

    expect(await new FileChargeRepository(file).findById("C-0001")).toEqual(paid);
  });

  it("finds a charge by the request that created it", async () => {
    const charge = aCharge({ idempotencyKey: "key-1" });
    await new FileChargeRepository(file).save(charge);

    expect(await new FileChargeRepository(file).findByIdempotencyKey("key-1")).toEqual(charge);
    expect(await new FileChargeRepository(file).findByIdempotencyKey("key-2")).toBeUndefined();
  });

  it("shares charges between instances, as the agent and the web app do", async () => {
    const agentSide = new FileChargeRepository(file);
    const webSide = new FileChargeRepository(file);
    const charge = aCharge();
    await agentSide.save(charge);

    const paid = applyPayment(charge, aTransfer());
    await webSide.save(paid);

    expect(await agentSide.findById("C-0001")).toEqual(paid);
  });

  it("replaces a charge saved with the same id and keeps the others", async () => {
    const repository = new FileChargeRepository(file);
    const first = aCharge({ id: "C-0001" });
    const second = aCharge({ id: "C-0002" });
    await repository.save(first);
    await repository.save(second);

    const paid = applyPayment(first, aTransfer());
    await repository.save(paid);

    expect(await repository.list()).toEqual([paid, second]);
  });
});
