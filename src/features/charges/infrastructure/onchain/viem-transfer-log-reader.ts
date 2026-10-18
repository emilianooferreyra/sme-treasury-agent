import { type Address, createPublicClient, http, parseAbiItem } from "viem";
import { celo } from "viem/chains";
import { WARS_TOKEN } from "../../../../core/celo/wars-token";
import type { TransferLogReader } from "./onchain-transfer-source";
import type { TransferLog } from "./transfer-log";

const TRANSFER = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");

/**
 * Reads wARS Transfer events to the business address through a Celo RPC (forno by default).
 * Read-only: no wallet, no keys. Some RPCs omit `blockTimestamp` on logs; then the block is fetched.
 */
export function viemTransferLogReader(config: { recipient: Address; rpcUrl?: string }): TransferLogReader {
  const client = createPublicClient({ chain: celo, transport: http(config.rpcUrl) });

  async function timestampOf(blockNumber: bigint, fromLog: bigint | null | undefined): Promise<bigint> {
    return fromLog ?? (await client.getBlock({ blockNumber })).timestamp;
  }

  return {
    latestBlock: () => client.getBlockNumber(),

    async transfersTo(from, to) {
      const logs = await client.getLogs({
        address: WARS_TOKEN,
        event: TRANSFER,
        args: { to: config.recipient },
        fromBlock: from,
        toBlock: to,
        strict: true,
      });

      return Promise.all(
        logs.map(
          async (log): Promise<TransferLog> => ({
            transactionHash: log.transactionHash,
            logIndex: log.logIndex,
            blockNumber: log.blockNumber,
            blockTimestamp: await timestampOf(log.blockNumber, log.blockTimestamp),
            to: log.args.to,
            value: log.args.value,
          }),
        ),
      );
    },
  };
}
