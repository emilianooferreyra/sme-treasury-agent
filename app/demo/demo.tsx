"use client";

import { useEveAgent } from "eve/react";
import { ArrowLeft, ArrowUp, LoaderCircle, Smartphone, Store } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import type { FormEvent } from "react";
import { cn } from "@/core/lib/utils";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import {
  ChargeCard,
  chargeFromPart,
  DemoProvider,
  PayerPhone,
  useDemo,
} from "@/features/charges/ui";

const BUSINESS_NAME = "Panadería de Ana";

/** Both sides of the demo: the owner's chat with the agent and the customer's phone. */
export function DemoScreen() {
  return (
    <DemoProvider>
      <Demo />
    </DemoProvider>
  );
}

const TABS = [
  { id: "business", label: "Negocio", icon: Store },
  { id: "customer", label: "Cliente", icon: Smartphone },
] as const;

function Demo() {
  const { state, dispatch } = useDemo();
  const unread = state.sent.filter((id) => state.charges[id]?.status === "pending").length;

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] lg:grid-cols-[minmax(0,1fr)_28rem] lg:grid-rows-1">
      <nav
        aria-label="Lados de la demo"
        className="sticky top-0 z-20 grid grid-cols-2 gap-1 border-b bg-background/80 p-2 backdrop-blur lg:hidden"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = state.tab === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => dispatch({ type: "tab-selected", tab: id })}
              className={cn(
                "relative inline-flex h-10 items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-card shadow-sm ring-1 ring-foreground/5"
                />
              )}
              <span className="relative inline-flex items-center gap-2">
                <Icon className="size-4" aria-hidden="true" />
                {label}
                {id === "customer" && unread > 0 && (
                  <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs leading-5 text-primary-foreground">
                    {unread}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </nav>

      <section aria-label="Negocio" className={cn("min-w-0", state.tab !== "business" && "max-lg:hidden")}>
        <OwnerChat />
      </section>

      <section
        aria-label="Cliente"
        className={cn(
          "grid content-start gap-3 px-4 py-5 lg:sticky lg:top-0 lg:h-dvh lg:content-center lg:border-l lg:bg-card/50",
          state.tab !== "customer" && "max-lg:hidden",
        )}
      >
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Celular de tu cliente
        </p>
        <PayerPhone businessName={BUSINESS_NAME} />
      </section>
    </div>
  );
}

function OwnerChat() {
  const agent = useEveAgent();
  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const isResuming = agent.status === "resuming";

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = String(new FormData(form).get("message") ?? "").trim();
    if (message.length === 0 || isResuming) {
      return;
    }
    void agent.send(message, isBusy ? { turnPolicy: "steer" } : undefined);
    form.reset();
  }

  return (
    <div className="mx-auto grid min-h-full max-w-2xl grid-rows-[auto_1fr_auto] px-4">
      <header className="flex items-center gap-3 border-b py-5">
        <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
          {BUSINESS_NAME.charAt(0)}
        </span>
        <div>
          <h1 className="text-lg font-semibold leading-tight">{BUSINESS_NAME}</h1>
          <p className="text-sm text-muted-foreground">Tu asistente de cobros en pesos</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="ml-auto">
          <Link href="/">
            <ArrowLeft aria-hidden="true" /> Inicio
          </Link>
        </Button>
      </header>

      <div aria-live="polite" className="flex flex-col gap-4 py-5">
        {agent.data.messages.length === 0 && (
          <div className="rounded-3xl border border-dashed p-4 text-sm text-muted-foreground">
            Probá con: <span className="text-foreground">«Cobrale $85.000 a Juan Pérez por 2 docenas de medialunas»</span>
          </div>
        )}
        {agent.data.messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex flex-col gap-2", message.role === "user" ? "items-end" : "items-start")}
          >
            {message.parts.map((part, index) => {
              if (part.type === "text") {
                return (
                  <motion.p
                    key={part.id ?? index}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap break-words rounded-3xl px-4 py-2.5",
                      message.role === "user"
                        ? "rounded-br-lg bg-primary text-primary-foreground"
                        : "rounded-bl-lg bg-card shadow-sm ring-1 ring-foreground/5",
                    )}
                  >
                    {part.text}
                  </motion.p>
                );
              }
              if (part.type !== "dynamic-tool") {
                return null;
              }
              const charge = chargeFromPart(part);
              if (charge) {
                return <ChargeCard key={part.toolCallId} charge={charge} />;
              }
              if (part.state === "output-error") {
                return (
                  <p key={part.toolCallId} className="text-sm text-destructive">
                    No se pudo completar: {part.errorText}
                  </p>
                );
              }
              return null;
            })}
          </div>
        ))}
        {isBusy && (
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Pensando…
          </p>
        )}
        {agent.error && <p className="text-sm text-destructive">{agent.error.message}</p>}
      </div>

      <form onSubmit={send} className="sticky bottom-0 flex gap-2 bg-background/80 pb-4 pt-3 backdrop-blur">
        <Input
          name="message"
          placeholder="Escribí un mensaje"
          autoComplete="off"
          disabled={isResuming}
          className="h-11 flex-1 px-4"
        />
        <Button type="submit" size="icon-lg" disabled={isResuming} aria-label="Enviar" className="size-11">
          <ArrowUp aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}
