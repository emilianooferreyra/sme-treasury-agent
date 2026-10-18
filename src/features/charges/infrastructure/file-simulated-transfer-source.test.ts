import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { money } from "../../../core/money/money";
import { FileSimulatedTransferSource } from "./file-simulated-transfer-source";

describe("FileSimulatedTransferSource", () => {
  let dir: string;
  let file: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "transfers-"));
    file = join(dir, "simulated-transfers.json");
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("lists nothing before any simulated payment", async () => {
    expect(await new FileSimulatedTransferSource(file).listIncoming()).toEqual([]);
  });

  it("shares simulated payments between instances and keeps the exact amount", async () => {
    const amount = money(85_000n * 10n ** 18n + 1n, "wARS");
    const transfer = await new FileSimulatedTransferSource(file).simulatePayment(amount);

    expect(await new FileSimulatedTransferSource(file).listIncoming()).toEqual([transfer]);
  });

  it("gives unique ids that say the payment is simulated, even across instances", async () => {
    const first = await new FileSimulatedTransferSource(file).simulatePayment(money(1n, "wARS"));
    const second = await new FileSimulatedTransferSource(file).simulatePayment(money(1n, "wARS"));

    expect(first.id).not.toBe(second.id);
    expect([first.id, second.id].every((id) => id.startsWith("simulated-"))).toBe(true);
  });
});
