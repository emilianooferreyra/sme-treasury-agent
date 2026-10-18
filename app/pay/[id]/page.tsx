import { notFound } from "next/navigation";
import { chargesRuntime } from "../../../src/features/charges";
import { SimulatedCheckout } from "../../../src/features/charges/ui";

/** The payer's side of a simulated charge. In ripio mode payers go to the real ramp instead. */
export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { config, feature } = chargesRuntime();
  const charge = config.mode === "simulated" ? await feature.getCharge(id) : undefined;

  if (!charge) {
    notFound();
  }

  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-sm">
        <SimulatedCheckout charge={charge} />
      </div>
    </main>
  );
}
