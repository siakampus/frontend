"use client";

import {
  LogOut,
  Home,
  GraduationCap,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Lock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const enrollmentData = [
  {
    id: "sarjana-2025",
    name: "Seleksi Mandiri Program Sarjana (2025)",
    status: "Aktif",
    statusColor: "bg-blue-700",
    date: "Batas Akhir: 19 Juli 2025",
    progress: 9,
    path: "/pendaftaran/sarjana-2025",
  },
];

const openPrograms = [
  {
    id: "pascasarjana-2025",
    name: "Penerimaan Program Pascasarjana (2025)",
    type: "S2 / S3",
    deadline: "25 Juli 2025",
    status: "Sedang Dibuka",
  },
  {
    id: "profesi-2025",
    name: "Pendaftaran Program Profesi (2025)",
    type: "Profesi",
    deadline: "15 Agustus 2025",
    status: "Sedang Dibuka",
  },
];

const EnrollmentCard: React.FC<typeof enrollmentData[0]> = ({
  name,
  status,
  statusColor,
  date,
  progress,
  path,
}) => (
  <Link
    to={path}
    className="block transform hover:scale-[1.01] transition-transform duration-200"
  >
    <Card className="shadow-sm hover:shadow-md hover:bg-gray-50 rounded-lg border cursor-pointer">
      <CardContent className="px-5 flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h2 className="text-lg font-bold text-gray-800">{name}</h2>
          <p className="text-sm text-muted-foreground">{date}</p>
          <Button size="sm" className="flex items-center gap-1">
            Lanjutkan Proses <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col items-end flex-shrink-0">
          <Badge className={`mt-1 ${statusColor}`}>{status}</Badge>
          <p className="text-xs mt-2">Progress: {progress}%</p>
        </div>
      </CardContent>
    </Card>
  </Link>
);

export function AdmissionsPage() {
  const [locked, setLocked] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const token = localStorage.getItem("token");

useEffect(() => {
  if (!token) {
    window.location.href = "/login";
    return;
  }

  const fetchLockStatus = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/personaldata/1`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        console.warn("🚫 Token tidak valid atau expired, redirect ke login...");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        console.warn("⚠️ Gagal mengambil data lock dari API.", res.status);
        setLocked(false);
        return;
      }

      const data = await res.json();

      const isLocked =
        data?.locked === true ||
        data?.locked === "true" ||
        data?.locked === 1 ||
        data?.data?.locked === true ||
        data?.data?.locked === "true" ||
        data?.data?.locked === 1 ||
        data?.data?.is_locked === true ||
        data?.data?.is_locked === "true" ||
        data?.data?.is_locked === 1 ||
        data?.data?.status === "locked";

      console.log("🔒 Status locked dari API:", data);
      setLocked(Boolean(isLocked));
    } catch (err) {
      console.error("❌ Gagal ambil status kunci data:", err);
      setLocked(false);
    } finally {
      setLoading(false);
    }
  };

  fetchLockStatus();
}, [API_URL, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        🔄 Memuat data...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 border-r flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="h-16 flex items-center justify-start p-6 gap-2 font-bold text-black">
          <img
            src="/favicon.png"
            alt="UGN"
            className="h-6 w-6 object-contain rounded-sm"
          />
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

            <hr className="my-4" />

            <button
              onClick={() => {
                if (confirm("Apakah Anda yakin ingin logout?")) {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-white">
          <h1 className="font-serif font-bold text-lg">Daftar Pendaftaran</h1>
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
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-6">
          {locked === false && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-4 rounded-md flex items-start gap-3">
              <Lock className="h-5 w-5 mt-0.5 text-yellow-600" />
              <div>
                <p className="font-medium">
                  Data pribadi Anda belum dikunci.
                </p>
                <p className="text-sm">
                  Harap lakukan <strong>Kunci Data Permanen</strong> di halaman{" "}
                  <Link
                    to="/data-diri"
                    className="underline text-blue-600 hover:text-blue-800"
                  >
                    Data Diri
                  </Link>{" "}
                  sebelum melakukan pendaftaran.
                </p>
              </div>
            </div>
          )}

          {locked === true && (
            <>
              {/* Riwayat Pendaftaran */}
              <Card className="shadow-sm border rounded-lg p-6">
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" /> Riwayat Pendaftaran
                </h1>
                <div className="space-y-4">
                  {enrollmentData.map((data) => (
                    <EnrollmentCard key={data.id} {...data} />
                  ))}
                </div>
              </Card>

              {/* Program yang sedang dibuka */}
              <Card className="shadow-sm border rounded-lg p-6">
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <CalendarDays className="h-6 w-6 text-primary" /> Program yang Sedang Dibuka
                </h1>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left">
                        <th className="p-3 font-semibold">Nama Program</th>
                        <th className="p-3 font-semibold">Jenis</th>
                        <th className="p-3 font-semibold">Status</th>
                        <th className="p-3 font-semibold">Batas Pendaftaran</th>
                        <th className="p-3 text-right font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openPrograms.map((program) => (
                        <tr
                          key={program.id}
                          className="border-b hover:bg-gray-50 transition"
                        >
                          <td className="p-3 font-medium">{program.name}</td>
                          <td className="p-3 text-muted-foreground">{program.type}</td>
                          <td className="p-3">
                            <Badge className="bg-green-600 text-white">
                              {program.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            Hingga {program.deadline}
                          </td>
                          <td className="p-3 text-right">
                            <Button size="sm" asChild>
                              <Link to={`/pendaftaran/detail-pendaftaran`}>Daftar</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
}