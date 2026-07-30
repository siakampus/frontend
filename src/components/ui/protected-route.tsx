import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_PUBLIC_API_URL ?? "";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[]; // e.g. ["student", "guest"], ["admin"], ["lecturer"]
  redirectTo?: string;
}

/**
 * ProtectedRoute — checks auth on every render.
 *
 * Auth strategy (in order):
 *  1. If a Bearer token exists in localStorage → GET /auth/profile (token auth)
 *     This works cross-origin (Vercel → ugnapi.online) because it's a header,
 *     not a cookie. Cookies are SameSite=Lax and won't cross origins.
 *  2. No token → GET /api/auth/get-session (cookie-based, works on localhost)
 *     Falls back to session cookie for local dev where origin matches.
 *
 * - If not authenticated → redirects to /login
 * - If authenticated but wrong role → redirects to the correct dashboard
 * - While checking → shows a minimal loading screen (prevents flash)
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: Props) {
  const [status, setStatus] = useState<"checking" | "ok" | "redirect">("checking");
  const [redirectPath, setRedirectPath] = useState(redirectTo);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const token = localStorage.getItem("token");

        let role = "";
        let authed = false;

        if (token) {
          // ── Path 1: Bearer token (works cross-origin on Vercel) ──────────
          try {
            const profileRes = await fetch(`${API_BASE}/auth/profile`, {
              credentials: "include",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              role = (profileData?.data?.role ?? profileData?.role ?? "").toLowerCase();
              authed = true;
            } else if (profileRes.status === 401) {
              // Token expired or invalid — clear it and fall through to redirect
              localStorage.removeItem("token");
              localStorage.removeItem("userRole");
              localStorage.removeItem("userEmail");
              if (!cancelled) { setRedirectPath("/login"); setStatus("redirect"); }
              return;
            }
          } catch {
            // Network error on profile — fall through to session check
          }
        }

        if (!authed) {
          // ── Path 2: Session cookie (local dev, same-origin) ───────────────
          const sessionRes = await fetch(`${API_BASE}/api/auth/get-session`, {
            credentials: "include",
          });

          if (!sessionRes.ok || sessionRes.status === 401) {
            if (!cancelled) { setRedirectPath("/login"); setStatus("redirect"); }
            return;
          }

          const sessionData = await sessionRes.json();
          const user = sessionData?.user;

          if (!user) {
            if (!cancelled) { setRedirectPath("/login"); setStatus("redirect"); }
            return;
          }

          role = (user.role ?? "").toLowerCase();
          authed = true;
        }

        if (!authed) {
          if (!cancelled) { setRedirectPath("/login"); setStatus("redirect"); }
          return;
        }

        // ── Role-based access check ─────────────────────────────────────────
        if (allowedRoles && allowedRoles.length > 0) {
          // Fallback: check localStorage if role still empty
          if (!role) {
            role = (localStorage.getItem("userRole") ?? "").toLowerCase();
          }

          if (!allowedRoles.map((r) => r.toLowerCase()).includes(role)) {
            // Wrong role — send to correct dashboard
            let dest = "/";
            if (role === "admin") dest = "/admin";
            else if (role === "lecturer") dest = "/lecturer";
            else if (role === "student") dest = "/mahasiswa";
            else if (role === "guest") dest = "/dashboard";
            if (!cancelled) { setRedirectPath(dest); setStatus("redirect"); }
            return;
          }
        }

        if (!cancelled) setStatus("ok");
      } catch {
        // Network error — send to login to be safe
        if (!cancelled) { setRedirectPath("/login"); setStatus("redirect"); }
      }
    };

    check();
    return () => { cancelled = true; };
  }, [allowedRoles]);

  if (status === "checking") {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#f9fafb",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "3px solid #e5e7eb",
          borderTopColor: "var(--primary, #4f46e5)",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === "redirect") {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
