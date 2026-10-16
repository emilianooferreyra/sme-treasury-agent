# Route Quotes

## ADDED Requirements

### Requirement: Reference amounts
The spike SHALL quote wARS → wBRL for 50, 500 and 5000 USD-equivalent on every route that exists.
The USD-equivalent SHALL be converted using a documented ARS/USD rate and BRL/USD rate, with source and time.

#### Scenario: Route with on-chain quote
- GIVEN a route with a read-only quoter (e.g. Uniswap QuoterV2 `quoteExactInputSingle` via `eth_call`)
- WHEN the quote runs for each reference amount
- THEN the report records amount out, mid-price, effective price, slippage % vs mid-price and fee, with block and timestamp

#### Scenario: Multi-hop route
- GIVEN no direct pair
- WHEN the route wARS → USDT → wBRL is evaluated
- THEN each hop is quoted separately and the combined slippage and fees are reported
- AND the output states the number of hops

#### Scenario: Route does not exist or reverts
- GIVEN a route that cannot be quoted
- WHEN the quote is attempted
- THEN it is listed under "Routes that do not work" with the revert reason or missing-pool evidence

### Requirement: Total cost definition
Total cost SHALL be stated as: venue fee + slippage + gas (in CELO converted to USD) , expressed in USD and as % of amount.
Fiat on/off-ramp costs are reported separately and not mixed with on-chain cost.

### Requirement: Read-only guarantee
The code SHALL perform no transaction, hold no private key and use no funded wallet. Only `eth_call`,
`eth_getCode`, `eth_getLogs` and equivalent reads are allowed. `eth_estimateGas` MAY be used with a zero-balance simulated sender.

## Out of scope
- Execution, signing, approvals or Permit2 flows.
