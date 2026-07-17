"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import ProgramDetailOverview from "./detail-overview"
import ProgramApplicants from "./detail-pendaftar.tsx"


export default function AdminProgramPage() {
  return (
    <div className="mt-6">
      <Tabs defaultValue="detail">
        <TabsList className="mb-4">
          <TabsTrigger value="detail">Detail Program</TabsTrigger>
          <TabsTrigger value="pendaftar">Pendaftar</TabsTrigger>
        </TabsList>

        {/* TAB: DETAIL */}
        <TabsContent value="detail">
          <ProgramDetailOverview />
        </TabsContent>

        {/* TAB: PENDAFTAR */}
        <TabsContent value="pendaftar">
          <ProgramApplicants />
        </TabsContent>
      </Tabs>
    </div>
  )
}
