import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Suppress instant navigation validation errors for routes with `export const instant = false`.
  // Admin routes use NextAuth which internally calls crypto.getRandomValues() - this cannot be
  // prerendered. The `instant = false` opt-out is the correct approach per Next.js docs.
  experimental: {
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
  images: {
    remotePatterns: [
      // Vercel Blob storage
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
      // Placeholder for development
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      // Resend avatars
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
