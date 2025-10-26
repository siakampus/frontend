import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, LogIn, CheckCircle, XCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Turnstile from "react-turnstile"

// ✅ Alert reusable component
function AlertBox({
  type,
  message,
}: {
  type: "success" | "error"
  message: string
}) {
  if (!message) return null
  const isSuccess = type === "success"
  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg relative mb-3 flex items-start gap-3 border",
        isSuccess
          ? "bg-green-100 border-green-400 text-green-700"
          : "bg-red-100 border-red-400 text-red-700"
      )}
    >
      {isSuccess ? (
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
      )}
      <span className="block text-sm font-medium">{message}</span>
    </div>
  )
}

export default function LoginAkunBaru({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [captchaToken, setCaptchaToken] = useState("dummy-captcha-token")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // 👉 Redirect user kalau sudah login (token sudah ada)
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) navigate("/data-diri")
  }, [navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, captchaToken }),
        }
      )

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setSuccessMessage("✅ Login berhasil! Mengarahkan ke halaman berikutnya...")
        if (data.token) localStorage.setItem("token", data.token)

        setTimeout(() => {
          navigate("/data-diri")
        }, 1000)
      } else {
        setErrorMessage(data.message || "❌ Email atau password salah.")
      }
    } catch (err) {
      console.error(err)
      setErrorMessage("❌ Gagal terhubung ke server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div
        className={cn("flex flex-col gap-6 w-full max-w-lg", className)}
        {...props}
      >
        <Card className="overflow-hidden p-0 rounded-lg shadow-lg">
          <CardContent className="m-0 p-0">
            {/* FORM AREA */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-xl font-bold font-serif text-black">
                  Masuk dengan <strong>akun baru</strong> Anda
                </h1>
                <p className="text-muted-foreground text-sm">
                  Gunakan kredensial Anda untuk melanjutkan proses.
                </p>
              </div>

              <form onSubmit={handleLogin} className="grid gap-4">
                {/* ✅ ALERTS */}
                {successMessage && (
                  <AlertBox type="success" message={successMessage} />
                )}
                {errorMessage && (
                  <AlertBox type="error" message={errorMessage} />
                )}

                {/* EMAIL */}
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

                {/* PASSWORD */}
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
                <div className="pt-2">
                  <Label>Verifikasi Keamanan</Label>
                  <div className="mt-2 w-full">
                    <Turnstile
                      sitekey="0x4AAAAAAB6AdQ7RikUW15dg"
                      size="flexible"
                      theme="light"
                      onVerify={(token) => setCaptchaToken(token)}
                      onError={() => setCaptchaToken("dummy-captcha-token")}
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={loading}
                >
                  {loading ? "Memproses..." : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" /> Masuk ke Portal
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* RIGHT PANEL (optional aesthetic placeholder) */}
            <div className="hidden md:flex bg-primary text-white items-center justify-center p-8">
              <div className="text-center">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-90" />
                <h2 className="text-lg font-serif font-bold">
                  Portal Pendaftaran Mahasiswa
                </h2>
                <p className="text-sm opacity-80 mt-1">
                  Masuk untuk melanjutkan proses administrasi Anda
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}