import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob — public store subdomain takes the shape <id>.public.blob.vercel-storage.com.
      // Post Phase 3A migration, this is the only image origin in use.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    dangerouslyAllowSVG: false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
