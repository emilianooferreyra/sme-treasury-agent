// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createWalletConfig } from "./wagmi-config";

describe("createWalletConfig", () => {
  it("offers the wallets a business on Celo uses: browser ones (MiniPay included), MetaMask and Valora", () => {
    // The modal hides browser-only wallets that are not installed, so the config is where to check.
    const wallets = createWalletConfig("test-project-id").connectors.map(
      (connector) => (connector as { rkDetails?: { id: string } }).rkDetails?.id,
    );

    expect(wallets).toEqual(["injected", "metaMask", "valora"]);
  });
});
