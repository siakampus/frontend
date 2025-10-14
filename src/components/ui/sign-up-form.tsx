"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

import { Mail, Lock, User, Contact, FileCheck } from "lucide-react"

// 👉 Form Field Component
function FormField({
  label,
  id,
  required,
  placeholder,
  type = "text",
  helper,
  value,
  onChange,
}: {
  label: string
  id: string
  required?: boolean
  placeholder?: string
  type?: string
  helper?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="flex items-center gap-1 text-sm">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <Input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} />
      {helper && <p className="text-xs text-muted-foreground mt-1">{helper}</p>}
    </div>
  )
}

// 👉 Section Header Component
function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType
  title: string
}) {
  return (
    <div className="flex items-center gap-2 bg-primary/5 px-4 py-3 rounded-t-md">
      <Icon className="h-5 w-5 text-primary" />
      <h2 className="font-serif font-bold text-base text-primary">{title}</h2>
    </div>
  )
}

// 👉 Main Sign Up Form Component
export function SignUpForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("") // untuk pesan kirim email
  const [tokenMessage, setTokenMessage] = useState("") // untuk pesan verifikasi
  const [loading, setLoading] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [token, setToken] = useState("")
  const [verified, setVerified] = useState(false)

  // password states
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // additional form states (keperluan register)
  const [nationality, setNationality] = useState("") // will set from Select
  const [nik, setNik] = useState("")
  const [fullName, setFullName] = useState("")
  const [academicTitle, setAcademicTitle] = useState("")
  const [lastDiplomaName, setLastDiplomaName] = useState("")
  const [placeOfBirth, setPlaceOfBirth] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState("") // will set from Select
  const [motherName, setMotherName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [telegramNumber, setTelegramNumber] = useState("")
  const [telegramUsername, setTelegramUsername] = useState("")
  const [lineNumber, setLineNumber] = useState("")
  const [lineId, setLineId] = useState("")
  const [checkDisclaimer, setCheckDisclaimer] = useState(false)

  const [registerMessage, setRegisterMessage] = useState("")

  const passwordMatch = confirmPassword.length > 0 && password === confirmPassword
  const passwordError = confirmPassword.length > 0 && password !== confirmPassword

  // 👉 Kirim kode verifikasi
  const handleSendVerification = async () => {
    if (!email) {
      setMessage("❌ Harap isi email terlebih dahulu.")
      return
    }

    try {
      setLoading(true)
      setMessage("⏳ Mengirim kode verifikasi...")
      setVerificationCode("")
      setTokenMessage("")
      setVerified(false)

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/request-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      )

      const data = await res.json()

      if (res.ok) {
        setMessage(`✅ ${data.message}`)
        if (data.verificationCode) setVerificationCode(data.verificationCode)
      } else {
        setMessage(`❌ ${data.message || "Gagal mengirim kode verifikasi."}`)
      }
    } catch (error) {
      console.error(error)
      setMessage("❌ Terjadi kesalahan saat mengirim email.")
    } finally {
      setLoading(false)
    }
  }

  // 👉 Verifikasi kode token
  const handleVerifyToken = async () => {
    if (!token) {
      setTokenMessage("❌ Harap isi token terlebih dahulu.")
      return
    }

    try {
      setLoading(true)
      setTokenMessage("⏳ Memverifikasi kode...")

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/verify-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: token }),
        }
      )

      if (res.ok) {
        setVerified(true)
        setTokenMessage("✅ Email berhasil diverifikasi!")
      } else {
        setVerified(false)
        setTokenMessage("❌ Token salah atau sudah kadaluarsa.")
      }
    } catch (error) {
      console.error(error)
      setTokenMessage("❌ Gagal menghubungi server.")
    } finally {
      setLoading(false)
    }
  }

  // 👉 Register API (kirim semua field sesuai schema)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterMessage("")

    if (!checkDisclaimer) {
      setRegisterMessage("❌ Harap centang pernyataan terlebih dahulu.")
      return
    }

    if (!passwordMatch) {
      setRegisterMessage("❌ Password tidak cocok.")
      return
    }

    try {
      setLoading(true)
      setRegisterMessage("⏳ Mengirim data pendaftaran...")

      const payload = {
        email,
        token,
        password,
        confirmPassword,
        nationality,
        nik,
        fullName,
        academicTitle,
        lastDiplomaName,
        placeOfBirth,
        dateOfBirth,
        gender,
        motherName,
        phoneNumber,
        whatsappNumber,
        telegramNumber,
        telegramUsername,
        lineNumber,
        lineId,
        checkDisclaimer,
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json().catch(() => ({}))

      if (res.status === 201) {
        setRegisterMessage("✅ User registered successfully")
        alert("✅ Akun berhasil dibuat! Silakan login dengan akun baru Anda.")
        window.location.href = "/pendaftaran/berhasil/login"
        return
      }else {
        // jika backend kirim { message: "..." } tampilkan, kalau gak ada tampil generik
        setRegisterMessage(`❌ ${data.message || "Gagal mendaftar."}`)
      }
    } catch (error) {
      console.error(error)
      setRegisterMessage("❌ Terjadi kesalahan saat mendaftar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleRegister}>
      {/* Verifikasi Email */}
      <Card className="overflow-hidden pt-0">
        <SectionHeader icon={Mail} title="Verifikasi Email" />
        <CardContent className="space-y-4">
          {/* Input Email */}
          <div className="grid gap-3">
            <Label htmlFor="email" className="flex items-center gap-1 text-sm">
              Email <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={verified}
              />
              <Button type="button" className="w-24" onClick={handleSendVerification} disabled={loading || verified}>
                {loading ? "Mengirim..." : "Kirim Kode"}
              </Button>
            </div>

            {message && (
              <p
                className={`text-xs mt-1 ${
                  message.startsWith("✅")
                    ? "text-green-600"
                    : message.startsWith("⏳")
                    ? "text-gray-500"
                    : "text-red-500"
                }`}
              >
                {message}
              </p>
            )
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pastikan email aktif untuk menerima dan memverifikasi token.
          </p>
          {/* Token */}
          <div className="flex gap-2">
            <Input
              id="token"
              placeholder="6 digit token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={verified}
            />
            <Button
              type="button"
              variant="secondary"
              className="w-24"
              onClick={handleVerifyToken}
              disabled={loading || verified}
            >
              {loading ? "Memverifikasi..." : "Verifikasi"}
            </Button>
          </div>

          {/* Pesan verifikasi terpisah */}
          {tokenMessage && (
            <p
              className={`text-xs mt-1 ${
                tokenMessage.startsWith("✅")
                  ? "text-green-600"
                  : tokenMessage.startsWith("⏳")
                  ? "text-gray-500"
                  : "text-red-500"
              }`}
            >
              {tokenMessage}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bagian lain disembunyikan sampai diverifikasi */}
      {verified && (
        <>
          {/* Data Akun */}
          <Card className="overflow-hidden pt-0 animate-fadeIn">
            <SectionHeader icon={Lock} title="Data Akun" />
            <CardContent className="grid md:grid-cols-2 gap-4">
              <FormField
                label="Password"
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helper="Minimal 8 karakter kombinasi huruf, angka, simbol."
              />
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-1 text-sm">
                  Ulangi Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                />
                <p
                  className={`text-xs mt-1 h-4 ${
                    passwordMatch
                      ? "text-green-600"
                      : passwordError
                      ? "text-red-500"
                      : "text-transparent"
                  }`}
                >
                  {passwordMatch ? "✅ Password cocok" : passwordError ? "❌ Password tidak sama" : "placeholder"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Pribadi */}
          <Card className="overflow-hidden pt-0 animate-fadeIn">
            <SectionHeader icon={User} title="Data Pribadi" />
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label className="flex items-center gap-1 text-sm">
                  Kewarganegaraan <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(v) => setNationality(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kewarganegaraan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indonesia">Indonesia</SelectItem>
                    <SelectItem value="Asing">Asing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FormField label="NIK" id="nik" required placeholder="Sesuai KTP/KK" value={nik} onChange={(e) => setNik(e.target.value)} />
              <FormField label="Nama Lengkap" id="fullname" required placeholder="Sesuai KTP/Passport" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <FormField label="Gelar Akademik (opsional)" id="gelar" placeholder="Misal: Dr., M.Sc." value={academicTitle} onChange={(e) => setAcademicTitle(e.target.value)} />
              <FormField label="Nama sesuai Ijazah" id="ijazah" required placeholder="Tanpa gelar" value={lastDiplomaName} onChange={(e) => setLastDiplomaName(e.target.value)} />
              <FormField label="Tempat Lahir" id="birthplace" required value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} />
              <FormField label="Tanggal Lahir" id="birthdate" type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />

              <div className="grid gap-3">
                <Label className="flex items-center gap-1 text-sm">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(v) => setGender(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Laki-laki</SelectItem>
                    <SelectItem value="female">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FormField label="Nama Ibu Kandung" id="mother" required placeholder="Sesuai KK" value={motherName} onChange={(e) => setMotherName(e.target.value)} />
            </CardContent>
          </Card>

          {/* Data Kontak */}
          <Card className="overflow-hidden pt-0 animate-fadeIn">
            <SectionHeader icon={Contact} title="Data Kontak" />
            <CardContent className="grid md:grid-cols-2 gap-4">
              <FormField
                label="Nomor Handphone"
                id="phone"
                type="number"
                required
                placeholder="62xxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <FormField label="Nomor WhatsApp" id="wa" type="number" placeholder="62xxxx" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
              <FormField label="Nomor Telegram" id="telegram" type="number" placeholder="62xxxx" value={telegramNumber} onChange={(e) => setTelegramNumber(e.target.value)} />
              <FormField label="Telegram Username" id="telegramUser" placeholder="@username" value={telegramUsername} onChange={(e) => setTelegramUsername(e.target.value)} />
              <FormField label="Nomor Line" id="line" type="number" placeholder="62xxxx" value={lineNumber} onChange={(e) => setLineNumber(e.target.value)} />
              <FormField label="ID Line" id="lineId" placeholder="Line ID" value={lineId} onChange={(e) => setLineId(e.target.value)} />
            </CardContent>
          </Card>

          {/* Pernyataan */}
          <Card className="overflow-hidden pt-0 animate-fadeIn">
            <SectionHeader icon={FileCheck} title="Pernyataan" />
            <CardContent>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agreement"
                  className="mt-1 hover:cursor-pointer"
                  onCheckedChange={(checked) => setCheckDisclaimer(checked === true)}
                />
                <label htmlFor="agreement" className="text-sm leading-relaxed">
                  Ya, saya setuju bahwa seluruh data yang saya isikan/unggah adalah benar, sah, dan legal.{" "}
                  <strong>SAYA TIDAK AKAN MENGUBAH DATA SETELAH AKUN DIBUAT.</strong>
                </label>
              </div>
            </CardContent>
          </Card>

          {registerMessage && (
                <p className={`text-xs mt-1 ${
                  registerMessage.startsWith("✅") ? "text-green-600" :
                  registerMessage.startsWith("⏳") ? "text-gray-500" : "text-red-500"
                }`}>
                  {registerMessage}
                </p>
              )}

          {/* Actions */}
          <div className="flex gap-4 w-full justify-end">
            <Button type="button" variant="outline">
              <a href="/login">Batalkan</a>
            </Button>
            <div className="flex flex-col items-end">
              <Button type="submit">
                <a> Lakukan Pendaftaran</a>
              </Button>
              
            </div>
          </div>
        </>
      )}
    </form>
  )
}