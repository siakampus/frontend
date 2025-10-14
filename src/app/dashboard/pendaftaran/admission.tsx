import {
  LogOut,
  Home,
  GraduationCap,
  Upload,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Printer,
  Bell,
  Lock,
  ChevronLeft,
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
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Link } from "react-router-dom"
import React from "react"

// Utility function to map status to a CSS class and Icon (TETAP SAMA)
const getStatusProps = (status: "Sudah diisi" | "Belum diisi" | "Revisi" | "Belum dibuka") => {
  switch (status) {
    case "Sudah diisi":
      return { icon: CheckCircle, color: "text-green-700", badge: "bg-green-100 text-green-700 border-green-200" }
    case "Belum diisi":
      return { icon: Clock, color: "text-orange-400", badge: "bg-orange-100 text-orange-700 border-orange-200" }
    case "Revisi":
      return { icon: AlertCircle, color: "text-red-700", badge: "bg-red-100 text-red-700 border-red-200" }
    case "Belum dibuka":
    default:
      return { icon: Lock, color: "text-gray-700", badge: "bg-gray-100 text-gray-700 border-gray-200" }
  }
}

const StatusSummaryCard: React.FC<{ title: string; count: number; status: "Sudah diisi" | "Belum diisi" | "Revisi" | "Belum dibuka" }> = ({ title, count, status }) => {
  const { icon: Icon, color } = getStatusProps(status);
  const isRevision = status === "Revisi";

  return (
    <Card className="shadow-sm hover:shadow-md transition rounded-lg border">
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-primary">{title}</p>
          <p className={`text-3xl font-bold text-text-primary`}>{count}</p>
        </div>
        
        <div className={`p-2 rounded-lg bg-muted/50 border border-dashed flex-shrink-0 ${isRevision ? 'border-red-300' : 'border-gray-300'}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  )
}


export default function ProsesPendaftaranPage() {
  
  // Informasi spesifik pendaftaran ini
  const programTitle = "Sarjana Reguler 2025"
  const programId = "SM-SARJANA-2025"


  const steps: {
    id: string
    title: string
    description: string
    schedule: string
    icon: React.ElementType
    status: "Belum diisi" | "Sudah diisi" | "Revisi" | "Belum dibuka"
    path: string
  }[] = [
    {
      id: "enrollment",
      title: "Pendaftaran (Enrollment)",
      description: "Isi formulir awal untuk mengikuti pendaftaran.",
      schedule: "1 - 5 Juli 2025",
      icon: FileText,
      status: "Sudah diisi",
      // Rute diubah
      path: "/pendaftaran/enrollment",
    },
    {
      id: "data-entry",
      title: "Pengisian Data Diri",
      description: "Lengkapi biodata dan informasi pribadi.",
      schedule: "2 - 6 Juli 2025",
      icon: FileText,
      status: "Revisi",
      // Rute diubah
      path: "/pendaftaran/data-diri",
    },
    {
      id: "program",
      title: "Pemilihan Program Studi",
      description: "Pilih jurusan / program studi yang diminati.",
      schedule: "3 - 7 Juli 2025",
      icon: GraduationCap,
      status: "Belum diisi",
      // Rute diubah
      path: "/pendaftaran/program-studi",
    },
    {
      id: "upload",
      title: "Upload Dokumen",
      description: "Unggah berkas yang diperlukan.",
      schedule: "4 - 8 Juli 2025",
      icon: Upload,
      status: "Belum dibuka",
      // Rute diubah
      path: "/pendaftaran/upload",
    },
    {
      id: "lock",
      title: "Penguncian Data",
      description: "Kunci data agar tidak bisa diubah kembali.",
      schedule: "5 - 9 Juli 2025",
      icon: Lock,
      status: "Belum dibuka",
      // Rute diubah
      path: "/pendaftaran/lock",
    },
    {
      id: "billing",
      title: "Buat Tagihan (Billing)",
      description: "Generate tagihan biaya pendaftaran.",
      schedule: "6 - 10 Juli 2025",
      icon: CreditCard,
      status: "Belum dibuka",
      // Rute diubah
      path: "/pendaftaran/billing",
    },
    {
      id: "payment",
      title: "Pembayaran Pendaftaran",
      description: "Lakukan pembayaran biaya pendaftaran.",
      schedule: "7 - 12 Juli 2025",
      icon: CreditCard,
      status: "Belum dibuka",
      // Rute diubah
      path: "/pendaftaran/payment",
    },
    {
      id: "cbt",
      title: "Penetapan Sesi CBT",
      description: "Pilih sesi ujian berbasis komputer (CBT).",
      schedule: "10 - 15 Juli 2025",
      icon: FileText,
      status: "Belum dibuka",
      // Rute diubah
      path: "/pendaftaran/cbt",
    },
    {
      id: "print-form",
      title: "Cetak Bukti Peserta",
      description: "Cetak bukti pendaftaran Anda.",
      schedule: "12 - 16 Juli 2025",
      icon: Printer,
      status: "Belum dibuka",
      // Rute diubah
      path: "/pendaftaran/print-form",
    },
    {
      id: "print-card",
      title: "Cetak Kartu Ujian",
      description: "Cetak kartu ujian resmi.",
      schedule: "15 - 18 Juli 2025",
      icon: Printer,
      status: "Belum dibuka",
      // Rute diubah
      path: "/pendaftaran/print-card",
    },
    {
      id: "announcement",
      title: "Pengumuman Hasil",
      description: "Lihat hasil seleksi pendaftaran.",
      schedule: "20 Juli 2025",
      icon: Bell,
      status: "Belum dibuka",
      // Rute diubah
      path: "/pendaftaran/announcement",
    },
  ]

  const totalSteps = steps.length
  const completedSteps = steps.filter((s) => s.status === "Sudah diisi").length
  const revisiSteps = steps.filter((s) => s.status === "Revisi").length
  const belumDibukaSteps = steps.filter((s) => s.status === "Belum dibuka").length
  const belumDiisiSteps = steps.filter((s) => s.status === "Belum diisi").length
  const progress = Math.round((completedSteps / totalSteps) * 100)

  // Data for the summary cards
  const summaryData = [
    { title: "Sudah Diisi", count: completedSteps, status: "Sudah diisi" as const },
    { title: "Belum Diisi", count: belumDiisiSteps, status: "Belum diisi" as const },
    { title: "Revisi", count: revisiSteps, status: "Revisi" as const },
    { title: "Belum Dibuka", count: belumDibukaSteps, status: "Belum dibuka" as const },
  ]

  const renderStatus = (status: "Sudah diisi" | "Belum diisi" | "Revisi" | "Belum dibuka") => {
    const { icon: Icon, badge: badgeClass } = getStatusProps(status)
    return (
      <Badge className={`flex items-center gap-1 ${badgeClass}`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

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
            <button
                onClick={() => {
                const confirmLogout = window.confirm("Apakah Anda yakin ingin logout?")
                if (confirmLogout) {
                    localStorage.removeItem("auth_token") // contoh hapus token
                    window.location.href = "/login" // redirect manual
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
          {/* Judul diubah menjadi Breadcrumb/Detail */}
          <div className="flex items-center gap-3">
             {/* Link kembali diubah */}
             <Link to="/pendaftaran" className="text-muted-foreground hover:text-primary transition">
                <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Proses Pendaftaran</p>
              <h1 className="font-serif font-bold text-lg">{programTitle}</h1>
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
        
        {/* Info Pendaftaran */}
        <Card className="shadow-sm border rounded-lg p-4 bg-primary/5 border-primary/20">
            <div className="flex justify-between items-center text-sm font-medium text-primary">
                <span>ID Pendaftaran: {programId}</span>
                <Badge variant="secondary" className="bg-blue-700 text-white">
                    AKTIF
                </Badge>
            </div>
        </Card>


        {/* RINGKASAN USER */}
        <Card className="shadow-sm border rounded-lg">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-grow">
                <Avatar className="h-14 w-14 border-2 border-primary">
                    <AvatarImage src="/avatar.png" alt="User" />
                    <AvatarFallback>SU</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="font-bold text-xl text-gray-800">Sumbuludun</h2>
                    <p className="text-sm text-muted-foreground">NIK: 3404100701990002</p>
                    <p className="text-sm text-muted-foreground">Email: sumbuludun@example.com</p>
                </div>
            </div>

            <div className="w-full md:w-64 pt-2 md:pt-0 flex-shrink-0">
              <p className="text-sm mb-2 text-muted-foreground font-medium flex justify-between">
                <span>Progress Pendaftaran</span>
                <span className="font-bold text-primary">{progress}%</span>
              </p>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {completedSteps} dari {totalSteps} langkah selesai
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summaryData.map(({ title, count, status }) => (
                <StatusSummaryCard key={title} title={title} count={count} status={status} />
            ))}
        </div>

          {/* Stepper */}
          <div className="relative border-l-2 border-gray-200 border-dashed space-y-6">
            {steps.map((step, index) => {
              const isDisabled = step.status === "Belum dibuka"
              const content = (
            <Card
              className={`transition-all duration-200 transform ${
                isDisabled
                  ? "opacity-50 pointer-events-none"
                  : "hover:shadow-lg hover:scale-[1.01] transition-transform"
              }`}
            > <CardContent className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <step.icon className="h-5 w-5 text-primary" />
                        <h2 className="font-bold">{step.title}</h2>
                        {renderStatus(step.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      <div className="bg-muted/50 border border-dashed rounded p-2 text-xs text-muted-foreground">
                        Jadwal Pelaksanaan:{" "}
                        <span className="font-medium text-foreground">{step.schedule}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )

              return (
                <div
                  key={step.id}
                  className={`relative pl-4 ${isDisabled ? "opacity-70" : ""}`}
                >
                  {/* Number Circle */}
                  <div className="absolute -left-[14px] top-2 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  {/* Link ke detail langkah diubah */}
                  {isDisabled ? content : <Link to={step.path} className="block group">{content}</Link>}
                </div>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}