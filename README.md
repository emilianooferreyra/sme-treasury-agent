# SME Treasury Agent

An AI collections assistant for Argentine small businesses: charge customers in pesos, get paid in
**wARS** (Ripio's digital peso) on **Celo**, and let the agent reconcile payments for you.

> Portfolio and learning project. Payments are **simulated by default**: no real money moves unless you
> explicitly switch to the real Ripio ramp.

## How it works

1. **The owner asks the agent for a charge.** *"Cobrale $85.000 a Juan Pérez por 2 docenas de
   medialunas"*. The agent creates charge `C-0001` with its payment link.
2. **The customer pays from their bank.** In production the link opens Ripio's on-ramp: the customer
   pays in pesos without touching crypto, and the business receives wARS on Celo.
3. **The agent reconciles.** Each incoming transfer is matched to the pending charge with the exact
   amount. The charge turns *paid* and both sides get a receipt.

The demo at `/demo` shows both sides at once: the owner's chat on the left and the customer's phone on
the right (tabs on mobile). The landing page at `/` reads a connected wallet's **real** wARS balance on
Celo mainnet (read-only, nothing is signed).

## Stack

| Layer | Choice |
| --- | --- |
| Agent | [eve](https://eve.dev) (Vercel) with a single typed tool, `create_charge` |
| Model | `openai/gpt-oss-120b` on Groq, through the AI SDK |
| Web | Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui, Motion |
| Chain | Celo mainnet, viem + wagmi (read-only) |
| Payments | Ripio ramp link, or a simulated checkout for demos |
| Tests | Vitest, written first (TDD) and checked with mutations |

## Architecture

A single project organised by features, with ports and adapters inside each feature:

```
agent/                      eve agent: model, instructions, tools
app/                        Next.js routes: landing, /demo, /pay/[id], /api/charges/[id]
src/
  core/
    money/                  Money as bigint base units, parsing and formatting (never `number`)
    storage/                atomic JSON file storage for local demos
    ui/                     shadcn components
  features/
    charges/
      domain/               charges, payment matching, references (C-0001…)
      application/          use cases (create charge, reconcile payments) and ports
      infrastructure/       Ripio link, simulated checkout, on-chain reader, file and in-memory adapters
      ui/                   charge card, payer phone, checkout, receipt
    wallet/                 wagmi config, wARS balance (read-only)
```

Some decisions worth calling out:

- **Money is a `bigint` in base units** (wARS has 18 decimals). Amounts cross JSON as decimal strings,
  and displays truncate instead of rounding: a balance never shows money that is not there.
- **Charge creation is idempotent per request.** The key is the eve session and turn plus the charge
  details, so a retried agent step returns the same charge instead of a duplicate.
- **Reconciliation never guesses.** The ramp link carries no order reference, so the amount is the only
  key. If two pending charges share an amount, the transfer is flagged as ambiguous for a person to
  assign, and a transfer only pays charges that existed when it arrived.
- **Test mode is visible**, Stripe style: an orange strip across the app and a "Prueba" tag on every
  simulated receipt, so a screenshot cannot pass for a real payment.

## Getting started

Requirements: Node.js 24+ and pnpm.

```sh
pnpm install
```

Create `.env.local` (it is git-ignored):

| Variable | Required | Description |
| --- | --- | --- |
| `GROQ_API_KEY` | yes | Groq API key for the model |
| `PAYMENTS_MODE` | no | `simulated` (default) or `ripio` |
| `BUSINESS_ADDRESS` | with `ripio` | Celo address that receives wARS |
| `START_BLOCK` | no | With `ripio`: Celo block to start watching payments from. Default: the current block, so only new payments count |
| `APP_URL` | no | Base URL for simulated payment links. Default `http://localhost:3000` |
| `DATA_DIR` | no | Where local demo data is stored. Default `./.data` |

```sh
pnpm dev          # web app and agent together, on http://localhost:3000
pnpm dev:agent    # the agent alone, in eve's terminal chat
pnpm test         # unit and integration tests
pnpm typecheck    # TypeScript
```

## Status

Built:

- Charges with references, idempotent creation and the Ripio ramp link.
- Reconciliation with simulated payments, file storage, the two-sided demo and receipts.
- In `ripio` mode, an on-chain reader of wARS `Transfer` events to the business address: it waits
  for confirmations, scans only new blocks, and real receipts link the transaction on Celoscan.
- A read-only wallet that shows the real wARS balance.

Next:

- Real persistence (Postgres) to deploy.

Later, phase 2: paying suppliers in Brazil (wARS → USD₮ → wBRL), behind explicit limits and a
dedicated wallet.

Phase 1 holds **no keys and sends no transactions**: the agent only creates links and reads the chain.
