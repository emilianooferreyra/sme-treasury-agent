import { ArrowRight, Landmark, MessageSquareText, Radar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { WalletSection } from "@/features/wallet/ui";

const STEPS = [
  {
    icon: MessageSquareText,
    title: "Le pedís el cobro al asistente",
    description: "«Cobrale $85.000 a Juan Pérez por 2 docenas de medialunas». Arma el cobro y el link de pago.",
  },
  {
    icon: Landmark,
    title: "Tu cliente paga desde su banco",
    description: "Con Ripio paga en pesos, sin saber nada de cripto. Vos recibís wARS, pesos digitales en Celo.",
  },
  {
    icon: Radar,
    title: "El agente concilia solo",
    description: "Detecta la transferencia en la blockchain, la asigna al cobro correcto y te avisa. Sin planillas.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-16 px-4 py-16 sm:py-24">
      <section className="grid justify-items-center gap-6 text-center">
        <span className="rounded-full bg-card px-3 py-1 text-sm text-muted-foreground shadow-sm ring-1 ring-foreground/5">
          Para PyMEs argentinas · Celo + Ripio
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Cobrá en pesos. <span className="text-muted-foreground">Recibilo en Celo.</span>
        </h1>
        <p className="max-w-xl text-lg text-pretty text-muted-foreground">
          Un asistente que crea tus cobros, le manda el link a tu cliente y te avisa cuando te pagaron. Tu cliente
          paga desde su banco; vos recibís wARS.
        </p>
        <Button asChild size="lg">
          <Link href="/demo">
            Probar la demo <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </section>

      <section aria-labelledby="your-wallet" className="grid justify-items-center gap-4 text-center">
        <div className="grid gap-1">
          <h2 id="your-wallet" className="text-2xl font-semibold tracking-tight">
            Tu saldo real en Celo
          </h2>
          <p className="text-muted-foreground">
            Conectá tu billetera y mirá cuántos wARS tenés. Solo lectura: no firmás nada.
          </p>
        </div>
        <WalletSection />
      </section>

      <section aria-labelledby="how-it-works" className="grid gap-6">
        <h2 id="how-it-works" className="text-center text-2xl font-semibold tracking-tight">
          Cómo funciona
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <li key={title}>
              <Card className="h-full">
                <CardHeader>
                  <span className="mb-2 grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <CardTitle>
                    <span className="text-muted-foreground">{index + 1}.</span> {title}
                  </CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
