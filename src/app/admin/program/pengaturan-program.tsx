"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, School } from "lucide-react"

type Program = {
  id: number
  name: string
  active: boolean
  startDate: string
  endDate: string
  pendaftar: number
}

export default function AdminProgramsPage() {
  const navigate = useNavigate()

  const [programs] = useState<Program[]>([
    {
      id: 1,
      name: "Sarjana (S1) 2025",
      active: true,
      startDate: "2025-07-01",
      endDate: "2025-08-15",
      pendaftar: 10,
    },
    {
      id: 2,
      name: "Pascasarjana (S2) 2025",
      active: false,
      startDate: "2025-09-01",
      endDate: "2025-10-10",
      pendaftar: 7,
    },
  ])

  const handleAddProgram = () => {
    navigate("/admin/programs/new")
  }

  const handleView = (id: number) => {
    navigate(`/admin/programs/${id}?view=preview`)
  }

  return (
    <div className="space-y-6 ">
      <Card className="p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-xl flex items-center gap-2">
            <School className="h-5 w-5" /> Program Pendaftaran
          </h2>
          <Button onClick={handleAddProgram} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Tambah Program
          </Button>
        </div>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b bg-muted text-left text-muted-foreground">
              <th className="p-3 font-semibold">Nama Program</th>
              <th className="p-3 font-semibold">Periode</th>
              <th className="p-3 font-semibold">Jumlah Pendaftar</th>
              <th className="p-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((p) => (
              <tr
                key={p.id}
                className="border-b hover:bg-gray-50 transition cursor-pointer"
                onClick={() => handleView(p.id)}
              >
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">
                  {p.startDate} – {p.endDate}
                </td>
                <td className="p-3">{p.pendaftar}</td>
                <td className="p-3">
                  {p.active ? (
                    <Badge variant="default">Aktif</Badge>
                  ) : (
                    <Badge variant="secondary">Nonaktif</Badge>
                  )}
                </td>
              </tr>
            ))}
            {programs.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted-foreground p-6">
                  Belum ada program pendaftaran.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}