import { join } from "node:path";
import { type ChargesFeature, createChargesFeature } from "./charges-feature";
import { FileChargeRepository } from "./infrastructure/file-charge-repository";
import { FileSimulatedTransferSource } from "./infrastructure/file-simulated-transfer-source";
import { ripioRampLinkBuilder } from "./infrastructure/ripio-ramp-link";
import { simulatedCheckoutLinkBuilder } from "./infrastructure/simulated-checkout-link";

const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;
const DEFAULT_APP_URL = "http://localhost:3000";

export class InvalidBusinessAddressError extends Error {
  constructor(address: string | undefined) {
    super(
      `"${address ?? ""}" is not a valid BUSINESS_ADDRESS (expected 0x followed by 40 hex characters)`,
    );
    this.name = "InvalidBusinessAddressError";
  }
}

export class InvalidPaymentsModeError extends Error {
  constructor(mode: string) {
    super(`PAYMENTS_MODE must be "simulated" or "ripio", got "${mode}"`);
    this.name = "InvalidPaymentsModeError";
  }
}

export type ChargesConfig =
  | Readonly<{ mode: "simulated"; appUrl: string; dataDir: string }>
  | Readonly<{ mode: "ripio"; recipient: string; dataDir: string }>;

/** Reads the charges configuration. Simulated is the default, so a demo never touches real money. */
export function chargesConfigFromEnv(env: Readonly<Record<string, string | undefined>>, cwd: string): ChargesConfig {
  const dataDir = env.DATA_DIR || join(cwd, ".data");
  const mode = env.PAYMENTS_MODE || "simulated";

  if (mode === "simulated") {
    return { mode, appUrl: env.APP_URL || DEFAULT_APP_URL, dataDir };
  }
  if (mode === "ripio") {
    const recipient = env.BUSINESS_ADDRESS;
    if (!recipient || !ADDRESS_PATTERN.test(recipient)) {
      throw new InvalidBusinessAddressError(recipient);
    }
    return { mode, recipient, dataDir };
  }
  throw new InvalidPaymentsModeError(mode);
}

/** Builds the feature with file storage, shared by the agent and the web app (separate processes). */
export function chargesFeatureFromConfig(config: ChargesConfig): ChargesFeature {
  const charges = new FileChargeRepository(join(config.dataDir, "charges.json"));

  if (config.mode === "simulated") {
    return createChargesFeature({
      charges,
      buildPaymentLink: simulatedCheckoutLinkBuilder({ appUrl: config.appUrl }),
      simulator: new FileSimulatedTransferSource(join(config.dataDir, "simulated-transfers.json")),
    });
  }
  return createChargesFeature({ charges, buildPaymentLink: ripioRampLinkBuilder({ recipient: config.recipient }) });
}
