import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // Suppress verbose Sentry build output — only errors will show.
  silent: true,

  // Disable source map upload in local dev (no auth token configured).
  // In production CI, set SENTRY_AUTH_TOKEN to enable this.
  disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,

  // Automatically tree-shake Sentry logger statements in production.
  hideSourceMaps: true,

  // Avoid wrapping all API routes in a Sentry handler automatically
  // (we wrap the critical ones manually for more control).
  autoInstrumentServerFunctions: false,
});
