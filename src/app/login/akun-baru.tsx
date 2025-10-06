"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils" // Asumsi utility class untuk tailwind
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, LogIn, CheckCircle, RotateCcw } from "lucide-react" // Menambahkan RotateCcw
import { useNavigate } from "react-router-dom"

// --- Alert Component for Success Message ---
function SuccessAlert({ message }: { message: string }) {
    if (!message) return null;
    return (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="block sm:inline text-sm font-medium">{message}</span>
        </div>
    );
}

// Fungsi pembantu untuk membuat CAPTCHA 4 digit
const generateCaptcha = () => {
    // Menghasilkan string 4 digit angka acak
    return String(Math.floor(1000 + Math.random() * 9000));
};


// --- Main Login Component ---
export default function LoginAkunBaru({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // CAPTCHA States
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState<string>('');
  
  const navigate = useNavigate();

  // Fungsi untuk menghasilkan dan mengatur ulang CAPTCHA
  const handleGenerateCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
    setCaptchaError('');
  };

  // Efek untuk mendeteksi query parameter sukses registrasi & Generate CAPTCHA awal
  useEffect(() => {
    // 1. Check registration success
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('registrationSuccess') === 'true') {
            setSuccessMessage("✅ Akun berhasil dibuat. Silakan **login** menggunakan akun yang baru Anda buat untuk melanjutkan pendaftaran.");
        }
    }
    // 2. Generate initial CAPTCHA
    handleGenerateCaptcha();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      
      // 1. Validasi CAPTCHA
      setCaptchaError(''); // Hapus error sebelumnya
      // Memastikan perbandingan input pengguna (string) dengan kode (string)
      if (captchaInput !== captchaCode) {
          setCaptchaError("❌ Kode CAPTCHA salah. Silakan coba lagi.");
          handleGenerateCaptcha(); // Refresh CAPTCHA jika gagal
          return;
      }
      
      // 2. --- Logika Login Simulasi ---
      // Di sini Anda akan memanggil API autentikasi
      
      // Redirect ke halaman Data Diri setelah login sukses
      navigate('/data-diri');
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className={cn("flex flex-col gap-6 w-full max-w-4xl", className)} {...props}>
            
            {/* NOTIFIKASI SUKSES REGISTRASI (DIPOSISIKAN DI ATAS CARD) */}
            <SuccessAlert message={successMessage} />

            <Card className="overflow-hidden p-0 rounded-lg shadow-lg">
                <CardContent className="grid p-0 md:grid-cols-2">
                    
                    {/* 1. Left side: Focused Login Form Panel (Putih) */}
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="flex flex-col items-center text-center">
                            <h1 className="text-xl font-bold font-serif text-primary">
                                Masuk ke Portal Pendaftaran
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Gunakan kredensial Anda untuk melanjutkan proses.
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="grid gap-4">
                            {/* Email */}
                            <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@ugn.ac.id"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            </div>

                            {/* Password */}
                            <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Kata Sandi</Label>
                                <a
                                href="#"
                                className="ml-auto text-sm text-primary/80 underline-offset-4 hover:underline"
                                >
                                Lupa kata sandi?
                                </a>
                            </div>
                            <Input 
                                id="password" 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            </div>
                            
                            {/* CAPTCHA */}
                            <div className="grid gap-2">
                                <Label htmlFor="captcha">Verifikasi Keamanan (CAPTCHA)</Label>
                                <div className="flex gap-2">
                                    {/* CAPTCHA Display */}
                                    <div className="flex-shrink-0 w-32 h-10 bg-gray-200 rounded-md border border-gray-300 flex items-center justify-center text-xl font-mono tracking-widest select-none font-bold text-gray-700">
                                        {captchaCode}
                                    </div>
                                    <Input
                                        id="captcha"
                                        type="text"
                                        placeholder="Masukkan kode"
                                        required
                                        maxLength={4}
                                        className="flex-grow text-center"
                                        value={captchaInput}
                                        onChange={(e) => setCaptchaInput(e.target.value)}
                                    />
                                    <Button type="button" variant="outline" size="icon" onClick={handleGenerateCaptcha} title="Refresh CAPTCHA">
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </div>
                                {captchaError && (
                                    <p className="text-xs text-red-500 mt-1">{captchaError}</p>
                                )}
                            </div>


                            <Button type="submit" className="w-full mt-4">
                                <LogIn className="h-4 w-4 mr-2" /> Masuk ke Portal
                            </Button>
                        </form>
                        
                    </div>
                    
                    {/* 2. Right side: Logo/Branding Panel (Biru) */}
                    <div className="bg-primary hidden md:flex flex-col items-center justify-center p-8 text-white text-center">
                        <GraduationCap className="h-16 w-16 mb-4 opacity-90" />
                        <h2 className="text-2xl font-serif font-bold mb-2">Login untuk melanjutkan</h2>
                        <p className="text-sm opacity-75">
                            Masuk menggunakan akun yang baru Anda buat.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}