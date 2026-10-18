import type { NextRequest } from "next/server";
import { chargesRuntime, isChargeReference } from "@/features/charges";

/** Enough for every card in a chat, and a bound on how much one request can make the server read. */
const MAX_IDS = 50;

/**
 * The current state of several charges: `?ids=C-0001,C-0002`. The demo's charge cards share one
 * poll of this route, so the server reconciles once per poll instead of once per card.
 */
export async function GET(request: NextRequest) {
  const ids = [...new Set((request.nextUrl.searchParams.get("ids") ?? "").split(",").filter(Boolean))];
  if (ids.length === 0 || ids.length > MAX_IDS || !ids.every(isChargeReference)) {
    return Response.json(
      { error: `ids must be 1 to ${MAX_IDS} comma-separated charge references, like C-0001` },
      { status: 400 },
    );
  }

  const { feature } = chargesRuntime();
  // Reconcile first, so a payment that just arrived (on-chain or simulated) shows up. If the chain
  // cannot be read right now, answer with what is already known; the next poll tries again.
  await feature.syncPayments().catch((error: unknown) => console.error("Payment sync failed", error));

  return Response.json({ charges: await feature.getCharges(ids) });
}
