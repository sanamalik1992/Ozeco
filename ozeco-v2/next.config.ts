import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ozeco.co.uk" },
      { protocol: "https", hostname: "www.ozeco.co.uk" },
    ],
    // A transparent SVG we render locally if a remote image fails.
    dangerouslyAllowSVG: false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
