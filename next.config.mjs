import { withSentryConfig } from "@sentry/nextjs";
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

// Only use Sentry in production
const config =
  process.env.NODE_ENV === "production"
    ? withSentryConfig(nextConfig, {
        org: "opyjo-consulting-rp",
        project: "javascript-nextjs",
        silent: true,
        widenClientFileUpload: true,
        tunnelRoute: "/monitoring",
        disableLogger: true,
        automaticVercelMonitors: true,
      })
    : nextConfig;

export default config;
