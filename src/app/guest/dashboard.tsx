"use client";

import { useEffect, useState } from "react";
import { logger } from "@/lib/logger"
import { AppLayout } from "@/components/ui/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  GraduationCap, 
  Lock, 
  Unlock, 
  CheckCircle, 
  ArrowRight,
  ShieldAlert,
  ClipboardList
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface UserSession {
  email: string;
  role?: string;
  name?: string;
}

export default function GuestDashboardPage() {
  const [userData, setUserData] = useState<UserSession | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const getAuthHeaders = (): HeadersInit => {
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchSessionAndLockStatus = async () => {
      try {
        setLoading(true);
        // 1. Get user session
        const sessionRes = await fetch("/api/auth/get-session", {
          credentials: "include",
          headers: getAuthHeaders()
        });

        if (!sessionRes.ok || sessionRes.status === 401) {
          navigate("/login");
          return;
        }

        const sessionData = await sessionRes.json();
        if (!sessionData?.user) {
          navigate("/login");
          return;
        }

        // Redirect if not guest
        const role = sessionData.user.role;
        if (role && role !== "guest") {
          if (role === "admin") navigate("/admin");
          else if (role === "lecturer") navigate("/lecturer");
          else if (role === "student") navigate("/mahasiswa");
          return;
        }

        setUserData(sessionData.user);

        // 2. Get lock status
        const lockRes = await fetch("/admissiondata/locked", {
          credentials: "include",
          headers: getAuthHeaders()
        });

        if (lockRes.ok) {
          const lockData = await lockRes.json();
          const locked = typeof lockData === "boolean" ? lockData : Boolean(
            lockData === true ||
            lockData.isLocked === true ||
            lockData.isPersonalDataLocked === true || 
            lockData.locked === true || 
            lockData.data?.isLocked === true ||
            lockData.data?.isPersonalDataLocked === true || 
            lockData.data?.locked === true ||
            lockData.status === "LOCKED" ||
            lockData.data === true
          );
          setIsLocked(locked);
        }
      } catch (error) {
        logger.error("Error fetching guest dashboard status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndLockStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-gray-50">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Memuat dashboard pendaftaran...</span>
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      menuTemplate="admisi"
      sidebarTitle="Admisi UGN"
      title="Dashboard Calon Mahasiswa"
      subtitle={`Selamat datang di Portal Admisi UGN, ${userData?.name || userData?.email || 'Calon Mahasiswa'}!`}
    >
      <div className="space-y-6">
        {/* Status Alerts */}
        {!isLocked ? (
          <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm shadow-sm">
            <ShieldAlert className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <h4 className="font-bold mb-1">Data Pribadi Belum Dikunci</h4>
              <p className="leading-relaxed">
                Anda wajib mengisi dan melakukan **Kunci Data Permanen** pada tab <strong>Data Diri</strong> terlebih dahulu sebelum diperbolehkan mendaftar ke jalur program studi yang dibuka.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm shadow-sm">
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
            <div>
              <h4 className="font-bold mb-1">Data Pribadi Berhasil Dikunci</h4>
              <p className="leading-relaxed">
                Data diri Anda telah dikunci dan siap untuk proses pendaftaran program studi. Silakan lanjutkan ke menu <strong>Pendaftaran</strong> untuk memilih program studi pilihan Anda.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard Grid Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Data Diri */}
          <Card className="shadow-sm border rounded-lg bg-white flex flex-col justify-between hover:shadow-md transition">
            <div>
              <CardHeader className="border-b bg-muted/10 pb-4">
                <CardTitle className="text-lg flex items-center justify-between font-serif text-primary">
                  <span className="flex items-center gap-2">
                    <User className="h-5 w-5" /> Data Diri
                  </span>
                  <Badge 
                    className={
                      isLocked 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-amber-100 text-amber-700 border border-amber-200"
                    }
                  >
                    {isLocked ? "Terkunci" : "Draf"}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Informasi biodata, kontak darurat, dan dokumen kelengkapan Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 text-sm text-gray-600 leading-relaxed">
                {isLocked ? (
                  <div className="flex items-center gap-2 text-green-700 font-medium">
                    <Lock className="h-4 w-4" /> Data pribadi Anda sudah terkunci dan aman.
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-700 font-medium">
                    <Unlock className="h-4 w-4" /> Lengkapi biodata Anda dan lakukan penguncian data secara permanen.
                  </div>
                )}
              </CardContent>
            </div>
            <div className="p-5 border-t bg-muted/5 flex justify-end">
              <Button asChild className="w-full sm:w-auto">
                <Link to="/data-diri" className="flex items-center gap-1.5 justify-center">
                  Kelola Data Diri <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>

          {/* Card Pendaftaran */}
          <Card className="shadow-sm border rounded-lg bg-white flex flex-col justify-between hover:shadow-md transition">
            <div>
              <CardHeader className="border-b bg-muted/10 pb-4">
                <CardTitle className="text-lg flex items-center justify-between font-serif text-primary">
                  <span className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" /> Pendaftaran Program Studi
                  </span>
                  <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
                    Aktif
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Pilih jalur pendaftaran sarjana, pascasarjana, maupun vokasi di Universitas Global Nusantara.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 text-sm text-gray-600 leading-relaxed">
                {!isLocked ? (
                  <p className="text-red-600 font-medium flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 flex-shrink-0" /> Harap selesaikan dan kunci data diri terlebih dahulu.
                  </p>
                ) : (
                  <p className="text-green-700 font-medium flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" /> Jalur pendaftaran terbuka. Anda dapat memilih program studi sekarang.
                  </p>
                )}
              </CardContent>
            </div>
            <div className="p-5 border-t bg-muted/5 flex justify-end">
              <Button asChild disabled={!isLocked} className="w-full sm:w-auto">
                <Link to="/pendaftaran" className="flex items-center gap-1.5 justify-center">
                  Buka Pendaftaran <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* Alur Proses Stepper Card */}
        <Card className="shadow-sm border rounded-lg bg-white">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 font-serif text-primary">
              <ClipboardList className="h-5 w-5" /> Alur Tahapan Pendaftaran Admisi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative border-l-2 border-gray-200 border-dashed space-y-6 ml-3">
              {/* Step 1 */}
              <div className="relative pl-6">
                <div className={`absolute -left-[14px] top-1 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                  isLocked ? "bg-green-600" : "bg-primary animate-pulse"
                }`}>
                  1
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    Lengkapi Data Diri & Dokumen
                    {isLocked && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none scale-90">Selesai</Badge>}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Isi data pribadi, data kontak, pas foto, serta unggah dokumen wajib (KTP & KK).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative pl-6">
                <div className={`absolute -left-[14px] top-1 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                  isLocked ? "bg-green-600" : "bg-gray-400"
                }`}>
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    Kunci Data Permanen
                    {isLocked && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none scale-90">Selesai</Badge>}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kunci data Anda secara permanen untuk memvalidasi kelayakan pendaftaran program studi.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative pl-6">
                <div className={`absolute -left-[14px] top-1 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                  isLocked ? "bg-primary animate-pulse" : "bg-gray-400"
                }`}>
                  3
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">
                    Pilih Jalur & Program Studi
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pilih program studi yang Anda minati di menu Pendaftaran dan cetak tagihan pendaftaran Anda.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative pl-6">
                <div className="absolute -left-[14px] top-1 flex items-center justify-center w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">
                    Pembayaran & Sesi CBT (Ujian)
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lakukan pembayaran biaya pendaftaran, pilih sesi ujian berbasis komputer (CBT), dan cetak kartu ujian resmi Anda.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
