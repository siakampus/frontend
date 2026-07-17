import React, { useEffect, useState } from "react";
import { logger } from "@/lib/logger"
import { AppLayout } from "@/components/ui/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  GraduationCap,
  Clock,
  FileText,
  CalendarDays,
  User
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { coursesApi } from "@/lib/api";

interface UserData {
  email: string;
  role?: string;
  name?: string;
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseCount, setCourseCount] = useState<number | string>("—");
  const [assignmentCount] = useState<number | string>("—");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem("token");
        const sessionRes = await fetch("/api/auth/get-session", {
          credentials: "include",
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
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

        // Ensure student role
        if (sessionData.user.role && sessionData.user.role !== "student" && sessionData.user.role !== "guest") {
          // Redirect to correct dashboard based on role
          if (sessionData.user.role === "admin") navigate("/admin");
          if (sessionData.user.role === "lecturer") navigate("/lecturer");
        }

        setUserData(sessionData.user);
      } catch (error) {
        logger.error("Error fetching session:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [navigate]);

  useEffect(() => {
    // Fetch course count for student stat cards
    coursesApi.getMyCourses().then((res) => {
      if (res.ok && res.data) {
        const body = res.data as { data?: unknown[]; total?: number };
        setCourseCount(body.total ?? (body.data?.length ?? "—"));
      }
    }).catch(() => { });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-gray-50">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Memuat dashboard...</span>
        </div>
      </div>
    );
  }

  const isStudent = userData?.role === "student";

  return (
    <AppLayout
      menuTemplate={isStudent ? "student" : "admisi"}
      sidebarTitle="SIA Dashboard"
      title={isStudent ? "Dashboard Mahasiswa" : "Dashboard Calon Mahasiswa"}
      subtitle={
        isStudent
          ? `Selamat datang kembali, ${userData?.name || userData?.email || 'Mahasiswa'}!`
          : `Selamat datang kembali, ${userData?.name || userData?.email || 'Calon Mahasiswa'}! Silakan lengkapi pendaftaran Anda.`
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Status Akademik" value={isStudent ? "Aktif" : "Calon Mahasiswa"} icon={<GraduationCap className="h-6 w-6 text-primary" />} />
          <StatCard title="Mata Kuliah Diambil" value={courseCount} icon={<BookOpen className="h-6 w-6 text-primary" />} />
          <StatCard title="Tugas Mendatang" value={assignmentCount} icon={<Clock className="h-6 w-6 text-primary" />} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm border rounded-lg">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 font-serif text-primary">
                <FileText className="h-5 w-5" /> Akses Cepat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-3">
              {isStudent ? (
                <>
                  <Link to="/courses" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Lihat Daftar Mata Kuliah (Course)
                  </Link>
                  <Link to="/profile" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2">
                    <User className="h-4 w-4" /> Lihat & Edit Profil (Profile)
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/pendaftaran" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" /> Lanjutkan Pendaftaran Mahasiswa Baru
                  </Link>
                  <Link to="/data-diri" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Perbarui Data Diri / Dokumen
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border rounded-lg">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 font-serif text-primary">
                <CalendarDays className="h-5 w-5" /> Pengumuman
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="rounded-md bg-blue-50 p-4 border border-blue-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Tidak ada pengumuman</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Saat ini belum ada pengumuman baru dari akademik.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <Card className="shadow-sm border rounded-lg overflow-hidden">
      <CardContent className="p-6 flex items-center gap-4 bg-white hover:bg-muted/10 transition-colors">
        <div className="p-3 bg-primary/10 rounded-full">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold font-serif text-gray-900">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
