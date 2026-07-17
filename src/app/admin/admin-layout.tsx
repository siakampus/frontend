import { Outlet, useOutletContext } from "react-router-dom"
import type { SidebarItem } from "@/components/ui/app-sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { AppHeader } from "@/components/ui/app-header"
import {
  Home, GraduationCap, BookOpen, Users, CreditCard, FileText, Settings,
} from "lucide-react"

export default function AdminLayout() {
  // 🧭 Sidebar Items untuk semua halaman admin
  const sidebarItems: SidebarItem[] = [
    { to: "/admin",                   label: "Dashboard",              icon: <Home className="h-4 w-4" /> },
    { to: "/admin/pendaftaran",       label: "Program Pendaftaran",    icon: <GraduationCap className="h-4 w-4" /> },
    { to: "/admin/programs",          label: "Pengaturan Program",     icon: <GraduationCap className="h-4 w-4" /> },
    { to: "/admin/users",             label: "Manajemen Pengguna",     icon: <Users className="h-4 w-4" /> },
    { to: "/admin/lecturers",         label: "Manajemen Dosen",        icon: <GraduationCap className="h-4 w-4" /> },
    { to: "/admin/lectures",          label: "Manajemen Kelas",        icon: <BookOpen className="h-4 w-4" /> },
    { to: "/admin/payments",          label: "Pembayaran",             icon: <CreditCard className="h-4 w-4" /> },
    { to: "/admin/registration/config", label: "Konfigurasi Pendaftaran", icon: <FileText className="h-4 w-4" /> },
    { to: "/admin/settings",          label: "Pengaturan Platform",    icon: <Settings className="h-4 w-4" /> },
  ]

  const outletContext = useOutletContext<{ title: string; subtitle: string }>()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (kiri) */}
      <AppSidebar items={sidebarItems} title="SIA Admin" />

      {/* Area utama (kanan) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header global admin */}
        <AppHeader
          title={outletContext?.title || "Admin Panel"}
          subtitle={outletContext?.subtitle || "Kelola sistem pendaftaran"}
        />

        {/* Konten dinamis dari route */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
