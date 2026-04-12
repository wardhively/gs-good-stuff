import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Inline server-side env vars into the build so they're available on Cloud Run
  // These get baked into the server bundle at build time
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
};

export default nextConfig;
