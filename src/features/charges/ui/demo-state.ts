import type { ChargeView } from "../charges-feature";

export type PhoneScreen =
  | Readonly<{ screen: "inbox" }>
  | Readonly<{ screen: "checkout"; chargeId: string }>
  | Readonly<{ screen: "receipt"; chargeId: string }>;

export type DemoTab = "business" | "customer";

/** The demo page: the owner's chat on one side, the customer's phone on the other. */
export type DemoState = Readonly<{
  charges: Readonly<Record<string, ChargeView>>;
  /** Charges whose payment message reached the customer's phone, in the order they were sent. */
  sent: readonly string[];
  phone: PhoneScreen;
  /** Which side a narrow screen shows. */
  tab: DemoTab;
}>;

export type DemoAction =
  | Readonly<{ type: "charge-seen"; charge: ChargeView }>
  /** The owner sent the payment message: it carries the charge so the phone can show it. */
  | Readonly<{ type: "charge-sent"; charge: ChargeView }>
  | Readonly<{ type: "payment-link-opened"; chargeId: string }>
  | Readonly<{ type: "charge-paid"; charge: ChargeView }>
  | Readonly<{ type: "receipt-opened"; chargeId: string }>
  | Readonly<{ type: "phone-back" }>
  | Readonly<{ type: "tab-selected"; tab: DemoTab }>;

export const initialDemoState: DemoState = { charges: {}, sent: [], phone: { screen: "inbox" }, tab: "business" };

/** Field-by-field equality of two views, which are flat objects of strings and booleans. */
function sameView(left: ChargeView, right: ChargeView): boolean {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]) as Set<keyof ChargeView>;
  return [...keys].every((key) => left[key] === right[key]);
}

/**
 * Merges a newer view of a charge. Payment is final: a stale pending view never undoes it.
 * Returns the same object when nothing changes, so React can skip re-rendering.
 */
function upsert(charges: DemoState["charges"], incoming: ChargeView): DemoState["charges"] {
  const current = charges[incoming.id];
  if (current?.status === "paid" && incoming.status === "pending") {
    return charges;
  }
  const created = incoming.created ?? current?.created;
  const merged = { ...incoming, ...(created === undefined ? {} : { created }) };
  return current && sameView(current, merged) ? charges : { ...charges, [incoming.id]: merged };
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "charge-seen": {
      const charges = upsert(state.charges, action.charge);
      return charges === state.charges ? state : { ...state, charges };
    }
    case "charge-sent":
      return {
        ...state,
        charges: upsert(state.charges, action.charge),
        sent: state.sent.includes(action.charge.id) ? state.sent : [...state.sent, action.charge.id],
        phone: { screen: "inbox" },
        tab: "customer",
      };
    case "payment-link-opened":
      return state.sent.includes(action.chargeId)
        ? { ...state, phone: { screen: "checkout", chargeId: action.chargeId } }
        : state;
    case "charge-paid":
      return {
        ...state,
        charges: upsert(state.charges, action.charge),
        phone: { screen: "receipt", chargeId: action.charge.id },
      };
    case "receipt-opened":
      return state.charges[action.chargeId]?.status === "paid"
        ? { ...state, phone: { screen: "receipt", chargeId: action.chargeId } }
        : state;
    case "phone-back":
      return { ...state, phone: { screen: "inbox" } };
    case "tab-selected":
      return { ...state, tab: action.tab };
  }
}
