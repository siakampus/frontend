import {
  LogOut,
  Home,
  GraduationCap,
  ChevronLeft,
  Megaphone,
  CheckCircle,
  XCircle,
  FileCheck,
  Calendar,
  Clock,
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
import { Link, useNavigate } from "react-router-dom"
import React, { useState } from "react"

export default function PengumumanHasilPage() {
    const navigate = useNavigate();
    
    // State untuk mensimulasikan hasil pengumuman
    // **[MODIFIKASI]** Ganti 'LULUS' menjadi 'TIDAK LULUS' atau 'MENUNGGU' untuk melihat tampilan yang lain
    const [statusKelulusan, setStatusKelulusan] = useState<'LULUS' | 'TIDAK LULUS' | 'MENUNGGU'>('LULUS');
    
    // Mock Data
    const dataHasil = {
        nama: "Sumbuludun Udin",
        nomorPendaftaran: "SM-SARJANA-2025-123456",
        programStudiDiterima: "Teknik Informatika",
        tanggalPengumuman: "25 Januari 2026",
        infoDaftarUlang: {
            tanggalMulai: "01 Februari 2026",
            tanggalSelesai: "10 Februari 2026",
            linkDokumen: "/pendaftaran/dokumen-daftar-ulang",
        }
    };

    const isLulus = statusKelulusan === 'LULUS';
    const isWaiting = statusKelulusan === 'MENUNGGU';

    const getStatusDisplay = () => {
        if (isWaiting) {
            return {
                title: "HASIL BELUM TERSEDIA",
                message: "Pengumuman hasil baru akan dibuka pada tanggal 25 Januari 2026. Silakan cek kembali pada tanggal tersebut.",
                icon: <Clock className="h-16 w-16 text-gray-500" />,
                bgClass: "bg-white border-gray-300 shadow-lg",
                textClass: "text-gray-700",
                buttonBg: "bg-gray-500 hover:bg-gray-600",
                primaryColorClass: "text-gray-700" 
            };
        } else if (isLulus) {
            return {
                title: "SELAMAT! ANDA DINYATAKAN LULUS",
                message: `Anda diterima di Program Studi ${dataHasil.programStudiDiterima}. Harap segera lakukan proses Daftar Ulang.`,
                icon: <CheckCircle className="h-16 w-16 text-white" />,
                bgClass: "bg-green-600 border-green-700 shadow-xl shadow-green-200",
                textClass: "text-white",
                buttonBg: "bg-green-500 hover:bg-green-700",
                primaryColorClass: "text-green-600" 
            };
        } else {
            return {
                title: "MOHON MAAF",
                message: "Anda dinyatakan TIDAK LULUS pada seleksi ujian masuk kali ini. Terima kasih atas partisipasi Anda.",
                icon: <XCircle className="h-16 w-16 text-white" />,
                bgClass: "bg-red-600 border-red-700 shadow-xl shadow-red-200",
                textClass: "text-white",
                buttonBg: "bg-red-500 hover:bg-red-700",
                // Warna primer untuk detail tidak lulus (merah)
                primaryColorClass: "text-red-600" 
            };
        }
    };

    const statusDisplay = getStatusDisplay();

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
                  <p className="text-sm text-muted-foreground font-medium">Tahap Akhir</p>
                  <h1 className="font-serif font-bold text-lg">Pengumuman Hasil</h1>
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
                
                {/* Status Toggle for Demo */}
                <div className="max-w-4xl mx-auto flex justify-center space-x-2 p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-sm font-medium text-gray-500 mt-1">Simulasi Status:</span>
                    <Button 
                        size="sm"
                        onClick={() => setStatusKelulusan('LULUS')} 
                        variant={statusKelulusan === 'LULUS' ? 'default' : 'outline'}
                        className={statusKelulusan === 'LULUS' ? 'bg-green-500 hover:bg-green-600' : 'text-gray-700'}
                    >
                        LULUS
                    </Button>
                    <Button 
                        size="sm"
                        onClick={() => setStatusKelulusan('TIDAK LULUS')} 
                        variant={statusKelulusan === 'TIDAK LULUS' ? 'default' : 'outline'}
                        className={statusKelulusan === 'TIDAK LULUS' ? 'bg-red-500 hover:bg-red-600' : 'text-gray-700'}
                    >
                        TIDAK LULUS
                    </Button>
                    <Button 
                        size="sm"
                        onClick={() => setStatusKelulusan('MENUNGGU')} 
                        variant={statusKelulusan === 'MENUNGGU' ? 'default' : 'outline'}
                        className={statusKelulusan === 'MENUNGGU' ? 'bg-gray-500 hover:bg-gray-600' : 'text-gray-700'}
                    >
                        MENUNGGU
                    </Button>
                </div>

                <Card className="shadow-lg border rounded-xl max-w-4xl gap-2 mx-auto">
                    <CardHeader className="pb-2 border-b border-gray-100">
                        <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                            <Megaphone className="h-5 w-5 text-primary"/> Pengumuman Hasil Seleksi
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Status kelulusan Anda untuk pendaftaran Ujian Masuk UGN.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-8 p-6">
                        
                        {/* 1. Status Kelulusan Block - Highly Visual */}
                        <div className={`p-10 rounded-xl border-4 ${statusDisplay.bgClass} text-center transition-all duration-300 ease-in-out`}>
                            <div className="flex justify-center mb-4">
                                {statusDisplay.icon}
                            </div>
                            <h2 className={`text-3xl md:text-4xl font-extrabold tracking-wide mb-2 ${isWaiting ? 'text-gray-700' : 'text-white'}`}>
                                {statusDisplay.title}
                            </h2>
                            <p className={`text-lg font-medium ${isWaiting ? 'text-gray-700' : 'text-white/90'}`}>
                                {statusDisplay.message}
                            </p>
                            <p className={`text-sm mt-3 ${isWaiting ? 'text-gray-500' : 'text-white/70'}`}>
                                Nomor Pendaftaran: {dataHasil.nomorPendaftaran}
                            </p>
                        </div>

                        {/* 2. Detail & Langkah Selanjutnya */}
                        {!isWaiting && (
                            <>
                                {/* Detail Hasil */}
                                <div className="p-4 rounded-lg bg-gray-50 shadow-inner">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><FileCheck className={`h-4 w-4 ${statusDisplay.primaryColorClass}`}/> Ringkasan Hasil</h3>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                        
                                        <div>
                                            <p className="font-medium text-gray-500">Tanggal Pengumuman</p>
                                            <p className="font-bold text-gray-800">{dataHasil.tanggalPengumuman}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-500">Pilihan Studi Awal</p>
                                            <p className="font-bold text-gray-800">Sarjana Reguler</p>
                                        </div>
                                        {isLulus && (
                                            <div className="col-span-2 space-y-1 pt-3 border-t border-gray-200">
                                                <p className="font-medium text-gray-500">Diterima di Program Studi</p>
                                                {/* **[MODIFIKASI]** Ukuran font dikecilkan dari text-2xl menjadi text-xl. Warna diganti dari text-blue-600 menjadi statusDisplay.primaryColorClass (Hijau) */}
                                                <p className={`text-xl font-extrabold ${statusDisplay.primaryColorClass}`}>{dataHasil.programStudiDiterima}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                        
                        {/* 3. Langkah Selanjutnya (Hanya muncul jika LULUS) */}
                        {isLulus && (
                            <div className="pt-4 border-t border-gray-100 space-y-4">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Calendar className={`h-5 w-5 ${statusDisplay.primaryColorClass}`}/> Proses Daftar Ulang</h3>
                                
                                {/* **[MODIFIKASI]** Ganti skema warna bg-blue-100/border-blue-300/text-blue-800/text-blue-900 menjadi skema Hijau (sesuai LULUS) */}
                                <div className="grid grid-cols-2 gap-4 text-sm bg-green-50 p-4 rounded-lg border border-green-300">
                                    <div className="space-y-1">
                                        <p className="font-medium text-green-800">Periode Daftar Ulang</p>
                                        <p className="font-bold text-lg text-green-900">{dataHasil.infoDaftarUlang.tanggalMulai} s/d {dataHasil.infoDaftarUlang.tanggalSelesai}</p>
                                    </div>
                                    <div className="flex items-center justify-end">
                                         <Button 
                                            onClick={() => navigate(dataHasil.infoDaftarUlang.linkDokumen)}
                                            // **[MODIFIKASI]** Ganti bg-blue-600/hover:bg-blue-700 menjadi bg-green-600/hover:bg-green-700
                                            className="bg-green-600 hover:bg-green-700 text-white shadow-md"
                                        >
                                            Lihat Panduan & Persyaratan
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Langkah Selanjutnya (Hanya muncul jika TIDAK LULUS) */}
                        {!isLulus && !isWaiting && (
                             <div className="pt-4 border-t border-gray-100 space-y-3">
                                <p className="text-base text-gray-700">
                                    Tetap semangat! Anda dapat mencoba mendaftar kembali pada gelombang atau periode pendaftaran berikutnya.
                                </p>
                                <Button 
                                    variant="outline"
                                    onClick={() => navigate('/pendaftaran')}
                                    className="w-full border-gray-300 text-primary hover:bg-primary/5 font-semibold"
                                >
                                    Lihat Jadwal Pendaftaran Berikutnya
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
          </div>
        </div>
    )
}