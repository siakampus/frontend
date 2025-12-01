"use client"

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react"

type Step = {
  id: number
  title: string
  start: string
  end: string
}

type Program = {
  id: number
  name: string
  active: boolean
  faculties: string[]
  levels: string[]
  startDate: string
  endDate: string
  steps: Step[]
}

const facultiesList = ["Fakultas Teknik", "Fakultas Ekonomi", "Fakultas Hukum"]
const levelList = ["Sarjana (S1)", "Pascasarjana (S2)", "Doktoral (S3)"]

// Template steps
const stepTemplates = [
  { id: 1, title: "Pemilihan Program Studi" },
  { id: 2, title: "Upload Dokumen" },
  { id: 3, title: "Penguncian Data" },
  { id: 4, title: "Buat Tagihan (Billing)" },
  { id: 5, title: "Pembayaran Pendaftaran" },
  { id: 6, title: "Cetak Bukti Peserta" },
  { id: 7, title: "Cetak Kartu Ujian" },
]

export default function AdminProgramAddPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const programId = id || "new"

  const [program, setProgram] = useState<Program>({
    id: Number(programId),
    name: programId === "new" ? "Program Baru" : "Sarjana (S1) 2025",
    active: true,
    faculties: ["Fakultas Teknik"],
    levels: ["Sarjana (S1)"],
    startDate: "2025-07-01",
    endDate: "2025-08-15",
    steps: [],
  })

  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Steps yg belum dipilih (tidak tampil di modal)
  const availableSteps = stepTemplates.filter(
    t => !program.steps.some(s => s.title === t.title)
  )

  const toggleCheckbox = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const addSteps = () => {
    const selectedSteps = availableSteps
      .filter(s => selectedIds.includes(s.id))
      .map(s => ({
        id: Date.now() + Math.random(),
        title: s.title,
        start: "",
        end: "",
      }))

    setProgram(prev => ({
      ...prev,
      steps: [...prev.steps, ...selectedSteps],
    }))

    setSelectedIds([])
    setOpen(false)
  }

  const removeStep = (id: number) => {
    setProgram(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== id)
    }))
  }

  const handleSave = () => {
    alert("Program berhasil disimpan!")
    navigate("/admin/programs")
  }

  return (
    <div className="space-y-6 mt-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/programs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold text-xl">
            {programId === "new" ? "Tambah Program Baru" : program.name}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={program.active}
            onCheckedChange={(v) => setProgram({ ...program, active: v })}
          />
          <span className="text-sm">{program.active ? "Aktif" : "Nonaktif"}</span>
        </div>
      </div>

      {/* Info Program */}
      <Card className="p-5 space-y-5">
        <div>
          <label className="text-sm font-medium">Nama Program</label>
          <Input
            value={program.name}
            onChange={(e) => setProgram({ ...program, name: e.target.value })}
          />
        </div>

        {/* Fakultas */}
        <div>
          <h4 className="text-sm font-medium mb-2">Fakultas</h4>
          <div className="flex flex-wrap gap-2">
            {facultiesList.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={program.faculties.includes(f) ? "default" : "outline"}
                onClick={() =>
                  setProgram(prev => ({
                    ...prev,
                    faculties: prev.faculties.includes(f)
                      ? prev.faculties.filter(x => x !== f)
                      : [...prev.faculties, f]
                  }))
                }
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Jenjang */}
        <div>
          <h4 className="text-sm font-medium mb-2">Jenjang</h4>
          <div className="flex flex-wrap gap-2">
            {levelList.map((lvl) => (
              <Button
                key={lvl}
                size="sm"
                variant={program.levels.includes(lvl) ? "default" : "outline"}
                onClick={() =>
                  setProgram(prev => ({
                    ...prev,
                    levels: prev.levels.includes(lvl)
                      ? prev.levels.filter(x => x !== lvl)
                      : [...prev.levels, lvl]
                  }))
                }
              >
                {lvl}
              </Button>
            ))}
          </div>
        </div>

        {/* Tanggal Program */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Tanggal Mulai</label>
            <Input
              type="date"
              value={program.startDate}
              onChange={(e) =>
                setProgram({ ...program, startDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Tanggal Berakhir</label>
            <Input
              type="date"
              value={program.endDate}
              onChange={(e) =>
                setProgram({ ...program, endDate: e.target.value })
              }
            />
          </div>
        </div>
      </Card>

      {/* Step Section */}
      <Card className="p-5 space-y-5">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-lg">Tahapan Pendaftaran</h4>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Tambah Step
          </Button>
        </div>

        {/* MODAL DIALOG */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pilih Step</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 mt-3">
              {availableSteps.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Semua step sudah ditambahkan.
                </div>
              )}

              {availableSteps.map(step => (
                <div key={step.id} className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedIds.includes(step.id)}
                    onCheckedChange={() => toggleCheckbox(step.id)}
                  />
                  <span>{step.title}</span>
                </div>
              ))}
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button onClick={addSteps}>Tambah</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* LIST STEP TERPILIH */}
        {program.steps.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Belum ada step yang ditambahkan.
          </div>
        )}

        {program.steps.map((step, index) => (
          <div
            key={step.id}
            className="border rounded-md p-4 bg-muted/20 space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="font-medium">
                Step {index + 1}: {step.title}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeStep(step.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>

            {/* Date fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Tanggal Mulai</label>
                <Input
                  type="date"
                  value={step.start}
                  onChange={(e) =>
                    setProgram(prev => ({
                      ...prev,
                      steps: prev.steps.map(s =>
                        s.id === step.id ? { ...s, start: e.target.value } : s
                      )
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Tanggal Berakhir</label>
                <Input
                  type="date"
                  value={step.end}
                  onChange={(e) =>
                    setProgram(prev => ({
                      ...prev,
                      steps: prev.steps.map(s =>
                        s.id === step.id ? { ...s, end: e.target.value } : s
                      )
                    }))
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Footer */}
      <div className="flex justify-end pt-4 border-t gap-2">
        <Button variant="outline" onClick={() => navigate("/admin/programs")}>
          Batal
        </Button>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" /> Simpan Program
        </Button>
      </div>

    </div>
  )
}