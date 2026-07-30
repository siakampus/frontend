/**
 * BetterAuth client
 *
 * baseURL resolves automatically:
 *   Local dev  → http://localhost:8000  (from .env.local)
 *   Production → https://ugnapi.online  (from .env.production / Vercel env vars)
 */
import { createAuthClient } from "better-auth/client";

const BETTER_AUTH_URL =
  import.meta.env.VITE_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:8000";

export const authClient = createAuthClient({
  baseURL: BETTER_AUTH_URL,
});

// Re-export the most-used helpers so callers don't need to import authClient everywhere
export const { signUp, signIn, signOut, getSession, useSession } = authClient;
