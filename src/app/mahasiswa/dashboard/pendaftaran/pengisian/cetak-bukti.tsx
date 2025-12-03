import {
  Printer,
  FileText,
  CheckCircle,
  Loader2, 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Link, useNavigate } from "react-router-dom"
import React, { useState } from "react" 
import { AppLayout } from "@/components/ui/app-layout"

export default function CetakBuktiPesertaPage() {
    const [isGenerating, setIsGenerating] = useState(false); 

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const token = localStorage.getItem("token"); 

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
                method: 'POST', 
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                // body: JSON.stringify({ ... })
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Gagal generate PDF:", errorText);
                alert(`Gagal membuat dokumen: ${res.status} ${res.statusText}`);
                return;
            }

            const data = await res.json();
            const downloadUrl = data?.downloadUrl;

            if (downloadUrl) {
                // 🔥 PDF dibuka di tab baru
                window.open(downloadUrl, "_blank");
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
        <AppLayout
            menuTemplate="admisi"
            title="Cetak Bukti Peserta"
            subtitle="Dokumen"
            backTo="/pendaftaran/sarjana-2025"
        >
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

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            Pastikan Anda juga mencetak Kartu Ujian setelah sesi CBT ditetapkan.
                        </p>

                        <Button 
                            onClick={handlePrint}
                            disabled={isGenerating} 
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
        </AppLayout>
    )
}