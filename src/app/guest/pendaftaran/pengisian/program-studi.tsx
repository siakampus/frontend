"use client"

import {
  GraduationCap,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import React from "react"
import { useNavigate } from "react-router-dom"
// --- PATH IMPORT APP LAYOUT YANG BENAR ---
import { AppLayout } from "@/components/ui/app-layout"

// Data Dummy untuk Select
const DUMMY_FAKULTAS = [
    { value: 'ft', label: 'Fakultas Teknik' },
    { value: 'fge', label: 'Fakultas Geografi' },
    { value: 'fis', label: 'Fakultas Ilmu Sosial dan Ilmu Politik' },
]

const DUMMY_PRODI = [
    { value: 'sipil', label: 'Teknik Sipil' },
    { value: 'arsitek', label: 'Arsitektur' },
    { value: 'geografi', label: 'Geografi' },
]

export default function PemilihanProgramStudiPage() {
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Pemilihan Program Studi berhasil disimpan!")
    navigate("/pendaftaran/sarjana-2025")
  }

  const renderPilihanForm = (pilihan: number) => (
    <div className="space-y-4 p-6 border border-primary/30 rounded-lg bg-primary/5">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
            <GraduationCap className="h-5 w-5"/> Pilihan {pilihan}
        </h3>
        <p className="text-sm text-muted-foreground">Pilih Fakultas dan Program Studi yang Anda minati. Pastikan urutan pilihan sudah sesuai prioritas Anda.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
                <Label htmlFor={`fakultas-${pilihan}`}>Fakultas</Label>
                <Select required>
                    <SelectTrigger id={`fakultas-${pilihan}`}><SelectValue placeholder={`Pilih Fakultas Pilihan ${pilihan}`} /></SelectTrigger>
                    <SelectContent>
                        {DUMMY_FAKULTAS.map(f => (
                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor={`prodi-${pilihan}`}>Program Studi/Peminatan</Label>
                <Select required>
                    <SelectTrigger id={`prodi-${pilihan}`}><SelectValue placeholder={`Pilih Program Studi Pilihan ${pilihan}`} /></SelectTrigger>
                    <SelectContent>
                         {DUMMY_PRODI.map(p => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    </div>
  )

  return (
    // Menggunakan AppLayout untuk menyediakan Sidebar dan Header
    <AppLayout
        menuTemplate="admisi" // Menggunakan menu untuk admisi
        title="Sarjana Reguler 2025" // Judul utama di Header
        subtitle="Pemilihan Program Studi" // Subtitle di Header
        backTo="/pendaftaran/sarjana-2025" // Rute kembali ke detail pendaftaran
    >
        {/* Content Halaman (children) */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Card dibatasi lebarnya dan diposisikan di tengah */}
            <Card className="shadow-sm border rounded-lg max-w-4xl gap-2 mx-auto">
                <CardHeader className="pb-2 border-b border-gray-200">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary"/>Pemilihan Program Studi
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Pilih dua (2) Program Studi Sarjana yang Anda minati. Pilihan pertama adalah prioritas utama.
                    </p>
                </CardHeader>
                <CardContent className="space-y-8 p-6">
                    
                    {/* Render Pilihan 1 */}
                    {renderPilihanForm(1)}

                    {/* Render Pilihan 2 */}
                    {renderPilihanForm(2)}

                    <div className="pt-4 border-t">
                        <Button type="submit" className="w-full md:w-auto">
                            <Save className="h-4 w-4 mr-2" /> Simpan & Lanjut ke Langkah Berikutnya
                        </Button>
                    </div>
                </CardContent>
            </Card>
          </form>
        </main>
        {/* Akhir Konten Halaman */}
    </AppLayout>
  )
}
