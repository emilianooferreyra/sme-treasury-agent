# Proposal: sme-treasury-agent

Status: draft · Date: 2026-10-15 (rev. 2026-10-16) · Owner: Emi
Supersedes: `spike-onchain-liquidity` (its route/benchmark scope no longer matches the product; see Decision log).

## Why

A small business in Argentina that sells to customers without crypto needs to **collect**: issue a charge, know
when it was paid, and chase late payers. Today that means checking bank movements by hand against a list of orders,
which is repetitive and error-prone.

Ripio wFiat on Celo makes collection observable: a charge link to `ramp.ripio.com` with `amount` and `address`
pre-filled lets the payer pay from their bank in ARS; wARS lands on-chain at the business address, where every
incoming transfer can be read and reconciled against open charges.

This is a standalone portfolio/learning project. It is **not** a hackathon entry (decision 2026-10-14), so no
attribution tag, ERC-8004 identity or deadline is required.

Value hypothesis (not measured): the value is **reconciliation and follow-up**, not generating the link.

Phase 2 (conditional) adds the other side of treasury: paying a supplier in Brazil in BRL within limits.

## Example flow

Ana runs a clothing shop in Córdoba.

1. Ana: "cobrale $85.000 a Juan por el pedido 123" → a charge is created and a ramp link returned.
2. Juan opens the link and pays from his bank in ARS; Ripio delivers wARS to Ana's address.
3. The incoming transfer is matched to charge 123, which becomes `paid`.
4. If Juan has not paid after N days, the charge becomes `overdue` and a reminder is drafted.
5. Ana asks "¿quién me debe?" at any time and gets the open balance per customer.

## Deterministic core vs LLM

Most of the flow is deterministic and must stay that way. The agent is not sold as "autonomous": the LLM works at
the edges, the rules live in each feature's `domain/` (`src/features/<feature>/domain`).

| Deterministic (domain, test-first) | LLM (where it adds value) |
|---|---|
| Charge lifecycle: pending → paid / partially paid / overdue / cancelled | Turning "cobrale a Juan lo del martes" into a charge |
| Exact matching of an incoming transfer to a charge | Answering "¿quién me debe?", "¿cómo vengo este mes?" |
| Amount owed, due dates, when a reminder is due | Drafting the reminder according to the customer's history |
| — | **Ambiguous matches**: asks Ana which charge a payment belongs to |

Rule: the LLM never changes a charge's state on its own; it calls domain operations that validate the transition.

## What is already established

| Fact | Confidence | Source |
|---|---|---|
| wARS `0x0dc4…d90d` on Celo mainnet, 18 decimals | high | Celo docs, RPC check (2026-10-09) |
| `ramp.ripio.com` accepts `country`, `chain`, `token`, `amount`, `address`; no order-reference parameter found | medium | page inspection, round 3 research |
| eve: agent = folder (`instructions.md`, `tools/`, `schedules/`, `channels/`), Zod tools, `approval` per tool, beta | medium | eve.dev/llms.txt, organizer slides |

## Verifications (gate before specs)

Each item ends as `confirmed` / `refuted` / `blocked`, with evidence and date, in `docs/verifications.md`.

| # | Question | Blocks | Who |
|---|---|---|---|
| V1 | Does a ramp link with a **third-party** `address` deliver wARS to that address? What KYC does the payer see? How long does it take? | the whole product | owner (small real payment) |
| V2 | Does the amount received equal the charged amount (fees, rounding)? | matching strategy | owner (same test as V1) |
| V3 | Can an eve tool import a workspace package (`@repo/domain`)? Is Node 24 required? | repo layout | agent |
| V4 | Is wARS deployed on a Celo testnet? | test strategy | agent (read-only RPC) |
| V5 | Can a non-filler get a Textile quote and execute wARS → USD₮ → wBRL? Minimum size, depth for ~R$2.000? | phase 2 only | agent (research); execution needs funds |

V1–V4 gate phase 1 specs. V5 gates phase 2 only and does not block phase 1.

If V1 is refuted, the product falls back to "payer sends wARS directly" (crypto-native payers only) and this
proposal is revisited.

## Scope

### Phase 1: collect (read-only on-chain, **no private key**)

In:
1. Feature domains (`src/features/charges`, `reconciliation`, `reminders`): charge lifecycle, matching, amount owed and reminder rules. Pure TypeScript, test-first.
2. Charge link generation for `ramp.ripio.com`.
3. Detection of incoming wARS transfers to the business address(es) with viem over read-only RPC.
4. eve agent (`agent/`) with tools to create charges, list them, report status and resolve ambiguous matches;
   scheduled reconciliation; one channel (Telegram or web).

