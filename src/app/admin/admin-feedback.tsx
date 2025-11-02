"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Eye,
  Send,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCcw,
  FileText,
  User,
  FolderOpen,
  GraduationCap,
} from "lucide-react"
import { AppLayout } from "@/components/ui/app-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 🧩 Sidebar
const adminSidebarItems = [
  { to: "/admin/settings", label: "Pengaturan Platform" },
  { to: "/admin/pendaftaran", label: "Data Pendaftaran" },
  { to: "/admin/upload", label: "Upload Data" },
  { to: "/admin/feedback", label: "Feedback Pendaftar" },
  { to: "/admin/hasil", label: "Hasil Pendaftaran" },
]

// 🧩 Types
type StepFeedback = {
  step: "personal" | "program" | "documents" | "confirmation"
  status: "approved" | "needs_revision" | "pending"
  comment: string
}

type Applicant = {
  id: number
  name: string
  email: string
  program: string
  personalData: Record<string, string>
  programChoices: string[]
  uploadedDocs: { name: string; url: string }[]
  steps: StepFeedback[]
}

// 🧩 Dummy data
const dummyApplicants: Applicant[] = [
  {
    id: 1,
    name: "Hassan Aldhi",
    email: "hassan@example.com",
    program: "Sarjana Informatika",
    personalData: {
      "Nama Lengkap": "Hassan Aldhi",
      "NIK": "3204012401920001",
      "Tempat Lahir": "Sleman",
      "Tanggal Lahir": "22 Februari 2002",
    },
    programChoices: ["Informatika", "Sistem Informasi"],
    uploadedDocs: [
      { name: "KTP.pdf", url: "#" },
      { name: "Ijazah.jpg", url: "#" },
    ],
    steps: [
      { step: "personal", status: "approved", comment: "" },
      { step: "program", status: "approved", comment: "" },
      {
        step: "documents",
        status: "needs_revision",
        comment: "Ijazah tidak jelas, mohon upload ulang file yang lebih jelas.",
      },
      { step: "confirmation", status: "pending", comment: "" },
    ],
  },
  {
    id: 2,
    name: "Sumbuludun",
    email: "sumbul@example.com",
    program: "Magister Manajemen",
    personalData: {
      "Nama Lengkap": "Sumbuludun",
      "NIK": "3204100501950002",
      "Tempat Lahir": "Jakarta",
      "Tanggal Lahir": "5 Januari 1995",
    },
    programChoices: ["Manajemen", "Akuntansi"],
    uploadedDocs: [{ name: "KTP.pdf", url: "#" }],
    steps: [
      { step: "personal", status: "pending", comment: "" },
      { step: "program", status: "pending", comment: "" },
      { step: "documents", status: "pending", comment: "" },
      { step: "confirmation", status: "pending", comment: "" },
    ],
  },
]

// 🧩 Helper maps
const stepLabels: Record<StepFeedback["step"], string> = {
  personal: "Data Pribadi",
  program: "Program Studi",
  documents: "Dokumen",
  confirmation: "Konfirmasi",
}

const statusLabels: Record<StepFeedback["status"], string> = {
  approved: "Disetujui",
  needs_revision: "Perlu Revisi",
  pending: "Menunggu",
}

const statusIcons: Record<StepFeedback["status"], React.ReactNode> = {
  approved: <CheckCircle className="h-4 w-4 text-green-600" />,
  needs_revision: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
  pending: <Clock className="h-4 w-4 text-gray-500" />,
}

