import type { Address, Hex } from "viem";
import { money } from "../../../../core/money/money";
import type { IncomingTransfer } from "../../domain/charge";

/** A decoded wARS Transfer event to the business address, as the chain reader returns it. */
export type TransferLog = Readonly<{
  transactionHash: Hex;
  logIndex: number;
  blockNumber: bigint;
  /** Seconds since the epoch. */
  blockTimestamp: bigint;
  to: Address;
  value: bigint;
}>;

/** One transaction can carry several transfers, so the log index is part of the id. */
export function toIncomingTransfer(log: TransferLog): IncomingTransfer {
  return {
    id: `${log.transactionHash}:${log.logIndex}`,
    amount: money(log.value, "wARS"),
    receivedAt: new Date(Number(log.blockTimestamp) * 1000).toISOString(),
  };
}

/** Inclusive [from, to] chunks of at most `size` blocks: RPCs cap how many blocks one query spans. */
export function blockRanges(from: bigint, to: bigint, size: bigint): Array<[bigint, bigint]> {
  const ranges: Array<[bigint, bigint]> = [];
  for (let start = from; start <= to; start += size) {
    const end = start + size - 1n;
    ranges.push([start, end < to ? end : to]);
  }
  return ranges;
}
