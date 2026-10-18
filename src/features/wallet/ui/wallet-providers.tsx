"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { WagmiProvider } from "wagmi";
import { createWalletConfig } from "../infrastructure/wagmi-config";

/** wagmi and its query cache, created once per browser session (the pattern in wagmi's SSR guide). */
export function WalletProviders({ children }: { children: ReactNode }) {
  const [config] = useState(createWalletConfig);
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
