"use client"

import React, { useState, useCallback } from "react" // Menambahkan useState dan useCallback
import { cn } from "@/lib/utils" // Asumsi utility class untuk tailwind
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import logo from "@/assets/images/logo.png"
import { GraduationCap, RotateCcw } from "lucide-react" // Menambahkan RotateCcw

// Placeholder for logo (Mendefinisikan placeholder jika import gagal)
const logoPlaceholder = "https://placehold.co/256x256/00008b/ffffff?text=U+G+N"

// CAPTCHA generation utility (4-digit numeric)
const generateCaptcha = () => {
    // Menghasilkan string 4 digit angka acak
    return String(Math.floor(1000 + Math.random() * 9000));
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
    // States untuk Login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // States untuk CAPTCHA
    const [captchaCode, setCaptchaCode] = useState(() => generateCaptcha());
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaError, setCaptchaError] = useState('');

    const handleRefreshCaptcha = useCallback(() => {
        setCaptchaCode(generateCaptcha());
        setCaptchaInput('');
        setCaptchaError('');
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        setCaptchaError('');

        // 1. Validasi CAPTCHA (4-digit numeric check)
        if (captchaInput !== captchaCode) {
            setCaptchaError("Kode CAPTCHA salah. Silakan coba lagi.");
            handleRefreshCaptcha();
            return;
        }

        // 2. Simulated Login Logic (Success)
        console.log("Login Berhasil! CAPTCHA terverifikasi. Melakukan login...");

        // Clear sensitive fields and refresh CAPTCHA after success
        setEmail('');
        setPassword('');
        setCaptchaInput('');
        handleRefreshCaptcha();
        
        // Di sini akan ada navigasi ke dashboard
    };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 rounded-lg shadow-lg">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* 👉 Left side: Forms */}
          <div className="p-6 md:p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Buat Akun</TabsTrigger>
              </TabsList>

              {/* --- Login Form --- */}
              <TabsContent
                value="login"
                className="space-y-6 min-h-[300px] flex flex-col"
              >
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-xl font-bold font-serif">
                    Sistem Informasi Akademik
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Silakan login untuk melanjutkan
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 flex-1">
                    {/* Email Input */}
                    <div className="grid gap-3">
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

                    {/* Password Input */}
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password">Kata Sandi</Label>
                        <a
                          href="#"
                          className="ml-auto text-sm underline-offset-2 hover:underline"
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

                    {/* CAPTCHA Input (4-digit numeric style) - DITAMBAH DI SINI */}
                    <div className="grid gap-3 pt-2">
                        <Label htmlFor="captcha">Verifikasi Keamanan (CAPTCHA)</Label>
                        <div className="flex gap-2 items-start">
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
                            <Button type="button" variant="outline" size="icon" onClick={handleRefreshCaptcha} title="Refresh CAPTCHA">
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                        {captchaError && (
                            <p className="text-xs text-red-500 mt-1">{captchaError}</p>
                        )}
                    </div>
                    
                    {/* Tombol Masuk */}
                    <Button type="submit" className="w-full mt-auto">
                      Masuk
                    </Button>
                </form>
              </TabsContent>

              {/* --- Register Redirect --- */}
              <TabsContent
                value="register"
                className="space-y-6 min-h-[300px] flex flex-col"
              >
                <div className="flex flex-col items-center pt-12 text-center gap-1">
                  <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full">
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <h1 className="text-xl font-bold font-serif">
                    Pendaftaran Mahasiswa Baru
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Silakan daftar untuk membuat akun baru
                  </p>
                </div>
                <Button asChild className="w-full mt-auto">
                  <a href="/signup">Daftar Sekarang</a>
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          {/* 👉 Right side: Logo */}
          <div className="bg-primary hidden md:flex items-center justify-center">
            <img
              src={logo}
              alt="Universitas Global Nusantara"
              className="h-64 w-64 object-contain"
              onError={(e) => { 
                (e.target as HTMLImageElement).src = logoPlaceholder; 
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
