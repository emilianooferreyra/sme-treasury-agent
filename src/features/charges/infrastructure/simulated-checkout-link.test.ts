import { describe, expect, it } from "vitest";
import { money } from "../../../core/money/money";
import { aCharge } from "../testing/fixtures";
import { simulatedCheckoutLinkBuilder } from "./simulated-checkout-link";

describe("simulatedCheckoutLinkBuilder", () => {
  it("points to the app's own simulated payment page instead of the real ramp", () => {
    const buildLink = simulatedCheckoutLinkBuilder({ appUrl: "http://localhost:3000" });
    const charge = aCharge({ id: "C-0123", amount: money(1n, "wARS") });

    expect(buildLink(charge)).toBe("http://localhost:3000/pay/C-0123");
  });

  it("escapes the charge id so any order reference yields a valid link", () => {
    const buildLink = simulatedCheckoutLinkBuilder({ appUrl: "http://localhost:3000/" });
    const charge = aCharge({ id: "pedido 12/b", amount: money(1n, "wARS") });

    expect(buildLink(charge)).toBe("http://localhost:3000/pay/pedido%2012%2Fb");
  });
});
