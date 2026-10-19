import { withAttribution } from "@celo/attribution-tags";
import { createWalletClient, type Hex, http, type Transport } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo, celoSepolia } from "viem/chains";
// Relative imports in this folder keep the .ts extension so scripts/ can run it with plain node.
import { ATTRIBUTION_CODES } from "./attribution.ts";

export type CeloNetwork = "mainnet" | "sepolia";

export type AgentWalletConfig = Readonly<{ privateKey: Hex; network: CeloNetwork }>;

const CHAINS = { mainnet: celo, sepolia: celoSepolia } as const;
const PRIVATE_KEY_PATTERN = /^0x[0-9a-fA-F]{64}$/;

export class MissingAgentKeyError extends Error {
  constructor() {
    super("AGENT_PRIVATE_KEY is not set: generate one with `node scripts/new-agent-key.ts`");
    this.name = "MissingAgentKeyError";
  }
}

export class InvalidAgentKeyError extends Error {
  constructor() {
    // Never include the value: it is (or is close to) a secret.
    super("AGENT_PRIVATE_KEY must be 0x followed by 64 hex characters");
    this.name = "InvalidAgentKeyError";
  }
}

export class InvalidCeloNetworkError extends Error {
  constructor(network: string) {
    super(`CELO_NETWORK must be "sepolia" or "mainnet", got "${network}"`);
    this.name = "InvalidCeloNetworkError";
  }
}

type Env = Readonly<Record<string, string | undefined>>;

/** Reads the agent wallet configuration. Sepolia is the default, so nothing reaches mainnet by accident. */
export function agentWalletConfigFromEnv(env: Env): AgentWalletConfig {
  const privateKey = env.AGENT_PRIVATE_KEY;
  if (!privateKey) {
    throw new MissingAgentKeyError();
  }
  if (!PRIVATE_KEY_PATTERN.test(privateKey)) {
    throw new InvalidAgentKeyError();
  }
  const network = env.CELO_NETWORK || "sepolia";
  if (network !== "mainnet" && network !== "sepolia") {
    throw new InvalidCeloNetworkError(network);
  }
  return { privateKey: privateKey as Hex, network };
}

/** The chain a network name stands for. */
export function celoChain(network: CeloNetwork) {
  return CHAINS[network];
}

/**
 * The wallet the agent transacts from. The hackathon ties the score to this one address, and every
 * transaction it sends carries the attribution suffix: it is added where the client is built, so no
 * call site can forget it.
 */
export function agentWallet(config: AgentWalletConfig, options: { transport?: Transport } = {}) {
  return createWalletClient({
    account: privateKeyToAccount(config.privateKey),
    chain: celoChain(config.network),
    transport: options.transport ?? http(),
  }).extend(withAttribution(ATTRIBUTION_CODES));
}
