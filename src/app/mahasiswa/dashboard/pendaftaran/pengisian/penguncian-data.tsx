import {
  LogOut,
  Home,
  GraduationCap,
  ChevronLeft,
  Lock,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
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
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Link } from "react-router-dom"
import React, { useState } from "react"

// Data Mock untuk pengecekan status langkah sebelumnya
const mockStepsStatus = [
    { id: 'data-entry', title: 'Pengisian Data Diri', status: 'Selesai' },
    { id: 'program', title: 'Pemilihan Program Studi', status: 'Selesai' }, // Contoh Revisi
    { id: 'upload', title: 'Upload Dokumen', status: 'Revisi' }, // Contoh Belum Selesai
]

// Tipe status: 'Selesai', 'Revisi', 'Belum Selesai'
type StepStatus = 'Selesai' | 'Revisi' | 'Belum Selesai';

const getStatusIcon = (status: StepStatus) => {
    switch (status) {
        case 'Selesai': return { Icon: CheckCircle, className: 'text-green-600' };
        case 'Revisi': return { Icon: AlertTriangle, className: 'text-red-600' };
        case 'Belum Selesai': return { Icon: XCircle, className: 'text-orange-600' };
        default: return { Icon: XCircle, className: 'text-gray-500' };
    }
}

export default function LockDataPendaftaranPage() {
    const [isLocked, setIsLocked] = useState(false) // State untuk menandakan data sudah dikunci
    
    // Hitung status kelengkapan
    const totalSteps = mockStepsStatus.length
    const stepsCompleted = mockStepsStatus.filter(s => s.status === 'Selesai').length
    const stepsNeedingRevision = mockStepsStatus.filter(s => s.status === 'Revisi').length
    const stepsIncomplete = mockStepsStatus.filter(s => s.status === 'Belum Selesai').length

    // Kriteria untuk mengunci: Semua langkah harus 'Selesai'
    const canLock = stepsNeedingRevision === 0 && stepsIncomplete === 0

    const handleLockData = (e: React.FormEvent) => {
        e.preventDefault()
        if (canLock) {
            if (window.confirm("PERINGATAN: Setelah dikunci, data tidak dapat diubah lagi. Apakah Anda yakin ingin mengunci data pendaftaran Anda?")) {
                // Logic untuk mengirim data penguncian ke server
                setIsLocked(true)
                alert("Data Pendaftaran berhasil dikunci! Anda sekarang dapat membuat tagihan pembayaran.")
                // Di sini Anda mungkin akan redirect ke langkah 'billing'
            }
        } else {
            alert("Anda belum bisa mengunci data. Harap selesaikan semua langkah dan revisi yang tertunda.")
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
                  <p className="text-sm text-muted-foreground font-medium">Penguncian Data</p>
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
              <form onSubmit={handleLockData}>
                <Card className="shadow-sm border rounded-lg max-w-4xl gap-2 mx-auto">
                    <CardHeader className="pb-2 border-b border-gray-200">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary"/>Penguncian Data Pendaftaran
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pastikan semua data sudah benar, karena setelah dikunci, Anda **tidak akan bisa mengubah** data pribadi, pilihan program studi, dan unggahan dokumen.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        
                        {/* Status Kelengkapan Global */}
                        <div className={`p-4 rounded-lg ${canLock ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'} border space-y-3`}>
                            {canLock ? (
                                <h2 className="text-lg font-bold flex items-center gap-2 text-green-800">
                                    <CheckCircle className="h-6 w-6" /> Data Anda Sudah Lengkap dan Siap Dikunci.
                                </h2>
                            ) : (
                                <h2 className="text-lg font-bold flex items-center gap-2 text-red-800">
                                    <AlertTriangle className="h-6 w-6" /> Data Belum Lengkap/Ada Revisi Tertunda.
                                </h2>
                            )}
                            
                            <p className="text-sm text-gray-700">
                                Progress pengisian data Anda saat ini: 
                                <span className="font-semibold text-primary ml-1">{stepsCompleted} dari {totalSteps} langkah selesai.</span>
                            </p>
                        </div>

                        {/* Detail Status Langkah */}
                        <div className="space-y-3">
                            <h3 className="text-base font-semibold border-b pb-2">Detail Status Langkah Wajib:</h3>
                            {mockStepsStatus.map(step => {
                                const { Icon, className } = getStatusIcon(step.status as StepStatus);
                                return (
                                    <div key={step.id} className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{step.title}</span>
                                        <div className="flex items-center gap-2">
                                            <Icon className={`h-4 w-4 ${className}`} />
                                            <Badge variant="outline" className={`font-semibold ${className} border-current`}>
                                                {step.status === 'Belum Selesai' ? 'Belum Diisi' : step.status}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Tombol Aksi */}
                        <div className="pt-4 border-t">
                            <Button 
                                type="submit" 
                                className={`w-full md:w-auto text-lg px-8 py-6 ${canLock && !isLocked ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
                                disabled={!canLock || isLocked}
                            >
                                {isLocked ? (
                                    <>
                                        <CheckCircle className="h-5 w-5 mr-2" /> Data Sudah Terkunci
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-5 w-5 mr-2" /> Kunci Data Permanen & Lanjut Tagihan
                                    </>
                                )}
                            </Button>
                            {!canLock && (
                                <p className="text-sm text-red-600 mt-2">
                                    Anda hanya dapat mengunci data jika semua langkah memiliki status **Selesai** atau **Sudah Upload**.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
              </form>
            </main>
          </div>
        </div>
      )
    }