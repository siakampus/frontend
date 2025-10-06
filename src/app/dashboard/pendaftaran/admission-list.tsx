// src/components/AdmissionsPage.tsx (atau AdmissionsList.tsx)

import { LogOut, Home, GraduationCap, ArrowRight, BookOpen } from "lucide-react"
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
import { Link } from "react-router-dom"
import React from "react"

// Data Dummy untuk Daftar Pendaftaran
const enrollmentData = [
    {
        id: "sarjana-2025",
        name: "Seleksi Mandiri Program Sarjana (2025)",
        status: "Aktif",
        statusColor: "bg-blue-500 hover:bg-blue-600",
        date: "Batas Akhir: 19 Juli 2025",
        progress: 9, // 35%
        // Rute diubah menjadi /pendaftaran/sarjana-2025
        path: "/pendaftaran/sarjana-2025",
    },
    {
        id: "pascasarjana-2024",
        name: "Penerimaan Program Pascasarjana (2024)",
        status: "Selesai",
        statusColor: "bg-gray-500 hover:bg-gray-600",
        date: "Tahun Akademik 2024/2025",
        progress: 100,
        // Rute diubah menjadi /pendaftaran/pascasarjana-2024
        path: "/pendaftaran/pascasarjana-2024",
    },
]

// Komponen Card Pendaftaran
const EnrollmentCard: React.FC<typeof enrollmentData[0]> = ({ name, status, statusColor, date, progress, path }) => (
    <Card className="shadow-sm hover:shadow-md transition rounded-lg border">
        <CardContent className="p-5 flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
                <h2 className="text-lg font-bold text-gray-800">{name}</h2>
                <p className="text-sm text-muted-foreground">{date}</p>
                <Badge className={`mt-1 ${statusColor}`}>{status}</Badge>
            </div>
            
            <div className="flex flex-col items-end flex-shrink-0">
                <Link to={path} className="w-full">
                    <Button size="sm" className="flex items-center gap-1">
                        Lanjutkan Proses <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-2">Progress: {progress}%</p>
            </div>
        </CardContent>
    </Card>
)

export function AdmissionsPage() {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-primary/5 border-r flex flex-col">
                <div className="h-16 flex items-center justify-center font-serif font-bold text-primary">
                    Portal Mahasiswa
                </div>
                <nav className="flex-1 px-4 py-6 text-sm">
                    <div className="space-y-1">
                        <Link
                            to="/data-diri"
                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10"
                        >
                            <Home className="h-4 w-4" /> Data Diri
                        </Link>
                        <Link
                            // Link di sidebar diubah
                            to="/pendaftaran"
                            className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 font-medium text-primary"
                        >
                            <GraduationCap className="h-4 w-4" /> Pendaftaran
                        </Link>
                    </div>
                </nav>
                <div className="p-4">
                    <Button variant="outline" className="w-full flex items-center gap-2">
                        <LogOut className="h-4 w-4" /> Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b flex items-center justify-between px-6 bg-white">
                    <h1 className="font-serif font-bold text-lg">Daftar Pendaftaran</h1>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/avatar.png" alt="User" />
                                    <AvatarFallback>UGM</AvatarFallback>
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
                    <Card className="shadow-sm border rounded-lg p-6">
                        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-primary" /> Riwayat Pendaftaran
                        </h1>
                        <div className="space-y-4">
                            {enrollmentData.map((data) => (
                                <EnrollmentCard key={data.id} {...data} />
                            ))}
                        </div>
                    </Card>
                    <div className="mt-6">
                        <Button variant="outline" className="w-full md:w-auto">
                            + Daftar Program Baru
                        </Button>
                    </div>
                </main>
            </div>
        </div>
    )
}