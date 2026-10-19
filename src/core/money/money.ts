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

const DECIMALS: Record<Currency, number> = {
  wARS: 18,
  wBRL: 18,
};

/**
 * Formats base units as a decimal string in whole units, e.g. 85000.5.
 * `maxFractionDigits` truncates, never rounds: a balance must not show money that is not there.
 */
export function toDecimalString(value: Money, options: { maxFractionDigits?: number } = {}): string {
  const decimals = DECIMALS[value.currency];
  const scale = 10n ** BigInt(decimals);
  const whole = value.amount / scale;
  const digits = (value.amount % scale)
    .toString()
    .padStart(decimals, "0")
    .slice(0, options.maxFractionDigits ?? decimals)
    .replace(/0+$/, "");

  return digits ? `${whole}.${digits}` : whole.toString();
}

/** Formats a decimal string as Argentine pesos, e.g. "85000.5" → "$85.000,50". Never goes through `number`. */
export function formatArs(amount: string): string {
  const [whole = "", fraction] = amount.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return fraction === undefined ? `$${grouped}` : `$${grouped},${fraction.padEnd(2, "0")}`;
}

export class InvalidAmountError extends Error {
  constructor(value: string, currency: Currency) {
    super(`"${value}" is not a valid ${currency} amount`);
    this.name = "InvalidAmountError";
  }
}

const DECIMAL_PATTERN = /^(\d+)(?:\.(\d+))?$/;

/** Parses a decimal string in whole units, e.g. 85000.5, into base units. Never goes through `number`. */
export function fromDecimalString(value: string, currency: Currency): Money {
  const match = DECIMAL_PATTERN.exec(value);
  const decimals = DECIMALS[currency];
  if (!match?.[1] || (match[2] ?? "").length > decimals) {
    throw new InvalidAmountError(value, currency);
  }

  const whole = BigInt(match[1]);
  const fraction = BigInt((match[2] ?? "").padEnd(decimals, "0"));
  return money(whole * 10n ** BigInt(decimals) + fraction, currency);
}

/** One hundredth of a whole unit (a peso cent), in base units. */
export function oneCent(currency: Currency): Money {
  return money(10n ** BigInt(DECIMALS[currency] - 2), currency);
}

export function equals(left: Money, right: Money): boolean {
  if (left.currency !== right.currency) {
    throw new CurrencyMismatchError(left.currency, right.currency);
  }

  return left.amount === right.amount;
}
