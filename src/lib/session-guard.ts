/**
 * Browser-session guard.
 *
 * Auth token + role are persisted in localStorage so they survive tab reloads
 * and navigation. But localStorage ALSO survives a full browser exit, which
 * means a user who closed the browser stays "logged in" next time they open it.
 *
 * This guard resets the session on browser exit by leaning on sessionStorage,
 * which is wiped when the browser (or last tab of the app) is fully closed —
 * unlike localStorage, it does NOT persist across a browser restart.
 *
 * Boot logic:
 *   - If localStorage has a token but sessionStorage has no marker → the browser
 *     was closed since the last visit → clear auth and force re-login.
 *   - Otherwise (fresh login within the same browser session, or a reload where
 *     the marker still exists) → (re)set the marker and continue.
 *
 * Must run BEFORE React renders (called from main.tsx).
 */

const SESSION_MARKER = "browser_session";

// Keys that make up the persisted auth session. Cleared together on reset.
const AUTH_KEYS = ["token", "userRole", "userEmail", "data_locked"] as const;

function clearAuth(): void {
  for (const key of AUTH_KEYS) {
    localStorage.removeItem(key);
  }
}

/**
 * Enforce that a persisted login is only honoured within the same browser
 * session it was created in. Returns true if a stale session was cleared.
 */
export function enforceBrowserSession(): boolean {
  const hasToken = !!localStorage.getItem("token");
  const hasMarker = !!sessionStorage.getItem(SESSION_MARKER);

  if (hasToken && !hasMarker) {
    // Token persisted from a previous browser run → treat as expired.
    clearAuth();
    return true;
  }

  // Same browser session (or no auth at all) → keep it alive.
  sessionStorage.setItem(SESSION_MARKER, "1");
  return false;
}

/**
 * Call once after a successful login so the current browser session is marked
 * as authoritative (prevents the just-stored token from being wiped on the
 * next boot within this same session).
 */
export function markSessionActive(): void {
  sessionStorage.setItem(SESSION_MARKER, "1");
}
