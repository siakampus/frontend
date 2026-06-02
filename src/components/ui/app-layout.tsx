import type { ReactNode } from "react"
import { AppSidebar, type SidebarItem } from "./app-sidebar" 
import { AppHeader } from "./app-header"
import { Home, GraduationCap } from "lucide-react"; 


export const ADMISI_MENU: SidebarItem[] = [
  { 
    label: "Data Diri", 
    to: "/data-diri", 
    icon: <Home className="h-4 w-4" /> 
  },
  { 
    label: "Pendaftaran", 
    to: "/pendaftaran", 
    icon: <GraduationCap className="h-4 w-4" /> 
  },
];

export const ADMIN_MENU: SidebarItem[] = [
  { 
    label: "Pengaturan Pendaftaran", 
    to: "/admin/settings", 
    icon: <GraduationCap className="h-4 w-4" /> 
  },
];

export type MenuTemplateType = "admisi" | "admin"; 

export const getSidebarItems = (template: MenuTemplateType): SidebarItem[] => {
  switch (template) {
    case "admisi":
      return ADMISI_MENU; // Menggunakan ADMISI_MENU yang sudah lengkap
    case "admin":
      return ADMIN_MENU;
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
    </div>
  )
}