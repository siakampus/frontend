import {
  LogOut,
  Home,
  GraduationCap,
  ChevronLeft,
  Printer,
  FileText,
  CheckCircle,
  Loader2, // Import Loader2 untuk ikon loading
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
import { Link, useNavigate } from "react-router-dom"
import React, { useState } from "react" // Import useState

export default function CetakBuktiPesertaPage() {
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false); // State untuk loading tombol

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const token = localStorage.getItem("token"); // Ambil token

    // Mock Data Bukti Peserta (tetap)
    const dataPeserta = {
        nama: "Sumbuludun Udin",
        nomorPendaftaran: "SM-SARJANA-2025-123456",
        programStudi: "Teknik Informatika",
        tanggalBayar: "10 November 2025",
    };
    
    // Fungsi untuk memanggil API dan mengunduh PDF
    const handlePrint = async () => {
        if (!token) {
            alert("Sesi berakhir. Mohon login kembali.");
            window.location.href = "/login";
            return;
        }

        setIsGenerating(true);
        
        try {
            const res = await fetch(`${API_URL}/admissiondata/generate-pdf`, {
                method: 'POST', // Biasanya generate file pakai POST/GET, tapi POST lebih aman
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                // body: JSON.stringify({ /* Jika API butuh body/ID pendaftaran */ })
            });

            if (!res.ok) {
                // Handle error respons dari API (misal: 404, 500)
                const errorText = await res.text();
                console.error("Gagal generate PDF:", errorText);
                alert(`Gagal membuat dokumen: ${res.status} ${res.statusText}`);
                return;
            }

            const data = await res.json();
            const downloadUrl = data?.downloadUrl;

            if (downloadUrl) {
                // ✅ Berhasil: Redirect browser langsung ke URL file
                window.location.href = downloadUrl;
            } else {
                alert("URL unduhan tidak ditemukan dalam respons API.");
            }

        } catch (error) {
            console.error("Kesalahan koneksi saat generate PDF:", error);
            alert("Terjadi kesalahan saat menghubungi server untuk membuat PDF.");
        } finally {
            setIsGenerating(false);
        }
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
                  <h1 className="font-serif font-bold text-lg">Cetak Bukti Peserta</h1>
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
                            <FileText className="h-5 w-5 text-primary"/> Bukti Peserta Pendaftaran
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Simpan dokumen ini sebagai bukti bahwa Anda telah menyelesaikan tahap pendaftaran dan pembayaran.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        
                        {/* Summary Block - Clean & Modern Style */}
                        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 space-y-3">
                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                <CheckCircle className="h-5 w-5 text-green-600"/>
                                <span className="font-semibold text-green-700">Pembayaran Dikonfirmasi</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <p className="font-medium text-gray-500">Nomor Pendaftaran</p>
                                    <p className="font-bold text-gray-800">{dataPeserta.nomorPendaftaran}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-gray-500">Nama Peserta</p>
                                    <p className="font-bold text-gray-800">{dataPeserta.nama}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-gray-500">Pilihan Program Studi</p>
                                    <p className="font-bold text-gray-800">{dataPeserta.programStudi}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-gray-500">Tanggal Pembayaran</p>
                                    <p className="font-bold text-gray-800">{dataPeserta.tanggalBayar}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* CTA Cetak */}
                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                                Pastikan Anda juga mencetak Kartu Ujian setelah sesi CBT ditetapkan.
                            </p>
                            <Button 
                                onClick={handlePrint}
                                disabled={isGenerating} // Matikan tombol saat loading
                                className="bg-primary hover:bg-primary/90 text-white"
                            >
                                {isGenerating ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Printer className="h-4 w-4 mr-2" />
                                )}
                                {isGenerating ? 'Membuat Dokumen...' : 'Cetak Bukti Peserta'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
          </div>
        </div>
    )
}