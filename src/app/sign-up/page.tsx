import { SignUpForm } from "@/components/ui/sign-up-form"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-muted">
      {/* Container form */}
      <div className="relative z-10 w-full max-w-4xl rounded-sm p-8">
        {/* Header row */}
        <div className="mb-8 flex items-center justify-between">
          {/* Back to login */}
          <Button asChild variant="link" className="text-sm text-primary">
            <a href="/login">← Kembali ke Login</a>
          </Button>

          {/* Title */}
          <div className="flex flex-col items-center text-center flex-1">
            <GraduationCap className="h-10 w-10 text-primary mb-2" />
            <h1 className="font-serif text-xl font-bold">
              Pendaftaran Mahasiswa Baru UGN
            </h1>
            <p className="text-muted-foreground text-sm">
              Silakan isi formulir berikut untuk membuat akun pendaftaran
            </p>
          </div>

          {/* Spacer biar kiri & kanan balance */}
          <div className="w-[120px]" />
        </div>

        {/* Form */}
        <SignUpForm />
      </div>
    </div>
  )
}