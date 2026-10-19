import { fromDataSuffix } from "@celo/attribution-tags";
import { describe, expect, it } from "vitest";
import { ATTRIBUTION_CODES, ATTRIBUTION_SUFFIX } from "./attribution.ts";

describe("attribution (ERC-8021)", () => {
  it("tags with the code Loops House assigned at enrollment, the one the leaderboard credits", () => {
    expect(ATTRIBUTION_CODES[0]).toBe("celo_1bc71ff8ce89");
  });

  it("also carries the code derived from this repository", () => {
    expect(ATTRIBUTION_CODES).toContain("celo_93c87b569368");
  });

  it("encodes every code in a single canonical (schema 0) suffix", () => {
    expect(fromDataSuffix(ATTRIBUTION_SUFFIX)).toMatchObject({ codes: [...ATTRIBUTION_CODES], schemaId: 0 });
  });
});
