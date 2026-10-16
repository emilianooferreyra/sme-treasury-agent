export type Currency = "wARS" | "wBRL";

/** An amount in the token's base units (wARS and wBRL use 18 decimals). */
export type Money = Readonly<{
  amount: bigint;
  currency: Currency;
}>;

export class CurrencyMismatchError extends Error {
  constructor(left: Currency, right: Currency) {
    super(`Cannot compare ${left} with ${right}`);
    this.name = "CurrencyMismatchError";
  }
}

export function money(amount: bigint, currency: Currency): Money {
  return { amount, currency };
}

export function equals(left: Money, right: Money): boolean {
  if (left.currency !== right.currency) {
    throw new CurrencyMismatchError(left.currency, right.currency);
  }

  return left.amount === right.amount;
}
