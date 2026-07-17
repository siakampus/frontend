import { Card } from "@/components/ui/card"
import { logger } from "@/lib/logger"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"

export default function ApplicantDetailPage() {
  const navigate = useNavigate()
  const { programId, applicantId } = useParams()

  const initialApplicantData = {
    name: "Budi Santoso",
    email: "budi@mail.com",
    finalStatus: "Menunggu Keputusan",
    steps: [
      { id: 1, title: "Pemilihan Program Studi", status: "Selesai" },
      { id: 2, title: "Upload Dokumen", status: "Perlu Revisi" },
      { id: 3, title: "Penguncian Data", status: "Menunggu" },
    ],
  }
  
  const [currentStatus, setCurrentStatus] = useState(initialApplicantData.finalStatus)

  const handleSaveStatus = () => {
    
    // Ini adalah simulasi logika penyimpanan ke backend.
    logger.log(`Menyimpan status final pendaftar ${applicantId}: ${currentStatus}`)
    
    // Gunakan fungsi alert standar sebagai pengganti Toast
    alert(`Status final pendaftar ${initialApplicantData.name} telah diubah menjadi: ${currentStatus}`)
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold text-xl">Detail Pendaftar</h2>
      </div>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold text-lg">Data Pendaftar</h3>
        <div>
          <p className="text-sm text-muted-foreground">Nama</p>
          <p className="font-medium">{initialApplicantData.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">{initialApplicantData.email}</p>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold text-lg">Progress Tahapan</h3>
        <div className="space-y-3">
          {initialApplicantData.steps.map((step) => (
            <div
              key={step.id}
              className="border p-3 rounded-md cursor-pointer hover:bg-muted/40"
              onClick={() =>
                navigate(
                  `/admin/programs/${programId}/applicant/${applicantId}/step/${step.id}`
                )
              }
            >
              <div className="flex justify-between">
                <p className="font-medium">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.status}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <Card className="p-5 space-y-4 bg-gray-50 border-2 border-primary/50">
        <h3 className="font-semibold text-lg">Keputusan Penerimaan Final</h3>
        <p className="text-sm text-muted-foreground">Tentukan status final pendaftar. Keputusan ini akan ditampilkan saat pengumuman dipublikasikan.</p>
        
        <div className="flex items-end gap-3 pt-2">
            <div>
                <p className="text-sm text-muted-foreground mb-1">Status Final</p>
                <Select value={currentStatus} onValueChange={setCurrentStatus}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Diterima">Diterima</SelectItem>
                        <SelectItem value="Ditolak">Ditolak</SelectItem>
                        <SelectItem value="Menunggu Keputusan">Menunggu Keputusan</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <Button 
                onClick={handleSaveStatus}
                disabled={currentStatus === initialApplicantData.finalStatus} 
            >
                Simpan Status
            </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">Status terakhir yang tersimpan: **{initialApplicantData.finalStatus}**</p>
      </Card>
    </div>
  )
}
