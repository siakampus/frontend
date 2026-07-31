import type { ReactNode } from "react"
import { AppSidebar, type SidebarItem } from "./app-sidebar" 
import { AppHeader } from "./app-header"
import { Home, GraduationCap, BookOpen, User, FileText, Users, CreditCard, Settings } from "lucide-react";
import FloatingChat from "./floating-chat";
import TawkChat from "./tawk-chat";


export const ADMISI_MENU: SidebarItem[] = [
  { 
    label: "Dashboard", 
    to: "/guest/dashboard", 
    icon: <Home className="h-4 w-4" /> 
  },
  { 
    label: "Data Diri", 
    to: "/data-diri", 
    icon: <User className="h-4 w-4" /> 
  },
  { 
    label: "Pendaftaran", 
    to: "/pendaftaran", 
    icon: <GraduationCap className="h-4 w-4" /> 
  },
];

export const STUDENT_MENU: SidebarItem[] = [
  { label: "Dashboard", to: "/mahasiswa", icon: <Home className="h-4 w-4" /> },
  { label: "Profile",   to: "/mahasiswa/profile",   icon: <User className="h-4 w-4" /> },
  { label: "Mata Kuliah", to: "/mahasiswa/courses", icon: <BookOpen className="h-4 w-4" /> },
  { label: "KRS", to: "/mahasiswa/krs", icon: <FileText className="h-4 w-4" /> },
];

export const ADMIN_MENU: SidebarItem[] = [
  { 
    label: "Dashboard Admin", 
    to: "/admin", 
    icon: <Home className="h-4 w-4" /> 
  },
  { 
    label: "Manajemen Pendaftaran", 
    to: "/admin/pendaftaran", 
    icon: <GraduationCap className="h-4 w-4" /> 
  },
  { 
    label: "Pengaturan Program", 
    to: "/admin/programs", 
    icon: <GraduationCap className="h-4 w-4" /> 
  },
  { 
    label: "Manajemen Pengguna", 
    to: "/admin/users", 
    icon: <Users className="h-4 w-4" /> 
  },
  { 
    label: "Manajemen Dosen", 
    to: "/admin/lecturers", 
    icon: <GraduationCap className="h-4 w-4" /> 
  },
  { 
    label: "Manajemen Kelas", 
    to: "/admin/lectures", 
    icon: <BookOpen className="h-4 w-4" /> 
  },
  { 
    label: "Pembayaran", 
    to: "/admin/payments", 
    icon: <CreditCard className="h-4 w-4" /> 
  },
  { 
    label: "Konfigurasi Pendaftaran", 
    to: "/admin/registration/config", 
    icon: <FileText className="h-4 w-4" /> 
  },
  { 
    label: "Pengaturan Sistem", 
    to: "/admin/settings", 
    icon: <Settings className="h-4 w-4" /> 
  },
];

export const LECTURER_MENU: SidebarItem[] = [
  { 
    label: "Dashboard Dosen", 
    to: "/lecturer", 
    icon: <Home className="h-4 w-4" /> 
  },
  { 
    label: "Manajemen Mata Kuliah", 
    to: "/lecturer/courses", 
    icon: <BookOpen className="h-4 w-4" /> 
  },
  { 
    label: "Manajemen Tugas", 
    to: "/lecturer/assignments", 
    icon: <FileText className="h-4 w-4" /> 
  },
];

export type MenuTemplateType = "admisi" | "admin" | "student" | "lecturer"; 

export const getSidebarItems = (template: MenuTemplateType): SidebarItem[] => {
  switch (template) {
    case "admisi":
      return ADMISI_MENU;
    case "student":
      return STUDENT_MENU;
    case "admin":
      return ADMIN_MENU;
    case "lecturer":
      return LECTURER_MENU;
    default:
      return [];
  }
};

// --- KOMPONEN APP LAYOUT ---

interface AppLayoutProps {
  children: ReactNode
  menuTemplate?: MenuTemplateType
  sidebarItems?: SidebarItem[]
  sidebarTitle?: string
  sidebarLogo?: string
  title?: string
  subtitle?: string
  backTo?: string
}

export function AppLayout({
  children,
  menuTemplate,
  sidebarItems: customSidebarItems,
  sidebarTitle,
  sidebarLogo,
  title,
  subtitle,
  backTo,
}: AppLayoutProps) {
  
  const sidebarItems: SidebarItem[] = customSidebarItems || (menuTemplate ? getSidebarItems(menuTemplate) : []); 

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar items={sidebarItems} title={sidebarTitle} logo={sidebarLogo} /> 
      
      <div className="flex-1 flex flex-col">
        <AppHeader title={title} subtitle={subtitle} backTo={backTo} />
        
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6 space-y-6">
          {children}
        </main>
      </div>

      {/* Floating chatbot — student & lecturer dashboards */}
      {(menuTemplate === "student" || menuTemplate === "lecturer") && <FloatingChat />}
      {/* Tawk.to live chat (UGN Chat) — side-by-side for comparison */}
      {(menuTemplate === "student" || menuTemplate === "lecturer") && <TawkChat />}
    </div>
  )
}
