import {
  Printer,
  FileText,
  CheckCircle,
  Clock,
  Loader2,
  User,
  GraduationCap,
  Calendar,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import React, { useEffect, useState } from "react"
import { AppLayout } from "@/components/ui/app-layout"
import { logger } from "@/lib/logger"

const API_BASE = import.meta.env.VITE_PUBLIC_API_URL ?? ""

interface ParticipantData {
  nama: string
  nik: string
  nomorPendaftaran: string
  programStudi: string
  fakultas: string
  tanggalBayar: string
  isVerified: boolean
  jumlahBayar: string
}

export default function CetakBuktiPesertaPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dataPeserta, setDataPeserta] = useState<ParticipantData>({
    nama: "—",
    nik: "—",
    nomorPendaftaran: "—",
    programStudi: "—",
    fakultas: "—",
    tanggalBayar: "—",
    isVerified: false,
    jumlahBayar: "Rp 250.000",
  })

  const token = localStorage.getItem("token")
  const getAuthHeaders = (): HeadersInit =>
    token ? { Authorization: `Bearer ${token}` } : {}

  useEffect(() => {
    const fetchParticipantData = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [res1, res2, billRes, userRes] = await Promise.all([
          fetch(`${API_BASE}/admissiondata/1`, {
            headers: getAuthHeaders(),
            credentials: "include",
          }),
          fetch(`${API_BASE}/admissiondata/2`, {
            headers: getAuthHeaders(),
            credentials: "include",
          }),
          fetch(`${API_BASE}/user/bill/status`, {
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
        const billJson = billRes.ok ? await billRes.json() : {}
        const billData = billJson.data ?? billJson ?? {}
        const userJson = userRes.ok ? await userRes.json() : {}
        const profile = userJson.data ?? userJson ?? {}

        const fullName = d1.fullName || profile.name || profile.fullName || "Pendaftar"
        const nik = d1.nik || profile.nik || "-"
        const major = d2.programChoice1Major || "Teknik Informatika"
        const faculty = d2.programChoice1Faculty || "Fakultas Teknik"

        // Format registration number from user id or NIK
        const identifier = String(profile.id || profile.userId || d1.nik || "123456").replace(/\D/g, "")
        const regNum = `SM-SARJANA-2025-${identifier.slice(-6).padStart(6, "0")}`

        // Format tanggal bayar
        let paymentDateStr = "10 November 2025"
        if (billData.verifiedAt || billData.updatedAt || billData.createdAt) {
          try {
            const rawDate = billData.verifiedAt || billData.updatedAt || billData.createdAt
            paymentDateStr = new Date(rawDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          } catch (e) {
            paymentDateStr = new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          }
        } else if (billData.isVerified) {
          paymentDateStr = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        }

        const amountFormatted = billData.amount
          ? `Rp ${Number(billData.amount).toLocaleString("id-ID")}`
          : "Rp 250.000"

        setDataPeserta({
          nama: fullName,
          nik: nik,
          nomorPendaftaran: regNum,
          programStudi: major,
          fakultas: faculty,
          tanggalBayar: paymentDateStr,
          isVerified: Boolean(billData.isVerified),
          jumlahBayar: amountFormatted,
        })
      } catch (err) {
        logger.error("Gagal mengambil data bukti peserta pendaftaran:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchParticipantData()
  }, [token])

  // Fungsi untuk memanggil API dan mengunduh PDF
  const handlePrint = async () => {
    if (!token) {
      alert("Sesi berakhir. Mohon login kembali.")
      window.location.href = "/login"
      return
    }

    setIsGenerating(true)

    try {
      const res = await fetch(`${API_BASE}/admissiondata/generate-pdf`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        const errorText = await res.text()
        logger.error("Gagal generate PDF via backend:", errorText)
        localStorage.setItem("proof_printed", "true")
        window.print()
        return
      }

      const data = await res.json()
      const downloadUrl = data?.downloadUrl

      if (downloadUrl) {
        localStorage.setItem("proof_printed", "true")
        window.open(downloadUrl, "_blank")
      } else {
        localStorage.setItem("proof_printed", "true")
        window.print()
      }
    } catch (error) {
      logger.error("Kesalahan koneksi saat generate PDF:", error)
      localStorage.setItem("proof_printed", "true")
      window.print()
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AppLayout
      menuTemplate="admisi"
      title="Cetak Bukti Peserta"
      subtitle="Dokumen Bukti Pendaftaran"
      backTo="/pendaftaran/sarjana-2025"
    >
      <Card className="shadow-sm border rounded-lg max-w-4xl gap-2 mx-auto">
        <CardHeader className="pb-2 border-b border-gray-200">
          <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <FileText className="h-5 w-5 text-primary" /> Bukti Peserta Pendaftaran
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Simpan dokumen resmi ini sebagai bukti bahwa Anda telah menyelesaikan tahap pengisian data dan pembayaran pendaftaran.
          </p>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Memuat data bukti peserta...
            </div>
          ) : (
            <div className="p-5 rounded-lg border border-gray-200 bg-gray-50/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  {dataPeserta.isVerified ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-700 text-sm">
                        Pembayaran Dikonfirmasi & Terverifikasi
                      </span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5 text-amber-600" />
                      <span className="font-semibold text-amber-700 text-sm">
                        Status Pembayaran: Terdaftar
                      </span>
                    </>
                  )}
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full">
                  SM-SARJANA-2025
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-gray-500 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" /> Nomor Pendaftaran
                  </p>
                  <p className="font-bold text-gray-900 text-base font-mono">
                    {dataPeserta.nomorPendaftaran}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-gray-500 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-primary" /> Nama Lengkap Peserta
                  </p>
                  <p className="font-bold text-gray-900 text-base">{dataPeserta.nama}</p>
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-gray-500 flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-primary" /> Program Studi Pilihan
                  </p>
                  <p className="font-bold text-gray-900">
                    {dataPeserta.programStudi}
                  </p>
                  <p className="text-xs text-muted-foreground">{dataPeserta.fakultas}</p>
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-gray-500 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" /> Tanggal Pembayaran
                  </p>
                  <p className="font-bold text-gray-900">{dataPeserta.tanggalBayar}</p>
                  <p className="text-xs text-muted-foreground">Biaya: {dataPeserta.jumlahBayar}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Pastikan Anda juga mencetak Kartu Ujian setelah sesi CBT ditetapkan.
            </p>

            <Button
              onClick={handlePrint}
              disabled={isGenerating || loading}
              className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Printer className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? "Membuat Dokumen..." : "Cetak Bukti Peserta"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}

