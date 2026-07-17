import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PengaturanFakultas from "./admin-pengaturan-fakultas"
import PengaturanProgram from "./program/pengaturan-program"
import AdminAcademicTerms from "./admin-academic-terms"

export default function PengaturanPlatform() {
    return (
        <>
            <Tabs defaultValue="program" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="program">Program Pendaftaran</TabsTrigger>
                    <TabsTrigger value="faculty">Fakultas & Program Studi</TabsTrigger>
                    <TabsTrigger value="academic-terms">Periode Akademik / KRS</TabsTrigger>
                </TabsList>

                <TabsContent value="program">
                    <PengaturanProgram />
                </TabsContent>
        
                <TabsContent value="faculty">
                    <PengaturanFakultas />
                </TabsContent>
    
                <TabsContent value="academic-terms">
                    <AdminAcademicTerms />
                </TabsContent>
            </Tabs>
        </>
    )
}
