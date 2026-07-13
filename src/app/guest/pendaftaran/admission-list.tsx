import {
  ArrowRight,
  CalendarDays,
  Lock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/ui/app-layout";
import React from "react";

// Definisikan tipe data untuk jalur pendaftaran (sesuai respons API)
// Menambahkan properti yang dibutuhkan di halaman detail, meskipun tidak lengkap dari API list
interface AdmissionPath {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  // Properti tambahan yang akan dimock atau diisi di DetailPendaftaranPage
  programType?: string; 
  faculty?: string;
  enrollmentFee?: number;
}

// --- Sub-Komponen ---

const NotLockedAlert: React.FC = () => (
  <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-4 rounded-md flex items-start gap-3">
    <Lock className="h-5 w-5 mt-0.5 flex-shrink-0 text-yellow-600" />
    <div>
      <p className="font-medium">
        Data pribadi Anda belum dikunci.
      </p>
      <p className="text-sm">
        Harap lakukan <strong>Kunci Data Permanen</strong> di halaman{" "}
        <Link
          to="/data-diri"
          className="underline text-blue-600 hover:text-blue-800 font-medium"
        >
          Data Diri
        </Link>{" "}
        sebelum melakukan pendaftaran.
      </p>
    </div>
  </div>
);

// --- Menggunakan data API untuk Program yang Sedang Dibuka ---
const EnrollmentContent: React.FC<{ activePaths: AdmissionPath[] }> = ({
  activePaths,
}) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <>
      <Card className="shadow-sm border rounded-lg p-6">
        <h1 className="text-xl font-bold flex items-center gap-2 mb-4">
          <CalendarDays className="h-6 w-6 text-primary" /> Program yang Sedang Dibuka
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="p-3 font-semibold">Jalur Pendaftaran</th>
                <th className="p-3 font-semibold">Deskripsi</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Batas Pendaftaran</th>
                <th className="p-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {activePaths.length > 0 ? (
                activePaths.map((path) => (
                  <tr
                    key={path.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium">{path.name}</td>
                    <td className="p-3 text-muted-foreground">
                      {path.description}
                    </td>
                    <td className="p-3">
                      <Badge className="bg-green-600 text-white">
                        Sedang Dibuka
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      Hingga {formatDate(path.endDate)}
                    </td>
                    <td className="p-3 text-right">
                      <Button size="sm" asChild>
                        {/* 💡 Perbaikan: Menggunakan /detail-pendaftaran/:id DAN Meneruskan state */}
                        <Link 
                            to={`/pendaftaran/detail-pendaftaran/${path.id}`}
                            state={{ pathDetail: path }}
                        >
                          Daftar
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    Tidak ada jalur pendaftaran yang sedang dibuka saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

// --- Komponen Utama AdmissionsPage ---

export function AdmissionsPage() {
  const [locked, setLocked] = useState<boolean | null>(null);
  const [activePaths, setActivePaths] = useState<AdmissionPath[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const authHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const fetchLockStatus = async () => {
      const res = await fetch(`${API_URL}/admissiondata/locked`, {
        method: "GET",
        headers: authHeaders,
      });

      if (res.status === 401) {
        throw new Error("unauthorized");
      }

      if (!res.ok) {
        console.warn("⚠️ Gagal mengambil data lock dari API.", res.status);
        return false;
      }

      const data = await res.json();
      return typeof data === "boolean" ? data : Boolean(
        data === true ||
        data?.isLocked === true ||
        data?.isPersonalDataLocked === true || 
        data?.locked === true || 
        data?.data?.isLocked === true ||
        data?.data?.isPersonalDataLocked === true || 
        data?.data?.locked === true ||
        data?.status === "LOCKED" ||
        data?.data === true
      );
    };

    const fetchActivePaths = async () => {
      const res = await fetch(`${API_URL}/admission-paths/active`, {
        method: "GET",
        headers: { accept: "application/json" },
      });

      if (!res.ok) {
        console.warn(
          "⚠️ Gagal mengambil jalur pendaftaran aktif.",
          res.status
        );
        return [];
      }

      const data: AdmissionPath[] = await res.json();
      // Tambahkan data mock default yang dibutuhkan DetailPendaftaranPage jika API list tidak menyediakannya
      return data.map(path => ({
          ...path,
          programType: path.programType || "Sarjana", 
          faculty: path.faculty || "Fakultas Umum",
          enrollmentFee: path.enrollmentFee || 350000 
      }));
    };

    const loadData = async () => {
      try {
        setLoading(true);

        const [isLocked, paths] = await Promise.all([
          fetchLockStatus(),
          fetchActivePaths(),
        ]);

        setLocked(isLocked);
        setActivePaths(paths);
      } catch (err) {
        if ((err as Error).message === "unauthorized") {
          console.warn("🚫 Token tidak valid atau expired, redirect ke login...");
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        console.error("❌ Gagal memuat data pendaftaran:", err);
        setLocked(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [API_URL, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      menuTemplate="admisi"
      title="Daftar Pendaftaran"
      subtitle="Kelola riwayat dan lihat program pendaftaran yang sedang dibuka."
    >
      {/* Conditional Rendering Logic */}
      {locked ? (
        <EnrollmentContent activePaths={activePaths} />
      ) : (
        <NotLockedAlert />
      )}
    </AppLayout>
  );
}