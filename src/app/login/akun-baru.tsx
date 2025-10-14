import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, LogIn, CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Turnstile from "react-turnstile"

function SuccessAlert({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4 flex items-start gap-3">
      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
      <span className="block sm:inline text-sm font-medium">{message}</span>
    </div>
  )
}

export default function LoginAkunBaru({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [captchaToken, setCaptchaToken] = useState("dummy-captcha-token") // 👉 dummy token
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()

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
      <div className={cn("flex flex-col gap-6 w-full max-w-4xl", className)} {...props}>
        <SuccessAlert message={successMessage} />
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm">
            {errorMessage}
          </div>
        )}

        <Card className="overflow-hidden p-0 rounded-lg shadow-lg">
          <CardContent className="grid p-0 md:grid-cols-2">
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

                <Button type="submit" className="w-full mt-4" disabled={loading}>
                  {loading ? "Memproses..." : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" /> Masuk ke Portal
                    </>
                  )}
                </Button>
              </form>
            </div>

            <div className="bg-primary hidden md:flex flex-col items-center justify-center p-8 text-white text-center">
              <GraduationCap className="h-16 w-16 mb-4 opacity-90" />
              <h2 className="text-2xl font-serif font-bold mb-2">
                Login untuk melanjutkan
              </h2>
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