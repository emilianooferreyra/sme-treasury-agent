# Cost Benchmark

## ADDED Requirements

### Requirement: Alternatives compared
The spike SHALL estimate the cost of sending the same 50 / 500 / 5000 USD-equivalent from Argentina to Brazil
through today's non-agent options: a local exchange route (e.g. Ripio, Lemon via USDT), Wise or equivalent
remittance provider, and bank/PIX-based routes, using only public sources.

#### Scenario: Sourced estimate
- GIVEN a published fee schedule or rate page
- WHEN the cost is computed
- THEN the report records fee, FX spread vs a reference rate, network fee, limits and KYC requirements, with source URL and access date

#### Scenario: Cost not publicly available
- GIVEN a provider that does not publish fees for this corridor
- WHEN the benchmark is compiled
- THEN the entry is marked `not available publicly` and no number is invented

### Requirement: Reference rates documented
The report SHALL name the ARS (official, MEP/blue where relevant) and BRL reference rates used, their source and timestamp,
since the ARS spread dominates total cost.

### Requirement: Fair comparison
Comparisons SHALL separate (a) on-chain conversion cost, (b) on/off-ramp cost, (c) time to settle, so the agent route
is not credited for savings that belong to the ramps.

## Out of scope
- Regulatory or tax analysis of cross-border transfers.
