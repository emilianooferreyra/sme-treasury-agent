import {
  ChargeNotFoundError,
  chargesRuntime,
  PaymentSimulationUnavailableError,
} from "../../../../../src/features/charges";

/** Fakes the payer's transfer. Only works with PAYMENTS_MODE=simulated: no real money moves. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    return Response.json(await chargesRuntime().feature.simulatePayment(id));
  } catch (error) {
    if (error instanceof ChargeNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof PaymentSimulationUnavailableError) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}
