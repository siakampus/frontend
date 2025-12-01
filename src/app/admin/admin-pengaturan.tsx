"use client"

import { AppLayout } from "@/components/ui/app-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PengaturanFakultas from "./admin-pengaturan-fakultas"
import PengaturanProgram from "./program/pengaturan-program"

const adminSidebarItems = [
	{ to: "/admin/settings", label: "Pengaturan Platform" },
	{ to: "/admin/pendaftaran", label: "Data Pendaftaran" },
]

export default function PengaturanPlatform() {
	return (
		<AppLayout
			sidebarItems={adminSidebarItems}
			title="Pengaturan Platform"
			subtitle="Kelola fakultas, program studi, dan jenjang pendaftaran"
		>
			<Tabs defaultValue="program" className="w-full">
				<TabsList className="mb-6">
					<TabsTrigger value="program">Program Pendaftaran</TabsTrigger>
					<TabsTrigger value="faculty">Fakultas & Program Studi</TabsTrigger>
				</TabsList>

				<TabsContent value="program">
					<PengaturanProgram />
				</TabsContent>
        
        <TabsContent value="faculty">
					<PengaturanFakultas />
				</TabsContent>
    
			</Tabs>
		</AppLayout>
	)
}