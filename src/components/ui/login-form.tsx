"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import logo from "@/assets/images/logo.png";
import { GraduationCap } from "lucide-react";
import Turnstile from "react-turnstile";

const logoPlaceholder = "https://placehold.co/256x256/00008b/ffffff?text=U+G+N";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 👉 Fungsi login ke backend
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      alert("⚠️ Mohon selesaikan verifikasi keamanan terlebih dahulu.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            captchaToken: captchaToken || "dummy-captcha-token",
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // ✅ Login sukses
        setSuccessMessage("✅ Login berhasil! Mengarahkan ke dashboard...");
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", data.user?.email || "");
        localStorage.setItem("userRole", data.user?.role || "");

        setTimeout(() => {
          window.location.href = "/data-diri";
        }, 1000);
      } else {
        // ❌ Login gagal
        setErrorMessage(data.message || "Email atau password salah.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 rounded-lg shadow-lg">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* 👉 Left side: Form */}
          <div className="p-6 md:p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Buat Akun</TabsTrigger>
              </TabsList>

              {/* --- LOGIN TAB --- */}
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

                {errorMessage && (
                  <div className="bg-red-100 border border-red-400 text-red-700 text-sm p-2 rounded">
                    {errorMessage}
                  </div>
                )}
                {successMessage && (
                  <div className="bg-green-100 border border-green-400 text-green-700 text-sm p-2 rounded">
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4 flex-1">
                  {/* Email */}
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

                  {/* Password */}
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

                  {/* ✅ Cloudflare Turnstile */}
                  <div className="pt-2 w-full">
                    <Label>Verifikasi Keamanan</Label>
                    <div className="mt-2">
                      <Turnstile
                        sitekey="0x4AAAAAAB6AdQ7RikUW15dg"
                        size="flexible"
                        onVerify={(token) => {
                          console.log("✅ Turnstile token:", token);
                          setCaptchaToken(token);
                        }}
                        onExpire={() => {
                          console.warn("⚠️ CAPTCHA expired, please retry.");
                          setCaptchaToken(null);
                        }}
                        onError={() => {
                          console.error("❌ CAPTCHA error.");
                          setCaptchaToken(null);
                        }}
                        theme="light"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-auto"
                    disabled={loading}
                  >
                    {loading ? "Memproses..." : "Masuk"}
                  </Button>
                </form>
              </TabsContent>

              {/* --- REGISTER TAB --- */}
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
  );
}