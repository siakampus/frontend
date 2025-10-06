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

// 👉 Icons
import { Mail, Lock, User, Contact, FileCheck } from "lucide-react"

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

export function SignUpForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const passwordMatch = confirmPassword.length > 0 && password === confirmPassword
  const passwordError = confirmPassword.length > 0 && password !== confirmPassword

  return (
    <form className="space-y-5">
      {/* Verifikasi Email */}
      <Card className="overflow-hidden pt-0">
        <SectionHeader icon={Mail} title="Verifikasi Email" />
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="email" className="flex items-center gap-1 text-sm">
              Email <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input id="email" type="email" placeholder="example@gmail.com" />
              <Button type="button">Kirim</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pastikan email aktif untuk menerima token verifikasi.
            </p>
          </div>
          <FormField
            label="Token"
            id="token"
            required
            placeholder="6 digit token"
            helper="Masukkan token yang dikirim ke email Anda."
          />
        </CardContent>
      </Card>

      {/* Data Akun */}
      <Card className="overflow-hidden pt-0">
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
                passwordMatch ? "text-green-600" : passwordError ? "text-red-500" : "text-transparent"
              }`}
            >
              {passwordMatch
                ? "✅ Password cocok"
                : passwordError
                ? "❌ Password tidak sama"
                : "placeholder"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Pribadi */}
      <Card className="overflow-hidden pt-0">
        <SectionHeader icon={User} title="Data Pribadi" />
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <Label className="flex items-center gap-1 text-sm">
              Kewarganegaraan <span className="text-red-500">*</span>
            </Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih kewarganegaraan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Indonesia</SelectItem>
                <SelectItem value="foreign">Asing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FormField label="NIK" id="nik" required placeholder="Sesuai KTP/KK" />
          <FormField
            label="Nama Lengkap"
            id="fullname"
            required
            placeholder="Sesuai KTP/Passport"
          />
          <FormField label="Gelar Akademik (opsional)" id="gelar" placeholder="Misal: Dr., M.Sc." />
          <FormField label="Nama sesuai Ijazah" id="ijazah" required placeholder="Tanpa gelar" />
          <FormField label="Tempat Lahir" id="birthplace" required />
          <FormField label="Tanggal Lahir" id="birthdate" type="date" required />

          <div className="grid gap-3">
            <Label className="flex items-center gap-1 text-sm">
              Jenis Kelamin <span className="text-red-500">*</span>
            </Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih jenis kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Laki-laki</SelectItem>
                <SelectItem value="female">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FormField
            label="Nama Ibu Kandung"
            id="mother"
            required
            placeholder="Sesuai KK"
          />
        </CardContent>
      </Card>

      {/* Data Kontak */}
      <Card className="overflow-hidden pt-0">
        <SectionHeader icon={Contact} title="Data Kontak" />
        <CardContent className="grid md:grid-cols-2 gap-4">
          <FormField label="Nomor Handphone" id="phone" type="number" required placeholder="62xxxx" />
          <FormField label="Nomor WhatsApp" id="wa" type="number" placeholder="62xxxx" />
          <FormField label="Nomor Telegram" id="telegram" type="number" placeholder="62xxxx" />
          <FormField label="Telegram Username" id="telegramUser" placeholder="@username" />
          <FormField label="Nomor Line" id="line" type="number" placeholder="62xxxx" />
          <FormField label="ID Line" id="lineId" placeholder="Line ID" />
        </CardContent>
      </Card>

      {/* Pernyataan */}
      <Card className="overflow-hidden pt-0">
        <SectionHeader icon={FileCheck} title="Pernyataan" />
        <CardContent>
          <div className="flex items-start gap-3">
            <Checkbox id="agreement" className="mt-1 hover:cursor-pointer" />
            <label
              htmlFor="agreement"
              className="text-sm leading-relaxed"
            >
              Ya, saya setuju bahwa seluruh data yang saya isikan/unggah adalah benar, sah, dan legal.{" "}
              <strong>SAYA TIDAK AKAN MENGUBAH DATA SETELAH AKUN DIBUAT.</strong>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 w-full justify-end">
        <Button type="button" variant="outline">
          <a href="/login">Batalkan</a>
        </Button>
        <Button type="submit">
          <a href="/pendaftaran/berhasil/login">Lakukan Pendaftaran</a>
        </Button>
      </div>
    </form>
  )
}