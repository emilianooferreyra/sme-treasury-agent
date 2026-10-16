# Design: spike-onchain-liquidity

## Approach

A small TypeScript + Node CLI (viem), run manually, that reads Celo mainnet and writes timestamped JSON.
No server, no UI.

```
scripts/
  config.ts          # chain (celo), RPC (forno.celo.org), token registry with source URLs
  verify-tokens.ts   # getCode, symbol, decimals, totalSupply, EIP-1967 slot
  discover-pools.ts  # Uniswap factory lookups, Mento broker, Curve registry, event scans
  quote-routes.ts    # QuoterV2 eth_call for 50/500/5000 USD, direct and 2-hop
  benchmark.md       # manual notes feeding the cost comparison
out/                 # timestamped JSON (git-ignored or committed per report)
docs/spike-findings.md
```

## Decisions

| Decision | Choice | Alternative | Tradeoff |
|---|---|---|---|
| Library | viem | ethers | viem has first-class Celo chain definitions and typed multicall; ethers is more familiar to some. Either meets the rule |
| Execution | one-shot scripts | persistent service | Spike needs repeatable snapshots, not uptime |
| Quote method | `eth_call` to quoter contracts | reserve math | Quoter is exact for Uniswap; reserve math is the fallback for venues without a quoter |
| RFQ venues (Textile FX) | document as off-chain unless a public quote endpoint exists | simulate fills | Simulating would need signing/Permit2 flows, out of scope for read-only |
| Amounts | USD-equivalent converted with documented rates | fixed token amounts | Keeps comparison with fiat alternatives meaningful |

## Open questions to resolve during the spike

1. Which Uniswap version/factory on Celo holds wARS/wBRL pools (v3, v4 PoolManager)? Addresses must be discovered, not assumed.
2. Does Mento have any exchange including wARS/wBRL, or only its own tokens (BRLm, COPm)?
3. Does Textile FX publish a quote API usable without credentials?
4. Is wBRL supply large enough for 5000 USD (~ R$ equivalent) to be a small share of any pool?

## Safety

- Read-only RPC calls only; no signer objects instantiated anywhere in the codebase.
- RPC URL is the only configuration value.
