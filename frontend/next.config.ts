import type { NextConfig } from "next";
import path from "path";

// Force standard production environment to prevent React 19 dispatcher corruption from non-standard NODE_ENV
(process.env as Record<string, string>).NODE_ENV = "production";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
