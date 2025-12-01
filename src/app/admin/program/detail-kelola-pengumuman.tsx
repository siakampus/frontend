import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function ProgramAnnouncementPage() {
  const { id: programId } = useParams()
  const navigate = useNavigate()
  
  // Simulasi data pengumuman (harus diganti dengan pengambilan data dari API)
  const [announcementText, setAnnouncementText] = useState(
    "Hasil seleksi pendaftaran program S-1 telah dirilis. Silakan cek status Anda melalui dashboard pendaftar masing-masing."
  )
  const [isPublished, setIsPublished] = useState(false) // Status publikasi

  const handlePublish = () => {
    // TODO: Logika untuk mengirim teks pengumuman dan mengubah status publikasi menjadi TRUE ke backend.
    setIsPublished(true) 
    alert(`[SIMULASI] Pengumuman Program ${programId} berhasil dipublikasikan!`)
  }

  const handleUnpublish = () => {
    // TODO: Logika untuk mengubah status publikasi menjadi FALSE ke backend.
    setIsPublished(false) 
    alert(`[SIMULASI] Pengumuman Program ${programId} berhasil ditarik.`)
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold text-xl">Kelola Pengumuman Program (ID: {programId})</h2>
      </div>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold text-lg">Publikasi Hasil Pendaftaran</h3>        
        
        <div className="flex justify-between items-center pt-4>">
          <div className="space-y-1">
             <p className="text-sm font-medium">Status Publikasi:</p>
             {isPublished ? (
              <span className="text-sm text-green-600 font-bold">SUDAH TERBIT</span>
            ) : (
              <span className="text-sm text-orange-600 font-bold">DRAFT (Belum Terbit)</span>
            )}
          </div>

          <div className="space-x-2">
            <Button variant="outline" className="mr-2">
                Simpan Draft
            </Button>
            {isPublished ? (
              <Button onClick={handleUnpublish} variant="destructive">
                Tarik Pengumuman
              </Button>
            ) : (
              <Button onClick={handlePublish}>
                Publikasi Sekarang
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}