import { ArrowRight, ChevronRight, Landmark, MessageSquareText, Radar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/ui/button";
import { WalletSection } from "@/features/wallet/ui";

// The flow at a glance; /how-it-works explains each step.
const STEPS = [
  { icon: MessageSquareText, title: "Pedís el cobro" },
  { icon: Landmark, title: "Tu cliente paga en pesos" },
  { icon: Radar, title: "El agente concilia" },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-16 px-4 py-4">
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
            Dónde recibís tus cobros
          </h2>
          <p className="text-muted-foreground">
            Conectá la billetera donde querés recibir y mirá tu saldo en wARS. Solo lectura: no firmás nada.
          </p>
        </div>
        <WalletSection />
      </section>

      <section aria-labelledby="how-it-works" className="grid justify-items-center gap-4">
        <h2 id="how-it-works" className="text-2xl font-semibold tracking-tight">
          Cómo funciona
        </h2>
        <ol className="flex flex-col items-center gap-3 sm:flex-row">
          {STEPS.map(({ icon: Icon, title }, index) => (
            <li key={title} className="flex flex-col items-center gap-3 sm:flex-row">
              {index > 0 && (
                <ChevronRight className="size-4 rotate-90 text-muted-foreground sm:rotate-0" aria-hidden="true" />
              )}
              <span className="flex items-center gap-2 rounded-full bg-card px-4 py-2 font-medium shadow-sm ring-1 ring-foreground/5">
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                {title}
              </span>
            </li>
          ))}
        </ol>
        <Button asChild variant="link">
          <Link href="/how-it-works">
            Ver cómo funciona en detalle <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </main>
  );
}
