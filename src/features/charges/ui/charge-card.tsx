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
import { formatArs, receiptFor } from "./charge-card-model";
import { useDemo } from "./demo-context";
import { ReceiptView } from "./receipt-view";

/**
 * The card's charge, kept current by the demo's shared status poll while it is pending, so a
 * payment made elsewhere (the /pay page on another device) also reaches the card. The charge
 * joins the shared state when the owner sends it (an event), not when the card renders: two
 * cards of the same charge would otherwise overwrite each other's view after every render.
 */
function useChargeSync(initial: ChargeView) {
  const { state, dispatch, watch } = useDemo();
  const charge = state.charges[initial.id] ?? initial;

  useEffect(() => {
    if (charge.status === "paid") {
      return;
    }
    return watch(charge.id);
  }, [charge.id, charge.status, watch]);

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
                onClick={() => dispatch({ type: "charge-sent", charge })}
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
