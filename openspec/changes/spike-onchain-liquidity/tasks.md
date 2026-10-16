# Tasks: spike-onchain-liquidity

## 1. Setup
- [ ] 1.1 Init Node + TypeScript project, add viem, configure Celo chain and `https://forno.celo.org`
- [ ] 1.2 Add token registry with source URL per address (wARS, wBRL, wMXN, wCOP, wPEN, wCLP, BRLm, BRLA, COPm, COPM, USDT, USDC)
- [ ] 1.3 Add `.gitignore` for `.env` and `out/`; confirm no keys anywhere

## 2. Token verification (spec: token-verification)
- [ ] 2.1 Script: getCode, symbol, name, decimals, totalSupply with block + timestamp
- [ ] 2.2 EIP-1967 proxy check and pause/blacklist function detection
- [ ] 2.3 Tag each address `verified` / `not verified`

## 3. Liquidity discovery (spec: liquidity-discovery)
- [ ] 3.1 Uniswap v3 factory lookup for all pairs among wARS, wBRL, USDT, USDC across fee tiers
- [ ] 3.2 Uniswap v4 pool discovery (PoolManager events) for the same pairs
- [ ] 3.3 Mento: enumerate broker exchange providers and exchanges; list pairs containing local stablecoins
- [ ] 3.4 Curve: registry/factory search for pools containing wARS or wBRL
- [ ] 3.5 Textile FX: document pools and whether a public quote endpoint exists
- [ ] 3.6 Answer: does a direct wARS/wBRL route exist?

## 4. Route quotes (spec: route-quotes)
- [ ] 4.1 Define USD-equivalent conversion with documented ARS and BRL rates (source + time)
- [ ] 4.2 Quote 50 / 500 / 5000 USD on each existing route (direct and 2-hop via USDT/USDC)
- [ ] 4.3 Compute slippage vs mid-price, venue fee, gas in CELO → USD, total cost %
- [ ] 4.4 List routes that revert or do not exist, with evidence

## 5. Cost benchmark (spec: cost-benchmark)
- [ ] 5.1 Collect public fee/spread data: local exchange via USDT, Wise-type remittance, bank/PIX route
- [ ] 5.2 Compute cost for 50 / 500 / 5000 USD separating conversion, ramps, time to settle
- [ ] 5.3 Mark providers without public data as `not available publicly`

## 6. Report (spec: findings-report)
- [ ] 6.1 Write `docs/spike-findings.md` with verified pairs, working/non-working routes, cost vs alternative
- [ ] 6.2 Write verdict (`real gap` / `no gap` / `inconclusive`) and map to options A/B/C
- [ ] 6.3 Add README with reproduction commands; save timestamped JSON outputs
- [ ] 6.4 Review: every claim has source + date; every unverified item labeled

## 7. Follow-up (not part of this change)
- [ ] 7.1 Open change `stable-router-agent` with the functional spec, using the verdict
- [ ] 7.2 Confirm hackathon eligibility rules (Telegram DevRels / loops.house) before the 2026-10-17 Builder Session
