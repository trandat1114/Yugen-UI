import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { optimizePackageImports: ["yugen-ui"] },
};

export default nextConfig;
