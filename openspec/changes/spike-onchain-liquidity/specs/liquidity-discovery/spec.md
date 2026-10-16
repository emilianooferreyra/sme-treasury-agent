# Liquidity Discovery

## ADDED Requirements

### Requirement: Venue enumeration
The spike SHALL look for pools or exchanges involving wARS or wBRL on each of: Uniswap (v3 and v4), Mento
(broker/exchange providers), Curve, and Textile FX.

#### Scenario: Pool found
- GIVEN a candidate pool address
- WHEN the script reads token0/token1, fee and liquidity or reserves
- THEN the pool is recorded with address, pair, fee tier, reserves in token units and USD-equivalent, block and timestamp
- AND the pool address is tagged `verified` only if the pair contains the expected tokens

#### Scenario: No pool found
- GIVEN a venue with no pool containing wARS or wBRL
- WHEN discovery finishes
- THEN the report states "no pool found on <venue> as of <timestamp>" along with the method used (factory lookup, registry, event scan)
- AND it SHALL NOT claim absence beyond what the method can show

### Requirement: Direct pair question answered
The spike SHALL state explicitly whether a direct wARS/wBRL route exists on any venue, or whether the only
route is multi-hop through USDT/USDC.

### Requirement: Off-chain quote venues flagged
Where a venue quotes off-chain (RFQ, e.g. Textile FX), the report SHALL mark depth as
`not measurable on-chain` unless a public quote endpoint is documented and used, in which case the endpoint and terms are cited.

## Out of scope
- Liquidity on chains other than Celo.
