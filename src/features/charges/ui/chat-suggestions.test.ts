import { describe, expect, it } from "vitest";
import type { ChargeView } from "../charges-feature";
import { chatSuggestions, LINK_FOR_KEVIN, MEDIALUNAS_FOR_JUAN } from "./chat-suggestions";

function charge(id: string, customer: string, createdAt = "2026-10-18T12:00:00.000Z"): ChargeView {
  return {
    id,
    customer,
    description: "2 docenas de medialunas",
    amount: "85000",
    currency: "ARS",
    status: "pending",
    createdAt,
    paymentLink: `http://localhost:3000/pay/${id}`,
  };
}

describe("chatSuggestions", () => {
  it("starts with ready-to-send charges, so nobody has to type the first message", () => {
    expect(chatSuggestions({ charges: [], asked: [] })).toEqual([LINK_FOR_KEVIN, MEDIALUNAS_FOR_JUAN]);
  });

  it("once a charge exists, offers to check it by the customer's name and by its number", () => {
    expect(chatSuggestions({ charges: [charge("C-0001", "Kevin Ferreira")], asked: [LINK_FOR_KEVIN] })).toEqual([
      "¿Kevin ya me pagó?",
      "¿Cómo está el C-0001?",
      MEDIALUNAS_FOR_JUAN,
    ]);
  });

  it("asks about the newest charge", () => {
    const suggestions = chatSuggestions({
      charges: [charge("C-0001", "Kevin Ferreira", "2026-10-18T12:00:00.000Z"), charge("C-0002", "Juan Pérez", "2026-10-18T12:05:00.000Z")],
      asked: [LINK_FOR_KEVIN, MEDIALUNAS_FOR_JUAN],
    });

    expect(suggestions).toEqual(["¿Juan ya me pagó?", "¿Cómo está el C-0002?"]);
  });

  it("never repeats what the owner already asked, and offers at most three", () => {
    const suggestions = chatSuggestions({
      charges: [charge("C-0001", "Kevin Ferreira")],
      asked: [LINK_FOR_KEVIN, " ¿Kevin ya me pagó? "],
    });

    expect(suggestions).toEqual(["¿Cómo está el C-0001?", MEDIALUNAS_FOR_JUAN]);
  });
});
