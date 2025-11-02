import type { ReactNode } from "react"
import { AppSidebar, type SidebarItem } from "./app-sidebar"
import { AppHeader } from "./app-header"

interface AppLayoutProps {
  children: ReactNode
  sidebarItems: SidebarItem[]
  title?: string
  subtitle?: string
  backTo?: string
}

export function AppLayout({
  children,
  sidebarItems,
  title,
  subtitle,
  backTo,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar items={sidebarItems} />
      <div className="flex-1 flex flex-col">
        <AppHeader title={title} subtitle={subtitle} backTo={backTo} />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}