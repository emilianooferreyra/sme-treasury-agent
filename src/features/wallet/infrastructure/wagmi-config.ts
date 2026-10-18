import { celo } from "viem/chains";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

/**
 * Read-only wallet setup: browser wallets only (MetaMask, Rabby…), and reads go through Celo's
 * public RPC (forno), so the wallet never has to switch networks or sign anything.
 */
export function createWalletConfig() {
  return createConfig({
    chains: [celo],
    connectors: [injected()],
    transports: { [celo.id]: http() },
    ssr: true,
  });
}
