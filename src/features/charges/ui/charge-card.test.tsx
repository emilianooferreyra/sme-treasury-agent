// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ChargeView } from "../charges-feature";
import { ChargeCard } from "./charge-card";
import { DemoProvider, useDemo } from "./demo-context";

const CHARGE: ChargeView = {
  id: "C-0001",
  customer: "Juan Pérez",
  description: "2 docenas de medialunas",
  amount: "85000",
  currency: "wARS",
  status: "pending",
  createdAt: "2026-10-17T15:00:00.000Z",
  paymentLink: "http://localhost:3000/pay/C-0001",
  created: true,
};

/** Shows what the customer's phone would read from the shared demo state. */
function PhoneProbe() {
  const { state } = useDemo();
  return <output aria-label="Bandeja">{state.sent.map((id) => state.charges[id]?.description).join(",")}</output>;
}

/**
 * Like the demo page: it reads the shared state, so every dispatch re-renders the chat, and the
 * tool output is parsed again on each render, so every view is a new object.
 */
function Chat({ views }: { views: readonly ChargeView[] }) {
  useDemo();
  return views.map((view, index) => <ChargeCard key={index} charge={{ ...view }} />);
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** A fake status endpoint: answers with the given charges, and records the ids each poll asked for. */
function stubStatusEndpoint(answer: (ids: string[]) => ChargeView[]) {
  const asked: string[][] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const ids = (new URL(url, "http://localhost").searchParams.get("ids") ?? "").split(",");
      asked.push(ids);
      return Response.json({ charges: answer(ids) });
    }),
  );
  return asked;
}

async function nextPoll() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(3000);
  });
}

const pending = (id: string): ChargeView => ({ ...CHARGE, id, paymentLink: `http://localhost:3000/pay/${id}` });

describe("ChargeCard", () => {
  it("renders two views of the same charge without an update loop (an agent retry returns created: false)", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <DemoProvider>
        <Chat views={[CHARGE, { ...CHARGE, created: false }]} />
      </DemoProvider>,
    );

    expect(screen.getAllByLabelText("Cobro C-0001")).toHaveLength(2);
    expect(errors).not.toHaveBeenCalled();
  });

  it("puts the charge on the customer's phone when the owner sends it", () => {
    render(
      <DemoProvider>
        <ChargeCard charge={CHARGE} />
        <PhoneProbe />
      </DemoProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Enviar a Juan" }));

    expect(screen.getByLabelText("Bandeja").textContent).toBe("2 docenas de medialunas");
  });

  describe("status polling", () => {
    it("asks for every pending card in one request, instead of one request per card", async () => {
      vi.useFakeTimers();
      const asked = stubStatusEndpoint((ids) => ids.map(pending));

      render(
        <DemoProvider>
          <Chat views={[pending("C-0001"), pending("C-0002"), pending("C-0003")]} />
        </DemoProvider>,
      );
      await nextPoll();

      expect(asked).toEqual([["C-0001", "C-0002", "C-0003"]]);
    });

    it("shows a payment as soon as the poll reports it, and stops asking for that charge", async () => {
      vi.useFakeTimers();
      const asked = stubStatusEndpoint((ids) =>
        ids.map((id) => (id === "C-0001" ? { ...pending(id), status: "paid", paidBy: "simulated-1" } : pending(id))),
      );

      render(
        <DemoProvider>
          <Chat views={[pending("C-0001"), pending("C-0002")]} />
        </DemoProvider>,
      );
      await nextPoll();
      await nextPoll();

      // Checked per card: the old badge stays in the DOM while its exit animation runs.
      expect(within(screen.getByLabelText("Cobro C-0001")).queryByText("Pagado")).not.toBeNull();
      expect(within(screen.getByLabelText("Cobro C-0002")).queryByText("Pagado")).toBeNull();
      expect(asked.at(-1)).toEqual(["C-0002"]);
    });

    it("stops asking for a charge the server no longer has", async () => {
      vi.useFakeTimers();
      const asked = stubStatusEndpoint((ids) => ids.filter((id) => id !== "C-0001").map(pending));

      render(
        <DemoProvider>
          <Chat views={[pending("C-0001"), pending("C-0002")]} />
        </DemoProvider>,
      );
      await nextPoll();
      await nextPoll();

      expect(asked.at(-1)).toEqual(["C-0002"]);
    });

    it("does not poll when no card is pending", async () => {
      vi.useFakeTimers();
      const asked = stubStatusEndpoint(() => []);

      render(
        <DemoProvider>
          <Chat views={[{ ...pending("C-0001"), status: "paid", paidBy: "simulated-1" }]} />
        </DemoProvider>,
      );
      await nextPoll();

      expect(asked).toEqual([]);
    });
  });
});
