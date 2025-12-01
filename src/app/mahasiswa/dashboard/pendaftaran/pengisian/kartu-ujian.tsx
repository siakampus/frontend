import {
  LogOut,
  Home,
  GraduationCap,
  ChevronLeft,
  Printer,
  Calendar,
  Clock,
  MapPin,
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
import { Separator } from "@/components/ui/separator"
import { Link } from "react-router-dom"
import React from "react"

export default function CetakKartuUjianPage() {
    // Mock Data Kartu Ujian
    const dataKartu = {
        nama: "Sumbuludun Udin",
        nomorPendaftaran: "SM-SARJANA-2025-123456",
        tanggalLahir: "01 Januari 2000",
        programStudi: "Teknik Informatika",
        fotoUrl: "/avatar.png", 
        sesi: {
            tanggal: "Sabtu, 15 Januari 2026",
            waktu: "Sesi 2 (Pukul 10:00 - 12:00 WIB)",
            lokasi: "Gedung Utama, Ruang 301 (Lab Komputer)",
        },
        peraturan: [
            "Wajib hadir 30 menit sebelum ujian dimulai.",
            "Membawa Kartu Ujian dan identitas diri (KTP/SIM).",
            "Mengenakan pakaian rapi dan sopan (kemeja/polo, celana panjang).",
            "Dilarang membawa alat komunikasi (HP, Smartwatch) ke ruang ujian."
        ]
    };
    
    // Fungsi untuk mensimulasikan cetak/unduh
    const handlePrintCard = () => {
        alert('Mengunduh Kartu Ujian. Harap siapkan printer.');
        // Logika cetak atau download PDF di sini
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
                  <p className="text-sm text-muted-foreground font-medium">Dokumen</p>
                  <h1 className="font-serif font-bold text-lg">Cetak Kartu Ujian</h1>
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
                            <GraduationCap className="h-5 w-5 text-primary"/> Kartu Tanda Peserta Ujian
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Harap cetak dan bawa kartu ini saat pelaksanaan ujian CBT.
                        </p>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        
                        {/* KARTU UJIAN - Design Clean dan Formal */}
                        <div className="border-4 border-primary/50 rounded-lg p-6 bg-white shadow-lg">
                            <h2 className="text-2xl font-extrabold text-primary mb-4 text-center">KARTU UJIAN MASUK UGN</h2>
                            <Separator className="bg-primary mb-6" />

                            <div className="grid grid-cols-4 gap-6">
                                {/* Kolom Kiri: Foto */}
                                <div className="col-span-1 flex flex-col items-center">
                                    <Avatar className="h-32 w-24 rounded-none border border-gray-300">
                                        <AvatarImage src={dataKartu.fotoUrl} alt="Foto Peserta" />
                                        <AvatarFallback>FOTO</AvatarFallback>
                                    </Avatar>
                                    <p className="text-xs text-muted-foreground mt-2">Pas Foto 3x4</p>
                                </div>
                                
                                {/* Kolom Kanan: Detail Peserta */}
                                <div className="col-span-3 space-y-2 text-sm">
                                    <div className="grid grid-cols-2">
                                        <p className="font-medium text-gray-600">Nomor Pendaftaran:</p>
                                        <p className="font-bold text-gray-900">{dataKartu.nomorPendaftaran}</p>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <p className="font-medium text-gray-600">Nama Lengkap:</p>
                                        <p className="font-bold text-gray-900">{dataKartu.nama}</p>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <p className="font-medium text-gray-600">Tanggal Lahir:</p>
                                        <p className="font-bold text-gray-900">{dataKartu.tanggalLahir}</p>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <p className="font-medium text-gray-600">Pilihan Program Studi:</p>
                                        <p className="font-bold text-gray-900">{dataKartu.programStudi}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            {/* Detail Sesi Ujian */}
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Calendar className="h-5 w-5 text-primary"/> DETAIL SESI UJIAN CBT</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div className="space-y-1">
                                    <p className="font-medium text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3"/> Tanggal</p>
                                    <p className="font-bold text-gray-800">{dataKartu.sesi.tanggal}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3"/> Waktu</p>
                                    <p className="font-bold text-gray-800">{dataKartu.sesi.waktu}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3"/> Lokasi</p>
                                    <p className="font-bold text-gray-800">{dataKartu.sesi.lokasi}</p>
                                </div>
                            </div>
                            
                            <Separator className="my-6" />

                            {/* Peraturan */}
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">PERATURAN PESERTA</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                                {dataKartu.peraturan.map((rule, index) => (
                                    <li key={index}>{rule}</li>
                                ))}
                            </ul>

                        </div>
                        
                        {/* CTA Cetak */}
                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <Button 
                                onClick={handlePrintCard}
                                className="bg-primary hover:bg-primary/90 text-white"
                            >
                                <Printer className="h-4 w-4 mr-2" /> Cetak Kartu Ujian
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
          </div>
        </div>
    )
}