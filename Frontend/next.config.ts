import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: 'export',
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  async rewrites() {
    return [{
      source: "/api/:path*",
      destination: `${process.env.BACKEND_URL ?? "https://ai-card-scan-backend.vercel.app"}/api/:path*`,
    }];
  },
};

export default nextConfig;
