import type { PaymentLinkBuilder } from "../application/ports";

/** Links to the app's simulated payment page, used for demos instead of the real Ripio ramp. */
export function simulatedCheckoutLinkBuilder(config: { appUrl: string }): PaymentLinkBuilder {
  const base = config.appUrl.replace(/\/+$/, "");
  return (charge) => `${base}/pay/${encodeURIComponent(charge.id)}`;
}
