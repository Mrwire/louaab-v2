import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allow overriding via NEXT_STRICT_LINT to re-enable blocking builds in CI.
    ignoreDuringBuilds: process.env.NEXT_STRICT_LINT !== "true",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
