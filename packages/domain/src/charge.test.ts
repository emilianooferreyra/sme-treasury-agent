import { describe, expect, it } from "vitest";
import { applyPayment, createCharge } from "./charge";

// wARS has 18 decimals; amounts are bigint in base units.
const WARS = 10n ** 18n;

describe("Charge", () => {
  it("starts as pending", () => {
    const charge = createCharge({ id: "order-123", amount: 85_000n * WARS });

    expect(charge.status).toBe("pending");
  });

  it("becomes paid when the exact amount arrives", () => {
    const charge = createCharge({ id: "order-123", amount: 85_000n * WARS });

    const result = applyPayment(charge, 85_000n * WARS);

    expect(result.status).toBe("paid");
  });

  it("stays pending when a different amount arrives", () => {
    const charge = createCharge({ id: "order-123", amount: 85_000n * WARS });

    const result = applyPayment(charge, 90_000n * WARS);

    expect(result.status).toBe("pending");
  });

  it("does not modify the original charge", () => {
    const charge = createCharge({ id: "order-123", amount: 85_000n * WARS });

    applyPayment(charge, 85_000n * WARS);

    expect(charge.status).toBe("pending");
  });
});
