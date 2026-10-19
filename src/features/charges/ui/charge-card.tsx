"use client";

import { Check, Copy, MessageCircle, ReceiptText, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type FormEvent, useEffect, useId, useState } from "react";
import { cn } from "@/core/lib/utils";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/core/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import type { ChargeView } from "../charges-feature";
import { formatArs, receiptFor, whatsAppNumber, whatsAppShareUrl } from "./charge-card-model";
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

/**
 * The customer's contact, asked right in the card. The mobile number only builds the WhatsApp
 * link: it is not saved anywhere.
 */
function ContactForm({
  charge,
  onSend,
  onCancel,
}: {
  charge: ChargeView;
  onSend: (whatsAppUrl: string) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const [first = charge.customer, ...rest] = charge.customer.trim().split(/\s+/);
  const [invalidPhone, setInvalidPhone] = useState(false);

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const phone = whatsAppNumber(String(data.get("phone") ?? ""));
    if (!phone) {
      setInvalidPhone(true);
      return;
    }
    const firstName = String(data.get("firstName") ?? "").trim() || first;
    onSend(whatsAppShareUrl(charge, { firstName, phone }));
  }

  return (
    <form aria-label={`Contacto de ${first}`} noValidate onSubmit={send} className="grid gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-1">
          <label htmlFor={`${id}-first`} className="text-xs font-medium text-muted-foreground">
            Nombre
          </label>
          <Input id={`${id}-first`} name="firstName" defaultValue={first} autoComplete="off" />
        </div>
        <div className="grid gap-1">
          <label htmlFor={`${id}-last`} className="text-xs font-medium text-muted-foreground">
            Apellido
          </label>
          <Input id={`${id}-last`} name="lastName" defaultValue={rest.join(" ")} autoComplete="off" />
        </div>
      </div>
      <div className="grid gap-1">
        <label htmlFor={`${id}-phone`} className="text-xs font-medium text-muted-foreground">
          Celular
        </label>
        <Input
          id={`${id}-phone`}
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="11 2345-6789"
          autoComplete="off"
          aria-invalid={invalidPhone}
          aria-describedby={`${id}-phone-hint`}
          onChange={() => setInvalidPhone(false)}
        />
        <p id={`${id}-phone-hint`} role={invalidPhone ? "alert" : undefined} className={cn("text-xs", invalidPhone ? "text-destructive" : "text-muted-foreground")}>
          {invalidPhone
            ? "Revisá el celular: código de área sin 0 y número sin 15, por ejemplo 11 2345-6789."
            : "Código de área sin 0 y número sin 15."}
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="cursor-pointer">
          <Send aria-hidden="true" /> Enviar por WhatsApp
        </Button>
        <Button type="button" variant="ghost" className="cursor-pointer" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function ChargeCard({ charge: initial }: { charge: ChargeView }) {
  const { charge, sent, dispatch } = useChargeSync(initial);
  const [copied, setCopied] = useState(false);
  const [askingContact, setAskingContact] = useState(false);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string>();
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
        <CardContent className="grid gap-4">
          <p className="text-3xl font-semibold tracking-tight">
            {formatArs(charge.amount)} <span className="text-sm font-normal text-muted-foreground">ARS</span>
          </p>
          {askingContact && !receipt && (
            <ContactForm
              charge={charge}
              onCancel={() => setAskingContact(false)}
              onSend={(url) => {
                setWhatsAppUrl(url);
                setAskingContact(false);
                // The demo's customer phone gets it too, so the flow goes on without a real number.
                dispatch({ type: "charge-sent", charge });
              }}
            />
          )}
        </CardContent>
        <CardFooter className="flex-wrap gap-2">
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
              {!askingContact && (
                <Button
                  disabled={sent}
                  variant={sent ? "secondary" : "default"}
                  className="cursor-pointer"
                  onClick={() => setAskingContact(true)}
                >
                  {sent ? <Check aria-hidden="true" /> : <Send aria-hidden="true" />}
                  {sent ? `Enviado a ${firstName}` : `Enviar a ${firstName}`}
                </Button>
              )}
              {sent && whatsAppUrl && (
                <Button asChild variant="outline">
                  <a href={whatsAppUrl} target="_blank" rel="noreferrer">
                    <MessageCircle aria-hidden="true" /> Abrir en WhatsApp
                  </a>
                </Button>
              )}
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
