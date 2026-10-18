import { type ChargesConfig, chargesConfigFromEnv, chargesFeatureFromConfig } from "./charges-config";
import type { ChargesFeature } from "./charges-feature";

let runtime: { config: ChargesConfig; feature: ChargesFeature } | undefined;

/**
 * The charges feature as configured by the environment, built once per process. The agent's
 * tools and the web app's routes both use it, so they agree on mode and storage.
 */
export function chargesRuntime() {
  if (!runtime) {
    const config = chargesConfigFromEnv(process.env, process.cwd());
    runtime = { config, feature: chargesFeatureFromConfig(config) };
  }
  return runtime;
}
