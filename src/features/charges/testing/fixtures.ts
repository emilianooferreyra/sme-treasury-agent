// Test-only helpers: realistic defaults so each test states only what it is about.
import { type Money, money } from "../../../core/money/money";
import { type Charge, createCharge, type IncomingTransfer } from "../domain/charge";

export const UNIT = 10n ** 18n;

/** Whole pesos as wARS base units. */
export const wars = (units: bigint): Money => money(units * UNIT, "wARS");

export function aCharge(overrides: Partial<Parameters<typeof createCharge>[0]> = {}): Charge {
  return createCharge({
    id: "C-0001",
    customer: "Juan Pérez",
    description: "2 docenas de medialunas",
    amount: wars(85_000n),
    createdAt: "2026-10-17T15:00:00.000Z",
    ...overrides,
  });
}

export function aTransfer(overrides: Partial<IncomingTransfer> = {}): IncomingTransfer {
  return {
    id: "tx-1",
    amount: wars(85_000n),
    receivedAt: "2026-10-17T15:05:00.000Z",
    ...overrides,
  };
}
