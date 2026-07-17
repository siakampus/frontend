import { useState } from "react"
import { logger } from "@/lib/logger"
import { useNavigate, useParams } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"

export default function StepDetailPage() {
  const { programId, applicantId, stepId } = useParams()
  const navigate = useNavigate()

  const [status, setStatus] = useState("Pending")
  const [note, setNote] = useState("")

  const stepDetail = {
    title: "Upload Dokumen",
    submittedData: [
      { label: "KTP", value: "ktp_budi.pdf" },
      { label: "Ijazah", value: "ijazah_budi.pdf" },
    ],
  }

  const handleSave = () => {
    logger.log("Program ID:", programId)
    logger.log("Applicant ID:", applicantId)
    logger.log("Step ID:", stepId)
    logger.log("Status:", status)
    logger.log("Catatan:", note)

    alert("Status berhasil diperbarui!")
    navigate(-1)
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold text-xl">{stepDetail.title}</h2>
      </div>

      <Card className="p-5 space-y-4">
        <h3 className="font-medium text-lg">Data yang Dikirim</h3>

        {stepDetail.submittedData.map((d, i) => (
          <div key={i} className="flex justify-between border-b py-2">
            <span>{d.label}</span>
            <a className="text-blue-600 underline" href="#">{d.value}</a>
          </div>
        ))}
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-medium text-lg">Atur Status</h3>

        <Select onValueChange={(v) => setStatus(v)} defaultValue="Pending">
          <SelectTrigger>
            <SelectValue placeholder="Pilih status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Selesai">Selesai</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Revisi">Perlu Revisi</SelectItem>
          </SelectContent>
        </Select>

        {status === "Revisi" && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Catatan Revisi</p>
            <Textarea
              placeholder="Tuliskan apa yang perlu diperbaiki..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}

        <Button className="w-full mt-2" onClick={handleSave}>
          Simpan Perubahan
        </Button>
      </Card>
    </div>
  )
}
