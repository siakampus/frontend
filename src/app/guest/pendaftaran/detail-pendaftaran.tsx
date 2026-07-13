import React, { useState } from "react" 
import { User, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { AppLayout } from "@/components/ui/app-layout"

interface PathDetail {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    programType?: string; 
    faculty?: string; 
    enrollmentFee?: number;
}

export default function DetailPendaftaranPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); 
    const location = useLocation(); 
    const receivedPathDetail = location.state?.pathDetail as PathDetail | undefined; 
    
    const pathDetail: PathDetail | null = receivedPathDetail || null;
    
    // 💡 State untuk menangani proses loading/submission
    const [isSubmitting, setIsSubmitting] = useState(false);
    const API_URL = "";
    const token = localStorage.getItem("token");

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
          day: "numeric",
          month: "long",
          year: "numeric",
        };
        return new Date(dateString).toLocaleDateString("id-ID", options);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const fileName = e.target.files[0].name
        console.log(`File berhasil dipilih: ${fileName}`)
      }
    }

    // 🎯 FUNGSI UTAMA YANG DIMODIFIKASI
    const handleApply = async () => {
        if (!pathDetail || !token) {
            alert("Data jalur pendaftaran atau sesi pengguna tidak ditemukan.");
            return;
        }

        const confirmApply = window.confirm(`Apakah Anda yakin ingin mendaftar program ${pathDetail.name}?`);
        if (!confirmApply) {
            return;
        }
        
        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/admission-paths/select`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Gunakan token otentikasi
                },
                body: JSON.stringify({
                    admissionPathId: pathDetail.id, // Menggunakan ID jalur dari pathDetail
                }),
            });

            if (response.ok) {
                // Pendaftaran berhasil
                alert(`Pendaftaran ke jalur ${pathDetail.name} berhasil! Silakan lanjutkan ke proses berikutnya.`);
                
                // Redirect ke halaman detail proses/stepper pendaftaran
                navigate(`/pendaftaran/sarjana-2025`); 
            } else if (response.status === 401) {
                // Handle Unauthorized
                alert("Sesi berakhir atau token tidak valid. Silakan login kembali.");
                localStorage.removeItem("token");
                navigate("/login");
            } else {
                // Handle error lain (misal: sudah terdaftar, server error)
                const errorData = await response.json();
                alert(`Gagal mendaftar: ${errorData.message || response.statusText}`);
                console.error("Enrollment failed:", errorData);
            }
        } catch (error) {
            console.error("Error during enrollment:", error);
            alert("Terjadi kesalahan jaringan saat mencoba mendaftar.");
        } finally {
            setIsSubmitting(false);
        }
    }

    // 💡 Handling jika user akses langsung tanpa state (Data tidak ada)
    if (!pathDetail) {
        return (
            <AppLayout
                menuTemplate="admisi"
                title="Akses Ditolak"
                subtitle="Pendaftaran Program"
                backTo="/pendaftaran"
            >
                <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <p className="font-bold mb-2">Gagal memuat detail jalur.</p>
                    <p>Detail program harus dimuat dari halaman daftar. Silakan klik "Daftar" dari halaman utama.</p>
                    <Button onClick={() => navigate('/pendaftaran')} className="mt-4">
                        Kembali ke Daftar Program
                    </Button>
                </div>
            </AppLayout>
        );
    }


    // --- Render Konten Utama dengan Data dari State ---

    return (
        <AppLayout
            menuTemplate="admisi"
            title={pathDetail.name || "Detail Program"}
            subtitle="Pendaftaran Program"
            backTo="/pendaftaran"
        >      
            {/* Detail Program */}
            <Card className="shadow-sm border rounded-lg pb-0 max-w-4xl mx-auto">
                <CardContent className="px-6 pt-0 pb-4 space-y-6">
                    {/* Judul & Tag */}
                    <div>
                        <h1 className="text-2xl font-sans font-bold text-gray-800">
                            {pathDetail.name}
                        </h1>
                        
                        {/* Tag info */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <Badge className="bg-gray-100 text-black border-gray-200">
                                {pathDetail.programType || 'N/A'}
                            </Badge>
                            <Badge className="bg-gray-100 text-black border-gray-200">
                                {pathDetail.faculty || 'N/A'}
                            </Badge>
                            <Badge className="bg-green-100 text-green-700 border border-green-300">
                                Sedang Dibuka
                            </Badge>
                        </div>
                        
                        <hr className="mt-6"/>

                        {/* Periode & Biaya */}
                        <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                            <div className="space-y-1 p-3 bg-blue-50 rounded-md">
                                <p className="font-semibold text-blue-800">Periode Pendaftaran:</p>
                                <p className="text-blue-900">
                                    {formatDate(pathDetail.startDate)} s.d {formatDate(pathDetail.endDate)}
                                </p>
                            </div>
                        </div>


                        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                            {pathDetail.description}
                        </p>

                    </div>

                    {/* Foto Section (tetap sebagai panduan) */}
                    <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex-shrink-0 w-36 h-36 flex items-center justify-center border border-gray-300 rounded bg-white">
                            <User className="w-24 h-24 text-gray-400" /> 
                        </div>
                        
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
                                    <Button variant="outline" className="text-gray-700 border-gray-400 bg-white hover:bg-gray-100" asChild>
                                        <label htmlFor="photo-upload" className="cursor-pointer">
                                            Ganti Foto
                                        </label>
                                    </Button>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                            Kembali
                        </Button>
                        <Button variant="default" onClick={handleApply} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Mendaftar...
                                </span>
                            ) : (
                                "Daftar Sekarang"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {/* Akhir Konten Utama */}
            
        </AppLayout>
    )
}