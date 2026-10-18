import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { chargesRuntime } from "@/features/charges";
import { SimulatedCheckout } from "@/features/charges/ui";

export const metadata: Metadata = {
  title: "Pagar",
  // A payment link carries a customer's charge: it must never show up in search results.
  robots: { index: false, follow: false },
};

/** The payer's side of a simulated charge. In ripio mode payers go to the real ramp instead. */
export default async function PayPage({ params }: PageProps<"/pay/[id]">) {
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
