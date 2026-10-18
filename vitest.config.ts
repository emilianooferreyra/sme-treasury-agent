import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resolves the "@/*" alias from tsconfig.json, as Next.js does, so tests can import components.
  resolve: { tsconfigPaths: true },
});
