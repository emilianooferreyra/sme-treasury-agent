// Creates the agent's wallet: writes a new private key to .env and prints only the address.
// The key never reaches the terminal, the repo or a chat. Refuses to replace an existing key,
// because the hackathon ties the score to one wallet for the whole event.
//
// Run: node scripts/new-agent-key.ts
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const ENV_FILE = ".env";

if (existsSync(ENV_FILE) && /^AGENT_PRIVATE_KEY=./m.test(readFileSync(ENV_FILE, "utf8"))) {
  console.error(`${ENV_FILE} already has an AGENT_PRIVATE_KEY. Not replacing it: the score is tied to one wallet.`);
  process.exit(1);
}

const privateKey = generatePrivateKey();
appendFileSync(ENV_FILE, `\n# Agent wallet (never commit or share)\nAGENT_PRIVATE_KEY=${privateKey}\n`);

console.log(`Agent wallet: ${privateKeyToAccount(privateKey).address}`);
console.log(`The key is in ${ENV_FILE}. Back it up somewhere safe: losing it loses the agent's identity.`);
