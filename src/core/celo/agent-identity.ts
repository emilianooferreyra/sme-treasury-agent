import { type Address, type Hex, isAddressEqual, type Log, parseEventLogs } from "viem";
import type { CeloNetwork } from "./agent-wallet.ts";

/** ERC-8004 Identity Registry singletons (docs.celo.org/build/agents/8004, checked 2026-10-19). */
export const IDENTITY_REGISTRY: Readonly<Record<CeloNetwork, Address>> = {
  mainnet: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
  sepolia: "0x8004A818BFB912233c491871b3d84c89A494BD9e",
};

export const IDENTITY_REGISTRY_ABI = [
  {
    type: "function",
    name: "register",
    stateMutability: "nonpayable",
    inputs: [{ name: "agentURI", type: "string" }],
    outputs: [{ name: "agentId", type: "uint256" }],
  },
  {
    type: "event",
    name: "Registered",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "agentURI", type: "string", indexed: false },
      { name: "owner", type: "address", indexed: true },
    ],
  },
] as const;

export class AgentNotRegisteredError extends Error {
  constructor(hash: Hex) {
    super(`Transaction ${hash} did not emit Registered from the Identity Registry`);
    this.name = "AgentNotRegisteredError";
  }
}

type RegisterRequest = Readonly<{
  address: Address;
  abi: typeof IDENTITY_REGISTRY_ABI;
  functionName: "register";
  args: readonly [string];
}>;

/**
 * Registers the agent's identity from the wallet that sends the call: the registry mints the
 * identity to it and publishes it as the agent's wallet. The id comes from the Registered event,
 * because what register() returns is only right if nobody else registered in between.
 */
export async function registerAgent(deps: {
  write: (request: RegisterRequest) => Promise<Hex>;
  waitForReceipt: (args: { hash: Hex }) => Promise<{ logs: Log[] }>;
  network: CeloNetwork;
  agentURI: string;
}): Promise<{ agentId: bigint; hash: Hex }> {
  const registry = IDENTITY_REGISTRY[deps.network];
  const hash = await deps.write({
    address: registry,
    abi: IDENTITY_REGISTRY_ABI,
    functionName: "register",
    args: [deps.agentURI],
  });
  const { logs } = await deps.waitForReceipt({ hash });

  const [registered] = parseEventLogs({
    abi: IDENTITY_REGISTRY_ABI,
    eventName: "Registered",
    logs: logs.filter((log) => isAddressEqual(log.address, registry)),
  });
  if (!registered) {
    throw new AgentNotRegisteredError(hash);
  }
  return { agentId: registered.args.agentId, hash };
}
