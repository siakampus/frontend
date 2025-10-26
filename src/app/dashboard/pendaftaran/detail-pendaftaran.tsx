import React, { useState } from "react"
import {
  LogOut,
  Home,
  GraduationCap,
  ChevronLeft,
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
import { Badge } from "@/components/ui/badge"
import { Link, useNavigate } from "react-router-dom"
import fotoProfil from "@/assets/images/foto-profil.png"

export default function DetailPendaftaranPage() {
  const navigate = useNavigate()
  const [photo, setPhoto] = useState("@/assets/images/foto-profil.png")

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleApply = () => {
    const confirmApply = window.confirm("Apakah Anda yakin ingin mendaftar program ini?")
    if (confirmApply) {
      alert("Pendaftaran berhasil dikirim!")
      navigate("/pendaftaran/sarjana-2025")
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 border-r flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="h-16 flex items-center justify-start p-6 gap-2 font-bold text-black">
          <img src="/favicon.png" alt="UGN" className="h-6 w-6 object-contain rounded-sm" />
          <span>Ujian Masuk UGN</span>
        </div>
        <hr />
        <nav className="flex-1 px-4 py-6 text-sm">
          <div className="space-y-1">
            <Link to="/data-diri" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10">
              <Home className="h-4 w-4" /> Data Diri
            </Link>
            <Link to="/pendaftaran" className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary font-medium text-white">
              <GraduationCap className="h-4 w-4" /> Pendaftaran
            </Link>
            
            <hr className="my-4"/>

            <button
              onClick={() => {
                const confirmLogout = window.confirm("Apakah Anda yakin ingin logout?")
                if (confirmLogout) {
                  localStorage.removeItem("auth_token")
                  window.location.href = "/login"
                }
              }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10 cursor-pointer"
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
            <Button variant="ghost" onClick={() => navigate(-1)} className="p-0 h-auto text-muted-foreground hover:text-primary">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Pendaftaran Program</p>
              <h1 className="font-serif font-bold text-lg">Program Profesi Psikologi 2025</h1>
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
          {/* Detail Program */}
          <Card className="shadow-sm border rounded-lg pb-0">
            <CardContent className="px-6 pt-0 pb-4 space-y-6">
              {/* Judul & Tag */}
              <div>
                <h1 className="text-2xl font-sans font-bold text-gray-800">
                  Program Pendidikan Profesi Psikologi Semester Genap TA 2025/2026
                </h1>
                

                {/* Tag info */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge className="bg-gray-100 text-black border-gray-200">
                    Sarjana (S1)
                  </Badge>
                  <Badge className="bg-gray-100 text-black border-gray-200">
                    Fakultas Psikologi
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border border-green-300">
                    Sedang Dibuka
                  </Badge>
                </div>
                
                <hr className="mt-6"/>

                <p className="mt-6 text-sm">
                  <strong>Periode Pendaftaran:</strong> Senin, 22 September 2025 s.d Rabu, 22 Oktober 2025
                </p>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Jalur pendaftaran ini memberikan kesempatan bagi lulusan{" "}
                  <strong>Sarjana (S1) Psikologi</strong> seluruh Perguruan Tinggi di Indonesia sesuai
                  dengan ketentuan akreditasi yang termuat pada persyaratan pendaftaran untuk mengikuti{" "}
                  <strong>Program Pendidikan Profesi Psikologi UGN</strong>.
                </p>

              </div>

              {/* Foto Section */}
              <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <img
                  src={fotoProfil}
                  alt="Foto resmi"
                  className="w-36 h-36 object-cover rounded border border-gray-300"
                />
                <div className="text-sm text-gray-700 space-y-3">
                  <p className="text-lg font-bold">Foto Resmi</p>
                  <p>
                    Gunakan foto resmi terbaru (maksimal 6 bulan terakhir). Foto ini akan digunakan
                    sebagai foto eKTM apabila Saudara diterima sebagai mahasiswa. Jika ingin mengganti
                    foto, klik tombol di bawah.
                  </p>
                  <div>
                    <label htmlFor="photo-upload">
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                      <Button variant="outline" className="text-gray-700 border-gray-400 bg-white hover:bg-gray-100">
                        Ganti Foto
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Kembali
                </Button>
                <Button variant="default" onClick={handleApply}>
                  Daftar Sekarang
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}