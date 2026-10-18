"use client";

import { LoaderCircle, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/core/ui/card";
import type { ChargeView } from "../charges-feature";
import { formatArs, parseChargeView, receiptFor } from "./charge-card-model";
import { ReceiptView } from "./receipt-view";

type State = "idle" | "paying" | "ambiguous" | "error";

const MESSAGES: Partial<Record<State, string>> = {
  ambiguous:
    "El pago llegó, pero hay otro cobro pendiente por el mismo monto: el negocio tiene que asignarlo a mano.",
  error: "No se pudo simular el pago. Probá de nuevo.",
};

/**
 * The payer's checkout for a simulated charge. Inside the demo phone, `onPaid` hands the paid
 * charge to the page; on its own page it shows the receipt in place.
 */
export function SimulatedCheckout({
  charge: initial,
  onPaid,
}: {
  charge: ChargeView;
  onPaid?: (charge: ChargeView) => void;
}) {
  const [charge, setCharge] = useState(initial);
  const [state, setState] = useState<State>("idle");
  const receipt = receiptFor(charge);

  async function pay() {
    setState("paying");
    try {
      const response = await fetch(`/api/charges/${encodeURIComponent(charge.id)}/simulate-payment`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const body = (await response.json()) as { charge: unknown; outcome: string };
      const latest = parseChargeView(body.charge);
      if (!latest) {
        throw new Error("Unexpected response");
      }
      setCharge(latest);
      if (latest.status === "paid") {
        setState("idle");
        onPaid?.(latest);
      } else {
        setState(body.outcome === "ambiguous" ? "ambiguous" : "error");
      }
    } catch {
      setState("error");
    }
  }

  if (receipt && !onPaid) {
    return (
      <Card>
        <CardContent>
          <ReceiptView receipt={receipt} />
        </CardContent>
      </Card>
    );
  }

  const message = MESSAGES[state];

  return (
    <Card className="text-center">
      <CardHeader className="justify-items-center">
        <CardDescription>
          Cobro <span className="font-mono">{charge.id}</span> · {charge.customer}
        </CardDescription>
        <CardTitle>{charge.description}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <p className="text-4xl font-semibold tracking-tight">{formatArs(charge.amount)}</p>
        <p className="text-muted-foreground">Pagás en pesos desde tu banco con Ripio, y el negocio recibe wARS en Celo.</p>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button
          size="lg"
          className="w-full"
          onClick={pay}
          disabled={state === "paying" || charge.status === "paid"}
        >
          {state === "paying" ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" /> Procesando…
            </>
          ) : (
            <>
              <Lock aria-hidden="true" /> Pagar {formatArs(charge.amount)}
            </>
          )}
        </Button>
        {message && (
          <p role="status" className={state === "error" ? "text-destructive" : "text-test-foreground"}>
            {message}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
