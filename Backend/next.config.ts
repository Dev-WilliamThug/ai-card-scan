import type { NextConfig } from "next";
import path from "node:path";

const frontendOrigin = process.env.FRONTEND_URL!;

const nextConfig: NextConfig = {
  turbopack: {
    // Les dépendances communes sont installées à la racine du workspace.
    root: path.resolve(__dirname, ".."),
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: frontendOrigin },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
