"use client";

import { Link } from "react-router-dom";
import { logger } from "@/lib/logger"

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import logo from "@/assets/images/logo.png";
import { GraduationCap, CheckCircle, XCircle } from "lucide-react";
import Turnstile from "react-turnstile";
import { getRedirectPathByRole } from "@/lib/redirectByRole";

// Placeholder kalau logo gagal dimuat
const logoPlaceholder = "https://placehold.co/256x256/00008b/ffffff?text=U+G+N";

// Alert Box Reusable Component
function AlertBox({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  if (!message) return null;
  const isSuccess = type === "success";
  return (
    <div
      className={cn(
        "flex items-start gap-3 border rounded-lg px-4 py-3 text-sm mb-3",
        isSuccess
          ? "bg-green-100 border-green-400 text-green-700"
          : "bg-red-100 border-red-400 text-red-700"
      )}
    >
      {isSuccess ? (
        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
      )}
      <span className="font-medium">{message}</span>
    </div>
  );
}

// Main Login Component
export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle Login API
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      setErrorMessage("ΓÜá∩╕Å Mohon selesaikan verifikasi keamanan terlebih dahulu.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // BetterAuth sign-in — uses session cookies, not bearer tokens
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-better-auth-version": "1",
        },
        credentials: "include", // IMPORTANT: store the session cookie
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      logger.log("Login response:", JSON.stringify(data, null, 2));

      if (res.ok) {
        // Save token for custom API usage
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // Fetch session to get the fully populated user object including role
        let role = data.user?.role || "";

        try {
          // Attempt 1: BetterAuth get-session using cookie and token
          const sessionRes = await fetch("/api/auth/get-session", {
            credentials: "include",
            headers: data.token ? { "Authorization": `Bearer ${data.token}` } : {}
          });
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            if (sessionData?.user?.role) {
              role = sessionData.user.role;
            }
          }
        } catch (err) {
          logger.error("Failed to fetch role from get-session", err);
        }

        if (!role || role === "guest") {
          try {
            // Attempt 2: Custom backend profile endpoint
            const profileRes = await fetch("/auth/profile", {
              credentials: "include",
              headers: data.token ? { "Authorization": `Bearer ${data.token}` } : {}
            });
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              if (profileData?.data?.role) {
                role = profileData.data.role;
              }
            }
          } catch (err) {
            logger.error("Failed to fetch role from profile", err);
          }
        }

        logger.log("Resolved Role:", role);

        localStorage.setItem("userEmail", data.user?.email || email);
        localStorage.setItem("userRole", role);

        const redirectPath = getRedirectPathByRole(role);
        setSuccessMessage("Γ£à Login berhasil! Mengarahkan ke " + redirectPath);
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 1000);
      } else {
        // BetterAuth errors: { error: { message } } or { message }
        const errMsg =
          data?.error?.message ||
          data?.message ||
          "Email atau password salah.";
        setErrorMessage(errMsg);
      }
    } catch (err) {
      logger.error(err);
      setErrorMessage("Γ¥î Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 rounded-lg shadow-lg">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Left side: Login Form */}
          <div className="p-6 md:p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Buat Akun</TabsTrigger>
              </TabsList>

              {/* === LOGIN TAB === */}
              <TabsContent
                value="login"
                className="space-y-6 min-h-[300px] flex flex-col"
              >
                <div className="flex flex-col items-center text-center mb-2">
                  <h1 className="text-xl font-bold font-serif">
                    Sistem Informasi Akademik
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Silakan login untuk melanjutkan
                  </p>
                </div>

                {/* ALERTS */}
                {errorMessage && (
                  <AlertBox type="error" message={errorMessage} />
                )}
                {successMessage && (
                  <AlertBox type="success" message={successMessage} />
                )}

                {/* FORM */}
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
                      <Link
                        to="/forgot-password"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        Lupa kata sandi?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {/* Turnstile CAPTCHA */}
                  <div className="pt-2 w-full">
                    <Label>Verifikasi Keamanan</Label>
                    <div className="mt-2">
                      <Turnstile
                        sitekey={import.meta.env.VITE_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA"}
                        size="flexible"
                        onVerify={(token) => {
                          logger.log("Γ£à Turnstile token:", token);
                          setCaptchaToken(token);
                        }}
                        onExpire={() => {
                          logger.warn("ΓÜá∩╕Å CAPTCHA expired, please retry.");
                          setCaptchaToken(null);
                        }}
                        onError={() => {
                          logger.error("Γ¥î CAPTCHA error.");
                          setCaptchaToken(null);
                        }}
                        theme="light"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full mt-auto"
                    disabled={loading}
                  >
                    {loading ? "Memproses..." : "Masuk"}
                  </Button>
                </form>
              </TabsContent>

              {/* === REGISTER TAB === */}
              <TabsContent
                value="register"
                className="space-y-6 min-h-[300px] flex flex-col"
              >
                <div className="flex flex-col items-center pt-12 text-center gap-2">
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

          {/* Right side: Logo area */}
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
