import type { ChargeView } from "../charges-feature";

export const LINK_FOR_KEVIN = "Creame un link de cobro para Kevin Ferreira por $25.000 por un pedido de alfajores";
export const MEDIALUNAS_FOR_JUAN = "Cobrale $85.000 a Juan Pérez por 2 docenas de medialunas";

const EXAMPLE_CHARGES = [LINK_FOR_KEVIN, MEDIALUNAS_FOR_JUAN];
const MAX_SUGGESTIONS = 3;

function newest(charges: readonly ChargeView[]): ChargeView | undefined {
  return charges.reduce<ChargeView | undefined>(
    (latest, charge) =>
      !latest || charge.createdAt > latest.createdAt || (charge.createdAt === latest.createdAt && charge.id > latest.id)
        ? charge
        : latest,
    undefined,
  );
}

/**
 * Messages the owner can send with one tap, for the two jobs a shop has: create a payment link to
 * share, and check whether a charge was paid, by the customer's name or by its number. What the
 * owner already asked is not offered again.
 */
export function chatSuggestions({
  charges,
  asked,
}: {
  charges: readonly ChargeView[];
  asked: readonly string[];
}): string[] {
  const latest = newest(charges);
  const firstName = latest?.customer.trim().split(/\s+/)[0];
  const candidates = [
    ...(latest ? [`¿${firstName} ya me pagó?`, `¿Cómo está el ${latest.id}?`] : []),
    ...EXAMPLE_CHARGES,
  ];
  const alreadyAsked = new Set(asked.map((message) => message.trim()));

  return candidates.filter((candidate) => !alreadyAsked.has(candidate)).slice(0, MAX_SUGGESTIONS);
}
