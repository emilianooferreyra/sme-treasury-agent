"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { WagmiProvider } from "wagmi";
import { createWalletConfig } from "../infrastructure/wagmi-config";

// The preset's primary color (oklch(0.205 0 0)), so the modal matches the app's buttons.
const theme = lightTheme({ accentColor: "#171717", accentColorForeground: "#fafafa", borderRadius: "large" });
// RainbowKit's default "learn more" page (learn.rainbow.me/understanding-web3) answers 404.
const appInfo = { learnMoreUrl: "https://ethereum.org/es/wallets/" };

/** wagmi, its query cache and RainbowKit's modal, created once per browser session. */
export function WalletProviders({ projectId, children }: { projectId: string; children: ReactNode }) {
  const [config] = useState(() => createWalletConfig(projectId));
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={theme} appInfo={appInfo} locale="es-419">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
