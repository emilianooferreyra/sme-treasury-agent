# Findings Report

## ADDED Requirements

### Requirement: Deliverable
The spike SHALL produce `docs/spike-findings.md` containing:
1. Verified pairs and liquidity, each with source and date.
2. Routes that work and routes that do not, with evidence.
3. Estimated cost vs the current alternative for 50 / 500 / 5000 USD.
4. A verdict on whether a real gap exists, backed by the above.

#### Scenario: Evidence discipline
- GIVEN any claim in the report
- WHEN it is written
- THEN it carries a source (tx/call/block or URL) and a timestamp
- AND unverified items are labeled `not verified`

#### Scenario: Verdict
- GIVEN the measurements
- WHEN the verdict is written
- THEN it is one of `real gap`, `no gap`, `inconclusive`, with the specific numbers that justify it
- AND it states which product option (A, B or C) the data supports and which it rules out

### Requirement: Reproducibility
The repo SHALL include the TypeScript (Node + viem) scripts and a `README` section with the exact commands and
RPC endpoint (`https://forno.celo.org`) so any measurement can be re-run. Output SHALL be saved as timestamped JSON next to the report.

### Requirement: No secrets
No private keys, mnemonics or funded wallet configuration SHALL exist in the repository. `.env` files are git-ignored and contain only the RPC URL.
