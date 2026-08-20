import {
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import React, { useEffect, useState } from "react"
// --- PATH IMPORT APP LAYOUT YANG BENAR ---
import { AppLayout } from "@/components/ui/app-layout"
import { useNavigate } from "react-router-dom"

import { logger } from "@/lib/logger"

const API_BASE = import.meta.env.VITE_PUBLIC_API_URL ?? ""

// Tipe status: 'Selesai', 'Revisi', 'Belum Selesai'
type StepStatus = "Selesai" | "Revisi" | "Belum Selesai"

const getStatusIcon = (status: StepStatus) => {
  switch (status) {
    case "Selesai":
      return { Icon: CheckCircle, className: "text-green-600" }
    case "Revisi":
      return { Icon: AlertTriangle, className: "text-red-600" }
    case "Belum Selesai":
      return { Icon: XCircle, className: "text-orange-600" }
    default:
      return { Icon: XCircle, className: "text-gray-500" }
  }
}

export default function LockDataPendaftaranPage() {
  const navigate = useNavigate()
  const [isLocked, setIsLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [locking, setLocking] = useState(false)
  const [steps, setSteps] = useState<{ id: string; title: string; status: StepStatus }[]>([
    { id: "data-entry", title: "Pengisian Data Diri", status: "Belum Selesai" },
    { id: "program", title: "Pemilihan Program Studi", status: "Belum Selesai" },
    { id: "upload", title: "Upload Dokumen", status: "Belum Selesai" },
  ])

  const token = localStorage.getItem("token")
  const getAuthHeaders = (): HeadersInit =>
    token ? { Authorization: `Bearer ${token}` } : {}

  // Load real completion + lock status from backend
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [res1, res2, res3, lockRes] = await Promise.all([
          fetch(`${API_BASE}/admissiondata/1`, { headers: getAuthHeaders(), credentials: "include" }),
          fetch(`${API_BASE}/admissiondata/2`, { headers: getAuthHeaders(), credentials: "include" }),
          fetch(`${API_BASE}/admissiondata/3`, { headers: getAuthHeaders(), credentials: "include" }),
          fetch(`${API_BASE}/admissiondata/locked`, { headers: getAuthHeaders(), credentials: "include" }),
        ])

        const d1 = res1.ok ? (await res1.json()).data ?? {} : {}
        const d2 = res2.ok ? (await res2.json()).data ?? {} : {}
        const d3 = res3.ok ? (await res3.json()).data ?? {} : {}

        const hasVal = (o: Record<string, unknown>) =>
          Object.values(o).some((v) => v !== null && v !== undefined && v !== "")

        setSteps([
          {
            id: "data-entry",
            title: "Pengisian Data Diri",
            status: d1.fullName && d1.nik && hasVal(d2) ? "Selesai" : "Belum Selesai",
          },
          {
            id: "program",
            title: "Pemilihan Program Studi",
            status: d1.major || d1.schoolOrigin ? "Selesai" : "Belum Selesai",
          },
          {
            id: "upload",
            title: "Upload Dokumen",
            status:
              d3.photo_url || d3.raport_url || d3.kk_url || d3.ijazah_url
                ? "Selesai"
                : "Belum Selesai",
          },
        ])

        if (lockRes.ok) {
          const lockData = await lockRes.json()
          setIsLocked(
            typeof lockData === "boolean"
              ? lockData
              : Boolean(
                lockData?.isLocked === true ||
                lockData?.data?.isLocked === true ||
                lockData?.data === true,
              ),
          )
        }
      } catch (err) {
        logger.error("Failed to load lock status:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalSteps = steps.length
  const stepsCompleted = steps.filter((s) => s.status === "Selesai").length
  const stepsNeedingRevision = steps.filter((s) => s.status === "Revisi").length
  const stepsIncomplete = steps.filter((s) => s.status === "Belum Selesai").length

  // Kriteria untuk mengunci: Semua langkah harus 'Selesai'
  const canLock = stepsNeedingRevision === 0 && stepsIncomplete === 0

  const handleLockData = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canLock || isLocked || locking) return

    const ok = window.confirm(
      "PERINGATAN: Setelah dikunci, data Anda TIDAK DAPAT diubah lagi.\nApakah Anda yakin ingin mengunci data pendaftaran?",
    )
    if (!ok) return

    setLocking(true)
    try {
      const res = await fetch(`${API_BASE}/admissiondata/lock`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      })

      if (res.ok) {
        setIsLocked(true)
        alert("✓ Data pendaftaran berhasil dikunci! Anda dapat melanjutkan ke pembuatan tagihan.")
        navigate("/pendaftaran/sarjana-2025")
      } else {
        const errText = await res.text()
        alert(`✗ Gagal mengunci data.\n${errText.substring(0, 120)}`)
      }
    } catch (err) {
      logger.error("Lock error:", err)
      alert("✗ Kesalahan server saat mengunci data")
    } finally {
      setLocking(false)
    }
  }

  return (
    <AppLayout
      menuTemplate="admisi"
      title="Sarjana Reguler 2025"
      subtitle="Penguncian Data"
      backTo="/pendaftaran/sarjana-2025"
    >
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <form onSubmit={handleLockData}>
          <Card className="shadow-sm border rounded-lg max-w-4xl gap-2 mx-auto">
            <CardHeader className="pb-2 border-b border-gray-200">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />Penguncian Data Pendaftaran
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Pastikan semua data sudah benar, karena setelah dikunci, Anda tidak akan bisa mengubah Data Diri, pilihan program studi, dan unggahan dokumen.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">

              {loading ? (
                <div className="text-center text-muted-foreground py-6">Memuat status data...</div>
              ) : (
                <>
                  {/* Status Kelengkapan Global */}
                  <div className={`p-4 rounded-lg ${isLocked ? "bg-green-50 border-green-300" : canLock ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"} border space-y-3`}>
                    {isLocked ? (
                      <h2 className="text-lg font-bold flex items-center gap-2 text-green-800">
                        <Lock className="h-6 w-6" /> Data Anda Sudah Terkunci.
                      </h2>
                    ) : canLock ? (
                      <h2 className="text-lg font-bold flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-6 w-6" /> Data Anda Sudah Lengkap dan Siap Dikunci.
                      </h2>
                    ) : (
                      <h2 className="text-lg font-bold flex items-center gap-2 text-red-800">
                        <AlertTriangle className="h-6 w-6" /> Data Belum Lengkap.
                      </h2>
                    )}

                    <p className="text-sm text-gray-700">
                      Progress pengisian data Anda saat ini:
                      <span className="font-semibold text-primary ml-1">{stepsCompleted} dari {totalSteps} langkah selesai.</span>
                    </p>
                  </div>

                  {/* Detail Status Langkah */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold border-b pb-2">Detail Status Langkah Wajib:</h3>
                    {steps.map((step) => {
                      const { Icon, className } = getStatusIcon(step.status)
                      return (
                        <div key={step.id} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{step.title}</span>
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${className}`} />
                            <Badge variant="outline" className={`font-semibold ${className} border-current`}>
                              {step.status === "Belum Selesai" ? "Belum Diisi" : step.status}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Tombol Aksi */}
                  <div className="pt-4 border-t">
                    <Button
                      type="submit"
                      className={`w-full md:w-auto text-lg px-8 py-6 ${canLock && !isLocked ? "bg-red-600 hover:bg-red-700" : "bg-gray-400 cursor-not-allowed"}`}
                      disabled={!canLock || isLocked || locking}
                    >
                      {isLocked ? (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" /> Data Sudah Terkunci
                        </>
                      ) : locking ? (
                        <>
                          <Lock className="h-5 w-5 mr-2" /> Mengunci...
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mr-2" /> Kunci Data Permanen &amp; Lanjut Tagihan
                        </>
                      )}
                    </Button>
                    {!canLock && !isLocked && (
                      <p className="text-sm text-red-600 mt-2">
                        Anda hanya dapat mengunci data jika semua langkah berstatus Selesai.
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </form>
      </main>
    </AppLayout>
  )
}
