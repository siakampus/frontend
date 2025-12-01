import {
  LogOut,
  Home,
  GraduationCap,
  ChevronLeft,
  CreditCard,
  Banknote,
  Download,
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
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Link } from "react-router-dom"
import React, { useState } from "react"

// Mock data untuk instruksi pembayaran
const paymentInstructions: { [key: string]: { name: string, instructions: string[] } } = {
    'bca': { 
        name: 'Bank BCA', 
        instructions: [
            "1. Masukkan Kartu ATM dan PIN Anda.",
            "2. Pilih menu 'Transaksi Lainnya'.",
            "3. Pilih menu 'Transfer' lalu 'Ke Rek BCA' atau 'Pembayaran' (tergantung ATM).",
            "4. Masukkan Nomor Virtual Account (VA) yang Anda dapatkan.",
            "5. Masukkan jumlah nominal tagihan (Rp 500.000).",
            "6. Konfirmasi pembayaran dan simpan bukti transfer."
        ]
    },
    'mandiri': { 
        name: 'Bank Mandiri', 
        instructions: [
            "1. Pilih menu 'Bayar/Beli'.",
            "2. Pilih 'Multi Payment'.",
            "3. Masukkan Kode Perusahaan (Cth: UGN 88999).",
            "4. Masukkan Nomor Virtual Account (VA) dan pilih 'Lanjut'.",
            "5. Pastikan detail pembayaran sudah benar, lalu konfirmasi."
        ]
    },
    'bri': { 
        name: 'Bank BRI', 
        instructions: [
            "1. Pilih menu 'Transaksi Lain'.",
            "2. Pilih 'Pembayaran' lalu 'BRIVA'.",
            "3. Masukkan Nomor Virtual Account (VA).",
            "4. Konfirmasi nama dan jumlah tagihan yang muncul di layar.",
            "5. Selesaikan transaksi."
        ]
    },
    'gopay': { 
        name: 'GoPay (E-Wallet)', 
        instructions: [
            "1. Buka aplikasi Gojek dan pilih menu 'Bayar'.",
            "2. Pilih 'Metode Pembayaran' dan masukkan Virtual Account UGN (atau kode bank terkait).",
            "3. Konfirmasi jumlah tagihan sebesar Rp 500.000.",
            "4. Masukkan PIN GoPay Anda."
        ]
    },
};

const banks = [
    { value: 'bca', label: 'Bank BCA' },
    { value: 'mandiri', label: 'Bank Mandiri' },
    { value: 'bri', label: 'Bank BRI' },
    { value: 'gopay', label: 'GoPay (E-Wallet)' },
];

export default function PaymentInstructionsPage() {
    const [selectedBankKey, setSelectedBankKey] = useState<string | null>('bca');
    
    const vaNumber = '700011234567890'; // VA yang sudah di-generate
    const biayaPendaftaran = 500000;
    const deadline = "20 Desember 2025, 23:59 WIB";

    const selectedInstructions = selectedBankKey ? paymentInstructions[selectedBankKey] : null;

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
                  <p className="text-sm text-muted-foreground font-medium">Instruksi Pembayaran</p>
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
                            <CreditCard className="h-5 w-5 text-primary"/> Petunjuk Pembayaran
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Lakukan pembayaran biaya pendaftaran menggunakan Nomor Virtual Account (VA) yang sudah digenerate.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        
                        {/* Detail Tagihan Statis */}
                        <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-300 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">Nomor VA Anda</span>
                                <span className="text-base font-mono font-bold text-primary">{vaNumber}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">Total Tagihan</span>
                                <span className="text-lg font-bold text-red-600">Rp {biayaPendaftaran.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-yellow-200">
                                <span className="text-sm font-semibold text-gray-700">Batas Waktu Pembayaran</span>
                                <Badge className="bg-yellow-600 text-white font-bold">{deadline}</Badge>
                            </div>
                        </div>

                        
                        {/* Dropdown Bank dan Instruksi */}
                        <div className="space-y-4 pt-4 border-t">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Banknote className="h-5 w-5"/> Pilih Metode Pembayaran untuk Instruksi
                            </h2>
                            <div className="space-y-2">
                                <Label htmlFor="select-bank">Pilih Bank / Metode Pembayaran</Label>
                                <Select onValueChange={setSelectedBankKey} defaultValue={selectedBankKey || undefined}>
                                    <SelectTrigger id="select-bank" className="w-full md:w-96"><SelectValue placeholder="Pilih Bank" /></SelectTrigger>
                                    <SelectContent>
                                        {banks.map(bank => (
                                            <SelectItem key={bank.value} value={bank.value}>{bank.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedInstructions && (
                                <Card className="border-primary/50 bg-primary/5">
                                    <CardHeader className="text-primary font-bold">
                                        Cara Pembayaran via {paymentInstructions[selectedBankKey!].name}
                                    </CardHeader>
                                    <CardContent>
                                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                                            {selectedInstructions.instructions.map((step, index) => (
                                                <li key={index} className="pl-1">{step}</li>
                                            ))}
                                        </ol>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                        
                        <div className="pt-4 border-t">
                            <p className="text-xs text-muted-foreground mt-2">
                                Setelah pembayaran berhasil, status tagihan Anda akan otomatis terperbarui. Kembali ke halaman sebelumnya untuk memantau status.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
          </div>
        </div>
    )
}