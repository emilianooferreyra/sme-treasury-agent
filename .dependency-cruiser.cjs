/**
 * Boundaries for a feature-based layout.
 *
 *   src/core/money          → nothing (shared kernel)
 *   src/core/*              → never features or the agent
 *   src/features/<f>/domain → only its own domain and src/core (no infrastructure)
 *   src/features/<a>        → src/features/<b> only through <b>/index.ts
 *   agent/                  → features only through their index.ts
 *
 * Test files may import test tooling (vitest).
 */

const TEST_FILE = "\\.test\\.ts$";
const INFRASTRUCTURE_LIBS = "node_modules/(viem|eve|ai|@vercel|zod)/";

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
      from: { path: "^src/core/money/", pathNot: TEST_FILE },
      to: { pathNot: "^src/core/money/" },
    },
    {
      name: "core-not-to-features-or-agent",
      severity: "error",
      comment: "core is shared by every feature, so it cannot depend on any of them.",
      from: { path: "^src/core/" },
      to: { path: ["^src/features/", "^agent/"] },
    },
    {
      name: "domain-stays-pure",
      severity: "error",
      comment: "A feature's domain only depends on its own domain and src/core.",
      from: { path: "^src/features/([^/]+)/domain/", pathNot: TEST_FILE },
      to: { pathNot: ["^src/features/$1/domain/", "^src/core/"] },
    },
    {
      name: "domain-not-to-infrastructure-libs",
      severity: "error",
      comment: "Domain code must not know about the chain, the agent framework or schema libraries.",
      from: { path: "^src/features/[^/]+/domain/" },
      to: { path: INFRASTRUCTURE_LIBS },
    },
    {
      name: "features-through-public-api",
      severity: "error",
      comment: "A feature reaches another feature only through its index.ts.",
      from: { path: "^src/features/([^/]+)/" },
      to: {
        path: "^src/features/",
        pathNot: ["^src/features/$1/", "^src/features/[^/]+/index\\.ts$"],
      },
    },
    {
      name: "agent-through-public-api",
      severity: "error",
      comment: "eve tools, schedules and channels use features only through their index.ts.",
      from: { path: "^agent/" },
      to: { path: "^src/features/", pathNot: "^src/features/[^/]+/index\\.ts$" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "^(\\.eve|\\.output|dist)/" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "default"],
      extensions: [".ts", ".js"],
    },
  },
};
