import { withEve } from "eve/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

// Mounts the agent in ./agent at /eve/v1/* on the same origin as the app.
export default withEve(nextConfig);
