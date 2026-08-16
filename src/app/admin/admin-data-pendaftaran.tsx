import { useEffect, useState } from "react"
import { logger } from "@/lib/logger"
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
  Monitor,
  Calendar,
  Clock,
  MapPin,
  Trash2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export interface CBTSessionData {
  tanggal: string
  waktu: string
  lokasi: string
  status: string
  assignedAt: string
}

interface Registration {
  id: string
  userId: string
  status: string
  isLocked: boolean
  isPersonalDataLocked: boolean
  isValidated: boolean
  fullName?: string
  programChoice1Faculty?: string
  programChoice1Major?: string
  cbtSession?: CBTSessionData | null
  user?: {
    email?: string
    name?: string
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
  
  // CBT Assignment Modal State
  const [cbtModalUser, setCbtModalUser] = useState<Registration | null>(null)
  const [cbtForm, setCbtForm] = useState<{ tanggal: string; waktu: string; lokasi: string }>({
    tanggal: "Sabtu, 15 Januari 2026",
    waktu: "Sesi 2 (Pukul 10:00 - 12:00 WIB)",
    lokasi: "Gedung Utama, Ruang 301 (Lab Komputer)",
  })

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
        // Match both number/string differences in IDs
        usersList.forEach((u: any) => userMap.set(String(u.id), u))

        fetchedRegs = fetchedRegs.map(reg => {
          let userObj = reg.user
          if (!userObj || (!userObj.email && !userObj.name)) {
            const foundUser = userMap.get(String(reg.userId))
            if (foundUser) {
              userObj = {
                email: foundUser.email,
                name: foundUser.name,
              }
            }
          }

          // Cek data sesi CBT tersimpan di localStorage
          let storedCbt: CBTSessionData | null = null
          const rawCbt = localStorage.getItem(`cbt_session_${reg.userId}`) || localStorage.getItem("cbt_session")
          if (rawCbt) {
            try {
              storedCbt = JSON.parse(rawCbt)
            } catch (e) {
              storedCbt = null
            }
          }

          return {
            ...reg,
            user: userObj,
            cbtSession: storedCbt,
          }
        })
      }
    } catch (err) {
      logger.error("Gagal melakukan mapping data user", err)
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

  const openCbtModal = (reg: Registration) => {
    setCbtModalUser(reg)
    if (reg.cbtSession) {
      setCbtForm({
        tanggal: reg.cbtSession.tanggal || "Sabtu, 15 Januari 2026",
        waktu: reg.cbtSession.waktu || "Sesi 2 (Pukul 10:00 - 12:00 WIB)",
        lokasi: reg.cbtSession.lokasi || "Gedung Utama, Ruang 301 (Lab Komputer)",
      })
    } else {
      setCbtForm({
        tanggal: "Sabtu, 15 Januari 2026",
        waktu: "Sesi 2 (Pukul 10:00 - 12:00 WIB)",
        lokasi: "Gedung Utama, Ruang 301 (Lab Komputer)",
      })
    }
  }

  const handleSaveCbtSession = () => {
    if (!cbtModalUser) return
    const payload: CBTSessionData = {
      tanggal: cbtForm.tanggal,
      waktu: cbtForm.waktu,
      lokasi: cbtForm.lokasi,
      status: "Ditetapkan",
      assignedAt: new Date().toISOString(),
    }
    // Simpan di local storage spesifik user dan global
    localStorage.setItem(`cbt_session_${cbtModalUser.userId}`, JSON.stringify(payload))
    localStorage.setItem("cbt_session", JSON.stringify(payload))
    localStorage.setItem("cbt_confirmed", "true")

    notify(`✅ Sesi CBT untuk ${cbtModalUser.fullName || cbtModalUser.user?.name || "pendaftar"} berhasil ditetapkan!`)
    setCbtModalUser(null)
    fetchRegistrations()
  }

  const handleDeleteCbtSession = (userId: string) => {
    if (!confirm("Hapus penetapan sesi CBT pendaftar ini?")) return
    localStorage.removeItem(`cbt_session_${userId}`)
    localStorage.removeItem("cbt_session")
    localStorage.removeItem("cbt_confirmed")
    notify("ℹ️ Sesi CBT pendaftar telah dihapus.")
    setCbtModalUser(null)
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
                    <th className="px-4 py-3 text-left">Sesi CBT</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {registrations.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {r.fullName || r.user?.name || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">{r.user?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {r.programChoice1Faculty && r.programChoice1Major
                          ? `${r.programChoice1Faculty} / ${r.programChoice1Major}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[r.status?.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
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
                          {r.isValidated ? "✅ Valid" : "Belum"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {r.cbtSession ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-medium gap-1 flex items-center w-fit">
                            <Monitor className="h-3 w-3" /> Ditetapkan
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500 text-xs font-normal">
                            Belum Ada
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            title="Atur Sesi CBT"
                            onClick={() => openCbtModal(r)}
                            className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                          >
                            <Monitor className="h-4 w-4" />
                          </button>
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
                              className="p-1.5 rounded hover:bg-purple-50 text-purple-600 transition-colors"
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

      {/* CBT Session Assignment Modal */}
      {cbtModalUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl border space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" /> Penetapan Sesi Ujian CBT
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Atur tanggal, sesi, dan lokasi ujian untuk pendaftar ini.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setCbtModalUser(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="bg-muted/40 p-3 rounded-lg text-xs space-y-1">
              <div><span className="font-semibold text-gray-700">Nama Pendaftar:</span> {cbtModalUser.fullName || cbtModalUser.user?.name || "—"}</div>
              <div><span className="font-semibold text-gray-700">Email:</span> {cbtModalUser.user?.email || "—"}</div>
              <div><span className="font-semibold text-gray-700">Program:</span> {cbtModalUser.programChoice1Major || "—"}</div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="font-medium text-gray-700 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" /> Tanggal Ujian
                </label>
                <select
                  value={cbtForm.tanggal}
                  onChange={(e) => setCbtForm({ ...cbtForm, tanggal: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="Sabtu, 15 Januari 2026">Sabtu, 15 Januari 2026</option>
                  <option value="Minggu, 16 Januari 2026">Minggu, 16 Januari 2026</option>
                  <option value="Senin, 17 Januari 2026">Senin, 17 Januari 2026</option>
                  <option value="Selasa, 18 Januari 2026">Selasa, 18 Januari 2026</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-gray-700 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" /> Sesi & Waktu Ujian
                </label>
                <select
                  value={cbtForm.waktu}
                  onChange={(e) => setCbtForm({ ...cbtForm, waktu: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="Sesi 1 (Pukul 08:00 - 10:00 WIB)">Sesi 1 (Pukul 08:00 - 10:00 WIB)</option>
                  <option value="Sesi 2 (Pukul 10:00 - 12:00 WIB)">Sesi 2 (Pukul 10:00 - 12:00 WIB)</option>
                  <option value="Sesi 3 (Pukul 13:00 - 15:00 WIB)">Sesi 3 (Pukul 13:00 - 15:00 WIB)</option>
                  <option value="Sesi 4 (Pukul 15:30 - 17:30 WIB)">Sesi 4 (Pukul 15:30 - 17:30 WIB)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-gray-700 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" /> Lokasi / Ruang Laboratorium
                </label>
                <select
                  value={cbtForm.lokasi}
                  onChange={(e) => setCbtForm({ ...cbtForm, lokasi: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="Gedung Utama, Ruang 301 (Lab Komputer)">Gedung Utama, Ruang 301 (Lab Komputer)</option>
                  <option value="Gedung Utama, Ruang 302 (Lab Sistem Informasi)">Gedung Utama, Ruang 302 (Lab Sistem Informasi)</option>
                  <option value="Gedung B, Ruang 204 (Lab Multimedia)">Gedung B, Ruang 204 (Lab Multimedia)</option>
                  <option value="Gedung CBT Center, Lab Terpadu Lt. 2">Gedung CBT Center, Lab Terpadu Lt. 2</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              {cbtModalUser.cbtSession ? (
                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs flex items-center gap-1"
                  onClick={() => handleDeleteCbtSession(cbtModalUser.userId)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus Sesi
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCbtModalUser(null)}>
                  Batal
                </Button>
                <Button onClick={handleSaveCbtSession} className="bg-primary hover:bg-primary/90 text-white">
                  Tetapkan Sesi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <div><span className="text-muted-foreground">Nama:</span> {selected.fullName || selected.user?.name || "—"}</div>
              <div><span className="text-muted-foreground">Fakultas:</span> {selected.programChoice1Faculty || "—"}</div>
              <div><span className="text-muted-foreground">Program:</span> {selected.programChoice1Major || "—"}</div>
              <div><span className="text-muted-foreground">Status:</span> {selected.status}</div>
              <div><span className="text-muted-foreground">Dikunci:</span> {selected.isLocked ? "Ya" : "Tidak"}</div>
              <div><span className="text-muted-foreground">Data Pribadi Dikunci:</span> {selected.isPersonalDataLocked ? "Ya" : "Tidak"}</div>
              <div><span className="text-muted-foreground">Tervalidasi:</span> {selected.isValidated ? "Ya" : "Tidak"}</div>
              <div>
                <span className="text-muted-foreground">Sesi CBT:</span>{" "}
                {selected.cbtSession ? `${selected.cbtSession.tanggal} - ${selected.cbtSession.waktu}` : "Belum Ditetapkan"}
              </div>
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

