import { Badge } from "@/core/ui/badge";
import type { Receipt } from "./charge-card-model";
import { SuccessCheck } from "./success-check";

const ROWS: Array<[label: string, field: keyof Receipt]> = [
  ["Concepto", "description"],
  ["Cliente", "customer"],
  ["Cobro", "reference"],
  ["Fecha", "paidAt"],
  ["Medio", "method"],
  ["Operación", "operation"],
];

/**
 * A payment receipt, without a frame of its own so it fits a card or a dialog.
 * In test mode it carries a "Prueba" badge, as test objects do in Stripe.
 */
export function ReceiptView({ receipt }: { receipt: Receipt }) {
  return (
    <article aria-label="Comprobante de pago" className="grid gap-5">
      <header className="grid justify-items-center gap-1.5 text-center">
        <SuccessCheck />
        <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
          Pago recibido
          {receipt.simulated && (
            <Badge className="bg-test-muted uppercase tracking-wide text-test-foreground">Prueba</Badge>
          )}
        </p>
        <p className="text-3xl font-semibold tracking-tight">{receipt.amount}</p>
      </header>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 border-t border-dashed pt-4 text-sm">
        {ROWS.map(([label, field]) => (
          <div key={field} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd
              className={
                field === "operation" ? "text-right font-mono text-xs break-all" : "text-right font-medium break-words"
              }
            >
              {String(receipt[field])}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
