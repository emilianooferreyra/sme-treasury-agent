import { codeFromRepo, toDataSuffix } from "@celo/attribution-tags";

/**
 * ERC-8021 attribution. The leaderboard only credits the code Loops House assigned at enrollment
 * (it is public: it rides in every transaction's calldata). The repo-derived code goes along too.
 * Untagged transactions are never credited and cannot be tagged afterwards.
 */
const ENROLLMENT_CODE = "celo_1bc71ff8ce89";
const REPOSITORY = "emilianooferreyra/sme-treasury-agent";

export const ATTRIBUTION_CODES: readonly string[] = [ENROLLMENT_CODE, codeFromRepo(REPOSITORY)];

export const ATTRIBUTION_SUFFIX = toDataSuffix(ATTRIBUTION_CODES);
