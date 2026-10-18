"use client";

import { WalletPanel } from "./wallet-panel";
import { WalletProviders } from "./wallet-providers";

/** The wallet panel with wagmi around it: the heavy part, loaded on its own by WalletSection. */
export function WalletWidget() {
  return (
    <WalletProviders>
      <WalletPanel />
    </WalletProviders>
  );
}
