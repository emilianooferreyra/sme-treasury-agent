// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import HomePage from "./page";

afterEach(cleanup);

describe("landing page", () => {
  it("sums up the flow in three short steps, leaving the explanation to the detail page", () => {
    render(<HomePage />);

    const flow = screen.getByRole("region", { name: "Cómo funciona" });
    const steps = within(flow)
      .getAllByRole("listitem")
      .map((step) => step.textContent);
    expect(steps).toEqual(["Pedís el cobro", "Tu cliente paga en pesos", "El agente concilia"]);
  });

  it("links to the detailed explanation", () => {
    render(<HomePage />);

    expect(screen.getByRole("link", { name: /Ver cómo funciona/ }).getAttribute("href")).toBe("/how-it-works");
  });
});
