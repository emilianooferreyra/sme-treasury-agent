"use client"; // Error boundaries must be Client Components.

import { RotateCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/core/ui/button";

/**
 * Catches unexpected errors in any page below the root layout. The technical message is only
 * logged: in production Next.js replaces server error messages with a digest anyway.
 */
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[80dvh] place-items-center p-4">
      <div className="grid max-w-sm justify-items-center gap-3 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Algo salió mal</h1>
        <p className="text-muted-foreground">No pudimos cargar esta página. Probá de nuevo en unos segundos.</p>
        <Button onClick={() => retry()}>
          <RotateCw aria-hidden="true" /> Reintentar
        </Button>
      </div>
    </main>
  );
}