### Phase 2: pay suppliers in BRL (**requires a funded wallet**)

Starts only when **both** hold: V5 is `confirmed`, and the owner explicitly decides to create a dedicated agent
wallet with a low balance cap.

In:
1. Supplier registry (name, Celo address for wBRL; supplier withdraws via `ramp.ripio.com/offramp`).
2. Payment of a BRL amount: wARS → USD₮ → wBRL via Textile FX, then wBRL transfer to the supplier.
3. Limits enforced in `src/features/payouts/domain`: per-payment cap, daily cap, allow-listed suppliers only.
4. Human approval (eve `approval`) for any payment above a threshold, and always for a new supplier.
5. Quote shown before execution (rate, slippage, fees); execution aborts if the quote moves beyond a tolerance.

Notes:
- The organizer and sponsors explicitly suggest this use case ("Pago a proveedores… con límites"; Textile's
  "treasury agents that manage a business's currency exposure"). The ramps' regulated side (KYC, fiat) is run by
  Ripio. Legal review becomes relevant only if this is offered as a service to third-party businesses.
- Irreversibility is mitigated by the wallet cap, domain limits and approval; it is not eliminated.

### Out (both phases)

- WhatsApp channel (not supported by eve).
- Invoicing/AFIP, accounting exports, multi-business.
- Attribution tags and ERC-8004 (kept as a disabled adapter seam; optional later).

## Key constraint

In phase 1 the agent only generates links and reads chain events for addresses the owner controls. No private key
exists in code or configuration; the spike's safety rule (no keys, no transactions) holds for all of phase 1.
Phase 2 introduces the first key: a dedicated, capped wallet, never the owner's main wallet, loaded from a secret
store and never returned by any tool output.

## Open design questions (resolved in design.md)

1. **Matching without a memo.** The ramp accepts no order reference, so two payments of $85.000 on the same day are
   indistinguishable. Options:
   - **Amount offset** ($85.000,37 per charge): simple; breaks if the ramp charges fees or rounds (V2).
   - **One address per charge**, derived from an extended public key (xpub), watch-only: robust and still keyless;
     cost is that funds end up spread across many addresses that the owner must later consolidate.
   - **Ask Ana** when a payment matches more than one charge: fallback for either option above.
2. Persistence: eve session state vs Postgres (Neon + Drizzle) for charges.
3. Confirmation depth before marking a charge paid.

## Risks

- eve is beta → business rules stay in `src/features/*/domain`; eve tools are thin adapters that call a feature's `index.ts`.
- Ramp behaviour is controlled by Ripio and undocumented for third-party addresses → V1 first.
- Payer KYC inside Ripio reduces conversion and is outside our control.
- Ramp fees and settlement time are unknown → measured in V1/V2 and shown to the owner.
- Ripio could ship this feature itself. Accepted: this is a learning/portfolio project.
- Phase 2: Textile has no public integration guide and unverified liquidity → V5; if refuted, phase 2 is dropped
  and phase 1 stands alone.

## Decision log

- 2026-10-09: spike-only scope; Jira deferred; docs in English.
- 2026-10-14: user will not enter the hackathon; project continues standalone.
- 2026-10-15: pivot from ARS→BRL remittance router to SME treasury agent. `spike-onchain-liquidity` superseded.
- 2026-10-15: Belo Buildathon parked until Belo's MCP is public (would be another adapter).
- 2026-10-16: part B (supplier payments) removed from scope (regulation, irreversible risk, two conversions).
  Product = collection only. Added deterministic-vs-LLM split, xpub option and "ask Ana" fallback. V5 dropped.
- 2026-10-16: part B restored as **phase 2**, gated by V5 and an explicit wallet decision. The legal argument was
  overweighted for a learning project moving the owner's own funds in small amounts; the remaining blockers are
  technical (Textile integration/liquidity, signing with real funds).
- 2026-10-16: layout changed to a **single project organized by features** (feature-based architecture):
  `agent/` (eve), `src/features/<feature>/{domain,application,infrastructure,index.ts}`, `src/core/` (money, chain,
  config), `fixtures/`. Turborepo and the multi-package workspace were removed as unjustified for one person and one
  deployable. Feature boundaries are a convention (features talk through `index.ts`; `domain/` never imports
  infrastructure), checked in review. No extra tooling until there is evidence it is needed.
