import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PengaturanFakultas from "./admin-pengaturan-fakultas"
import PengaturanProgram from "./program/pengaturan-program"

export default function PengaturanPlatform() {
    return (
        <>
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
        </>
    )
}