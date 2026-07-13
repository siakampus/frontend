/**
 * Returns the redirect path for a given user role after login.
 *
 * Roles (must match what BetterAuth returns in session.user.role):
 *   "guest"    → /data-diri      (new applicant filling personal data)
 *   "student"  → /dashboard      (enrolled student dashboard)
 *   "admin"    → /admin          (admin panel)
 *   "lecturer" → /lecturer       (lecturer dashboard)
 *
 * Falls back to /data-diri for unknown/empty roles.
 */
export function getRedirectPathByRole(role: string | undefined | null): string {
  switch ((role ?? "").toLowerCase()) {
    case "admin":
      return "/admin"
    case "student":
      return "/dashboard"
    case "lecturer":
      return "/lecturer"
    case "guest":
    default:
      return "/guest/dashboard"
  }
}
