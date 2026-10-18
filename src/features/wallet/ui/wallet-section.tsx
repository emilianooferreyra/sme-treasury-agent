"use client";

import { Wallet } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/core/ui/button";

/** Same size and label as the real connect button, so nothing moves when the panel arrives. */
function ConnectPlaceholder() {
  return (
    <Button size="lg" variant="outline" disabled>
      <Wallet aria-hidden="true" />
      Conectar billetera
    </Button>
  );
}

// wagmi, viem and react-query travel in their own chunk, fetched after the page is interactive.
// The dynamic import lives in a Client Component: Next.js only code-splits it from one.
// ssr: false, since a wallet only exists in the browser.
const WalletWidget = dynamic(() => import("./wallet-widget").then((module) => module.WalletWidget), {
  ssr: false,
  loading: ConnectPlaceholder,
});

/** The landing's wallet: connect and see the real wARS balance on Celo, without slowing the page down. */
export function WalletSection() {
  return <WalletWidget />;
}