// 🧩 Main Component
export default function AdminFeedbackPage() {
  const [applicants, setApplicants] = useState<Applicant[]>(dummyApplicants)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Applicant | null>(null)
  const [activeStep, setActiveStep] = useState<StepFeedback["step"]>("personal")
  const [editedFeedback, setEditedFeedback] = useState<string>("")
  const [editedStatus, setEditedStatus] =
    useState<StepFeedback["status"]>("pending")

  const filtered = applicants.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.program.toLowerCase().includes(search.toLowerCase())
  )

  const handleSaveFeedback = () => {
    if (!selected) return
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === selected.id
          ? {
              ...a,
              steps: a.steps.map((s) =>
                s.step === activeStep
                  ? { ...s, comment: editedFeedback, status: editedStatus }
                  : s
              ),
            }
          : a
      )
    )
    alert(`✅ Feedback untuk ${stepLabels[activeStep]} berhasil disimpan!`)
    setSelected(null)
  }

  return (
    <AppLayout
      sidebarItems={adminSidebarItems}
      title="Feedback Pendaftar"
      subtitle="Periksa data dan beri masukan per-step untuk setiap pendaftar"
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
                <th className="p-3 font-semibold">Progress Review</th>
                <th className="p-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const reviewedCount = a.steps.filter(
                  (s) => s.status !== "pending"
                ).length
                return (
                  <tr
                    key={a.id}
                    className="border-b hover:bg-gray-50 transition text-sm"
                  >
                    <td className="p-3 font-medium">{a.name}</td>
                    <td className="p-3">{a.email}</td>
                    <td className="p-3">{a.program}</td>
                    <td className="p-3 text-gray-600">
                      {reviewedCount}/{a.steps.length} selesai
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelected(a)
                          setActiveStep("personal")
                          setEditedFeedback(
                            a.steps.find((s) => s.step === "personal")
                              ?.comment || ""
                          )
                          setEditedStatus(
                            a.steps.find((s) => s.step === "personal")
                              ?.status || "pending"
                          )
                        }}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" /> Review
                      </Button>
                    </td>
                  </tr>
                )
              })}

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

      {/* Modal per pendaftar */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl shadow-xl border p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="font-bold text-lg">
                Review Data — {selected.name}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelected(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <Tabs
              defaultValue="personal"
              value={activeStep}
              onValueChange={(v) => {
                setActiveStep(v as StepFeedback["step"])
                const data = selected.steps.find((s) => s.step === v)
                setEditedFeedback(data?.comment || "")
                setEditedStatus(data?.status || "pending")
              }}
            >
              <TabsList className="flex flex-wrap mb-4 bg-muted/30 p-1 rounded-md">
                {selected.steps.map((s) => (
                  <TabsTrigger key={s.step} value={s.step}>
                    <div className="flex items-center gap-1">
                      {statusIcons[s.status]}
                      {stepLabels[s.step]}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* === PERSONAL DATA === */}
              <TabsContent value="personal">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" /> Data Pribadi
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(selected.personalData).map(([key, val]) => (
                      <div key={key}>
                        <p className="text-muted-foreground">{key}</p>
                        <p className="font-medium">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* === PROGRAM === */}
              <TabsContent value="program">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <GraduationCap className="h-4 w-4" /> Pilihan Program Studi
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {selected.programChoices.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </TabsContent>

              {/* === DOCUMENTS === */}
              <TabsContent value="documents">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <FolderOpen className="h-4 w-4" /> Dokumen Terunggah
                </h3>
                <ul className="space-y-2">
                  {selected.uploadedDocs.map((doc) => (
                    <li
                      key={doc.name}
                      className="flex items-center justify-between border rounded-md p-2"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span>{doc.name}</span>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={doc.url} target="_blank">
                          Lihat
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              {/* === CONFIRMATION === */}
              <TabsContent value="confirmation">
                <p className="text-sm text-gray-600">
                  Langkah terakhir untuk validasi akhir pendaftar.
                </p>
              </TabsContent>
            </Tabs>

            {/* === FEEDBACK SECTION === */}
            <div className="space-y-3 border-t pt-3">
              <div>
                <label className="text-sm font-medium">Status Review</label>
                <select
                  className="border rounded-md w-full h-9 px-2 mt-1 text-sm"
                  value={editedStatus}
                  onChange={(e) =>
                    setEditedStatus(e.target.value as StepFeedback["status"])
                  }
                >
                  <option value="approved">Disetujui</option>
                  <option value="needs_revision">Perlu Revisi</option>
                  <option value="pending">Menunggu</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Catatan / Feedback
                </label>
                <Textarea
                  placeholder="Tuliskan catatan atau revisi yang perlu dilakukan..."
                  value={editedFeedback}
                  onChange={(e) => setEditedFeedback(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Batal
                </Button>
                <Button
                  onClick={handleSaveFeedback}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" /> Simpan Feedback
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}