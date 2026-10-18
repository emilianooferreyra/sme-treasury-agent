// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WalletSection } from "./wallet-section";

afterEach(() => {
  cleanup();
});

describe("WalletSection", () => {
  it("shows the connect button right away, disabled until the wallet code arrives, so the page does not jump", () => {
    render(<WalletSection />);

    const button = screen.getByRole("button", { name: "Conectar billetera" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("swaps in the working wallet panel once its code has loaded", async () => {
    render(<WalletSection />);

    await expect
      .poll(() => (screen.getByRole("button", { name: "Conectar billetera" }) as HTMLButtonElement).disabled, {
        timeout: 10_000,
      })
      .toBe(false);
  });
});
