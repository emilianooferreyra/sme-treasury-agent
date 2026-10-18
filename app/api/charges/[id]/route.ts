import { chargesRuntime } from "../../../../src/features/charges";

/** The current state of a charge. The chat's charge card polls it until the charge is paid. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { feature } = chargesRuntime();
  // Reconcile first, so a payment that just arrived (on-chain or simulated) shows up. If the chain
  // cannot be read right now, answer with what is already known; the next poll tries again.
  await feature.syncPayments().catch((error: unknown) => console.error("Payment sync failed", error));
  const charge = await feature.getCharge(id);

  return charge ? Response.json(charge) : Response.json({ error: "Charge not found" }, { status: 404 });
}
