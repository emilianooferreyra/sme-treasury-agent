# Proposal: spike-onchain-liquidity

Status: **superseded by `sme-treasury-agent` (2026-10-15)** · Date: 2026-10-09 · Owner: Emi

## Why

We want to build an agent that routes small ARS↔BRL remittances over local-currency stablecoins on Celo
(Hackathon "Agents on Open Rails", deadline 2026-11-09). Before specifying the product we must know whether
a real gap exists. Desk research (web, 25 claims verified) left the key questions unanswered:

- Depth and slippage of wARS/wBRL on Celo venues (Mento, Uniswap, Curve, Textile FX) — **no evidence**.
- Cost of today's alternatives (local exchanges, Ripio, Lemon, Wise, PIX) — **no evidence**.
- Whether a direct wARS/wBRL route exists, or only wARS → USDT → wBRL — **unconfirmed**.

Current verdict confidence for "there is a gap": **low**. This spike exists to replace assumptions with
measurements. It is **not** the product.

## What is already established (desk research, 2026-10-09)

| Fact | Confidence | Source |
|---|---|---|
| wARS `0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d` and wBRL `0xd76f5faf6888e24d9f04bf92a0c8b921fe4390e0` are Ripio wFiat tokens on Celo mainnet (18 decimals) | high | Celo docs, Ripio launch post (2026-07-31), RPC check |
| Celo docs list only wARS for ARS (no Mento ARS). BRL: BRLm (Mento), BRLA, wBRL. COP: COPm, COPM, wCOP | high | docs.celo.org stablecoin-contracts |
| Textile FX: RFQ rail, 1 bp fee on Celo, pools wARS/USDT and wBRL/USDT; hackathon track 2a | medium | Dune (Ripio), @Celo thread, Luma |
| Celo x402 facilitator supports wARS/wBRL/wCOP (same-currency payments, no swap) | medium | blog.celo.org (2026-09-17) |

Unverified and **must not** be asserted until measured: pool addresses, supply/depth, existence of Mento/Curve
pools, any slippage figure, competitor costs.

## Scope

In:
1. Read-only on-chain discovery and verification of tokens and pools on Celo mainnet.
2. Quotes for wARS → wBRL at 50 / 500 / 5000 USD-equivalent per available route.
3. Public-source cost benchmark of the current non-agent alternatives.
4. Deliverable `docs/spike-findings.md` with sources, dates and a verdict.

Out:
- Any transaction, funded wallet or private key. Read-only RPC only.
- UI, backend, agent logic, ramp integration.
- The product specification (`stable-router-agent`), which is written **after** this spike.

## Success criteria

- Every address in the report is tagged `verified` (on-chain proof) or `not verified`.
- Every number has a source and a timestamp.
- The report ends with a verdict ("real gap" / "no gap" / "inconclusive") backed by the measurements,
  and states which of the product options (A end-to-end corridor, B Textile FX execution leg,
  C quote/comparison agent) the data supports.

## Risks

- Pools may expose no usable quote interface (RFQ rails quote off-chain) → fall back to reserves/ticks math or mark "not measurable on-chain".
- Public RPC rate limits → batch via multicall, cache, retry with backoff.
- Liquidity is days/weeks old and moves quickly → every measurement is timestamped.
- Fiat-side costs depend on volatile rates (ARS blue/MEP) → record rate source and time.

## Decision log

- 2026-10-09: spike-only scope (product spec deferred until data). Jira deferred. Docs in English.
