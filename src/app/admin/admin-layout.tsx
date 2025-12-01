import { Outlet, useOutletContext } from "react-router-dom"
import type { SidebarItem } from "@/components/ui/app-sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { AppHeader } from "@/components/ui/app-header"

export default function AdminLayout() {
  // 🧭 Sidebar Items untuk semua halaman admin
  const sidebarItems: SidebarItem[] = [
    { to: "/admin/settings", label: "Pengaturan Platform" },
    { to: "/admin/pendaftaran", label: "Program Pendaftaran" },
  ]

  const outletContext = useOutletContext<{ title: string; subtitle: string }>()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (kiri) */}
      <AppSidebar items={sidebarItems} />

      {/* Area utama (kanan) */}
      <div className="flex-1 flex flex-col">
        {/* Header global admin */}
        <AppHeader title={outletContext?.title || "Admin Panel"} subtitle={outletContext?.subtitle || "Kelola sistem pendaftaran"} />

        {/* Konten dinamis dari route */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}