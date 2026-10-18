import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// The routes read their configuration from the environment once per process, so each test
// points DATA_DIR at a fresh folder and reloads the modules.
async function loadRoutes() {
  vi.resetModules();
  const charges = await import("@/features/charges");
  const status = await import("./route");
  const simulate = await import("./[id]/simulate-payment/route");
  return { feature: charges.chargesRuntime().feature, status, simulate };
}

const context = (id: string) => ({ params: Promise.resolve({ id }) });
const statusOf = (ids: string) =>
  new NextRequest(`http://localhost/api/charges?ids=${encodeURIComponent(ids)}`);
const simulateRequest = () => new Request("http://localhost/test", { method: "POST" });
const NEW_CHARGE = {
  requestId: "session-1:turn-1",
  customer: "Juan Pérez",
  description: "2 docenas de medialunas",
  amount: "85000",
};

describe("charge routes (simulated mode)", () => {
  let dir: string;

  // The first import transforms the whole feature (viem included). Doing it once here keeps that
  // cold cost out of the tests' own timeout; later imports re-run modules but reuse the transform.
  beforeAll(async () => {
    await import("./route");
    await import("./[id]/simulate-payment/route");
  }, 30_000);

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

    const before = await (await status.GET(statusOf("C-0001"))).json();
    const payment = await (await simulate.POST(simulateRequest(), context("C-0001"))).json();
    const after = await (await status.GET(statusOf("C-0001"))).json();

    expect(before.charges).toMatchObject([{ status: "pending", paymentLink: "http://localhost:3000/pay/C-0001" }]);
    expect(payment).toMatchObject({ outcome: "paid" });
    expect(after.charges).toMatchObject([{ status: "paid" }]);
  });

  it("answers the status of several charges at once, leaving out the ones that do not exist", async () => {
    const { feature, status } = await loadRoutes();
    await feature.createCharge(NEW_CHARGE);
    await feature.createCharge({ ...NEW_CHARGE, requestId: "session-1:turn-2" });

    const response = await status.GET(statusOf("C-0002,C-9999,C-0001,C-0002"));

    expect(response.status).toBe(200);
    expect((await response.json()).charges.map((charge: { id: string }) => charge.id)).toEqual(["C-0002", "C-0001"]);
  });

  it.each([
    ["no ids", ""],
    ["an id that is not a charge reference", "C-0001,../secrets"],
    ["more than 50 ids", Array.from({ length: 51 }, (_, index) => `C-${index + 1}`).join(",")],
  ])("refuses a status request with %s (400)", async (_case, ids) => {
    const { status } = await loadRoutes();

    expect((await status.GET(statusOf(ids))).status).toBe(400);
  });

  it("answers 404 when simulating the payment of a charge that does not exist", async () => {
    const { simulate } = await loadRoutes();

    expect((await simulate.POST(simulateRequest(), context("missing"))).status).toBe(404);
  });

  it("refuses to simulate payments in ripio mode (403)", async () => {
    vi.stubEnv("PAYMENTS_MODE", "ripio");
    vi.stubEnv("BUSINESS_ADDRESS", "0x000000000000000000000000000000000000dEaD");
    const { feature, simulate } = await loadRoutes();
    await feature.createCharge(NEW_CHARGE);

    expect((await simulate.POST(simulateRequest(), context("C-0001"))).status).toBe(403);
  });
});
