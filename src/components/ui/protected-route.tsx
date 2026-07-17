import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[]; // e.g. ["student", "guest"], ["admin"], ["lecturer"]
  redirectTo?: string;
}

/**
 * ProtectedRoute — checks the backend session on every render.
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
        const res = await fetch("/api/auth/get-session", {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok || res.status === 401) {
          if (!cancelled) { setRedirectPath("/login"); setStatus("redirect"); }
          return;
        }

        const data = await res.json();
        const user = data?.user;

        if (!user) {
          if (!cancelled) { setRedirectPath("/login"); setStatus("redirect"); }
          return;
        }

        // Role-based access check
        if (allowedRoles && allowedRoles.length > 0) {
          let role: string = (user.role ?? "").toLowerCase();

          if (!role || role === "guest") {
            try {
              const profileRes = await fetch("/auth/profile", {
                credentials: "include",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              if (profileRes.ok) {
                const profileData = await profileRes.json();
                if (profileData?.data?.role) {
                  role = profileData.data.role.toLowerCase();
                }
              }
            } catch (err) {
              console.error("Failed to fetch role from profile in ProtectedRoute", err);
            }
          }

          // Fallback to localStorage if still not found
          if (!role) {
            role = (localStorage.getItem("userRole") ?? "").toLowerCase();
          }

          if (!allowedRoles.includes(role)) {
            // Redirect to the correct dashboard for their actual role
            const fallback =
              role === "admin" ? "/admin"
              : role === "lecturer" ? "/lecturer"
              : role === "student" ? "/dashboard"
              : role === "guest" ? "/guest/dashboard"
              : "/login";
            if (!cancelled) { setRedirectPath(fallback); setStatus("redirect"); }
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
