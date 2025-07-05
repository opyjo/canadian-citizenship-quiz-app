// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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
