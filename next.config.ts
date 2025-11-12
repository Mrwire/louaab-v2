import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Re-enable ESLint during builds to catch lint/type issues early.
  // Previously set to ignoreDuringBuilds = true to iterate quickly; now
  // we run the full build and fix reported problems.
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
