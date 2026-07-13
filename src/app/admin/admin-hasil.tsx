import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { adminRegistrationsApi } from "@/lib/api"
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Send,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

interface Registration {
  id: string
  userId: string
  status: string
  isValidated: boolean
  isLocked: boolean
  user?: { email?: string; name?: string }
  registrationData?: {
    fullName?: string
    program?: string
    faculty?: string
    feedback?: string
  }
}

const RESULT_LABEL: Record<string, string> = {
  validated: "Diterima",
  rejected: "Ditolak",
  pending: "Menunggu",
  submitted: "Diajukan",
}

const RESULT_COLOR: Record<string, string> = {
  validated: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  pending: "bg-gray-100 text-gray-600",
  submitted: "bg-blue-100 text-blue-700",
}

export default function AdminResultsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Registration | null>(null)
  const [editedResult, setEditedResult] = useState<boolean>(true)
  const [editedNote, setEditedNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [actionMsg, setActionMsg] = useState("")
  const navigate = useNavigate()

  const fetchRegistrations = async () => {
    setLoading(true)
    const res = await adminRegistrationsApi.list(search ? { search } : undefined)
    if (res.status === 401) { navigate("/login"); return }
    if (res.ok && res.data) {
      const body = res.data as { data?: Registration[]; registrations?: Registration[] }
      setRegistrations(body.data || (body.registrations as Registration[]) || (res.data as unknown as Registration[]) || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchRegistrations() }, [])

  const notify = (msg: string) => {
    setActionMsg(msg)
    setTimeout(() => setActionMsg(""), 3000)
  }

  const handleOpen = (r: Registration) => {
    setSelected(r)
    setEditedResult(r.isValidated)
    setEditedNote(r.registrationData?.feedback || "")
  }

  const handleSaveResult = async () => {
    if (!selected) return
    setSaving(true)
    const res = await adminRegistrationsApi.setResult(selected.id, editedResult)
    if (res.ok) {
      // Also save feedback/note if provided
      if (editedNote.trim()) {
        await adminRegistrationsApi.setFeedback(selected.id, editedNote)
      }
      notify(`✅ Hasil untuk ${selected.registrationData?.fullName || selected.user?.name} berhasil disimpan.`)
      setSelected(null)
      fetchRegistrations()
    } else {
      notify("❌ Gagal menyimpan hasil.")
    }
    setSaving(false)
  }

  const filtered = registrations.filter((r) => {
    const q = search.toLowerCase()
    return (
      (r.user?.email || "").toLowerCase().includes(q) ||
      (r.user?.name || "").toLowerCase().includes(q) ||
      (r.registrationData?.fullName || "").toLowerCase().includes(q) ||
      (r.registrationData?.program || "").toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card className="shadow-sm border rounded-lg">
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, email, atau program..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchRegistrations()}
            />
          </div>
          <Button onClick={fetchRegistrations} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </CardContent>
      </Card>

      {actionMsg && (
        <div className="text-sm font-medium px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
          {actionMsg}
        </div>
      )}

      <Card className="shadow-sm border rounded-lg overflow-hidden">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 font-serif text-primary">
            Hasil Pendaftaran ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="animate-spin h-5 w-5 mr-2" /> Memuat data...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              Tidak ada data pendaftaran.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/20 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Pendaftar</th>
                    <th className="px-4 py-3 text-left">Program</th>
                    <th className="px-4 py-3 text-left">Status Akhir</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {r.registrationData?.fullName || r.user?.name || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">{r.user?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {r.registrationData?.faculty
                          ? `${r.registrationData.faculty} / ${r.registrationData.program || ""}`
                          : r.registrationData?.program || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${RESULT_COLOR[r.status] || "bg-gray-100 text-gray-600"}`}>
                          {RESULT_LABEL[r.status] || r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => handleOpen(r)}
                        >
                          <Eye className="h-4 w-4" /> Tentukan Hasil
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Alert */}
      <Card className="p-6 border rounded-lg shadow-sm bg-amber-50/50">
        <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" /> Catatan
        </h2>
        <p className="text-sm text-muted-foreground">
          Gunakan tombol "Tentukan Hasil" di setiap baris untuk menetapkan status penerimaan dan menambahkan catatan kepada pendaftar.
        </p>
      </Card>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-xl border p-6 space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="font-bold text-lg">
                Hasil Akhir — {selected.registrationData?.fullName || selected.user?.name}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Program</p>
                <p className="font-medium">
                  {selected.registrationData?.faculty
                    ? `${selected.registrationData.faculty} / ${selected.registrationData.program || ""}`
                    : selected.registrationData?.program || "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{selected.user?.email || "—"}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Keputusan</label>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setEditedResult(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      editedResult ? "bg-green-100 border-green-400 text-green-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" /> Diterima
                  </button>
                  <button
                    onClick={() => setEditedResult(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      !editedResult ? "bg-red-100 border-red-400 text-red-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <XCircle className="h-4 w-4" /> Ditolak
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Catatan</label>
                <Textarea
                  placeholder="Tuliskan pesan atau alasan hasil..."
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                  className="min-h-[100px] mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button variant="outline" onClick={() => setSelected(null)}>Batal</Button>
                <Button onClick={handleSaveResult} disabled={saving} className="flex items-center gap-2">
                  <Send className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Hasil"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}