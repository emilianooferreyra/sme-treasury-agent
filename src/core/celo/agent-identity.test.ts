import { type Address, encodeAbiParameters, encodeEventTopics, type Hex, type Log } from "viem";
import { describe, expect, it } from "vitest";
import {
  AgentNotRegisteredError,
  IDENTITY_REGISTRY,
  IDENTITY_REGISTRY_ABI,
  registerAgent,
} from "./agent-identity.ts";

const HASH: Hex = `0x${"cd".repeat(32)}`;
const OWNER = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const URI = "https://example.com/agent.json";

/** A receipt log as viem returns it, holding a Registered event. */
function registeredLog(agentId: bigint, address: Address = IDENTITY_REGISTRY.sepolia): Log {
  const topics = encodeEventTopics({
    abi: IDENTITY_REGISTRY_ABI,
    eventName: "Registered",
    args: { agentId, owner: OWNER },
  }) as [Hex, ...Hex[]];
  return {
    address,
    topics,
    data: encodeAbiParameters([{ type: "string" }], [URI]),
    blockHash: HASH,
    blockNumber: 1n,
    logIndex: 0,
    transactionHash: HASH,
    transactionIndex: 0,
    removed: false,
  };
}

function clients(logs: Log[]) {
  const writes: unknown[] = [];
  return {
    writes,
    write: async (request: unknown) => {
      writes.push(request);
      return HASH;
    },
    waitForReceipt: async ({ hash }: { hash: Hex }) => ({ transactionHash: hash, logs }),
  };
}

describe("registerAgent (ERC-8004)", () => {
  it("calls register(agentURI) on the network's Identity Registry", async () => {
    const deps = clients([registeredLog(42n)]);

    await registerAgent({ ...deps, network: "sepolia", agentURI: URI });

    expect(deps.writes).toEqual([
      expect.objectContaining({ address: IDENTITY_REGISTRY.sepolia, functionName: "register", args: [URI] }),
    ]);
  });

  it("reads the agent id from the Registered event, not from the simulated return value", async () => {
    const deps = clients([registeredLog(9911n)]);

    expect(await registerAgent({ ...deps, network: "sepolia", agentURI: URI })).toEqual({
      agentId: 9911n,
      hash: HASH,
    });
  });

  it("ignores a Registered event from any other contract", async () => {
    const deps = clients([registeredLog(1n, "0x0000000000000000000000000000000000000bad"), registeredLog(7n)]);

    expect((await registerAgent({ ...deps, network: "sepolia", agentURI: URI })).agentId).toBe(7n);
  });

  it("fails when the receipt has no Registered event", async () => {
    await expect(registerAgent({ ...clients([]), network: "sepolia", agentURI: URI })).rejects.toThrow(
      AgentNotRegisteredError,
    );
  });

  it("knows the mainnet registry the hackathon scores", () => {
    expect(IDENTITY_REGISTRY.mainnet).toBe("0x8004A169FB4a3325136EB29fA0ceB6D2e539a432");
  });
});
