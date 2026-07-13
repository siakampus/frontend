import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { adminRegistrationsApi, adminUsersApi } from "@/lib/api"
import {
  Eye,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  CheckCircle,
  X,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

interface Registration {
  id: string
  userId: string
  status: string
  isLocked: boolean
  isPersonalDataLocked: boolean
  isValidated: boolean
  user?: {
    email?: string
    name?: string
  }
  registrationData?: {
    fullName?: string
    program?: string
    faculty?: string
  }
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  submitted: "bg-blue-100 text-blue-700",
  validated: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [actionMsg, setActionMsg] = useState("")
  const [selected, setSelected] = useState<Registration | null>(null)
  const navigate = useNavigate()

  const fetchRegistrations = async () => {
    setLoading(true)
    const res = await adminRegistrationsApi.list(search ? { search } : undefined)
    if (res.status === 401) { navigate("/login"); return }
    
    let fetchedRegs: Registration[] = []
    if (res.ok && res.data) {
      const body = res.data as { data?: Registration[]; registrations?: Registration[] }
      fetchedRegs = body.data || (body.registrations as Registration[]) || (res.data as unknown as Registration[]) || []
    }

    try {
      // Ambil daftar pengguna untuk mencocokkan email dan nama
      const usersRes = await adminUsersApi.list({ take: 1000 })
      if (usersRes.ok && usersRes.data) {
        const usersBody = usersRes.data as any
        const usersList = usersBody.data || usersBody.users || usersBody || []
        
        const userMap = new Map<string, any>()
        usersList.forEach((u: any) => userMap.set(u.id, u))

        fetchedRegs = fetchedRegs.map(reg => {
          if (!reg.user || (!reg.user.email && !reg.user.name)) {
            const foundUser = userMap.get(reg.userId)
            if (foundUser) {
              return {
                ...reg,
                user: {
                  email: foundUser.email,
                  name: foundUser.name,
                }
              }
            }
          }
          return reg
        })
      }
    } catch (err) {
      console.error("Gagal melakukan mapping data user", err)
    }

    setRegistrations(fetchedRegs)
    setLoading(false)
  }

  useEffect(() => { fetchRegistrations() }, [])

  const notify = (msg: string) => {
    setActionMsg(msg)
    setTimeout(() => setActionMsg(""), 3000)
  }

  const handleValidate = async (userId: string) => {
    if (!confirm("Validasi pendaftaran ini?")) return
    const res = await adminRegistrationsApi.validate([userId])
    notify(res.ok ? "✅ Pendaftaran berhasil divalidasi." : "❌ Gagal memvalidasi.")
    fetchRegistrations()
  }

  const handleUnlockRegistration = async (userId: string) => {
    const res = await adminRegistrationsApi.unlockRegistration(userId)
    notify(res.ok ? "✅ Kunci pendaftaran dibuka." : "❌ Gagal membuka kunci.")
    fetchRegistrations()
  }

  const handleUnlockPersonalData = async (userId: string) => {
    const res = await adminRegistrationsApi.unlockPersonalData(userId)
    notify(res.ok ? "✅ Kunci data pribadi dibuka." : "❌ Gagal membuka kunci data pribadi.")
    fetchRegistrations()
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card className="shadow-sm border rounded-lg">
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari email atau nama pendaftar..."
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
            Data Pendaftaran ({registrations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="animate-spin h-5 w-5 mr-2" /> Memuat data...
            </div>
          ) : registrations.length === 0 ? (
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
                    <th className="px-4 py-3 text-left">Dikunci</th>
                    <th className="px-4 py-3 text-left">Tervalidasi</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {registrations.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {r.registrationData?.fullName || r.user?.name || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">{r.user?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {r.registrationData?.faculty && r.registrationData?.program
                          ? `${r.registrationData.faculty} / ${r.registrationData.program}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[r.status] || "bg-gray-100 text-gray-600"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={r.isLocked ? "default" : "outline"} className="text-xs">
                          {r.isLocked ? "Terkunci" : "Terbuka"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={r.isValidated ? "default" : "outline"} className="text-xs">
                          {r.isValidated ? "✓ Valid" : "Belum"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            title="Lihat Detail"
                            onClick={() => setSelected(r)}
                            className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {!r.isValidated && (
                            <button
                              title="Validasi"
                              onClick={() => handleValidate(r.userId)}
                              className="p-1.5 rounded hover:bg-green-50 text-green-600 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {r.isLocked && (
                            <button
                              title="Buka Kunci Pendaftaran"
                              onClick={() => handleUnlockRegistration(r.userId)}
                              className="p-1.5 rounded hover:bg-amber-50 text-amber-600 transition-colors"
                            >
                              <Unlock className="h-4 w-4" />
                            </button>
                          )}
                          {r.isPersonalDataLocked && (
                            <button
                              title="Buka Kunci Data Pribadi"
                              onClick={() => handleUnlockPersonalData(r.userId)}
                              className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                            >
                              <Lock className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="font-bold text-lg">Detail Pendaftaran</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Email:</span> {selected.user?.email || "—"}</div>
              <div><span className="text-muted-foreground">Nama:</span> {selected.registrationData?.fullName || selected.user?.name || "—"}</div>
              <div><span className="text-muted-foreground">Fakultas:</span> {selected.registrationData?.faculty || "—"}</div>
              <div><span className="text-muted-foreground">Program:</span> {selected.registrationData?.program || "—"}</div>
              <div><span className="text-muted-foreground">Status:</span> {selected.status}</div>
              <div><span className="text-muted-foreground">Dikunci:</span> {selected.isLocked ? "Ya" : "Tidak"}</div>
              <div><span className="text-muted-foreground">Data Pribadi Dikunci:</span> {selected.isPersonalDataLocked ? "Ya" : "Tidak"}</div>
              <div><span className="text-muted-foreground">Tervalidasi:</span> {selected.isValidated ? "Ya" : "Tidak"}</div>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelected(null)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}