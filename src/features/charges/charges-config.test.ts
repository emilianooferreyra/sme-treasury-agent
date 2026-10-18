import { describe, expect, it } from "vitest";
import {
  chargesConfigFromEnv,
  InvalidBusinessAddressError,
  InvalidPaymentsModeError,
  InvalidStartBlockError,
} from "./charges-config";

const CWD = "/project";
const ADDRESS = "0x000000000000000000000000000000000000dEaD";

describe("chargesConfigFromEnv", () => {
  it("defaults to simulated payments on the local app, so no demo ever touches real money", () => {
    expect(chargesConfigFromEnv({}, CWD)).toEqual({
      mode: "simulated",
      appUrl: "http://localhost:3000",
      dataDir: "/project/.data",
    });
  });

  it("reads the app URL and data folder when they are set", () => {
    expect(chargesConfigFromEnv({ APP_URL: "https://cobros.test", DATA_DIR: "/tmp/data" }, CWD)).toEqual({
      mode: "simulated",
      appUrl: "https://cobros.test",
      dataDir: "/tmp/data",
    });
  });

  it("uses the real Ripio ramp with a valid business address", () => {
    expect(chargesConfigFromEnv({ PAYMENTS_MODE: "ripio", BUSINESS_ADDRESS: ADDRESS }, CWD)).toEqual({
      mode: "ripio",
      recipient: ADDRESS,
      dataDir: "/project/.data",
    });
  });

  it.each([undefined, "", "0x123", "dEaD", `${ADDRESS}0`, "0x000000000000000000000000000000000000zzzz"])(
    "refuses the ripio mode with %j as the business address",
    (address) => {
      const env = { PAYMENTS_MODE: "ripio", ...(address === undefined ? {} : { BUSINESS_ADDRESS: address }) };

      expect(() => chargesConfigFromEnv(env, CWD)).toThrow(InvalidBusinessAddressError);
    },
  );

  it("reads the block to start watching payments from, when given", () => {
    const env = { PAYMENTS_MODE: "ripio", BUSINESS_ADDRESS: ADDRESS, START_BLOCK: "80385000" };

    expect(chargesConfigFromEnv(env, CWD)).toMatchObject({ mode: "ripio", startBlock: 80_385_000n });
  });

  it.each(["-1", "1.5", "abc", "1e9"])("refuses %j as a start block", (startBlock) => {
    const env = { PAYMENTS_MODE: "ripio", BUSINESS_ADDRESS: ADDRESS, START_BLOCK: startBlock };

    expect(() => chargesConfigFromEnv(env, CWD)).toThrow(InvalidStartBlockError);
  });

  it("refuses an unknown payments mode instead of guessing", () => {
    expect(() => chargesConfigFromEnv({ PAYMENTS_MODE: "real" }, CWD)).toThrow(InvalidPaymentsModeError);
  });
});
