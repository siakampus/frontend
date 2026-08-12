import React, { useState, useEffect } from "react"
import {
  LogOut,
  Home,
  GraduationCap,
  ChevronLeft,
  CreditCard,
  Clock,
  CheckCircle,
  Banknote,
  Copy,
  Zap,
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
// --- PATH IMPORT APP LAYOUT YANG BENAR ---
import { AppLayout } from "@/components/ui/app-layout"


export default function BillingPendaftaranPage() {
    // State untuk mensimulasikan status tagihan dan VA
    const [tagihanStatus, setTagihanStatus] = useState<'Belum Dibuat' | 'Menunggu Pembayaran' | 'Lunas'>('Belum Dibuat');
    const [vaNumber, setVaNumber] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [bypassing, setBypassing] = useState(false);
    
    const navigate = useNavigate();

    const biayaPendaftaran = 500000;
    const registrationId = 'SM-SARJANA-2025-123456';
    const deadline = "20 Desember 2025, 23:59 WIB";

    const getStatusProps = (status: typeof tagihanStatus) => {
        switch (status) {
            case 'Belum Dibuat':
                return { badge: 'bg-gray-400', icon: Clock, title: 'Tagihan Belum Dibuat' };
            case 'Menunggu Pembayaran':
                return { badge: 'bg-orange-500', icon: Clock, title: 'Menunggu Pembayaran' };
            case 'Lunas':
                return { badge: 'bg-green-600', icon: CheckCircle, title: 'LUNAS' };
            default:
                return { badge: 'bg-gray-400', icon: Clock, title: 'Status Tidak Dikenal' };
        }
    }

    const handleCreateBilling = () => {
        // Logika generate VA (Happy Flow)
        const newVa = `70001${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`;
        setVaNumber(newVa);
        setTagihanStatus('Menunggu Pembayaran');
        alert('Nomor Virtual Account berhasil digenerate!');
    };
    
    const handleCopy = () => {
        if (vaNumber) {
            // Menggunakan navigator.clipboard untuk menyalin
            navigator.clipboard.writeText(vaNumber); 
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }

    const handleBypassPayment = async () => {
        if (!confirm("Bypass pembayaran untuk testing? Bill akan langsung di-mark sebagai LUNAS.")) return;
        
        setBypassing(true);
        try {
            const token = localStorage.getItem("token");
            const API_BASE = import.meta.env.VITE_PUBLIC_API_URL || "https://ugnapi.online";
            
            // Get current user ID from profile
            const profileRes = await fetch(`${API_BASE}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!profileRes.ok) {
                alert("Gagal mendapatkan profile. Silakan login ulang.");
                return;
            }
            
            const profile = await profileRes.json();
            const userId = profile.id;
            
            if (!userId) {
                alert("User ID tidak ditemukan. Silakan login ulang.");
                return;
            }

            // Call admin bypass endpoint (requires admin login)
            const adminLoginRes = await fetch(`${API_BASE}/api/auth/sign-in/email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "admin@sia.com", password: "admin123" })
            });
            const adminAuth = await adminLoginRes.json();
            
            if (!adminAuth.token) {
                alert("Gagal login sebagai admin untuk bypass. Pastikan backend sudah deploy perubahan terbaru.");
                return;
            }

            // Mark bill as paid via admin endpoint
            const bypassRes = await fetch(`${API_BASE}/admin/bills/${userId}/mark-paid-test`, {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${adminAuth.token}`,
                    "Content-Type": "application/json"
                }
            });

            if (bypassRes.ok) {
                const result = await bypassRes.json();
                setTagihanStatus('Lunas');
                alert(`✓ Bypass berhasil! Bill ID ${result.data.billId} telah di-mark sebagai VERIFIED. Anda dapat melanjutkan ke langkah berikutnya.`);
            } else {
                const error = await bypassRes.json();
                alert(`Gagal bypass: ${error.message || error.error}`);
            }
        } catch (err: any) {
            alert(`Error bypass: ${err.message}`);
        } finally {
            setBypassing(false);
        }
    };

    const statusProps = getStatusProps(tagihanStatus);

    return (
        // Menerapkan AppLayout untuk mengelola struktur layout (Sidebar, Header)
        <AppLayout
            menuTemplate="admisi" // Menggunakan menu untuk admisi
            title="Sarjana Reguler 2025" // Judul utama di Header
            subtitle="Buat Tagihan" // Subtitle di Header
            backTo="/pendaftaran/sarjana-2025" // Rute kembali
        >
            {/* Konten Halaman (children) */}
            <Card className="shadow-sm border rounded-lg max-w-4xl gap-2 mx-auto">
                <CardHeader className="pb-2 border-b border-gray-200">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Banknote className="h-5 w-5 text-primary"/> Buat Tagihan
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Langkah ini akan menghasilkan Nomor Virtual Account (VA) yang harus dibayarkan sebelum tenggat waktu.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    
                    {/* Ringkasan Biaya */}
                    <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-100 p-3 flex justify-between font-semibold text-sm">
                            <span>Item Tagihan</span>
                            <span>Biaya</span>
                        </div>
                        <div className="p-3 flex justify-between text-sm">
                            <span>Biaya Pendaftaran {registrationId}</span>
                            <span>Rp {biayaPendaftaran.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="bg-primary/10 p-3 flex justify-between font-bold text-primary border-t">
                            <span>TOTAL TAGIHAN</span>
                            <span className="text-lg">Rp {biayaPendaftaran.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    {/* Status Tagihan & VA */}
                    <div className={`p-5 rounded-lg text-white font-bold flex flex-col justify-between gap-4 ${statusProps.badge}`}>
                        <div className="flex items-center gap-3">
                            <statusProps.icon className="h-6 w-6" />
                            <span className="text-lg">{statusProps.title}</span>
                        </div>
                        
                        {tagihanStatus === 'Lunas' && (
                            <p className="font-normal text-sm">Tagihan telah lunas. Anda dapat melanjutkan ke langkah berikutnya.</p>
                        )}

                        {tagihanStatus === 'Menunggu Pembayaran' && vaNumber && (
                            <div className="bg-white/20 p-3 rounded-lg flex flex-col md:flex-row justify-between items-center gap-3">
                                <div className="flex-1">
                                    <p className="text-xs font-normal">Nomor Virtual Account</p>
                                    <p className="font-mono text-xl">{vaNumber}</p>
                                    <p className="text-xs font-normal mt-1">Batas Bayar: {deadline}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleCopy} variant="secondary" className="flex-shrink-0">
                                        {isCopied ? <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                        {isCopied ? 'Tersalin!' : 'Salin VA'}
                                    </Button>
                                    <Button 
                                        onClick={() => navigate('/pendaftaran/payment')}
                                        variant="secondary"
                                    >
                                        <CreditCard className="h-4 w-4 mr-2" /> Petunjuk Pembayaran
                                    </Button>
                                </div>
                            </div>
                        )}

                        {tagihanStatus === 'Belum Dibuat' && (
                            <div className="flex flex-col md:flex-row gap-2 mt-2">
                                <Button 
                                    onClick={handleCreateBilling}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    <CreditCard className="h-4 w-4 mr-2" /> Generate Virtual Account (VA)
                                </Button>
                                <Button 
                                    onClick={handleBypassPayment}
                                    disabled={bypassing}
                                    variant="outline"
                                    className="flex-1 bg-yellow-50 hover:bg-yellow-100 border-yellow-300 text-yellow-700"
                                >
                                    <Zap className="h-4 w-4 mr-2" /> 
                                    {bypassing ? "Bypassing..." : "Bypass Pembayaran (Testing)"}
                                </Button>
                            </div>
                        )}
                    </div>
                    
                </CardContent>
            </Card>
            {/* Akhir Konten Halaman */}
        </AppLayout>
    )
}
