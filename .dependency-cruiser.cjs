/**
 * Module boundaries. The domain never depends on infrastructure.
 *
 *   money        → nothing (shared kernel)
 *   collections  → money
 *   adapters/*   → domain packages (never the other way)
 *   apps/*       → anything
 *
 * Test files may import test tooling (vitest).
 */

const DOMAIN = "^packages/(money|collections|ledger|payouts)/";
const TEST_FILE = "\\.test\\.ts$";

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular dependencies make modules impossible to reason about in isolation.",
      from: {},
      to: { circular: true },
    },
    {
      name: "not-to-unresolvable",
      severity: "error",
      comment: "Every import must resolve; an unresolvable import is a missing dependency.",
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: "money-is-a-leaf",
      severity: "error",
      comment: "money is the shared kernel: it depends on nothing.",
      from: { path: "^packages/money/", pathNot: TEST_FILE },
      to: { pathNot: "^packages/money/" },
    },
    {
      name: "collections-only-depends-on-money",
      severity: "error",
      comment: "collections may use money and nothing else.",
      from: { path: "^packages/collections/", pathNot: TEST_FILE },
      to: { pathNot: "^packages/(collections|money)/" },
    },
    {
      name: "domain-not-to-infrastructure",
      severity: "error",
      comment: "Domain packages must not know about adapters, apps, chain or agent libraries.",
      from: { path: DOMAIN },
      to: { path: ["^packages/adapters/", "^apps/", "node_modules/(viem|eve|ai|@vercel)/"] },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "(^|/)(node_modules|\\.eve|\\.output|dist)/" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "default"],
      extensions: [".ts", ".js"],
    },
  },
};
