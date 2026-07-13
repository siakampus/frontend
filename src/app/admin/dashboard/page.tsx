import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  FileText,
  Activity,
  CreditCard,
  Settings
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { adminUsersApi, adminRegistrationsApi, adminPaymentsApi } from "@/lib/api";

interface UserData {
  email: string;
  role?: string;
  name?: string;
}

export default function AdminDashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalRegistrants, setTotalRegistrants] = useState<number | string>("—");
  const [totalUsers, setTotalUsers] = useState<number | string>("—");
  const [totalPayments, setTotalPayments] = useState<number | string>("—");
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
        
        // Ensure admin role
        if (sessionData.user.role !== "admin") {
           // Redirect to correct dashboard based on role
           if (sessionData.user.role === "student" || sessionData.user.role === "guest") navigate("/dashboard");
           if (sessionData.user.role === "lecturer") navigate("/lecturer");
           return;
        }

        setUserData(sessionData.user);
      } catch (error) {
        console.error("Error fetching session:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [navigate]);

  useEffect(() => {
    // Fetch real counts for stat cards
    adminRegistrationsApi.list({ take: 1 } as Record<string, unknown>).then((res) => {
      if (res.ok && res.data) {
        const body = res.data as { total?: number; data?: unknown[] };
        setTotalRegistrants(body.total ?? (body.data?.length ?? "—"));
      }
    }).catch(() => {});

    adminUsersApi.list({ take: 1 }).then((res) => {
      if (res.ok && res.data) {
        const body = res.data as { total?: number; data?: unknown[] };
        setTotalUsers(body.total ?? (body.data?.length ?? "—"));
      }
    }).catch(() => {});

    adminPaymentsApi.list().then((res) => {
      if (res.ok && res.data) {
        const body = res.data as { total?: number; data?: unknown[] };
        setTotalPayments(body.total ?? (body.data?.length ?? "—"));
      }
    }).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Memuat dashboard admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-serif text-gray-900">Dashboard Admin</h2>
        <p className="text-muted-foreground">Selamat datang di panel administrasi, {userData?.name || userData?.email || 'Admin'}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Pendaftar" value={totalRegistrants} icon={<Users className="h-6 w-6 text-blue-500" />} />
        <StatCard title="Total Pengguna" value={totalUsers} icon={<FileText className="h-6 w-6 text-orange-500" />} />
        <StatCard title="Pembayaran" value={totalPayments} icon={<CreditCard className="h-6 w-6 text-green-500" />} />
        <StatCard title="Status Sistem" value="Sehat" icon={<Activity className="h-6 w-6 text-indigo-500" />} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border rounded-lg">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 font-serif text-primary">
              <Settings className="h-5 w-5" /> Manajemen Sistem
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-3">
             <Link to="/admin/pendaftaran" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2">
               <FileText className="h-4 w-4"/> Kelola Data Pendaftaran
             </Link>
             <Link to="/admin/programs" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2">
               <Users className="h-4 w-4"/> Kelola Program Studi
             </Link>
             <Link to="/admin/settings" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2">
               <Settings className="h-4 w-4"/> Pengaturan Platform
             </Link>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border rounded-lg">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 font-serif text-primary">
              <Activity className="h-5 w-5" /> Log Aktivitas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="rounded-md bg-gray-50 p-4 border border-gray-100">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-800">Sistem Berjalan Normal</h3>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Semua layanan berfungsi dengan baik. Belum ada aktivitas krusial hari ini.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <Card className="shadow-sm border rounded-lg overflow-hidden">
      <CardContent className="p-6 flex items-center gap-4 bg-white hover:bg-muted/10 transition-colors">
        <div className="p-3 bg-gray-100 rounded-full">
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
