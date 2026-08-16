import {
  GraduationCap,
  Printer,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import React, { useEffect, useState } from "react"
import { AppLayout } from "@/components/ui/app-layout"
import { logger } from "@/lib/logger"
import { generateKartuUjianPdf } from "@/lib/pdf-generator"

const API_BASE = import.meta.env.VITE_PUBLIC_API_URL ?? ""

export default function CetakKartuUjianPage() {
  const [loading, setLoading] = useState(true)
  const [cbtSesi, setCbtSesi] = useState({
    tanggal: "Sabtu, 15 Januari 2026",
    waktu: "Sesi 2 (Pukul 10:00 - 12:00 WIB)",
    lokasi: "Gedung Utama, Ruang 301 (Lab Komputer)",
  })
  const [isPrinted, setIsPrinted] = useState(false)
  const [dataPeserta, setDataPeserta] = useState({
    nama: "—",
    nomorPendaftaran: "—",
    tanggalLahir: "—",
    programStudi: "—",
    fotoUrl: "/avatar.png",
  })

  const token = localStorage.getItem("token")
  const getAuthHeaders = (): HeadersInit =>
    token ? { Authorization: `Bearer ${token}` } : {}

  useEffect(() => {
    // 1. Ambil Sesi CBT dari storage
    const raw = localStorage.getItem("cbt_session")
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setCbtSesi({
          tanggal: parsed.tanggal || "Sabtu, 15 Januari 2026",
          waktu: parsed.waktu || "Sesi 2 (Pukul 10:00 - 12:00 WIB)",
          lokasi: parsed.lokasi || "Gedung Utama, Ruang 301 (Lab Komputer)",
        })
      } catch (e) {
        // ignore
      }
    }
    setIsPrinted(localStorage.getItem("card_printed") === "true")

    // 2. Fetch data pendaftar dari backend database
    const fetchData = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [res1, res2, res3, userRes] = await Promise.all([
          fetch(`${API_BASE}/admissiondata/1`, {
            headers: getAuthHeaders(),
            credentials: "include",
          }),
          fetch(`${API_BASE}/admissiondata/2`, {
            headers: getAuthHeaders(),
            credentials: "include",
          }),
          fetch(`${API_BASE}/admissiondata/3`, {
            headers: getAuthHeaders(),
            credentials: "include",
          }),
          fetch(`${API_BASE}/user/profile`, {
            headers: getAuthHeaders(),
            credentials: "include",
          }),
        ])

        const d1 = res1.ok ? ((await res1.json()).data ?? {}) : {}
        const d2 = res2.ok ? ((await res2.json()).data ?? {}) : {}
        const d3 = res3.ok ? ((await res3.json()).data ?? {}) : {}
        const userJson = userRes.ok ? await userRes.json() : {}
        const profile = userJson.data ?? userJson ?? {}

        const fullName = d1.fullName || profile.name || profile.fullName || "Pendaftar"
        const identifier = String(profile.id || profile.userId || d1.nik || "123456").replace(/\D/g, "")
        const regNum = `SM-SARJANA-2025-${identifier.slice(-6).padStart(6, "0")}`

        let birthDateFormatted = d1.tanggalLahir || d1.birthDate || "01 Januari 2000"
        if (d1.birthDate || d1.tanggalLahir) {
          try {
            const rawDate = d1.birthDate || d1.tanggalLahir
            birthDateFormatted = new Date(rawDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          } catch (e) {
            birthDateFormatted = d1.tanggalLahir || d1.birthDate
          }
        }

        const major = d2.programChoice1Major
          ? `${d2.programChoice1Faculty ? d2.programChoice1Faculty + " / " : ""}${d2.programChoice1Major}`
          : "Teknik Informatika"

        const photo = d3.photo_url || d3.photoUrl || profile.profilePicture || "/avatar.png"

        setDataPeserta({
          nama: fullName,
          nomorPendaftaran: regNum,
          tanggalLahir: birthDateFormatted,
          programStudi: major,
          fotoUrl: photo,
        })
      } catch (err) {
        logger.error("Gagal mengambil data peserta untuk kartu ujian:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  // Data Kartu Ujian
  const dataKartu = {
    ...dataPeserta,
    sesi: cbtSesi,
    peraturan: [
      "Wajib hadir 30 menit sebelum ujian dimulai.",
      "Membawa Kartu Ujian dan identitas diri (KTP/SIM).",
      "Mengenakan pakaian rapi dan sopan (kemeja/polo, celana panjang).",
      "Dilarang membawa alat komunikasi (HP, Smartwatch) ke ruang ujian."
    ]
  }

  // Fungsi untuk men-generate dan mengunduh Kartu Ujian (Native Vector PDF)
  const handlePrintCard = () => {
    try {
      generateKartuUjianPdf({
        nomorPendaftaran: dataPeserta.nomorPendaftaran,
        nama: dataPeserta.nama,
        tanggalLahir: dataPeserta.tanggalLahir,
        programStudi: dataPeserta.programStudi,
        tanggalUjian: cbtSesi.tanggal,
        waktuUjian: cbtSesi.waktu,
        lokasiUjian: cbtSesi.lokasi,
        fotoUrl: dataPeserta.fotoUrl,
      })
      localStorage.setItem("card_printed", "true")
      setIsPrinted(true)
    } catch (error) {
      logger.error("Gagal membuat PDF kartu ujian:", error)
      alert("Terjadi kendala saat mengunduh Kartu Ujian. Silakan coba lagi.")
    }
  }

    return (
        // Menggunakan AppLayout untuk menyediakan Sidebar dan Header
        <AppLayout
            menuTemplate="admisi" // Menggunakan menu untuk admisi
            title="Cetak Kartu Ujian" // Judul utama di Header
            subtitle="Dokumen" // Subtitle di Header
            backTo="/pendaftaran/sarjana-2025" // Rute kembali ke detail pendaftaran
        >
            {/* Konten Halaman (children) */}
            <Card className="shadow-sm border rounded-lg max-w-4xl gap-2 mx-auto">
                <CardHeader className="pb-2 border-b border-gray-200">
                    <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <GraduationCap className="h-5 w-5 text-primary"/> Kartu Tanda Peserta Ujian
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Harap cetak dan bawa kartu ini saat pelaksanaan ujian CBT.
                    </p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    
                    {/* KARTU UJIAN - Design Clean dan Formal */}
                    <div className="border-4 border-primary/50 rounded-lg p-6 bg-white shadow-lg">
                        <h2 className="text-2xl font-extrabold text-primary mb-4 text-center">KARTU UJIAN MASUK UGN</h2>
                        <Separator className="bg-primary mb-6" />

                        <div className="grid grid-cols-4 gap-6">
                            {/* Kolom Kiri: Foto */}
                            <div className="col-span-1 flex flex-col items-center">
                                <Avatar className="h-32 w-24 rounded-none border border-gray-300">
                                    <AvatarImage src={dataKartu.fotoUrl} alt="Foto Peserta" />
                                    <AvatarFallback>FOTO</AvatarFallback>
                                </Avatar>
                                <p className="text-xs text-muted-foreground mt-2">Pas Foto 3x4</p>
                            </div>
                            
                            {/* Kolom Kanan: Detail Peserta */}
                            <div className="col-span-3 space-y-2 text-sm">
                                <div className="grid grid-cols-2">
                                    <p className="font-medium text-gray-600">Nomor Pendaftaran:</p>
                                    <p className="font-bold text-gray-900">{dataKartu.nomorPendaftaran}</p>
                                </div>
                                <div className="grid grid-cols-2">
                                    <p className="font-medium text-gray-600">Nama Lengkap:</p>
                                    <p className="font-bold text-gray-900">{dataKartu.nama}</p>
                                </div>
                                <div className="grid grid-cols-2">
                                    <p className="font-medium text-gray-600">Tanggal Lahir:</p>
                                    <p className="font-bold text-gray-900">{dataKartu.tanggalLahir}</p>
                                </div>
                                <div className="grid grid-cols-2">
                                    <p className="font-medium text-gray-600">Pilihan Program Studi:</p>
                                    <p className="font-bold text-gray-900">{dataKartu.programStudi}</p>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Detail Sesi Ujian */}
                        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Calendar className="h-5 w-5 text-primary"/> DETAIL SESI UJIAN CBT</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="space-y-1">
                                <p className="font-medium text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3"/> Tanggal</p>
                                <p className="font-bold text-gray-800">{dataKartu.sesi.tanggal}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3"/> Waktu</p>
                                <p className="font-bold text-gray-800">{dataKartu.sesi.waktu}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3"/> Lokasi</p>
                                <p className="font-bold text-gray-800">{dataKartu.sesi.lokasi}</p>
                            </div>
                        </div>
                        
                        <Separator className="my-6" />

                        {/* Peraturan */}
                        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">PERATURAN PESERTA</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                            {dataKartu.peraturan.map((rule, index) => (
                                <li key={index}>{rule}</li>
                            ))}
                        </ul>

                    </div>
                    
                    {/* CTA Cetak */}
                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <Button 
                            onClick={handlePrintCard}
                            className="bg-primary hover:bg-primary/90 text-white"
                        >
                            <Printer className="h-4 w-4 mr-2" /> Cetak Kartu Ujian
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {/* Akhir Konten Halaman */}
        </AppLayout>
    )
}
