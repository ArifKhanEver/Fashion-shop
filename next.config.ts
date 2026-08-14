import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Using Cloudinary for all images — disabling Next.js image optimization
    // to avoid 'sharp' memory issues on shared hosting
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  // Disable source maps in production for smaller build size
  productionBrowserSourceMaps: false,
  // TypeScript strict compliance
  typescript: {
    ignoreBuildErrors: false,
  },
};

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default analyzer(nextConfig);
