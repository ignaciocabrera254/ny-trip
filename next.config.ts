import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: an unrelated lockfile in the parent home
  // directory otherwise makes Next.js/Turbopack guess wrong.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
