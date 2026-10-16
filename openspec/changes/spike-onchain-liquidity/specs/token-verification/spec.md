# Token Verification

## ADDED Requirements

### Requirement: Token identity is proven on-chain
The spike SHALL verify each local-currency stablecoin on Celo mainnet (chain id 42220) through read-only RPC calls
before listing it as verified.

#### Scenario: Verified token
- GIVEN an address from a public source (Celo docs or Ripio)
- WHEN the script calls `eth_getCode`, `symbol()`, `name()`, `decimals()` and `totalSupply()`
- THEN the address is tagged `verified` only if bytecode is non-empty and the calls succeed
- AND symbol, decimals and supply are recorded with block number and timestamp

#### Scenario: Unverifiable token
- GIVEN an address that returns empty code or reverting calls
- WHEN verification runs
- THEN the address is tagged `not verified` and is never assumed

### Requirement: Token set covered
The spike SHALL cover at least wARS, wBRL, wMXN, wCOP, wPEN, wCLP, BRLm, BRLA, COPm, COPM, USDT and USDC
using the addresses published by Ripio and Celo docs, and SHALL record the source URL of each address.

### Requirement: Proxy and admin surface noted
For each verified token the report SHALL note whether it is an upgradeable proxy (EIP-1967 slot) and any
visible pause/blacklist function, as risk context for remittances.

## Out of scope
- Confirming issuer legal control of the contracts (not verifiable on-chain).
