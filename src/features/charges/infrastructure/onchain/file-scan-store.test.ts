import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { money } from "../../../../core/money/money";
import { FileScanStore } from "./file-scan-store";

describe("FileScanStore", () => {
  let dir: string;
  let file: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "scan-"));
    file = join(dir, "onchain-scan.json");
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("starts with nothing scanned", async () => {
    expect(await new FileScanStore(file).load()).toEqual({ transfers: [] });
  });

  it("keeps the progress and the exact amounts across instances", async () => {
    const state = {
      lastBlock: 80_385_633n,
      transfers: [
        {
          id: "0x9682:0",
          amount: money(1_029_038_246_175_668_291_471n, "wARS"),
          receivedAt: "2026-10-18T01:10:53.000Z",
        },
      ],
    };
    await new FileScanStore(file).save(state);

    expect(await new FileScanStore(file).load()).toEqual(state);
  });
});
