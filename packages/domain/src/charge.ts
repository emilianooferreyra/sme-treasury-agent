export type ChargeStatus = "pending" | "paid";

export type Charge = Readonly<{
  id: string;
  amount: bigint;
  status: ChargeStatus;
}>;

export function createCharge(input: { id: string; amount: bigint }): Charge {
  return {
    id: input.id,
    amount: input.amount,
    status: "pending",
  };
}

export function applyPayment(charge: Charge, received: bigint): Charge {
  if (received === charge.amount) {
    return { ...charge, status: "paid" };
  }

  return charge;
}
