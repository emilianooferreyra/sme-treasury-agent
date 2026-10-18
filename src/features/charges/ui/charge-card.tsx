"use client";

import { Check, Copy, ReceiptText, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/core/lib/utils";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/core/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/core/ui/dialog";
import type { ChargeView } from "../charges-feature";
import { formatArs, pollResult, receiptFor } from "./charge-card-model";
import { useDemo } from "./demo-context";
import { ReceiptView } from "./receipt-view";

const POLL_INTERVAL_MS = 3000;

/**
 * Keeps the shared demo state in sync with the server for one charge, so a payment made
 * elsewhere (the /pay page on another device) also reaches the card.
 */
function useChargeSync(initial: ChargeView) {
  const { state, dispatch } = useDemo();
  const charge = state.charges[initial.id] ?? initial;
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    dispatch({ type: "charge-seen", charge: initial });
  }, [dispatch, initial]);

  useEffect(() => {
    if (charge.status === "paid" || stopped) {
      return;
    }
    const controller = new AbortController();
    const timer = setInterval(async () => {
      try {
        const response = await fetch(`/api/charges/${encodeURIComponent(charge.id)}`, {
          signal: controller.signal,
        });
        const result = pollResult(response.status, await response.json().catch(() => undefined));
        if (result.kind === "stop") {
          setStopped(true);
        } else if (result.kind === "update") {
          dispatch({ type: "charge-seen", charge: result.charge });
        }
      } catch {
        // A failed poll is retried on the next tick.
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [charge.id, charge.status, stopped, dispatch]);

  return { charge, sent: state.sent.includes(charge.id), dispatch };
}

function StatusBadge({ status }: { status: ChargeView["status"] }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={status}
        initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
        className="inline-flex"
      >
        <Badge
          role="status"
          className={status === "paid" ? "bg-success/15 text-success" : "bg-test-muted text-test-foreground"}
        >
          {status === "paid" && <Check aria-hidden="true" />}
          {status === "paid" ? "Pagado" : "Pendiente"}
        </Badge>
      </motion.span>
    </AnimatePresence>
  );
}

export function ChargeCard({ charge: initial }: { charge: ChargeView }) {
  const { charge, sent, dispatch } = useChargeSync(initial);
  const [copied, setCopied] = useState(false);
  const receipt = receiptFor(charge);
  const firstName = charge.customer.split(/\s+/)[0] ?? charge.customer;

  async function copyLink() {
    await navigator.clipboard.writeText(charge.paymentLink);
    setCopied(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="w-full max-w-sm"
    >
      <Card
        size="sm"
        aria-label={`Cobro ${charge.id}`}
        className={cn("transition-shadow duration-500", receipt && "ring-success/40")}
      >
        <CardHeader>
          <CardDescription>
            <span className="font-mono">{charge.id}</span> · {charge.customer}
          </CardDescription>
          <CardTitle>{charge.description}</CardTitle>
          <CardAction>
            <StatusBadge status={charge.status} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold tracking-tight">
            {formatArs(charge.amount)} <span className="text-sm font-normal text-muted-foreground">ARS</span>
          </p>
        </CardContent>
        <CardFooter className="gap-2">
          {receipt ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <ReceiptText aria-hidden="true" /> Ver comprobante
                </Button>
              </DialogTrigger>
              <DialogContent aria-describedby={undefined}>
                <DialogTitle className="sr-only">Comprobante del cobro {charge.id}</DialogTitle>
                <ReceiptView receipt={receipt} />
              </DialogContent>
            </Dialog>
          ) : (
            <>
              <Button
                disabled={sent}
                variant={sent ? "secondary" : "default"}
                onClick={() => dispatch({ type: "charge-sent", chargeId: charge.id })}
              >
                {sent ? <Check aria-hidden="true" /> : <Send aria-hidden="true" />}
                {sent ? `Enviado a ${firstName}` : `Enviar a ${firstName}`}
              </Button>
              <Button variant="outline" onClick={copyLink}>
                {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                {copied ? "¡Copiado!" : "Copiar link"}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
