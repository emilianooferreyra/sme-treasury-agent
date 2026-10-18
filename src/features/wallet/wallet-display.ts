import { formatArs, money, toDecimalString } from "../../core/money/money";

/** "0x1a2B3c…9fC3" style: the start and the end are what people compare. */
export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/** A wARS balance (18-decimal base units) as pesos with at most two decimals, truncated. */
export function formatWarsBalance(raw: bigint): string {
  return formatArs(toDecimalString(money(raw, "wARS"), { maxFractionDigits: 2 }));
}
