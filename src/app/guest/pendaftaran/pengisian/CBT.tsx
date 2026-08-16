import {
  Clock,
  MapPin,
  Calendar,
  Monitor,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Printer,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppLayout } from "@/components/ui/app-layout"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

interface CBTSession {
  tanggal: string
  waktu: string
  lokasi: string
  status?: string
}

export default function CBTSesiPage() {
  const navigate = useNavigate()
  const [sesiCBT, setSesiCBT] = useState<CBTSession | null>(null)
  const [isAssigned, setIsAssigned] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem("cbt_session")
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setSesiCBT(parsed)
        setIsAssigned(true)
      } catch (e) {
        setSesiCBT({
          tanggal: "Sabtu, 15 Januari 2026",
          waktu: "Sesi 2 (Pukul 10:00 - 12:00 WIB)",
          lokasi: "Gedung Utama, Ruang 301 (Lab Komputer)",
          status: "Ditetapkan",
        })
        setIsAssigned(true)
      }
    } else {
      // Default fallback jika belum ditetapkan khusus oleh admin
      setSesiCBT({
        tanggal: "Sabtu, 15 Januari 2026",
        waktu: "Sesi 2 (Pukul 10:00 - 12:00 WIB)",
        lokasi: "Gedung Utama, Ruang 301 (Lab Komputer)",
        status: "Ditetapkan",
      })
      setIsAssigned(true)
      // Otomatis simpan status confirmed
      localStorage.setItem("cbt_confirmed", "true")
    }
  }, [])

  const handleProceed = () => {
    localStorage.setItem("cbt_confirmed", "true")
    navigate("/pendaftaran/print-card")
  }

  return (
    <AppLayout
      menuTemplate="admisi"
      title="Sarjana Reguler 2025"
      subtitle="Penetapan Sesi CBT"
      backTo="/pendaftaran/sarjana-2025"
    >
      <Card className="shadow-sm border rounded-lg max-w-4xl gap-2 mx-auto">
        <CardHeader className="pb-2 border-b border-gray-200">
          <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <Monitor className="h-5 w-5 text-primary" /> Penetapan Sesi Ujian CBT
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sesi ujian Anda telah ditetapkan oleh panitia admisi. Harap catat detail di bawah ini dan lanjutkan ke pencetakan Kartu Ujian.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Status dan Notifikasi */}
          {isAssigned ? (
            <div className="p-4 rounded-lg border border-green-200 bg-green-50 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-700">
                <p className="font-semibold">Sesi Ujian Telah Ditetapkan!</p>
                <p>Detail di bawah adalah jadwal resmi Anda dari panitia. Harap hadir 30 menit sebelum waktu ujian dimulai.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-700">
                <p className="font-semibold">Menunggu Penetapan Sesi oleh Admin</p>
                <p>Jadwal sesi ujian Anda sedang diproses oleh panitia PMB.</p>
              </div>
            </div>
          )}

          {/* Detail Sesi CBT */}
          {sesiCBT && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-white">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Tanggal Ujian
                </p>
                <p className="text-lg font-bold text-gray-800">{sesiCBT.tanggal}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Sesi & Waktu
                </p>
                <p className="text-lg font-bold text-gray-800">{sesiCBT.waktu}</p>
              </div>

              <div className="md:col-span-2 space-y-1 pt-3 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Lokasi Ujian
                </p>
                <p className="text-lg font-bold text-gray-800">{sesiCBT.lokasi}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => navigate("/pendaftaran/sarjana-2025")}
            >
              Kembali ke Progres Pendaftaran
            </Button>
            <Button
              onClick={handleProceed}
              className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
            >
              <Printer className="h-4 w-4" /> Cetak Kartu Ujian <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}

