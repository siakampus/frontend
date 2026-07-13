import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminRegistrationsApi } from "@/lib/api"
import {
  Search,
  Eye,
  Send,
  X,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

interface Registration {
  id: string
  userId: string
  status: string
  isValidated: boolean
  user?: { email?: string; name?: string }
  registrationData?: {
    fullName?: string
    program?: string
    faculty?: string
    feedback?: string
  }
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  validated: <CheckCircle className="h-4 w-4 text-green-600" />,
  needs_revision: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
  pending: <Clock className="h-4 w-4 text-gray-500" />,
}

export default function AdminFeedbackPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Registration | null>(null)
  const [feedbackText, setFeedbackText] = useState("")
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

  const handleOpenFeedback = (r: Registration) => {
    setSelected(r)
    setFeedbackText(r.registrationData?.feedback || "")
  }

  const handleSaveFeedback = async () => {
    if (!selected) return
    setSaving(true)
    const res = await adminRegistrationsApi.setFeedback(selected.id, feedbackText)
    setSaving(false)
    if (res.ok) {
      notify("✅ Feedback berhasil disimpan.")
      setSelected(null)
      fetchRegistrations()
    } else {
      notify("❌ Gagal menyimpan feedback.")
    }
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
            Feedback Pendaftar ({filtered.length})
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
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Feedback</th>
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
                        <div className="flex items-center gap-1 text-xs">
                          {STATUS_ICON[r.status] || STATUS_ICON["pending"]}
                          <span className="capitalize">{r.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                        {r.registrationData?.feedback || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenFeedback(r)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" /> Review
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

      {/* Modal Feedback */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-xl border p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="font-bold text-lg">
                Feedback — {selected.registrationData?.fullName || selected.user?.name}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Email:</span> {selected.user?.email || "—"}</p>
              <p>
                <span className="text-muted-foreground">Program:</span>{" "}
                {selected.registrationData?.faculty
                  ? `${selected.registrationData.faculty} / ${selected.registrationData.program || ""}`
                  : selected.registrationData?.program || "—"}
              </p>
              <p><span className="text-muted-foreground">Status:</span> {selected.status}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Catatan / Feedback</label>
              <Textarea
                placeholder="Tuliskan catatan atau revisi yang perlu dilakukan..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[100px] mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" onClick={() => setSelected(null)}>Batal</Button>
              <Button onClick={handleSaveFeedback} disabled={saving} className="flex items-center gap-2">
                <Send className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Feedback"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}