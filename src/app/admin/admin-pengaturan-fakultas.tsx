"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Trash2,
  X,
  Building,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

type ProgramStudy = { id: number; name: string }
type Level = { id: number; name: string; programs: ProgramStudy[] }
type Faculty = { id: number; name: string; levels: Level[] }

export default function PengaturanFakultas() {
  const [faculties, setFaculties] = useState<Faculty[]>([
    {
      id: 1,
      name: "Fakultas Teknik",
      levels: [
        {
          id: 11,
          name: "Sarjana (S1)",
          programs: [
            { id: 111, name: "Informatika" },
            { id: 112, name: "Sistem Informasi" },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Fakultas Ekonomi dan Bisnis",
      levels: [
        {
          id: 21,
          name: "Sarjana (S1)",
          programs: [
            { id: 211, name: "Manajemen" },
            { id: 212, name: "Akuntansi" },
          ],
        },
      ],
    },
  ])

  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(
    null
  )
  const selected = faculties.find((f) => f.id === selectedFacultyId) || null
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [expandedLevels, setExpandedLevels] = useState<number[]>([])
  const [editFacultyName, setEditFacultyName] = useState("")

  const nextId = () => Date.now() + Math.floor(Math.random() * 1000)

  // open drawer (for edit or new)
  const openDrawer = (faculty?: Faculty) => {
    if (faculty) {
      setSelectedFacultyId(faculty.id)
      setEditFacultyName(faculty.name)
    } else {
      // create new faculty first
      const newFaculty: Faculty = { id: nextId(), name: "Fakultas Baru", levels: [] }
      setFaculties((prev) => [...prev, newFaculty])
      setSelectedFacultyId(newFaculty.id)
      setEditFacultyName(newFaculty.name)
    }
    setDrawerOpen(true)
    setExpandedLevels([])
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setTimeout(() => setSelectedFacultyId(null), 200)
  }

  const handleSaveFaculty = () => {
    if (!selectedFacultyId) return
    setFaculties((prev) =>
      prev.map((f) =>
        f.id === selectedFacultyId ? { ...f, name: editFacultyName } : f
      )
    )
    closeDrawer()
  }

  const handleDeleteFaculty = (id: number) => {
    if (!confirm("Yakin ingin menghapus fakultas ini?")) return
    setFaculties((prev) => prev.filter((f) => f.id !== id))
    if (selectedFacultyId === id) closeDrawer()
  }

  const handleAddLevel = (facultyId: number) => {
    const newLevel: Level = { id: nextId(), name: "Jenjang Baru", programs: [] }
    setFaculties((prev) =>
      prev.map((f) =>
        f.id === facultyId ? { ...f, levels: [...f.levels, newLevel] } : f
      )
    )
    setExpandedLevels((prev) => [...prev, newLevel.id])
  }

  const handleRemoveLevel = (facultyId: number, levelId: number) => {
    if (!confirm("Hapus jenjang ini?")) return
    setFaculties((prev) =>
      prev.map((f) =>
        f.id === facultyId
          ? { ...f, levels: f.levels.filter((l) => l.id !== levelId) }
          : f
      )
    )
    setExpandedLevels((prev) => prev.filter((id) => id !== levelId))
  }

  const handleAddProgram = (facultyId: number, levelId: number) => {
    const newProgram: ProgramStudy = { id: nextId(), name: "Program Baru" }
    setFaculties((prev) =>
      prev.map((f) =>
        f.id === facultyId
          ? {
              ...f,
              levels: f.levels.map((l) =>
                l.id === levelId
                  ? { ...l, programs: [...l.programs, newProgram] }
                  : l
              ),
            }
          : f
      )
    )
  }

  const handleProgramNameChange = (
    facultyId: number,
    levelId: number,
    programId: number,
    value: string
  ) => {
    setFaculties((prev) =>
      prev.map((f) =>
        f.id === facultyId
          ? {
              ...f,
              levels: f.levels.map((l) =>
                l.id === levelId
                  ? {
                      ...l,
                      programs: l.programs.map((p) =>
                        p.id === programId ? { ...p, name: value } : p
                      ),
                    }
                  : l
              ),
            }
          : f
      )
    )
  }

  const handleRemoveProgram = (
    facultyId: number,
    levelId: number,
    programId: number
  ) => {
    setFaculties((prev) =>
      prev.map((f) =>
        f.id === facultyId
          ? {
              ...f,
              levels: f.levels.map((l) =>
                l.id === levelId
                  ? {
                      ...l,
                      programs: l.programs.filter((p) => p.id !== programId),
                    }
                  : l
              ),
            }
          : f
      )
    )
  }

  const toggleLevel = (levelId: number) => {
    setExpandedLevels((prev) =>
      prev.includes(levelId)
        ? prev.filter((i) => i !== levelId)
        : [...prev, levelId]
    )
  }

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : ""
  }, [drawerOpen])

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-xl flex items-center gap-2">
            <Building className="h-5 w-5" /> Daftar Fakultas
          </h2>
          <Button onClick={() => openDrawer()} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Tambah Fakultas
          </Button>
        </div>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b bg-muted text-left text-muted-foreground">
              <th className="p-3 text-left font-semibold">Nama Fakultas</th>
              <th className="p-3 text-left font-semibold">Jumlah Jenjang</th>
              <th className="p-3 text-left font-semibold">Jumlah Prodi</th>
            </tr>
          </thead>
          <tbody>
            {faculties.map((f) => {
              const totalPrograms = f.levels.reduce(
                (sum, l) => sum + l.programs.length,
                0
              )
              return (
                <tr
                  key={f.id}
                  className="border-b hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => openDrawer(f)}
                >
                  <td className="p-3 font-medium">{f.name}</td>
                  <td className="p-3">{f.levels.length}</td>
                  <td className="p-3">{totalPrograms}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {/* Drawer */}
      {selected && (
        <>
          <div
            className={`fixed h-screen inset-0 bg-black/40 z-40 transition-opacity duration-200 ${
              drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={closeDrawer}
          />

          <div
            className={`fixed right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-200 ${
              drawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <div className="text-sm text-muted-foreground">Detail Fakultas</div>
                <h3 className="font-bold text-lg">{editFacultyName}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={closeDrawer}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-6">
              {/* Nama Fakultas */}
              <div>
                <div className="text-xs text-muted-foreground mb-1">NAMA FAKULTAS</div>
                <Input
                  value={editFacultyName}
                  onChange={(e) => setEditFacultyName(e.target.value)}
                />
              </div>

              {/* Jenjang Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-muted-foreground">JENJANG</div>
                    <div className="font-medium text-sm">
                      Daftar jenjang & program studi
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddLevel(selected.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Tambah Jenjang
                  </Button>
                </div>

                {selected.levels.length === 0 && (
                  <div className="text-sm text-muted-foreground border rounded-md p-3">
                    Belum ada jenjang.
                  </div>
                )}

                {selected.levels.map((lvl) => {
                  const expanded = expandedLevels.includes(lvl.id)
                  return (
                    <div
                      key={lvl.id}
                      className="border rounded-md bg-muted/10 mb-3"
                    >
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer"
                        onClick={() => toggleLevel(lvl.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-primary rounded-full" />
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Jenjang
                            </div>
                            <div className="font-medium">{lvl.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveLevel(selected.id, lvl.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                          {expanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>

                      {expanded && (
                        <div className="p-4 border-t space-y-4">
                          <Input
                            value={lvl.name}
                            onChange={(e) =>
                              setFaculties((prev) =>
                                prev.map((f) =>
                                  f.id === selected.id
                                    ? {
                                        ...f,
                                        levels: f.levels.map((l) =>
                                          l.id === lvl.id
                                            ? { ...l, name: e.target.value }
                                            : l
                                        ),
                                      }
                                    : f
                                )
                              )
                            }
                          />

                          <div>
                            <div className="flex justify-between mb-2">
                              <div className="text-xs text-muted-foreground">
                                PROGRAM STUDI
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleAddProgram(selected.id, lvl.id)
                                }
                              >
                                <Plus className="h-4 w-4 mr-1" /> Tambah Prodi
                              </Button>
                            </div>

                            {lvl.programs.length === 0 && (
                              <div className="text-sm text-muted-foreground">
                                Belum ada prodi.
                              </div>
                            )}

                            {lvl.programs.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center gap-2 mb-2"
                              >
                                <Input
                                  value={p.name}
                                  onChange={(e) =>
                                    handleProgramNameChange(
                                      selected.id,
                                      lvl.id,
                                      p.id,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    handleRemoveProgram(
                                      selected.id,
                                      lvl.id,
                                      p.id
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={closeDrawer}>
                Batal
              </Button>
              <Button onClick={handleSaveFaculty}>Simpan</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}