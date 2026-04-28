import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // This only runs in 'pnpm dev'.
  // In production ('pnpm build'), this list is ignored.
  allowedDevOrigins: isDev
    ? ["2w8gs3-3000.csb.app", "2w8gs3-3001.csb.app", "localhost:3000"]
    : [],
};

export default nextConfig;
