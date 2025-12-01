"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  X,
  Save,
  RefreshCcw,
} from "lucide-react"
import { AppLayout } from "@/components/ui/app-layout"

// 🧩 Type definition
type Registration = {
  id: number | null
  name: string
  email: string
  program: string
  status: string
  registeredAt: string
}

// 🧩 Dummy data awal
const dummyRegistrations: Registration[] = [
  {
    id: 1,
    name: "Hassan Aldhi",
    email: "hassan@example.com",
    program: "Sarjana Informatika",
    status: "Menunggu",
    registeredAt: "2025-07-18",
  },
  {
    id: 2,
    name: "Sumbuludun",
    email: "sumbul@example.com",
    program: "Magister Manajemen",
    status: "Diterima",
    registeredAt: "2025-07-10",
  },
]

// 🧩 Sidebar Items (bisa reuse di semua halaman admin)
const adminSidebarItems = [
  { to: "/admin/settings", label: "Pengaturan Pendaftaran" },
  { to: "/admin/pendaftaran", label: "Data Pendaftaran" },
]

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] =
    useState<Registration[]>(dummyRegistrations)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Registration>>({
    id: null,
    name: "",
    email: "",
    program: "",
    status: "Menunggu",
  })

  // 🔍 Filter hasil pencarian
  const filtered = registrations.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.program.toLowerCase().includes(search.toLowerCase())
  )

  // 💾 Simpan (Tambah/Edit)
  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.program) {
      alert("Mohon lengkapi semua data!")
      return
    }

    const updated: Registration = {
      id: formData.id ?? Date.now(),
      name: formData.name!,
      email: formData.email!,
      program: formData.program!,
      status: formData.status || "Menunggu",
      registeredAt:
        formData.registeredAt ?? new Date().toISOString().split("T")[0],
    }

    if (formData.id) {
      // edit existing
      setRegistrations((prev) =>
        prev.map((r) => (r.id === formData.id ? updated : r))
      )
    } else {
      // add new
      setRegistrations((prev) => [...prev, updated])
    }

    // reset form
    setShowForm(false)
    setFormData({
      id: null,
      name: "",
      email: "",
      program: "",
      status: "Menunggu",
    })
  }

  // ✏️ Edit data
  const handleEdit = (entry: Registration) => {
    setFormData(entry)
    setShowForm(true)
  }

  // 🗑️ Hapus data
  const handleDelete = (id: number | null) => {
    if (id === null) return
    if (confirm("Yakin ingin menghapus pendaftaran ini?")) {
      setRegistrations((prev) => prev.filter((r) => r.id !== id))
    }
  }

  return (
    <AppLayout
      sidebarItems={adminSidebarItems}
      title="Data Pendaftaran"
      subtitle="Kelola daftar calon mahasiswa"
    >
      <Card className="p-6 shadow-sm border rounded-lg">
        {/* 🔧 Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama, email, atau program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Tambah
            </Button>
            <Button
              variant="outline"
              onClick={() => alert("🔄 Data di-refresh (dummy only).")}
              className="flex items-center gap-1"
            >
              <RefreshCcw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>

        {/* 🧾 Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="p-3 font-semibold">Nama</th>
                <th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold">Program</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Tanggal Daftar</th>
                <th className="p-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id ?? Math.random()}
                  className="border-b hover:bg-gray-50 transition text-sm"
                >
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{r.program}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        r.status === "Diterima"
                          ? "bg-green-100 text-green-700"
                          : r.status === "Ditolak"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">{r.registeredAt}</td>
                  <td className="p-3 text-right flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert(`👁️ Detail: ${r.name}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(r)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleDelete(r.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
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

      {/* 📋 FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="font-bold text-lg">
                {formData.id ? "Edit Data Pendaftar" : "Tambah Pendaftar Baru"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForm(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Nama Lengkap</label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Program Studi</label>
                <Input
                  value={formData.program || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, program: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  className="border rounded-md w-full h-9 px-2"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option>Menunggu</option>
                  <option>Diterima</option>
                  <option>Ditolak</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Batal
              </Button>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" /> Simpan
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}