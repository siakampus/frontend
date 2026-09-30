"use client"

import { useState, useRef, useEffect } from "react"
import { LogOut, ChevronRight } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
const API_BASE = import.meta.env.VITE_PUBLIC_API_URL ?? "";

export interface SidebarItem {
  label: string
  to: string
  icon?: React.ReactNode
  children?: SidebarItem[]
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
    if (path === location.pathname) return true;
    if (path.split("/").length > 2) return location.pathname.startsWith(path);
    return false;
  }

  const hasActiveChild = (item: SidebarItem): boolean => {
    if (!item.children) return false;
    return item.children.some((child) => isActive(child.to));
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
          {items.map((item) =>
            item.children ? (
              <SidebarDropdownItem
                key={item.to}
                item={item}
                isActive={isActive}
                isParentActive={hasActiveChild(item)}
              />
            ) : (
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
            )
          )}

          <hr className="my-4" />

          <button
            onClick={async () => {
              if (!confirm("Apakah Anda yakin ingin logout?")) return;
              try {
                const token = localStorage.getItem("token");
                await fetch(`${API_BASE}/api/auth/sign-out`, {
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


function SidebarDropdownItem({
  item,
  isActive,
  isParentActive,
}: {
  item: SidebarItem
  isActive: (path: string) => boolean
  isParentActive: boolean
}) {
  const [open, setOpen] = useState(isParentActive);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep submenu open if a child route is active
  useEffect(() => {
    if (isParentActive) setOpen(true);
  }, [isParentActive]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    // Only auto-close if no child is active
    if (!isParentActive) {
      timeoutRef.current = setTimeout(() => setOpen(false), 200);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Parent trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-md transition cursor-pointer text-left",
          isParentActive
            ? "bg-primary font-medium text-white"
            : "hover:bg-primary/10"
        )}
      >
        {item.icon}
        <span className="flex-1">{item.label}</span>
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-90"
          )}
        />
      </button>

      {/* Dropdown children */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-300 pl-2">
          {item.children!.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition",
                isActive(child.to)
                  ? "bg-primary/15 font-medium text-primary"
                  : "text-gray-600 hover:bg-primary/5 hover:text-gray-900"
              )}
            >
              {child.icon}
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
