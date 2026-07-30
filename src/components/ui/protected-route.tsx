import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

/**
 * ProtectedRoute — gate based on localStorage token + role.
 *
 * Strategy:
 *   - If no token → redirect to /login
 *   - If token exists but role doesn't match allowedRoles → redirect to correct dashboard
 *   - If token exists and role matches → render children
 *
 * Session validity is NOT re-checked here on every render — that would require
 * a cross-origin API call which is unreliable (bearer plugin 500s on GET /api/auth/get-session).
 * Instead, individual pages redirect to /login on 401 responses from the API.
 * Token + role are written to localStorage by login-form.tsx after sign-in.
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: Props) {
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("userRole") ?? "").toLowerCase();

  // No token at all → login
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  // Role check
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.map((r) => r.toLowerCase()).includes(role)) {
      // Wrong role — send to correct dashboard
      let dest = "/guest/dashboard";
      if (role === "admin") dest = "/admin";
      else if (role === "lecturer") dest = "/lecturer";
      else if (role === "student") dest = "/mahasiswa";
      return <Navigate to={dest} replace />;
    }
  }

  return <>{children}</>;
}
