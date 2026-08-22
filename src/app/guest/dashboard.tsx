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
  ClipboardList,
  FileText,
  Upload,
  CreditCard,
  Printer,
  Bell,
  Monitor,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
const API_BASE = import.meta.env.VITE_PUBLIC_API_URL ?? "";

interface UserSession {
  email: string;
  role?: string;
  name?: string;
}

interface StepInfo {
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

export default function GuestDashboardPage() {
  const [userData, setUserData] = useState<UserSession | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Step completion states
  const [filled, setFilled] = useState<{ dataDiri: boolean; program: boolean; upload: boolean }>({
    dataDiri: false,
    program: false,
    upload: false,
  });
  const [billStatus, setBillStatus] = useState<{ hasBill: boolean; isVerified: boolean }>({
    hasBill: false,
    isVerified: false,
  });
  const [cbtAssigned, setCbtAssigned] = useState(false);
  const [proofPrinted, setProofPrinted] = useState(false);
  const [cardPrinted, setCardPrinted] = useState(false);
  const [hasSelectedPath, setHasSelectedPath] = useState(false);

  const token = localStorage.getItem("token");

  const getAuthHeaders = (): HeadersInit => {
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchSessionAndAllStatus = async () => {
      try {
        setLoading(true);
        // 1. Get user session
        const sessionRes = await fetch(`${API_BASE}/api/auth/get-session`, {
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
        const lockRes = await fetch(`${API_BASE}/admissiondata/locked`, {
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

        // 3. Fetch admission data sections for step completion
        const hasVal = (o: Record<string, unknown>) => Object.values(o).some((v) => v !== null && v !== undefined && v !== "");

        try {
          const [res1, res2, res3] = await Promise.all([
            fetch(`${API_BASE}/admissiondata/1`, { headers: getAuthHeaders(), credentials: "include" }),
            fetch(`${API_BASE}/admissiondata/2`, { headers: getAuthHeaders(), credentials: "include" }),
            fetch(`${API_BASE}/admissiondata/3`, { headers: getAuthHeaders(), credentials: "include" }),
          ]);

          const d1 = res1.ok ? ((await res1.json()).data ?? {}) : {};
          const d2 = res2.ok ? ((await res2.json()).data ?? {}) : {};
          const d3 = res3.ok ? ((await res3.json()).data ?? {}) : {};

          setFilled({
            dataDiri: Boolean(d1.fullName && d1.nik) && hasVal(d2),
            program: Boolean(d2.programChoice1Faculty && d2.programChoice1Major),
            upload: Boolean(d3.photo_url || d3.raport_url || d3.kk_url || d3.ijazah_url),
          });
        } catch (err) {
          logger.error("Error fetching admission data sections:", err);
        }

        // 4. Fetch bill status
        try {
          const billRes = await fetch(`${API_BASE}/user/bill/status`, {
            headers: getAuthHeaders(),
            credentials: "include",
          });
          if (billRes.ok) {
            const billData = await billRes.json();
            setBillStatus({
              hasBill: billData.data?.hasBill || false,
              isVerified: billData.data?.isVerified || false,
            });
          }
        } catch (err) {
          logger.error("Error fetching bill status:", err);
        }

        // 5. Fetch selected path status
        try {
          const selectedRes = await fetch(`${API_BASE}/admission-paths/selected`, {
            headers: getAuthHeaders(),
            credentials: "include",
          });
          if (selectedRes.ok) {
            const selectedData = await selectedRes.json();
            setHasSelectedPath(Boolean(selectedData?.data?.id || selectedData?.id || selectedData?.data?.admissionPathId));
          }
        } catch (err) {
          logger.error("Error fetching selected path:", err);
        }

        // 6. Check localStorage for CBT, print statuses
        const rawCbt = localStorage.getItem("cbt_session") || localStorage.getItem("cbt_confirmed");
        setCbtAssigned(Boolean(rawCbt));
        setProofPrinted(localStorage.getItem("proof_printed") === "true");
        setCardPrinted(localStorage.getItem("card_printed") === "true");

      } catch (error) {
        logger.error("Error fetching guest dashboard status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndAllStatus();
  }, [navigate]);

  // Build 10 steps with real completion data
  const steps: StepInfo[] = [
    {
      title: "Lengkapi Data Diri & Dokumen",
      description: "Isi data pribadi, data kontak, pas foto, serta unggah dokumen wajib (KTP & KK).",
      icon: FileText,
      completed: filled.dataDiri,
    },
    {
      title: "Kunci Data Permanen",
      description: "Kunci data Anda secara permanen untuk memvalidasi kelayakan pendaftaran program studi.",
      icon: Lock,
      completed: isLocked,
    },
    {
      title: "Pilih Jalur & Program Studi",
      description: "Pilih program studi yang Anda minati di menu Pendaftaran.",
      icon: GraduationCap,
      completed: hasSelectedPath || filled.program,
    },
    {
      title: "Buat Tagihan (Billing)",
      description: "Generate tagihan biaya pendaftaran Anda.",
      icon: CreditCard,
      completed: billStatus.hasBill,
    },
    {
      title: "Pembayaran Pendaftaran",
      description: "Lakukan pembayaran biaya pendaftaran.",
      icon: CreditCard,
      completed: billStatus.isVerified,
    },
    {
      title: "Upload Dokumen Pendaftaran",
      description: "Unggah berkas yang diperlukan untuk pendaftaran.",
      icon: Upload,
      completed: filled.upload,
    },
    {
      title: "Penetapan Sesi CBT",
      description: "Pilih atau terima sesi ujian berbasis komputer (CBT) dari panitia.",
      icon: Monitor,
      completed: cbtAssigned,
    },
    {
      title: "Cetak Bukti Peserta",
      description: "Cetak bukti pendaftaran resmi Anda.",
      icon: Printer,
      completed: proofPrinted,
    },
    {
      title: "Cetak Kartu Ujian",
      description: "Cetak kartu ujian resmi untuk hari pelaksanaan.",
      icon: Printer,
      completed: cardPrinted,
    },
    {
      title: "Pengumuman Hasil",
      description: "Lihat hasil seleksi pendaftaran Anda.",
      icon: Bell,
      completed: false, // Always pending until admin announces
    },
  ];

  // Determine the current active step (first incomplete step)
  const currentStepIndex = steps.findIndex(s => !s.completed);
  const completedSteps = steps.filter(s => s.completed).length;

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
              <h4 className="font-bold mb-1">Data Diri Belum Dikunci</h4>
              <p className="leading-relaxed">
                Anda wajib mengisi dan melakukan **Kunci Data Permanen** pada tab <strong>Data Diri</strong> terlebih dahulu sebelum diperbolehkan mendaftar ke jalur program studi yang dibuka.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm shadow-sm">
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
            <div>
              <h4 className="font-bold mb-1">Data Diri Berhasil Dikunci</h4>
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
                    <Lock className="h-4 w-4" /> Data Diri Anda sudah terkunci dan aman.
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

        {/* Alur Proses Stepper Card — now synced with real data */}
        <Card className="shadow-sm border rounded-lg bg-white">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 font-serif text-primary">
              <ClipboardList className="h-5 w-5" /> Alur Tahapan Pendaftaran Admisi
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {completedSteps} dari {steps.length} tahap selesai
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative border-l-2 border-gray-200 border-dashed space-y-6 ml-3">
              {steps.map((step, index) => {
                const isCompleted = step.completed;
                const isCurrent = index === currentStepIndex;
                const isFuture = !isCompleted && !isCurrent;
                const StepIcon = step.icon;

                return (
                  <div key={index} className="relative pl-6">
                    <div className={`absolute -left-[14px] top-1 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                      isCompleted ? "bg-green-600" : isCurrent ? "bg-primary animate-pulse" : "bg-gray-400"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                        {step.title}
                        {isCompleted && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none scale-90">Selesai</Badge>}
                        {isCurrent && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none scale-90">Sedang Berlangsung</Badge>}
                      </h4>
                      <p className={`text-xs mt-1 ${isFuture ? 'text-gray-400' : 'text-muted-foreground'}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

