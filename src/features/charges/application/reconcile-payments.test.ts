import { describe, expect, it } from "vitest";
import { InMemoryChargeRepository } from "../infrastructure/in-memory-charge-repository";
import { SimulatedTransferSource } from "../infrastructure/simulated-transfer-source";
import { aCharge, wars } from "../testing/fixtures";
import { reconcilePaymentsUseCase } from "./reconcile-payments";

async function setup(...pending: Array<[id: string, units: bigint]>) {
  const charges = new InMemoryChargeRepository();
  for (const [id, units] of pending) {
    await charges.save(aCharge({ id, amount: wars(units) }));
  }
  const transfers = new SimulatedTransferSource();
  const reconcile = reconcilePaymentsUseCase({ charges, transfers });
  return { charges, transfers, reconcile };
}

describe("reconcilePayments use case", () => {
  it("marks the matching charge as paid and reports it", async () => {
    const { charges, transfers, reconcile } = await setup(["C-0123", 85_000n]);
    const transfer = await transfers.simulatePayment(wars(85_000n));

    const report = await reconcile();

    expect(report).toEqual({ paid: ["C-0123"], unmatched: [], ambiguous: [] });
    expect(await charges.findById("C-0123")).toMatchObject({ status: "paid", paidBy: transfer.id });
  });

  it("is safe to repeat: a second run changes nothing", async () => {
    const { transfers, reconcile } = await setup(["C-0123", 85_000n]);
    await transfers.simulatePayment(wars(85_000n));
    await reconcile();

    const second = await reconcile();

    expect(second).toEqual({ paid: [], unmatched: [], ambiguous: [] });
  });

  it("never lets a transfer that already paid a charge pay a newer one with the same amount", async () => {
    const { charges, transfers, reconcile } = await setup(["C-0001", 85_000n]);
    await transfers.simulatePayment(wars(85_000n));
    await reconcile();
    await charges.save(aCharge({ id: "C-0002", amount: wars(85_000n) }));

    await reconcile();

    expect(await charges.findById("C-0002")).toMatchObject({ status: "pending" });
  });

  it("reports a transfer that matches no charge", async () => {
    const { transfers, reconcile } = await setup(["C-0123", 85_000n]);
    const transfer = await transfers.simulatePayment(wars(1_000n));

    expect(await reconcile()).toEqual({ paid: [], unmatched: [transfer.id], ambiguous: [] });
  });

  it("leaves both charges pending when a transfer could pay either", async () => {
    const { charges, transfers, reconcile } = await setup(["C-0001", 85_000n], ["C-0002", 85_000n]);
    const transfer = await transfers.simulatePayment(wars(85_000n));

    expect(await reconcile()).toEqual({ paid: [], unmatched: [], ambiguous: [transfer.id] });
    expect(await charges.findById("C-0001")).toMatchObject({ status: "pending" });
    expect(await charges.findById("C-0002")).toMatchObject({ status: "pending" });
  });

  it("reports a duplicate payment in the same run as unmatched and keeps the first one", async () => {
    const { charges, transfers, reconcile } = await setup(["C-0123", 85_000n]);
    const first = await transfers.simulatePayment(wars(85_000n));
    const duplicate = await transfers.simulatePayment(wars(85_000n));

    expect(await reconcile()).toEqual({ paid: ["C-0123"], unmatched: [duplicate.id], ambiguous: [] });
    expect(await charges.findById("C-0123")).toMatchObject({ paidBy: first.id });
  });

  it("pays two charges with different amounts in one run", async () => {
    const { transfers, reconcile } = await setup(["C-0001", 85_000n], ["C-0002", 90_000n]);
    await transfers.simulatePayment(wars(90_000n));
    await transfers.simulatePayment(wars(85_000n));

    const report = await reconcile();

    expect([...report.paid].sort()).toEqual(["C-0001", "C-0002"]);
  });
});
