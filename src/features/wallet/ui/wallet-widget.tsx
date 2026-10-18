"use client";

import { WalletPanel } from "./wallet-panel";
import { WalletProviders } from "./wallet-providers";

/** The wallet panel with wagmi and RainbowKit around it: the heavy part, loaded on its own by WalletSection. */
export function WalletWidget({ projectId }: { projectId: string }) {
  return (
    <WalletProviders projectId={projectId}>
      <WalletPanel />
    </WalletProviders>
  );
}
