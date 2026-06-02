import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SidebarItem } from "@/components/ui/app-sidebar";
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  CalendarDays, 
  GraduationCap, 
  Activity,
  FileText,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

interface UserData {
  email: string;
  role?: string;
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const response = await fetch("/auth/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
          }
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setUserData(data.user || { email: "Unknown", role: "guest" });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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

  const role = userData?.role || "student";

  // Define sidebar items based on role
  let sidebarItems: SidebarItem[] = [];
  if (role === "admin") {
    sidebarItems = [
      { label: "Dashboard", to: "/dashboard", icon: <Activity className="h-4 w-4" /> },
      { label: "Manajemen Pendaftaran", to: "/admin/pendaftaran", icon: <FileText className="h-4 w-4" /> },
      { label: "Pengaturan Sistem", to: "/admin/settings", icon: <Activity className="h-4 w-4" /> },
    ];
  } else if (role === "lecturer") {
    sidebarItems = [
      { label: "Dashboard", to: "/dashboard", icon: <Activity className="h-4 w-4" /> },
      { label: "Jadwal Mengajar", to: "#", icon: <CalendarDays className="h-4 w-4" /> },
      { label: "Penilaian", to: "#", icon: <CheckCircle className="h-4 w-4" /> },
    ];
  } else {
    // Default to student
    sidebarItems = [
      { label: "Dashboard", to: "/dashboard", icon: <Activity className="h-4 w-4" /> },
      { label: "Pendaftaran", to: "/pendaftaran", icon: <GraduationCap className="h-4 w-4" /> },
      { label: "Data Diri", to: "/data-diri", icon: <Users className="h-4 w-4" /> },
    ];
  }

  return (
    <AppLayout
      sidebarItems={sidebarItems}
      sidebarTitle="SIA Dashboard"
      title="Dashboard"
      subtitle={`Selamat datang kembali, ${userData?.email || 'Pengguna'}!`}
    >
      {role === "admin" && <AdminDashboard />}
      {role === "lecturer" && <LecturerDashboard />}
      {(role === "student" || role === "guest") && <StudentDashboard />}
    </AppLayout>
  );
}

// --- Role Specific Dashboard Widgets ---

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Pengguna" value="1,234" icon={<Users className="h-6 w-6 text-blue-500" />} />
        <StatCard title="Pendaftaran Baru" value="56" icon={<FileText className="h-6 w-6 text-green-500" />} />
        <StatCard title="Status Sistem" value="Sehat" icon={<Activity className="h-6 w-6 text-indigo-500" />} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5" /> Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Tidak ada aktivitas terbaru.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function LecturerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Kelas Aktif" value="4" icon={<BookOpen className="h-6 w-6 text-blue-500" />} />
        <StatCard title="Tugas Belum Dinilai" value="12" icon={<CheckCircle className="h-6 w-6 text-orange-500" />} />
        <StatCard title="Total Mahasiswa" value="120" icon={<Users className="h-6 w-6 text-green-500" />} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Jadwal Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Tidak ada jadwal kelas hari ini.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Status Pendaftaran" value="Aktif" icon={<GraduationCap className="h-6 w-6 text-green-500" />} />
        <StatCard title="Mata Kuliah" value="6" icon={<BookOpen className="h-6 w-6 text-blue-500" />} />
        <StatCard title="Tugas Mendatang" value="2" icon={<Clock className="h-6 w-6 text-orange-500" />} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" /> Akses Cepat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
             <Link to="/pendaftaran" className="text-sm text-blue-600 hover:underline">Lanjutkan Pendaftaran</Link>
             <Link to="/data-diri" className="text-sm text-blue-600 hover:underline">Perbarui Data Diri</Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Pengumuman</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Belum ada pengumuman baru.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Common Components ---

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <Card className="shadow-sm border">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3 bg-muted/50 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
