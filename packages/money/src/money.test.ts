import { describe, expect, it } from "vitest";
import { CurrencyMismatchError, equals, money } from "./money";

describe("Money", () => {
  it("keeps the amount in base units and its currency", () => {
    const value = money(85_000n, "wARS");

    expect(value.amount).toBe(85_000n);
    expect(value.currency).toBe("wARS");
  });

  it("is equal to another value with the same amount and currency", () => {
    expect(equals(money(85_000n, "wARS"), money(85_000n, "wARS"))).toBe(true);
  });

  it("is not equal to another value with a different amount", () => {
    expect(equals(money(85_000n, "wARS"), money(90_000n, "wARS"))).toBe(false);
  });

  it("refuses to compare different currencies", () => {
    expect(() => equals(money(85_000n, "wARS"), money(85_000n, "wBRL"))).toThrow(
      CurrencyMismatchError,
    );
  });
});
