// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://879c091de3125f50b537783033b59f81@o4509477589811200.ingest.us.sentry.io/4509477598724096",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Suppress console errors and debug output
  debug: false,

  // Disable performance monitoring to reduce noise
  enabled: process.env.NODE_ENV === "production",

  // Adjust sampling to minimum in development
  sampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0.01,
});
