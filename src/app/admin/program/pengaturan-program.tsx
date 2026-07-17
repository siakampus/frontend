"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, School, Loader2, AlertCircle, RefreshCw, Power } from "lucide-react"
import { admissionPathsApi } from "@/lib/api"

type AdmissionPath = {
  id: number
  name: string
  description?: string | null
  status: "ACTIVE" | "INACTIVE"
  startDate: string
  endDate: string
}

type ApiResp<T> = { ok: boolean; status: number; data: T }

export default function AdminProgramsPage() {
  const navigate = useNavigate()
  const [programs, setPrograms] = useState<AdmissionPath[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const fetchPrograms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await admissionPathsApi.listAll() as ApiResp<{ data?: AdmissionPath[] } | AdmissionPath[]>
      if (res.ok) {
        const list: AdmissionPath[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray((res.data as { data?: AdmissionPath[] }).data)
          ? (res.data as { data: AdmissionPath[] }).data
          : []
        setPrograms(list)
      } else {
        setError("Gagal memuat program pendaftaran.")
      }
    } catch {
      setError("Koneksi ke server gagal.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPrograms() }, [fetchPrograms])

  const handleToggleStatus = async (e: React.MouseEvent, p: AdmissionPath) => {
    e.stopPropagation()
    const newStatus = p.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    setTogglingId(p.id)
    try {
      const res = await admissionPathsApi.toggleStatus(p.id, newStatus) as ApiResp<unknown>
      if (res.ok) {
        setPrograms((prev) =>
          prev.map((x) => (x.id === p.id ? { ...x, status: newStatus } : x))
        )
      } else {
        alert("Gagal mengubah status program.")
      }
    } finally {
      setTogglingId(null)
    }
  }

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) }
    catch { return d }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Memuat program pendaftaran...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-4 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchPrograms} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-xl flex items-center gap-2">
            <School className="h-5 w-5" /> Program Pendaftaran
          </h2>
          <Button onClick={() => navigate("/admin/programs/new")} className="flex items-center gap-2" id="btn-tambah-program">
            <Plus className="h-4 w-4" /> Tambah Program
          </Button>
        </div>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b bg-muted text-left text-muted-foreground">
              <th className="p-3 font-semibold">Nama Program</th>
              <th className="p-3 font-semibold">Periode</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((p) => (
              <tr
                key={p.id}
                className="border-b hover:bg-muted/40 transition cursor-pointer"
                onClick={() => navigate(`/admin/programs/${p.id}`)}
              >
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-muted-foreground">
                  {formatDate(p.startDate)} – {formatDate(p.endDate)}
                </td>
                <td className="p-3">
                  {p.status === "ACTIVE" ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">Aktif</Badge>
                  ) : (
                    <Badge variant="secondary">Nonaktif</Badge>
                  )}
                </td>
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5 text-xs"
                    onClick={(e) => handleToggleStatus(e, p)}
                    disabled={togglingId === p.id}
                    id={`btn-toggle-status-${p.id}`}
                  >
                    {togglingId === p.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Power className="h-3.5 w-3.5" />
                    )}
                    {p.status === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                </td>
              </tr>
            ))}
            {programs.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted-foreground p-8">
                  <School className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Belum ada program pendaftaran.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
