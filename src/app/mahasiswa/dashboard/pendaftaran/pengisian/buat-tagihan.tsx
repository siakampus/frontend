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
import React, { useState } from "react"

export default function BillingPendaftaranPage() {
    // State untuk mensimulasikan status tagihan dan VA
    const [tagihanStatus, setTagihanStatus] = useState<'Belum Dibuat' | 'Menunggu Pembayaran' | 'Lunas'>('Belum Dibuat');
    const [vaNumber, setVaNumber] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    
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
            navigator.clipboard.writeText(vaNumber);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }

    const statusProps = getStatusProps(tagihanStatus);

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
                  <p className="text-sm text-muted-foreground font-medium">Buat Tagihan</p>
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
                                <Button 
                                    onClick={handleCreateBilling}
                                    variant="secondary"
                                    className="w-full md:w-auto mt-2"
                                >
                                    <CreditCard className="h-4 w-4 mr-2" /> Generate Virtual Account (VA)
                                </Button>
                            )}
                        </div>
                        
                    </CardContent>
                </Card>
            </main>
          </div>
        </div>
    )
}