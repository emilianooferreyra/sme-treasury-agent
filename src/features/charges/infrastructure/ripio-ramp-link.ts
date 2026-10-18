import { type Currency, toDecimalString } from "../../../core/money/money";
import type { PaymentLinkBuilder } from "../application/ports";

const RAMP_URL = "https://ramp.ripio.com/";
const CELO_CHAIN_ID = "42220";

// Ripio ramp parameters per currency. Only wARS (Argentina) is supported in phase 1.
const RAMP_TOKENS: Partial<Record<Currency, { country: string; token: string }>> = {
  wARS: { country: "AR", token: "WARS" },
};

export class UnsupportedRampCurrencyError extends Error {
  constructor(currency: Currency) {
    super(`The Ripio ramp is not configured for ${currency}`);
    this.name = "UnsupportedRampCurrencyError";
  }
}

export function ripioRampLinkBuilder(config: { recipient: string }): PaymentLinkBuilder {
  return (charge) => {
    const ramp = RAMP_TOKENS[charge.amount.currency];
    if (!ramp) {
      throw new UnsupportedRampCurrencyError(charge.amount.currency);
    }

    const params = new URLSearchParams({
      country: ramp.country,
      chain: CELO_CHAIN_ID,
      token: ramp.token,
      amount: toDecimalString(charge.amount),
      address: config.recipient,
    });

    return `${RAMP_URL}?${params}`;
  };
}
