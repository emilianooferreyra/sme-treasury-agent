/**
 * A payment link that leads nowhere: mistyped, or from a charge that no longer exists. The
 * payer is the business's customer, so it points them back to the business, not to our home.
 */
export default function PayNotFound() {
  return (
    <main className="grid min-h-[80dvh] place-items-center p-4">
      <div className="grid max-w-sm justify-items-center gap-3 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Este link de pago no existe</h1>
        <p className="text-muted-foreground">
          Puede que esté incompleto o que el cobro ya no esté disponible. Pedile al negocio un link nuevo.
        </p>
      </div>
    </main>
  );
}
