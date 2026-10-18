import { chargesRuntime } from "../../../../src/features/charges";

/** The current state of a charge. The chat's charge card polls it until the charge is paid. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const charge = await chargesRuntime().feature.getCharge(id);

  return charge ? Response.json(charge) : Response.json({ error: "Charge not found" }, { status: 404 });
}
