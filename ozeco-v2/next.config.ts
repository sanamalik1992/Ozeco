import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ozeco.co.uk" },
      { protocol: "https", hostname: "www.ozeco.co.uk" },
      // Vercel Blob — public store subdomain takes the shape <id>.public.blob.vercel-storage.com
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    dangerouslyAllowSVG: false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
