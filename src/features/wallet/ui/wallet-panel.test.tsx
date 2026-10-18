// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// A connected wallet without a real one: the panel only reads wagmi's and RainbowKit's hooks.
const ADDRESS = "0x1234567890abcdef1234567890abcdef123456ab";
vi.mock("wagmi", () => ({
  useAccount: () => ({ address: ADDRESS, isConnected: true }),
  useDisconnect: () => ({ disconnect: vi.fn() }),
  useReadContract: () => ({ data: undefined, isError: false }),
}));
vi.mock("@rainbow-me/rainbowkit", () => ({
  useConnectModal: () => ({ openConnectModal: vi.fn(), connectModalOpen: false }),
}));
import { WalletPanel } from "./wallet-panel";

afterEach(cleanup);

describe("WalletPanel, connected", () => {
  it("tells the business that its charges will arrive at the connected address", () => {
    render(<WalletPanel />);

    expect(screen.getByText("Tus cobros llegarán a")).toBeTruthy();
    expect(screen.getByText("0x1234…56ab")).toBeTruthy();
  });
});
