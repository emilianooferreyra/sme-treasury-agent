import { decodeEventLog, erc20Abi, type Hex } from "viem";
import { describe, expect, it } from "vitest";
import realLog from "./fixtures/wars-transfer-log.json";
import { blockRanges, type TransferLog, toIncomingTransfer } from "./transfer-log";

/** A real wARS Transfer recorded from Celo mainnet (block 80385095), decoded as the reader does. */
function recordedTransfer(): TransferLog {
  const { args } = decodeEventLog({
    abi: erc20Abi,
    eventName: "Transfer",
    data: realLog.data as Hex,
    topics: realLog.topics as [Hex, ...Hex[]],
  });
  return {
    transactionHash: realLog.transactionHash as Hex,
    logIndex: Number(realLog.logIndex),
    blockNumber: BigInt(realLog.blockNumber),
    blockTimestamp: BigInt(realLog.blockTimestamp),
    to: args.to,
    value: args.value,
  };
}

describe("toIncomingTransfer", () => {
  it("turns a recorded mainnet wARS transfer into an incoming transfer", () => {
    expect(toIncomingTransfer(recordedTransfer())).toEqual({
      id: "0x96826333ef7ebc965b53850659251b13eee6ed17c49887ed63f4090e722511a0:0",
      amount: { amount: 1_029_038_246_175_668_291_471n, currency: "wARS" },
      receivedAt: "2026-10-18T01:10:53.000Z",
    });
  });

  it("tells apart two transfers in the same transaction by their log index", () => {
    const first = toIncomingTransfer(recordedTransfer());
    const second = toIncomingTransfer({ ...recordedTransfer(), logIndex: 1 });

    expect(first.id).not.toBe(second.id);
  });
});

describe("blockRanges", () => {
  it("splits a range into chunks the RPC accepts", () => {
    expect(blockRanges(100n, 349n, 100n)).toEqual([
      [100n, 199n],
      [200n, 299n],
      [300n, 349n],
    ]);
  });

  it("returns one chunk when the range is small", () => {
    expect(blockRanges(100n, 100n, 5000n)).toEqual([[100n, 100n]]);
  });

  it("returns nothing when there are no new blocks", () => {
    expect(blockRanges(101n, 100n, 5000n)).toEqual([]);
  });
});
