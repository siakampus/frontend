"use client"

import {
  LogOut,
  Home,
  GraduationCap,
  ChevronLeft,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Link } from "react-router-dom"

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mengganti alert dengan notifikasi atau modal kustom di lingkungan produksi
    alert("Pemilihan Program Studi berhasil disimpan! Kembali ke proses pendaftaran.")
    // Logic to save data and redirect to /pendaftaran
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
    <div className="flex min-h-screen">
      {/* Sidebar (SAMA) */}
<aside className="w-64 bg-gray-100 border-r flex flex-col sticky top-0 h-screen overflow-y-auto">        
        <div className="h-16 flex items-center justify-start p-6 gap-2 font-bold text-black">
          <img src="/favicon.png" alt="UGN" className="h-6 w-6 object-contain rounded-sm" />
          <span>Ujian Masuk UGN</span>
        </div>
        <hr />
        <nav className="flex-1 px-4 py-6 text-sm">
          <div className="space-y-1">
            <Link
              to="/data-diri"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10"
            >
              <Home className="h-4 w-4" /> Data Diri
            </Link>
            <Link
              to="/pendaftaran"
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary font-medium text-white"
            >
              <GraduationCap className="h-4 w-4" /> Pendaftaran
            </Link>

            <hr className="my-4"/>

            <button
                onClick={() => {
                const confirmLogout = window.confirm("Apakah Anda yakin ingin logout?")
                if (confirmLogout) {
                    localStorage.removeItem("auth_token") // contoh hapus token
                    window.location.href = "/login" // redirect manual
                }
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10 cursor-pointer "
            >
                <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Navbar */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-white">
          <div className="flex items-center gap-3">
             <Link 
                // Link kembali ke halaman detail pendaftaran (stepper)
                to="/pendaftaran/sarjana-2025" 
                className="text-muted-foreground hover:text-primary transition">
                <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Pemilihan Program Studi</p>
              <h1 className="font-serif font-bold text-lg">Sarjana Reguler 2025</h1>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback>SU</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Sumbuludun</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6 space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Card dibatasi lebarnya dan diposisikan di tengah */}
            <Card className="shadow-sm border rounded-lg max-w-4xl mx-auto">
                <CardHeader className="pb-2 border-b border-gray-200">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary"/> Langkah 3: Pemilihan Program Studi
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Pilih dua (2) Program Studi Sarjana yang Anda minati. Pilihan pertama adalah prioritas utama.
                    </p>
                </CardHeader>
                <CardContent className="mt-6 space-y-8 p-6">
                    
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
      </div>
    </div>
  )
}
