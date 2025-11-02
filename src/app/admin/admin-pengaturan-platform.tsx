"use client"

import { useState } from "react"
import { AppLayout } from "@/components/ui/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Layers,
  CalendarDays,
  Save,
  Plus,
  Trash2,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

// Sidebar reusable
const adminSidebarItems = [
  { to: "/admin/settings", label: "Pengaturan Platform" },
  { to: "/admin/pendaftaran", label: "Data Pendaftaran" },
  { to: "/admin/upload", label: "Upload Data" },
  { to: "/admin/feedback", label: "Feedback Pendaftar" },
  { to: "/admin/hasil", label: "Hasil Pendaftaran" },
]

// 🧩 Types
type ProgramStudy = {
  name: string
  faculty: string
  quota: number
}

type LevelSetting = {
  id: number
  name: string
  active: boolean
  startDate: string
  endDate: string
  programs: ProgramStudy[]
}

const defaultLevels: LevelSetting[] = [
  {
    id: 1,
    name: "Sarjana (S1)",
    active: true,
    startDate: "2025-07-01",
    endDate: "2025-08-15",
    programs: [
      { name: "Informatika", faculty: "Teknik", quota: 150 },
      { name: "Manajemen", faculty: "Ekonomi & Bisnis", quota: 100 },
      { name: "Hukum", faculty: "Hukum", quota: 50 },
    ],
  },
  {
    id: 2,
    name: "Pascasarjana (S2)",
    active: false,
    startDate: "",
    endDate: "",
    programs: [
      { name: "Magister Manajemen", faculty: "Ekonomi", quota: 40 },
      { name: "Magister Akuntansi", faculty: "Ekonomi", quota: 30 },
    ],
  },
]

export default function AdminSettingsPage() {
  const [levels, setLevels] = useState<LevelSetting[]>(defaultLevels)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const handleAddLevel = () => {
    const newLevel: LevelSetting = {
      id: Date.now(),
      name: "Jenjang Baru",
      active: false,
      startDate: "",
      endDate: "",
      programs: [],
    }
    setLevels([...levels, newLevel])
  }

  const handleRemoveLevel = (id: number) => {
    if (confirm("Yakin ingin menghapus jenjang ini?")) {
      setLevels(levels.filter((l) => l.id !== id))
    }
  }

  const handleAddProgram = (levelId: number) => {
    setLevels((prev) =>
      prev.map((l) =>
        l.id === levelId
          ? {
              ...l,
              programs: [
                ...l.programs,
                { name: "Program Baru", faculty: "Fakultas", quota: 0 },
              ],
            }
          : l
      )
    )
  }

  const handleProgramChange = (
    levelId: number,
    index: number,
    field: keyof ProgramStudy,
    value: string | number
  ) => {
    setLevels((prev) =>
      prev.map((l) =>
        l.id === levelId
          ? {
              ...l,
              programs: l.programs.map((p, i) =>
                i === index ? { ...p, [field]: value } : p
              ),
            }
          : l
      )
    )
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      alert("✅ Pengaturan jenjang berhasil disimpan!")
      setSaving(false)
    }, 1000)
  }

  return (
    <AppLayout
      sidebarItems={adminSidebarItems}
      title="Pengaturan Platform"
      subtitle="Kelola jenjang, jadwal, dan program studi pendaftaran"
    >
      <Card className="p-6 shadow-sm border rounded-lg space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" /> Jenjang Pendaftaran
          </h2>
          <Button size="sm" onClick={handleAddLevel} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Tambah Jenjang
          </Button>
        </div>

        <div className="space-y-4">
          {levels.map((level) => (
            <div key={level.id} className="border rounded-md p-4 bg-muted/30">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="font-bold">{level.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {level.active ? "Aktif" : "Nonaktif"} •{" "}
                    {level.startDate && level.endDate
                      ? `${level.startDate} s/d ${level.endDate}`
                      : "Belum dijadwalkan"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      setExpanded(expanded === level.id ? null : level.id)
                    }
                  >
                    {expanded === level.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-red-600 border-red-300"
                    onClick={() => handleRemoveLevel(level.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {expanded === level.id && (
                <div className="mt-4 space-y-5 border-t pt-4">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={level.active}
                        onCheckedChange={(val) =>
                          setLevels((prev) =>
                            prev.map((l) =>
                              l.id === level.id ? { ...l, active: val } : l
                            )
                          )
                        }
                      />
                      <span className="text-sm">
                        {level.active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </div>

                  {/* Jadwal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Tanggal Mulai</label>
                      <Input
                        type="date"
                        value={level.startDate}
                        onChange={(e) =>
                          setLevels((prev) =>
                            prev.map((l) =>
                              l.id === level.id
                                ? { ...l, startDate: e.target.value }
                                : l
                            )
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tanggal Berakhir</label>
                      <Input
                        type="date"
                        value={level.endDate}
                        onChange={(e) =>
                          setLevels((prev) =>
                            prev.map((l) =>
                              l.id === level.id
                                ? { ...l, endDate: e.target.value }
                                : l
                            )
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Program Studi */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Program Studi</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddProgram(level.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Tambah Program
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {level.programs.map((p, i) => (
                        <div
                          key={i}
                          className="flex flex-col md:flex-row md:items-center justify-between gap-3 border rounded-md p-3 bg-white"
                        >
                          <div className="flex-1">
                            <Input
                              value={p.name}
                              onChange={(e) =>
                                handleProgramChange(level.id, i, "name", e.target.value)
                              }
                              placeholder="Nama Program Studi"
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              value={p.faculty}
                              onChange={(e) =>
                                handleProgramChange(level.id, i, "faculty", e.target.value)
                              }
                              placeholder="Fakultas"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={p.quota}
                              onChange={(e) =>
                                handleProgramChange(
                                  level.id,
                                  i,
                                  "quota",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-20 text-right"
                            />
                            <span className="text-sm text-muted-foreground">org</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="h-4 w-4" /> Reset
          </Button>
          <Button
            onClick={handleSave}
            className="flex items-center gap-2"
            disabled={saving}
          >
            <Save className="h-4 w-4" />{" "}
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </div>
      </Card>
    </AppLayout>
  )
}