import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Server-side uses the non-public DSN (same value, but accessed via SENTRY_DSN
  // so it's never leaked to the client bundle).
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 10% transaction sample — errors are always captured (sample rate doesn't apply).
  tracesSampleRate: 0.1,

  enabled: process.env.NODE_ENV === "production",
});
