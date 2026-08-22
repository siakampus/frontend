import {
  Megaphone,
  CheckCircle,
  XCircle,
  FileCheck,
  Calendar,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import React, { useState } from "react"
// --- PATH IMPORT APP LAYOUT YANG BENAR ---
import { AppLayout } from "@/components/ui/app-layout"

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
        // Menggunakan AppLayout untuk menyediakan Sidebar dan Header
        <AppLayout
            menuTemplate="admisi" // Menggunakan menu untuk admisi
            title="Pengumuman Hasil" // Judul utama di Header
            subtitle="Tahap Akhir" // Subtitle di Header
            backTo="/pendaftaran/sarjana-2025" // Rute kembali ke detail pendaftaran
        >
            {/* Konten Halaman (children) */}
            
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-green-50 p-4 rounded-lg border border-green-300">
                                <div className="space-y-1">
                                    <p className="font-medium text-green-800">Periode Daftar Ulang</p>
                                    <p className="font-bold text-lg text-green-900">{dataHasil.infoDaftarUlang.tanggalMulai} s/d {dataHasil.infoDaftarUlang.tanggalSelesai}</p>
                                </div>
                                <div className="flex items-center justify-end">
                                     <Button 
                                        disabled
                                        className="bg-gray-400 text-white shadow-md cursor-not-allowed"
                                    >
                                        Lihat Panduan & Persyaratan
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 flex items-start gap-3 mt-3">
                                <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-amber-700">
                                    <p className="font-semibold">Menunggu Konfirmasi dari Admin</p>
                                    <p>Panduan dan persyaratan daftar ulang sedang dalam proses persetujuan oleh Admin. Silakan cek kembali secara berkala untuk informasi terbaru.</p>
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
            {/* Akhir Konten Halaman */}
        </AppLayout>
    )
}
