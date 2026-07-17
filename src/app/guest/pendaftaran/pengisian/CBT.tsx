import {
  Clock,
  MapPin,
  Calendar,
  Monitor,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AppLayout } from "@/components/ui/app-layout" 

export default function CBTSesiPage() {

    const sesiCBT = {
        tanggal: "Sabtu, 15 Januari 2026",
        waktu: "Sesi 2 (Pukul 10:00 - 12:00 WIB)",
        lokasi: "Gedung Utama, Ruang 301 (Lab Komputer)",
        status: "Ditetapkan",
    };

    return (
        // Menggunakan AppLayout untuk menyediakan Sidebar dan Header
        <AppLayout
            menuTemplate="admisi" // Menggunakan menu untuk admisi
            title="Sarjana Reguler 2025" // Judul utama di Header
            subtitle="Penetapan Sesi" // Subtitle di Header
            backTo="/pendaftaran/sarjana-2025" // Rute kembali ke detail pendaftaran
        >
            {/* Konten Halaman (children) */}
            <Card className="shadow-sm border rounded-lg max-w-4xl gap-2 mx-auto">
                <CardHeader className="pb-2 border-b border-gray-200">
                    <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <Monitor className="h-5 w-5 text-primary"/> Penetapan Sesi Ujian CBT
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Sesi ujian Anda telah ditetapkan. Harap catat detail di bawah ini dan cetak Kartu Ujian Anda.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    
                    {/* Status dan Notifikasi */}
                    <div className="p-4 rounded-lg border border-green-200 bg-green-50 flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0"/>
                        <div className="text-sm text-green-700">
                            <p className="font-semibold">Sesi Ujian Telah Ditetapkan!</p>
                            <p>Detail di bawah adalah jadwal resmi Anda. Harap hadir 30 menit sebelum waktu ujian.</p>
                        </div>
                    </div>

                    {/* Detail Sesi CBT - Clean & Modern Style */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-white">
                        
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary"/> Tanggal Ujian</p>
                            <p className="text-lg font-bold text-gray-800">{sesiCBT.tanggal}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500 flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/> Sesi & Waktu</p>
                            <p className="text-lg font-bold text-gray-800">{sesiCBT.waktu}</p>
                        </div>
                        
                        <div className="md:col-span-2 space-y-1 pt-3 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-500 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary"/> Lokasi Ujian</p>
                            <p className="text-lg font-bold text-gray-800">{sesiCBT.lokasi}</p>
                        </div>
                    </div>
                
                </CardContent>
            </Card>
            {/* Akhir Konten Halaman */}
        </AppLayout>
    )
}
