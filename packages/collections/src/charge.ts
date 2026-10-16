import { equals, type Money } from "@sme-treasury-agent/money/money";

export type ChargeStatus = "pending" | "paid";

export type Charge = Readonly<{
  id: string;
  amount: Money;
  status: ChargeStatus;
}>;

export function createCharge(input: { id: string; amount: Money }): Charge {
  return {
    id: input.id,
    amount: input.amount,
    status: "pending",
  };
}

export function applyPayment(charge: Charge, received: Money): Charge {
  if (equals(received, charge.amount)) {
    return { ...charge, status: "paid" };
  }

  return charge;
}
