import type { EveMessagePart } from "eve/react";
import { z } from "zod";
import { formatArs } from "../../../core/money/money";
import type { ChargeView } from "../charges-feature";

const CREATE_CHARGE_TOOL = "create_charge";

// Tool outputs reach the browser as `unknown`, so the card validates them before rendering.
const chargeViewSchema = z.object({
  id: z.string(),
  customer: z.string(),
  description: z.string(),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  currency: z.string(),
  status: z.enum(["pending", "paid"]),
  createdAt: z.iso.datetime(),
  paymentLink: z.url(),
  paidAt: z.iso.datetime().optional(),
  paidBy: z.string().optional(),
  created: z.boolean().optional(),
});

/** Validates a charge received over the network (tool output or status endpoint). */
export function parseChargeView(value: unknown): ChargeView | undefined {
  const parsed = chargeViewSchema.safeParse(value);
  if (!parsed.success) {
    return undefined;
  }
  // Optional fields are dropped when absent rather than set to undefined (exactOptionalPropertyTypes).
  const { paidAt, paidBy, created, ...view } = parsed.data;
  return {
    ...view,
    ...(paidAt === undefined ? {} : { paidAt }),
    ...(paidBy === undefined ? {} : { paidBy }),
    ...(created === undefined ? {} : { created }),
  };
}

export type PollResult =
  | Readonly<{ kind: "update"; charge: ChargeView }>
  | Readonly<{ kind: "stop" }>
  | Readonly<{ kind: "retry" }>;

/** What the card does with a status response: a missing charge ends polling for good. */
export function pollResult(httpStatus: number, body: unknown): PollResult {
  if (httpStatus === 404) {
    return { kind: "stop" };
  }
  const charge = httpStatus === 200 ? parseChargeView(body) : undefined;
  return charge ? { kind: "update", charge } : { kind: "retry" };
}

/** The charge a finished create_charge call returned, or undefined for any other part. */
export function chargeFromPart(part: EveMessagePart): ChargeView | undefined {
  if (
    part.type !== "dynamic-tool" ||
    part.toolName !== CREATE_CHARGE_TOOL ||
    part.state !== "output-available" ||
    part.partial
  ) {
    return undefined;
  }

  return parseChargeView(part.output);
}

export { formatArs };

/** The message the owner sends the payer, in the simulated phone or through WhatsApp. */
export function paymentMessage(charge: ChargeView): string {
  const firstName = charge.customer.split(/\s+/)[0] ?? charge.customer;
  return `¡Hola ${firstName}! Te paso el link para pagar ${charge.description} (${charge.id}) por ${formatArs(charge.amount)}: ${charge.paymentLink}`;
}

/** A wa.me link that opens WhatsApp with the payment message ready to send. */
export function whatsAppShareUrl(charge: ChargeView): string {
  return `https://wa.me/?text=${encodeURIComponent(paymentMessage(charge))}`;
}

export type Receipt = Readonly<{
  reference: string;
  /** The paying transfer's id: the operation number. */
  operation: string;
  /** Local time in Argentina, dd/mm/yyyy hh:mm. */
  paidAt: string;
  customer: string;
  description: string;
  amount: string;
  method: string;
  /** A simulated receipt must say so: it is never proof of a real payment. */
  simulated: boolean;
  /** For a real payment, its transaction on Celoscan: the proof anyone can check. */
  explorerUrl?: string;
}>;

const ARGENTINA_TIME = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function formatArgentinaTime(iso: string): string {
  const parts = Object.fromEntries(
    ARGENTINA_TIME.formatToParts(new Date(iso)).map((part) => [part.type, part.value]),
  );
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
}

/** The receipt of a paid charge, or undefined while it is pending. */
export function receiptFor(charge: ChargeView): Receipt | undefined {
  if (charge.status !== "paid" || charge.paidAt === undefined || charge.paidBy === undefined) {
    return undefined;
  }
  const simulated = charge.paidBy.startsWith("simulated-");
  // On-chain transfer ids are `${txHash}:${logIndex}`.
  const txHash = charge.paidBy.split(":")[0];
  return {
    reference: charge.id,
    operation: charge.paidBy,
    paidAt: formatArgentinaTime(charge.paidAt),
    customer: charge.customer,
    description: charge.description,
    amount: formatArs(charge.amount),
    method: "Ripio · wARS en Celo",
    simulated,
    ...(simulated || !txHash ? {} : { explorerUrl: `https://celoscan.io/tx/${txHash}` }),
  };
}
