import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl:
    process.env.NEON_AUTH_BASE_URL ??
    "https://auth-unconfigured.invalid/neondb/auth",
  cookies: {
    secret:
      process.env.NEON_AUTH_COOKIE_SECRET ??
      "build-only-cookie-secret-not-used-at-runtime",
    sessionDataTtl: 120,
  },
  logLevel: process.env.NODE_ENV === "production" ? "warn" : "debug",
});
