import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The routes read their configuration from the environment once per process, so each test
// points DATA_DIR at a fresh folder and reloads the modules.
async function loadRoutes() {
  vi.resetModules();
  const charges = await import("../../../../src/features/charges");
  const status = await import("./route");
  const simulate = await import("./simulate-payment/route");
  return { feature: charges.chargesRuntime().feature, status, simulate };
}

const context = (id: string) => ({ params: Promise.resolve({ id }) });
const request = (method = "GET") => new Request("http://localhost/test", { method });
const NEW_CHARGE = {
  requestId: "session-1:turn-1",
  customer: "Juan Pérez",
  description: "2 docenas de medialunas",
  amount: "85000",
};

describe("charge routes (simulated mode)", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "routes-"));
    vi.stubEnv("DATA_DIR", dir);
    vi.stubEnv("PAYMENTS_MODE", "simulated");
    vi.stubEnv("APP_URL", "http://localhost:3000");
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(dir, { recursive: true, force: true });
  });

  it("takes a charge from pending to paid through the simulated payment", async () => {
    const { feature, status, simulate } = await loadRoutes();
    await feature.createCharge(NEW_CHARGE);

    const before = await (await status.GET(request(), context("C-0001"))).json();
    const payment = await (await simulate.POST(request("POST"), context("C-0001"))).json();
    const after = await (await status.GET(request(), context("C-0001"))).json();

    expect(before).toMatchObject({ status: "pending", paymentLink: "http://localhost:3000/pay/C-0001" });
    expect(payment).toMatchObject({ outcome: "paid" });
    expect(after).toMatchObject({ status: "paid" });
  });

  it("answers 404 for a charge that does not exist", async () => {
    const { status, simulate } = await loadRoutes();

    expect((await status.GET(request(), context("missing"))).status).toBe(404);
    expect((await simulate.POST(request("POST"), context("missing"))).status).toBe(404);
  });

  it("refuses to simulate payments in ripio mode (403)", async () => {
    vi.stubEnv("PAYMENTS_MODE", "ripio");
    vi.stubEnv("BUSINESS_ADDRESS", "0x000000000000000000000000000000000000dEaD");
    const { feature, simulate } = await loadRoutes();
    await feature.createCharge(NEW_CHARGE);

    expect((await simulate.POST(request("POST"), context("C-0001"))).status).toBe(403);
  });
});
