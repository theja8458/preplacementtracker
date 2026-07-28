import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Edge runtime is lightweight — keep trace sample low.
  tracesSampleRate: 0.1,

  enabled: process.env.NODE_ENV === "production",
});
