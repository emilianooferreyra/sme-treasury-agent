import { describe, expect, it } from "vitest";
import type { ChargeView } from "../charges-feature";
import { type DemoState, demoReducer, initialDemoState } from "./demo-state";

const PENDING: ChargeView = {
  id: "C-0007",
  customer: "Juan Pérez",
  description: "2 docenas de medialunas",
  amount: "85000",
  currency: "wARS",
  status: "pending",
  createdAt: "2026-10-17T15:00:00.000Z",
  paymentLink: "http://localhost:3000/pay/C-0007",
  created: true,
};

const PAID: ChargeView = {
  ...PENDING,
  status: "paid",
  paidAt: "2026-10-17T15:05:00.000Z",
  paidBy: "simulated-1",
};

function stateWith(...actions: Parameters<typeof demoReducer>[1][]): DemoState {
  return actions.reduce(demoReducer, initialDemoState);
}

describe("demoReducer", () => {
  it("starts on the business side with an empty phone", () => {
    expect(initialDemoState).toEqual({ charges: {}, sent: [], phone: { screen: "inbox" }, tab: "business" });
  });

  it("remembers a charge the agent created", () => {
    expect(stateWith({ type: "charge-seen", charge: PENDING }).charges["C-0007"]).toEqual(PENDING);
  });

  it("returns the very same state when a view brings nothing new, so React skips the re-render", () => {
    const state = stateWith({ type: "charge-seen", charge: PENDING });

    expect(demoReducer(state, { type: "charge-seen", charge: { ...PENDING } })).toBe(state);
  });

  it("never turns a paid charge back into pending when a stale view arrives", () => {
    const state = stateWith({ type: "charge-paid", charge: PAID }, { type: "charge-seen", charge: PENDING });

    expect(state.charges["C-0007"]?.status).toBe("paid");
  });

  it("sends the payment message to the customer's phone once, and shows the customer side", () => {
    const state = stateWith(
      { type: "charge-seen", charge: PENDING },
      { type: "charge-sent", chargeId: "C-0007" },
      { type: "charge-sent", chargeId: "C-0007" },
    );

    expect(state.sent).toEqual(["C-0007"]);
    expect(state.tab).toBe("customer");
    expect(state.phone).toEqual({ screen: "inbox" });
  });

  it("opens the checkout in the phone when the customer taps a link they received", () => {
    const state = stateWith(
      { type: "charge-seen", charge: PENDING },
      { type: "charge-sent", chargeId: "C-0007" },
      { type: "payment-link-opened", chargeId: "C-0007" },
    );

    expect(state.phone).toEqual({ screen: "checkout", chargeId: "C-0007" });
  });

  it("ignores a link the customer never received", () => {
    const state = stateWith({ type: "charge-seen", charge: PENDING }, { type: "payment-link-opened", chargeId: "C-0007" });

    expect(state.phone).toEqual({ screen: "inbox" });
  });

  it("shows the receipt in the phone and marks the charge paid for the owner once the payment goes through", () => {
    const state = stateWith(
      { type: "charge-seen", charge: PENDING },
      { type: "charge-sent", chargeId: "C-0007" },
      { type: "payment-link-opened", chargeId: "C-0007" },
      { type: "charge-paid", charge: PAID },
    );

    expect(state.phone).toEqual({ screen: "receipt", chargeId: "C-0007" });
    expect(state.charges["C-0007"]).toEqual({ ...PAID, created: true });
  });

  it("reopens the receipt of a paid charge from the inbox", () => {
    const state = stateWith(
      { type: "charge-seen", charge: PENDING },
      { type: "charge-sent", chargeId: "C-0007" },
      { type: "charge-paid", charge: PAID },
      { type: "phone-back" },
      { type: "receipt-opened", chargeId: "C-0007" },
    );

    expect(state.phone).toEqual({ screen: "receipt", chargeId: "C-0007" });
  });

  it("has no receipt to open for a charge that is still pending", () => {
    const state = stateWith(
      { type: "charge-seen", charge: PENDING },
      { type: "charge-sent", chargeId: "C-0007" },
      { type: "receipt-opened", chargeId: "C-0007" },
    );

    expect(state.phone).toEqual({ screen: "inbox" });
  });

  it("goes back to the inbox from any phone screen", () => {
    const state = stateWith(
      { type: "charge-seen", charge: PENDING },
      { type: "charge-sent", chargeId: "C-0007" },
      { type: "payment-link-opened", chargeId: "C-0007" },
      { type: "phone-back" },
    );

    expect(state.phone).toEqual({ screen: "inbox" });
  });

  it("switches between the business and customer sides", () => {
    expect(stateWith({ type: "tab-selected", tab: "customer" }).tab).toBe("customer");
  });
});
