// src/components/EnrollmentPage.tsx
"use client"

import {
  LogOut,
  Home,
  GraduationCap,
  ChevronLeft,
  Save,
  FileText,
  User,
  Mail,
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Link } from "react-router-dom"

export default function EnrollmentPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Data Pendaftaran Awal berhasil disimpan! Lanjut ke Pengisian Data Diri.")
    // Logic to save data and redirect to /pendaftaran/data-diri or /pendaftaran
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-primary/5 border-r flex flex-col">
        <div className="h-16 flex items-center justify-center font-serif font-bold text-primary">
          Portal Mahasiswa
        </div>
        <nav className="flex-1 px-4 py-6 text-sm">
          <div className="space-y-1">
            <Link to="/data-diri" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10">
              <Home className="h-4 w-4" /> Data Diri
            </Link>
            <Link
              to="/pendaftaran"
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 font-medium text-primary"
            >
              <GraduationCap className="h-4 w-4" /> Pendaftaran
            </Link>
          </div>
        </nav>
        <div className="p-4">
          <Button variant="outline" className="w-full flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-white">
          <div className="flex items-center gap-3">
             <Link to="/pendaftaran/sarjana-2025" className="text-muted-foreground hover:text-primary transition">
                <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Pendaftaran Awal</p>
              <h1 className="font-serif font-bold text-lg">Sarjana Reguler 2025</h1>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback>UGM</AvatarFallback>
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
            <Card className="shadow-sm border rounded-lg max-w-3xl mx-auto">
                <CardHeader className="pb-2 border-b border-gray-200">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary"/> Langkah 1: Pendaftaran (Enrollment)
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Isi data diri pendaftar dan tentukan target program studi Anda.
                    </p>
                </CardHeader>
                <CardContent className="mt-3 space-y-8 p-6">

                    {/* Detail Akun Pendaftar */}
                    <div className="space-y-4 border-b pb-4">
                        <h2 className="text-lg font-semibold border-l-4 border-primary pl-3 flex items-center gap-2"><User className="h-5 w-5"/> Detail Akun Pendaftar</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="nik">Nomor Induk Kependudukan (NIK)</Label>
                                <Input id="nik" value="3404100701990002" disabled />
                                <p className="text-xs text-muted-foreground">NIK diambil dari data diri akun Anda.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama Lengkap</Label>
                                <Input id="nama" value="Sumbuludun" disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="email" type="email" placeholder="Cth: email@contoh.com" className="pl-10" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Nomor Telepon (WhatsApp)</Label>
                                <Input id="phone" type="tel" placeholder="Cth: 6281234567890" required />
                            </div>
                        </div>
                    </div>

                    {/* Target Program */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold border-l-4 border-primary pl-3 flex items-center gap-2"><GraduationCap className="h-5 w-5"/> Target Program</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="jenjang">Jenjang Pendidikan</Label>
                                <Select required>
                                    <SelectTrigger id="jenjang"><SelectValue placeholder="Pilih Jenjang" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sarjana">Sarjana</SelectItem>
                                        <SelectItem value="diploma">Diploma</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jalur">Jalur Seleksi</Label>
                                <Select required>
                                    <SelectTrigger id="jalur"><SelectValue placeholder="Pilih Jalur" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mandiri">Seleksi Mandiri</SelectItem>
                                        <SelectItem value="kemitraan">Jalur Kemitraan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tahun">Tahun Akademik</Label>
                                <Select required>
                                    <SelectTrigger id="tahun"><SelectValue placeholder="Pilih Tahun" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2025">2025/2026</SelectItem>
                                        <SelectItem value="2026">2026/2027</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                        <Button type="submit" className="w-full md:w-auto">
                            <Save className="h-4 w-4 mr-2" /> Simpan & Lanjut ke Pengisian Data
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