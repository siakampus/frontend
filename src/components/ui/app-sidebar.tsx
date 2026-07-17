"use client"

import { LogOut } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

export interface SidebarItem {
  label: string
  to: string
  icon?: React.ReactNode
}

interface AppSidebarProps {
  items: SidebarItem[]
  title?: string
  logo?: string
}

export function AppSidebar({
  items,
  title = "UNIVERSITAS GLOBAL NUSANTARA ",
  logo = "/favicon.png",
}: AppSidebarProps) {
  const location = useLocation()
  const isActive = (path: string) => {
    // Exact match for index-like paths to avoid /admin matching /admin/users etc.
    if (path === location.pathname) return true;
    // Prefix match only when path is not a bare segment (has a sub-path)
    if (path.split("/").length > 2) return location.pathname.startsWith(path);
    return false;
  }

  return (
    <aside className="w-64 bg-gray-100 border-r flex flex-col sticky top-0 h-screen overflow-y-auto">
      {/* Header */}
      <div className="h-16 flex items-center justify-start p-6 gap-2 font-bold text-black">
        <img src={logo} alt="Logo" className="h-6 w-6 object-contain rounded-sm" />
        <span>{title}</span>
      </div>
      <hr />

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 text-sm">
        <div className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md transition",
                isActive(item.to)
                  ? "bg-primary font-medium text-white"
                  : "hover:bg-primary/10"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          <hr className="my-4" />

          <button
            onClick={async () => {
              if (!confirm("Apakah Anda yakin ingin logout?")) return;
              try {
                const token = localStorage.getItem("token");
                // Invalidate the server-side session + cookie
                await fetch("/api/auth/sign-out", {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
                  },
                });
              } catch (_) {
                // silently ignore network errors — still logout locally
              } finally {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10 cursor-pointer text-left"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </nav>
    </aside>
  )
}
