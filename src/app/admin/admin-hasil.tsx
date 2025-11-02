"use client"

import { useState } from "react"
import { AppLayout } from "@/components/ui/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCcw,
  Send,
  FileText,
} from "lucide-react"

// 🧩 Sidebar Items
const adminSidebarItems = [
  { to: "/admin/settings", label: "Pengaturan Platform" },
  { to: "/admin/pendaftaran", label: "Data Pendaftaran" },
  { to: "/admin/upload", label: "Upload Data" },
  { to: "/admin/feedback", label: "Feedback Pendaftar" },
  { to: "/admin/hasil", label: "Hasil Pendaftaran" },
]

// 🧩 Types
type ResultStatus = "lulus" | "tidak_lulus" | "cadangan" | "belum_ditetapkan"

type Applicant = {
  id: number
  name: string
  email: string
  program: string
  statusPerStep: Record<string, string>
  result: ResultStatus
  note: string
}

// 🧩 Dummy Data
const dummyApplicants: Applicant[] = [
  {
    id: 1,
    name: "Hassan Aldhi",
    email: "hassan@example.com",
    program: "Sarjana Informatika",
    statusPerStep: {
      "Data Pribadi": "Disetujui",
      "Program Studi": "Disetujui",
      "Dokumen": "Perlu Revisi",
      "Konfirmasi": "Selesai",
    },
    result: "belum_ditetapkan",
    note: "",
  },
  {
    id: 2,
    name: "Sumbuludun",
    email: "sumbul@example.com",
    program: "Magister Manajemen",
    statusPerStep: {
      "Data Pribadi": "Disetujui",
      "Program Studi": "Disetujui",
      "Dokumen": "Disetujui",
      "Konfirmasi": "Selesai",
    },
    result: "lulus",
    note: "Selamat, Anda diterima di Program Magister Manajemen.",
  },
]

// 🧩 Helper
const resultLabels: Record<ResultStatus, string> = {
  lulus: "Lulus",
  tidak_lulus: "Tidak Lulus",
  cadangan: "Cadangan",
  belum_ditetapkan: "Belum Ditetapkan",
}

const resultColors: Record<ResultStatus, string> = {
  lulus: "bg-green-100 text-green-700",
  tidak_lulus: "bg-red-100 text-red-700",
  cadangan: "bg-yellow-100 text-yellow-700",
  belum_ditetapkan: "bg-gray-100 text-gray-600",
}

// 🧩 Component
export default function AdminResultsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>(dummyApplicants)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Applicant | null>(null)
  const [editedResult, setEditedResult] =
    useState<ResultStatus>("belum_ditetapkan")
  const [editedNote, setEditedNote] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [confirmChecked, setConfirmChecked] = useState(false)

  const filtered = applicants.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.program.toLowerCase().includes(search.toLowerCase())
  )

  const handleSaveResult = () => {
    if (!selected) return
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === selected.id
          ? { ...a, result: editedResult, note: editedNote }
          : a
      )
    )
    alert(`✅ Hasil untuk ${selected.name} berhasil disimpan.`)
    setSelected(null)
  }

  const handlePublish = () => {
    if (!confirmChecked) {
      alert("⚠️ Anda harus mencentang konfirmasi terlebih dahulu.")
      return
    }

    if (
      confirm(
        "Apakah Anda yakin ingin mempublikasikan hasil pendaftaran? Semua data akan terkunci dan tidak bisa diubah lagi."
      )
    ) {
      setIsPublished(true)
      alert("🎉 Hasil pendaftaran berhasil dipublikasikan!")
    }
  }

  return (
    <AppLayout
      sidebarItems={adminSidebarItems}
      title="Hasil Pendaftaran"
      subtitle="Tentukan dan publikasikan hasil akhir setiap pendaftar"
    >
      <Card className="p-6 shadow-sm border rounded-lg space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama, email, atau program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => alert("🔄 Data di-refresh (dummy only).")}
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="p-3 font-semibold">Nama</th>
                <th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold">Program</th>
                <th className="p-3 font-semibold">Status Akhir</th>
                <th className="p-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="border-b hover:bg-gray-50 transition text-sm"
                >
                  <td className="p-3 font-medium">{a.name}</td>
                  <td className="p-3">{a.email}</td>
                  <td className="p-3">{a.program}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${resultColors[a.result]}`}
                    >
                      {resultLabels[a.result]}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => {
                        setSelected(a)
                        setEditedResult(a.result)
                        setEditedNote(a.note)
                      }}
                      disabled={isPublished}
                    >
                      <Eye className="h-4 w-4" /> {isPublished ? "Terkunci" : "Tentukan Hasil"}
                    </Button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-muted-foreground"
                  >
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section Publikasi */}
      <Card className="p-6 mt-6 border rounded-lg shadow-sm bg-muted/30">
        <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" /> Publikasikan Hasil Pendaftaran
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Setelah hasil dipublikasikan, data akan <strong>terkunci permanen</strong> dan tidak dapat diubah lagi.
        </p>

        {isPublished ? (
          <div className="flex items-center gap-2 text-green-700 font-medium">
            <CheckCircle className="h-5 w-5" /> Hasil telah dipublikasikan.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <input
                id="confirm-publish"
                type="checkbox"
                className="w-4 h-4"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
              />
              <label htmlFor="confirm-publish" className="text-sm">
                Saya yakin semua data hasil sudah benar dan siap dipublikasikan.
              </label>
            </div>

            <Button
              onClick={handlePublish}
              disabled={!confirmChecked}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" /> Publikasikan Sekarang
            </Button>
          </>
        )}
      </Card>

      {/* Modal Edit Hasil */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl border p-6 space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="font-bold text-lg">
                Hasil Akhir — {selected.name}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Program</p>
                <p className="font-medium">{selected.program}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{selected.email}</p>
              </div>
            </div>

            <div className="border rounded-md p-4 bg-muted/20">
              <h4 className="font-semibold mb-2 flex items-center gap-1">
                <FileText className="h-4 w-4" /> Status per Step
              </h4>
              <ul className="text-sm space-y-1">
                {Object.entries(selected.statusPerStep).map(([key, val]) => (
                  <li key={key} className="flex justify-between">
                    <span>{key}</span>
                    <span className="font-medium">{val}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Status Akhir</label>
              <select
                className="border rounded-md w-full h-9 px-2 text-sm"
                value={editedResult}
                onChange={(e) => setEditedResult(e.target.value as ResultStatus)}
              >
                <option value="lulus">Lulus</option>
                <option value="tidak_lulus">Tidak Lulus</option>
                <option value="cadangan">Cadangan</option>
                <option value="belum_ditetapkan">Belum Ditetapkan</option>
              </select>

              <div>
                <label className="text-sm font-medium">Catatan</label>
                <Textarea
                  placeholder="Tuliskan pesan atau alasan hasil..."
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Batal
                </Button>
                <Button
                  onClick={handleSaveResult}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" /> Simpan Hasil
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}