import {
  LogOut,
  Home,
  GraduationCap,
  ChevronLeft,
  Clock,
  MapPin,
  Calendar,
  Monitor,
  CheckCircle,
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
import React from "react"

export default function CBTSesiPage() {
    const navigate = useNavigate();

    // Mock Data Penetapan Sesi CBT
    const sesiCBT = {
        tanggal: "Sabtu, 15 Januari 2026",
        waktu: "Sesi 2 (Pukul 10:00 - 12:00 WIB)",
        lokasi: "Gedung Utama, Ruang 301 (Lab Komputer)",
        status: "Ditetapkan",
    };

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
                        localStorage.removeItem("auth_token")
                        window.location.href = "/login"
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
                    to="/pendaftaran/sarjana-2025" 
                    className="text-muted-foreground hover:text-primary transition">
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Penetapan Sesi</p>
                  <h1 className="font-serif font-bold text-lg">Sarjana Reguler 2025</h1>
                </div>
              </div>
              <DropdownMenu>
                {/* ... (Dropdown Menu content) */}
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
                <Card className="shadow-sm border rounded-lg max-w-4xl gap-2 mx-auto">
                    <CardHeader className="pb-2 border-b border-gray-200">
                        <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                            <Monitor className="h-5 w-5 text-primary"/> Penetapan Sesi Ujian CBT
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Sesi ujian Anda telah ditetapkan. Harap catat detail di bawah ini dan cetak Kartu Ujian Anda.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        
                        {/* Status dan Notifikasi */}
                        <div className="p-4 rounded-lg border border-green-200 bg-green-50 flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0"/>
                            <div className="text-sm text-green-700">
                                <p className="font-semibold">Sesi Ujian Telah Ditetapkan!</p>
                                <p>Detail di bawah adalah jadwal resmi Anda. Harap hadir 30 menit sebelum waktu ujian.</p>
                            </div>
                        </div>

                        {/* Detail Sesi CBT - Clean & Modern Style */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-white">
                            
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary"/> Tanggal Ujian</p>
                                <p className="text-lg font-bold text-gray-800">{sesiCBT.tanggal}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500 flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/> Sesi & Waktu</p>
                                <p className="text-lg font-bold text-gray-800">{sesiCBT.waktu}</p>
                            </div>
                            
                            <div className="md:col-span-2 space-y-1 pt-3 border-t border-gray-100">
                                <p className="text-sm font-medium text-gray-500 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary"/> Lokasi Ujian</p>
                                <p className="text-lg font-bold text-gray-800">{sesiCBT.lokasi}</p>
                            </div>
                        </div>
                      
                    </CardContent>
                </Card>
            </main>
          </div>
        </div>
    )
}