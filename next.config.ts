import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/usdpen.json",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Cache-Control", value: "public, max-age=60, s-maxage=300" }
        ]
      }
    ];
  }
};

export default nextConfig;
