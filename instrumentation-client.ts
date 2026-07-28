/**
 * instrumentation-client.ts
 *
 * Next.js 15+ client instrumentation entry point.
 * Replaces the legacy `sentry.client.config.ts` convention.
 * This file runs in the browser before any page code.
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10% of transactions — keeps free-tier quota comfortable.
  // Error capture (the valuable part) is always 100%.
  tracesSampleRate: 0.1,

  // No session replay — not needed at this scale and
  // it would rapidly exhaust the free replay quota.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Only enable in production; skip noisy local development errors.
  enabled: process.env.NODE_ENV === "production",
});
