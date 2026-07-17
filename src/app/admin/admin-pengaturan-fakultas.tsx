"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  Building2,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  Users,
} from "lucide-react"
import { jurusanApi, adminLecturersApi, adminUsersApi } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

type Major = {
  id: number
  name: string
  facultyId: number
}

type Faculty = {
  id: number
  name: string
  majors: Major[]
}

type Lecturer = {
  id: string
  fullName?: string
  name?: string
  email?: string
  nip?: string
  faculty?: string
}

type User = {
  id: string
  email: string
  name?: string
  role: string
}

type ApiResponse<T> = { ok: boolean; status: number; data: T }

// ─────────────────────────────────────────────────────────
// Faculty Details Component (Mahasiswa & Dosen)
// ─────────────────────────────────────────────────────────

function FacultyDetails({ faculty, children }: { faculty: Faculty; children: React.ReactNode }) {
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [lecRes, stuRes] = await Promise.all([
          adminLecturersApi.list({ faculty: faculty.name }),
          adminUsersApi.list({ role: "student", facultyId: faculty.id }),
        ])

        if (lecRes.ok && lecRes.data) {
          const lData = lecRes.data as { data?: Lecturer[]; lecturers?: Lecturer[]; users?: Lecturer[] }
          setLecturers(lData.data || lData.lecturers || lData.users || (lecRes.data as unknown as Lecturer[]) || [])
        }

        if (stuRes.ok && stuRes.data) {
          const sData = stuRes.data as { data?: User[]; users?: User[] }
          const allStudents = sData.data || sData.users || (stuRes.data as unknown as User[]) || []
          setStudents(allStudents) 
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [faculty.name])

  return (
    <div className="border-t bg-muted/20 px-4 pb-4">
      <Tabs defaultValue="prodi" className="w-full mt-4">
        <TabsList className="mb-4 bg-muted/50 border shadow-sm">
          <TabsTrigger value="prodi" className="gap-2 text-xs">
            <BookOpen className="h-3.5 w-3.5" /> Program Studi
          </TabsTrigger>
          <TabsTrigger value="dosen" className="gap-2 text-xs">
            <GraduationCap className="h-3.5 w-3.5" /> Dosen
          </TabsTrigger>
          <TabsTrigger value="mahasiswa" className="gap-2 text-xs">
            <Users className="h-3.5 w-3.5" /> Mahasiswa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prodi" className="mt-0 outline-none">
          {children}
        </TabsContent>

        <TabsContent value="dosen" className="mt-0 outline-none">
          <Card className="border shadow-sm bg-background">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat data dosen...
              </div>
            ) : lecturers.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground italic bg-muted/10">
                Belum ada data dosen untuk fakultas ini.
              </div>
            ) : (
              <div className="divide-y max-h-[350px] overflow-y-auto">
                {lecturers.map((l) => (
                  <div key={l.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/30 transition-colors gap-2">
                    <div>
                      <div className="text-sm font-semibold text-primary">{l.fullName || l.name || "—"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] py-0 h-4">NIP: {l.nip || "—"}</Badge>
                        <span>{l.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="mahasiswa" className="mt-0 outline-none">
          <Card className="border shadow-sm bg-background">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat data mahasiswa...
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground italic bg-muted/10">
                Belum ada data mahasiswa ditemukan.
              </div>
            ) : (
              <div className="divide-y max-h-[350px] overflow-y-auto">
                {students.map((s) => (
                  <div key={s.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/30 transition-colors gap-2">
                    <div>
                      <div className="text-sm font-semibold text-primary">{s.name || "—"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="p-2 text-center text-[10px] text-muted-foreground bg-muted/20 border-t">
              *Catatan: Menampilkan data mahasiswa dari fakultas terkait.
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────

export default function PengaturanFakultas() {
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Expanded faculty IDs
  const [expandedFaculty, setExpandedFaculty] = useState<Set<number>>(new Set())

  // Edit states
  const [editingFacultyId, setEditingFacultyId] = useState<number | null>(null)
  const [editFacultyName, setEditFacultyName] = useState("")
  const [editingMajorId, setEditingMajorId] = useState<number | null>(null)
  const [editMajorName, setEditMajorName] = useState("")

  // New faculty
  const [newFacultyName, setNewFacultyName] = useState("")
  const [addingFaculty, setAddingFaculty] = useState(false)

  // New major per faculty
  const [addingMajorForFaculty, setAddingMajorForFaculty] = useState<number | null>(null)
  const [newMajorName, setNewMajorName] = useState("")

  // Loading states for mutations
  const [savingId, setSavingId] = useState<string | null>(null)

  // ─────────────────────────────────────────────
  // Fetch data
  // ─────────────────────────────────────────────

  const fetchFaculties = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await jurusanApi.listFaculties() as ApiResponse<{ data?: Faculty[]; [key: string]: unknown }>
      if (res.ok) {
        const data = res.data
        const list: Faculty[] = Array.isArray(data)
          ? data
          : Array.isArray((data as { data?: Faculty[] }).data)
          ? (data as { data: Faculty[] }).data
          : []
        setFaculties(list)
      } else {
        setError("Gagal memuat data fakultas. Periksa koneksi ke server.")
      }
    } catch {
      setError("Terjadi kesalahan saat memuat data.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFaculties()
  }, [fetchFaculties])

  // ─────────────────────────────────────────────
  // Faculty: Add
  // ─────────────────────────────────────────────

  const handleAddFaculty = async () => {
    const name = newFacultyName.trim()
    if (!name) return
    setSavingId("new-faculty")
    try {
      const res = await jurusanApi.createFaculty(name) as ApiResponse<{ data?: Faculty; [key: string]: unknown }>
      if (res.ok) {
        const created: Faculty = (res.data as { data?: Faculty })?.data ?? (res.data as Faculty)
        setFaculties((prev) => [...prev, { ...created, majors: created.majors ?? [] }])
        setNewFacultyName("")
        setAddingFaculty(false)
        setExpandedFaculty((prev) => new Set([...prev, created.id]))
      } else {
        alert("Gagal menambah fakultas.")
      }
    } finally {
      setSavingId(null)
    }
  }

  // ─────────────────────────────────────────────
  // Faculty: Edit
  // ─────────────────────────────────────────────

  const handleEditFaculty = async (id: number) => {
    const name = editFacultyName.trim()
    if (!name) return
    setSavingId(`faculty-${id}`)
    try {
      const res = await jurusanApi.updateFaculty(id, name) as ApiResponse<unknown>
      if (res.ok) {
        setFaculties((prev) =>
          prev.map((f) => (f.id === id ? { ...f, name } : f))
        )
        setEditingFacultyId(null)
      } else {
        alert("Gagal mengupdate nama fakultas.")
      }
    } finally {
      setSavingId(null)
    }
  }

  // ─────────────────────────────────────────────
  // Faculty: Delete
  // ─────────────────────────────────────────────

  const handleDeleteFaculty = async (id: number) => {
    const faculty = faculties.find((f) => f.id === id)
    if (!faculty) return
    if (faculty.majors.length > 0) {
      alert("Hapus semua program studi terlebih dahulu sebelum menghapus fakultas ini.")
      return
    }
    if (!confirm(`Hapus fakultas "${faculty.name}"?`)) return
    setSavingId(`del-faculty-${id}`)
    try {
      const res = await jurusanApi.deleteFaculty(id) as ApiResponse<unknown>
      if (res.ok) {
        setFaculties((prev) => prev.filter((f) => f.id !== id))
      } else {
        alert("Gagal menghapus fakultas. Pastikan tidak ada program studi yang terhubung.")
      }
    } finally {
      setSavingId(null)
    }
  }

  // ─────────────────────────────────────────────
  // Major: Add
  // ─────────────────────────────────────────────

  const handleAddMajor = async (facultyId: number) => {
    const name = newMajorName.trim()
    if (!name) return
    setSavingId(`new-major-${facultyId}`)
    try {
      const res = await jurusanApi.createMajor(name, facultyId) as ApiResponse<{ data?: Major; [key: string]: unknown }>
      if (res.ok) {
        const created: Major = (res.data as { data?: Major })?.data ?? (res.data as Major)
        setFaculties((prev) =>
          prev.map((f) =>
            f.id === facultyId
              ? { ...f, majors: [...f.majors, created] }
              : f
          )
        )
        setNewMajorName("")
        setAddingMajorForFaculty(null)
      } else {
        alert("Gagal menambah program studi.")
      }
    } finally {
      setSavingId(null)
    }
  }

  // ─────────────────────────────────────────────
  // Major: Edit
  // ─────────────────────────────────────────────

  const handleEditMajor = async (majorId: number, facultyId: number) => {
    const name = editMajorName.trim()
    if (!name) return
    setSavingId(`major-${majorId}`)
    try {
      const res = await jurusanApi.updateMajor(majorId, { name }) as ApiResponse<unknown>
      if (res.ok) {
        setFaculties((prev) =>
          prev.map((f) =>
            f.id === facultyId
              ? { ...f, majors: f.majors.map((m) => (m.id === majorId ? { ...m, name } : m)) }
              : f
          )
        )
        setEditingMajorId(null)
      } else {
        alert("Gagal mengupdate nama program studi.")
      }
    } finally {
      setSavingId(null)
    }
  }

  // ─────────────────────────────────────────────
  // Major: Delete
  // ─────────────────────────────────────────────

  const handleDeleteMajor = async (majorId: number, facultyId: number, majorName: string) => {
    if (!confirm(`Hapus program studi "${majorName}"?`)) return
    setSavingId(`del-major-${majorId}`)
    try {
      const res = await jurusanApi.deleteMajor(majorId) as ApiResponse<unknown>
      if (res.ok) {
        setFaculties((prev) =>
          prev.map((f) =>
            f.id === facultyId
              ? { ...f, majors: f.majors.filter((m) => m.id !== majorId) }
              : f
          )
        )
      } else {
        alert("Gagal menghapus program studi.")
      }
    } finally {
      setSavingId(null)
    }
  }

  // ─────────────────────────────────────────────
  // Toggle expand
  // ─────────────────────────────────────────────

  const toggleFaculty = (id: number) => {
    setExpandedFaculty((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Memuat data fakultas...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-4 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchFaculties} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Fakultas &amp; Program Studi</h2>
          <Badge variant="secondary" className="ml-1">{faculties.length} Fakultas</Badge>
        </div>
        <Button
          size="sm"
          onClick={() => { setAddingFaculty(true); setNewFacultyName("") }}
          className="gap-1.5"
          disabled={addingFaculty}
          id="btn-tambah-fakultas"
        >
          <Plus className="h-4 w-4" /> Tambah Fakultas
        </Button>
      </div>

      {/* Add Faculty Form */}
      {addingFaculty && (
        <Card className="p-4 border-dashed border-2 border-primary/40 bg-primary/5">
          <p className="text-sm font-medium mb-2 text-primary">Fakultas Baru</p>
          <div className="flex gap-2">
            <Input
              autoFocus
              placeholder="Nama Fakultas..."
              value={newFacultyName}
              onChange={(e) => setNewFacultyName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddFaculty(); if (e.key === "Escape") setAddingFaculty(false) }}
              id="input-nama-fakultas"
            />
            <Button
              size="sm"
              onClick={handleAddFaculty}
              disabled={!newFacultyName.trim() || savingId === "new-faculty"}
              id="btn-simpan-fakultas"
            >
              {savingId === "new-faculty" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAddingFaculty(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {faculties.length === 0 && !addingFaculty && (
        <Card className="p-12 text-center text-muted-foreground">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Belum ada data fakultas.</p>
          <p className="text-xs mt-1">Klik &ldquo;Tambah Fakultas&rdquo; untuk mulai.</p>
        </Card>
      )}

      {/* Faculty List */}
      {faculties.map((faculty) => {
        const isExpanded = expandedFaculty.has(faculty.id)
        const isEditingFaculty = editingFacultyId === faculty.id
        const isAddingMajor = addingMajorForFaculty === faculty.id

        return (
          <Card key={faculty.id} className="overflow-hidden">
            {/* Faculty Row */}
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/40 transition-colors select-none"
              onClick={() => !isEditingFaculty && toggleFaculty(faculty.id)}
            >
              <span className="text-muted-foreground flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>

              <Building2 className="h-4 w-4 text-primary flex-shrink-0" />

              {/* Faculty Name / Edit */}
              {isEditingFaculty ? (
                <div className="flex gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                  <Input
                    autoFocus
                    value={editFacultyName}
                    onChange={(e) => setEditFacultyName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleEditFaculty(faculty.id); if (e.key === "Escape") setEditingFacultyId(null) }}
                    className="h-8 text-sm"
                    id={`input-edit-faculty-${faculty.id}`}
                  />
                  <Button size="icon" className="h-8 w-8" onClick={() => handleEditFaculty(faculty.id)} disabled={savingId === `faculty-${faculty.id}`} id={`btn-save-faculty-${faculty.id}`}>
                    {savingId === `faculty-${faculty.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingFacultyId(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <span className="font-semibold text-sm flex-1">{faculty.name}</span>
              )}

              <Badge variant="outline" className="text-xs flex-shrink-0">
                {faculty.majors?.length ?? 0} Prodi
              </Badge>

              {/* Faculty Action Buttons */}
              {!isEditingFaculty && (
                <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => { setEditingFacultyId(faculty.id); setEditFacultyName(faculty.name) }}
                    id={`btn-edit-faculty-${faculty.id}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteFaculty(faculty.id)}
                    disabled={savingId === `del-faculty-${faculty.id}`}
                    id={`btn-delete-faculty-${faculty.id}`}
                  >
                    {savingId === `del-faculty-${faculty.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  </Button>
                </div>
              )}
            </div>

            {/* Majors Section */}
            {isExpanded && (
              <FacultyDetails faculty={faculty}>
                <div className="pt-2 space-y-1.5">
                  {/* Major rows */}
                  {(faculty.majors ?? []).map((major) => {
                    const isEditingMajor = editingMajorId === major.id
                    return (
                      <div
                        key={major.id}
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-background transition-colors group"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />

                        {isEditingMajor ? (
                          <div className="flex gap-2 flex-1">
                            <Input
                              autoFocus
                              value={editMajorName}
                              onChange={(e) => setEditMajorName(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") handleEditMajor(major.id, faculty.id); if (e.key === "Escape") setEditingMajorId(null) }}
                              className="h-7 text-xs"
                              id={`input-edit-major-${major.id}`}
                            />
                            <Button size="icon" className="h-7 w-7" onClick={() => handleEditMajor(major.id, faculty.id)} disabled={savingId === `major-${major.id}`} id={`btn-save-major-${major.id}`}>
                              {savingId === `major-${major.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingMajorId(null)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm flex-1">{major.name}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => { setEditingMajorId(major.id); setEditMajorName(major.name) }}
                                id={`btn-edit-major-${major.id}`}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteMajor(major.id, faculty.id, major.name)}
                                disabled={savingId === `del-major-${major.id}`}
                                id={`btn-delete-major-${major.id}`}
                              >
                                {savingId === `del-major-${major.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}

                  {/* Empty major state */}
                  {(faculty.majors ?? []).length === 0 && !isAddingMajor && (
                    <p className="text-xs text-muted-foreground px-3 py-2 italic">
                      Belum ada program studi di fakultas ini.
                    </p>
                  )}

                  {/* Add Major Form */}
                  {isAddingMajor ? (
                    <div className="flex gap-2 pt-1 px-1">
                      <BookOpen className="h-3.5 w-3.5 text-primary mt-2 flex-shrink-0" />
                      <Input
                        autoFocus
                        placeholder="Nama Program Studi..."
                        value={newMajorName}
                        onChange={(e) => setNewMajorName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleAddMajor(faculty.id); if (e.key === "Escape") { setAddingMajorForFaculty(null); setNewMajorName("") } }}
                        className="h-7 text-xs"
                        id={`input-new-major-${faculty.id}`}
                      />
                      <Button size="icon" className="h-7 w-7" onClick={() => handleAddMajor(faculty.id)} disabled={!newMajorName.trim() || savingId === `new-major-${faculty.id}`} id={`btn-save-new-major-${faculty.id}`}>
                        {savingId === `new-major-${faculty.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setAddingMajorForFaculty(null); setNewMajorName("") }}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-1 h-7"
                      onClick={() => { setAddingMajorForFaculty(faculty.id); setNewMajorName("") }}
                      id={`btn-tambah-prodi-${faculty.id}`}
                    >
                      <Plus className="h-3 w-3" /> Tambah Program Studi
                    </Button>
                  )}
                </div>
              </FacultyDetails>
            )}
          </Card>
        )
      })}
    </div>
  )
}
