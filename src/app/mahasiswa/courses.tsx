"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Search, 
  ArrowLeft,
  Calendar,
  AlertCircle,
  FileText,
  User,
  GraduationCap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Course {
  id: number;
  title: string;
  description: string | null;
  classId: number;
  createdAt: string;
  updatedAt: string;
  class?: {
    id: number;
    name: string;
  };
  creator?: {
    id: number;
    email: string;
  };
  _count?: {
    assignments: number;
  };
}

export default function CoursesPage() {
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const getAuthHeaders = () => {
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Coba ambil mata kuliah mahasiswa
      const myRes = await fetch("/courses/student/my-courses", {
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (myRes.ok) {
        const json = await myRes.json();
        if (json.success && Array.isArray(json.data)) {
          setMyCourses(json.data);
          setIsDemoMode(false);
          setLoading(false);
          return;
        }
      }

      // Jika gagal atau student record not found, fetch seluruh courses sebagai fallback
      setIsDemoMode(true);
      const allRes = await fetch("/courses", {
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (allRes.ok) {
        const json = await allRes.json();
        if (json.success && Array.isArray(json.data)) {
          setAllCourses(json.data);
        }
      } else {
        if (allRes.status === 401) {
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Error fetching courses data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const displayedCourses = isDemoMode ? allCourses : myCourses;

  const filteredCourses = displayedCourses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (course.class?.name && course.class.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-gray-50">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Memuat mata kuliah...</span>
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      menuTemplate="student"
      sidebarTitle="SIA Dashboard"
      title="Daftar Mata Kuliah"
      subtitle="Kelola dan pantau seluruh kelas akademik serta materi kuliah Anda"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Tombol kembali */}
        <Button 
          variant="outline" 
          onClick={() => navigate("/dashboard")} 
          className="flex items-center gap-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Button>

        {/* Banner Informasional jika Demo/Fallback mode */}
        {isDemoMode && (
          <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm shadow-sm animate-fade-in">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <h4 className="font-bold mb-1">Status Akun Belum Dikaitkan</h4>
              <p className="leading-relaxed">
                Akun pengguna Anda belum memiliki Rekam Mahasiswa Aktif. Kami menampilkan daftar seluruh mata kuliah yang tersedia di program studi Universitas Global Nusantara sebagai referensi Anda.
              </p>
            </div>
          </div>
        )}

        {/* Pencarian dan Filter */}
        <div className="flex items-center gap-3 bg-white p-4 border rounded-lg shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari mata kuliah atau nama kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>

        {/* Grid List Mata Kuliah */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card 
                key={course.id} 
                className="shadow-sm border rounded-lg overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-primary/30 transition-all bg-white group"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <Badge className="bg-primary/10 text-primary border-none text-[10px] px-2 py-0.5 tracking-wide uppercase font-semibold">
                      Kelas: {course.class?.name || "Umum"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      ID: {course.id}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                      {course.description || "Tidak ada deskripsi detail untuk mata kuliah ini."}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-4 border-t bg-muted/5 flex items-center justify-between text-xs text-muted-foreground mt-auto">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {course._count?.assignments ?? 0} Tugas
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(course.updatedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short"
                    })}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-sm border rounded-lg bg-white p-12 text-center">
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-muted rounded-full">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-gray-900">Mata Kuliah Tidak Ditemukan</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Tidak ada mata kuliah yang cocok dengan kata kunci pencarian Anda. Coba kata kunci lainnya.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
