import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development", // Only enable in production
});

const nextConfig: NextConfig = {
  // Use webpack for builds (Serwist requires it)
  turbopack: {},
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
};

export default withSerwist(nextConfig);
