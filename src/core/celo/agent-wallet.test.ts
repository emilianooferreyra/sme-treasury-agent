import { fromDataSuffix } from "@celo/attribution-tags";
import { custom, encodeFunctionData, erc20Abi, type Hex } from "viem";
import { parseTransaction } from "viem/celo";
import { describe, expect, it } from "vitest";
import {
  agentWallet,
  agentWalletConfigFromEnv,
  assertCanPayGas,
  InvalidAgentKeyError,
  InvalidCeloNetworkError,
  MissingAgentKeyError,
  UnfundedAgentWalletError,
} from "./agent-wallet.ts";
import { ATTRIBUTION_CODES } from "./attribution.ts";

// Hardhat/Anvil's first well-known development key: public, never holds real funds.
const TEST_KEY: Hex = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const RECIPIENT = "0x00000000000000000000000000000000000000b0";
const TOKEN = "0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d";

describe("agentWalletConfigFromEnv", () => {
  it("uses Celo Sepolia by default, so nothing reaches mainnet by accident", () => {
    expect(agentWalletConfigFromEnv({ AGENT_PRIVATE_KEY: TEST_KEY })).toEqual({
      privateKey: TEST_KEY,
      network: "sepolia",
    });
  });

  it("uses mainnet only when asked", () => {
    expect(agentWalletConfigFromEnv({ AGENT_PRIVATE_KEY: TEST_KEY, CELO_NETWORK: "mainnet" }).network).toBe("mainnet");
  });

  it("fails without a key", () => {
    expect(() => agentWalletConfigFromEnv({})).toThrow(MissingAgentKeyError);
    expect(() => agentWalletConfigFromEnv({ AGENT_PRIVATE_KEY: "" })).toThrow(MissingAgentKeyError);
  });

  it("rejects a malformed key without ever echoing it", () => {
    const secretish = "0x1234-not-a-key";

    expect(() => agentWalletConfigFromEnv({ AGENT_PRIVATE_KEY: secretish })).toThrow(InvalidAgentKeyError);
    expect(() => agentWalletConfigFromEnv({ AGENT_PRIVATE_KEY: secretish })).not.toThrow(/1234/);
  });

  it("rejects an unknown network", () => {
    expect(() => agentWalletConfigFromEnv({ AGENT_PRIVATE_KEY: TEST_KEY, CELO_NETWORK: "alfajores" })).toThrow(
      InvalidCeloNetworkError,
    );
  });
});

describe("assertCanPayGas", () => {
  const address = "0xEA93f4D017BFF57a4E79CFC19b98BDb6CeA4f99c";

  it("passes when the wallet holds CELO", async () => {
    await expect(assertCanPayGas({ address, network: "sepolia", getBalance: async () => 1n })).resolves.toBeUndefined();
  });

  it("points to the faucet when a Sepolia wallet is empty", async () => {
    const empty = assertCanPayGas({ address, network: "sepolia", getBalance: async () => 0n });

    await expect(empty).rejects.toThrow(UnfundedAgentWalletError);
    await expect(empty).rejects.toThrow(/faucet\.celo\.org\/celo-sepolia/);
    await expect(empty).rejects.toThrow(address);
  });

  it("never points a mainnet wallet to the testnet faucet", async () => {
    const empty = assertCanPayGas({ address, network: "mainnet", getBalance: async () => 0n });

    await expect(empty).rejects.toThrow(UnfundedAgentWalletError);
    await expect(empty).rejects.not.toThrow(/faucet/);
  });
});

/** An RPC that answers what signing a transaction needs and keeps every raw transaction sent. */
function recordingRpc(chainId: number) {
  const sent: Hex[] = [];
  const transport = custom({
    async request({ method, params }: { method: string; params?: unknown }) {
      switch (method) {
        case "eth_chainId":
          return `0x${chainId.toString(16)}`;
        case "eth_getTransactionCount":
          return "0x0";
        case "eth_estimateGas":
          return "0x5208";
        case "eth_gasPrice":
        case "eth_maxPriorityFeePerGas":
          return "0x1";
        case "eth_getBlockByNumber":
          return { baseFeePerGas: "0x1", number: "0x1", timestamp: "0x1", transactions: [] };
        case "eth_sendRawTransaction": {
          const [raw] = params as [Hex];
          sent.push(raw);
          return `0x${"ab".repeat(32)}`;
        }
        default:
          throw new Error(`unexpected RPC call ${method}`);
      }
    },
  });
  return { sent, transport };
}

describe("agentWallet", () => {
  it("signs with the agent key on the configured network", () => {
    const { transport } = recordingRpc(11_142_220);
    const wallet = agentWallet({ privateKey: TEST_KEY, network: "sepolia" }, { transport });

    expect(wallet.account.address).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    expect(wallet.chain.id).toBe(11_142_220);
  });

  it("tags every contract call with the attribution suffix, leaving the call itself intact", async () => {
    const { sent, transport } = recordingRpc(11_142_220);
    const wallet = agentWallet({ privateKey: TEST_KEY, network: "sepolia" }, { transport });

    await wallet.writeContract({ address: TOKEN, abi: erc20Abi, functionName: "transfer", args: [RECIPIENT, 1n] });

    const call = encodeFunctionData({ abi: erc20Abi, functionName: "transfer", args: [RECIPIENT, 1n] });
    const data = parseTransaction(sent[0] as Hex).data ?? "0x";
    expect(data.startsWith(call)).toBe(true);
    expect(fromDataSuffix(data)?.codes).toEqual([...ATTRIBUTION_CODES]);
  });

  it("tags plain transfers too", async () => {
    const { sent, transport } = recordingRpc(42_220);
    const wallet = agentWallet({ privateKey: TEST_KEY, network: "mainnet" }, { transport });

    await wallet.sendTransaction({ to: RECIPIENT, value: 1n });

    expect(fromDataSuffix(parseTransaction(sent[0] as Hex).data ?? "0x")?.codes).toEqual([...ATTRIBUTION_CODES]);
  });
});
