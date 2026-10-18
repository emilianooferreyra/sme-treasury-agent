import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/ui/button";

/** Any address the app does not handle, and any page that calls notFound() without its own UI. */
export default function NotFound() {
  return (
    <main className="grid min-h-[80dvh] place-items-center p-4">
      <div className="grid max-w-sm justify-items-center gap-3 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">No encontramos esta página</h1>
        <p className="text-muted-foreground">Puede que el link esté mal escrito o que la página ya no exista.</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft aria-hidden="true" /> Volver al inicio
          </Link>
        </Button>
      </div>
    </main>
  );
}
