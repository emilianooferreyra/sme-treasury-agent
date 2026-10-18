import { describe, expect, it } from "vitest";
import { money } from "../../../core/money/money";
import { SimulatedTransferSource } from "./simulated-transfer-source";

describe("SimulatedTransferSource", () => {
  it("lists simulated payments in the order they happened", async () => {
    const source = new SimulatedTransferSource();
    const first = await source.simulatePayment(money(1n, "wARS"));
    const second = await source.simulatePayment(money(2n, "wARS"));

    expect(await source.listIncoming()).toEqual([first, second]);
  });

  it("gives each payment a unique id that says it is simulated", async () => {
    const source = new SimulatedTransferSource();

    const first = await source.simulatePayment(money(1n, "wARS"));
    const second = await source.simulatePayment(money(1n, "wARS"));
    const ids = [first.id, second.id];

    expect(new Set(ids).size).toBe(2);
    expect(ids.every((id) => id.startsWith("simulated-"))).toBe(true);
  });

  it("stamps each payment with the time it arrived", async () => {
    const source = new SimulatedTransferSource({ now: () => new Date("2026-10-17T15:05:00.000Z") });

    const transfer = await source.simulatePayment(money(1n, "wARS"));

    expect(transfer.receivedAt).toBe("2026-10-17T15:05:00.000Z");
  });
});
