import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  async rewrites() {
    return [{
      source: "/api/:path*",
      destination: `${process.env.BACKEND_URL ?? "http://localhost:3001"}/api/:path*`,
    }];
  },
};

export default nextConfig;
