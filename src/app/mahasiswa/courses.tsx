"use client";

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger"
import { chatApi, chatApiAdditions } from "@/lib/api";

const API_BASE = import.meta.env.VITE_PUBLIC_API_URL ?? "";
import { AppLayout } from "@/components/ui/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Search,
  ArrowLeft,
  Calendar,
  AlertCircle,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CourseUser {
  id: number;
  email: string;
  fullName?: string;
}

interface CourseLecturer {
  lecturer: {
    fullName?: string;
    user?: CourseUser;
  };
}

interface CourseStudent {
  student: {
    nim?: string;
    studentDataId?: string;
    user?: CourseUser;
  };
}

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
    lecturers?: CourseLecturer[];
    students?: CourseStudent[];
  };
  creator?: CourseUser;
  _count?: {
    assignments: number;
  };
}

interface CourseDetail extends Course {
  class: {
    id: number;
    name: string;
    lecturers: CourseLecturer[];
    students: CourseStudent[];
  };
}

interface CourseAssignment {
  id: number;
  title: string;
  description?: string;
  dueDate?: string | null;
}

function getLecturerName(course: Course | CourseDetail | null): string {
  const lecturers = course?.class?.lecturers ?? [];
  if (lecturers.length > 0) {
    const lecturer = lecturers[0].lecturer;
    return (
      lecturer?.user?.fullName ??
      lecturer?.fullName ??
      lecturer?.user?.email ??
      "Tanpa Nama"
    );
  }

  return course?.creator?.email ?? "Tanpa Nama";
}

export default function CoursesPage() {
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<CourseDetail | null>(null);
  const [courseAssignments, setCourseAssignments] = useState<CourseAssignment[]>([]);
  const [courseMaterials, setCourseMaterials] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [materialSummaries, setMaterialSummaries] = useState<
    Record<
      number,
      {
        loading: boolean;
        text: string | null;
        expanded: boolean;
        cached: boolean;
        docInfo: {
          fileType: string;
          pageCount: number;
          textLength: number;
          truncated: boolean;
        } | null;
      }
    >
  >({});
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const getAuthHeaders = (): Record<string, string> => {
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Coba ambil mata kuliah mahasiswa
      const myRes = await fetch(`${API_BASE}/courses/student/my-courses`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (myRes.status === 401) {
        navigate("/login");
        return;
      }

      if (myRes.ok) {
        const json = await myRes.json();
        if (json.success && Array.isArray(json.data)) {
          setMyCourses(json.data);
          setIsDemoMode(false);
          return;
        }
      }

      // Demo fallback only when the student record is missing (e.g. calon_mahasiswa)
      if (myRes.status === 404) {
        setIsDemoMode(true);
        const allRes = await fetch(`${API_BASE}/courses`, {
          credentials: "include",
          headers: getAuthHeaders(),
        });

        if (allRes.status === 401) {
          navigate("/login");
          return;
        }

        if (allRes.ok) {
          const json = await allRes.json();
          if (json.success && Array.isArray(json.data)) {
            setAllCourses(json.data);
          }
        }
        return;
      }

      logger.error("Failed to fetch enrolled courses:", myRes.status);
    } catch (error) {
      logger.error("Error fetching courses data:", error);
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

  const handleSelectCourse = async (course: Course) => {
    setSelectedCourse(course);
    setLoadingDetails(true);
    setSelectedCourseDetail(null);
    setCourseAssignments([]);
    setCourseMaterials([]);
    setMaterialSummaries({});
    try {
      const [courseRes, assigRes, materiRes] = await Promise.all([
        fetch(`/courses/${course.id}`, {
          credentials: "include",
          headers: getAuthHeaders(),
        }),
        fetch(`/assignments/course/${course.id}`, {
          credentials: "include",
          headers: getAuthHeaders(),
        }),
        fetch(`/materials/course/${course.id}`, {
          credentials: "include",
          headers: getAuthHeaders(),
        }),
      ]);
      if (courseRes.ok) {
        const json = await courseRes.json();
        if (json.success && json.data) {
          setSelectedCourseDetail(json.data);
        }
      }
      if (assigRes.ok) {
        const json = await assigRes.json();
        setCourseAssignments(Array.isArray(json.data) ? json.data : []);
      }
      if (materiRes.ok) {
        const json = await materiRes.json();
        setCourseMaterials(Array.isArray(json.data) ? json.data : []);
      }
    } catch (err) {
      console.error("Failed to fetch course details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const summarizeMaterial = async (material: any, refresh = false) => {
    const id: number = material.id;

    // Toggle collapse if already summarized and this isn't a forced regenerate
    if (!refresh && materialSummaries[id]?.text) {
      setMaterialSummaries((prev) => ({
        ...prev,
        [id]: { ...prev[id], expanded: !prev[id].expanded },
      }));
      return;
    }

    setMaterialSummaries((prev) => ({
      ...prev,
      [id]: {
        loading: true,
        // Keep showing the previous summary while a regenerate is in flight
        text: refresh ? prev[id]?.text ?? null : null,
        expanded: true,
        cached: prev[id]?.cached ?? false,
        docInfo: prev[id]?.docInfo ?? null,
      },
    }));

    try {
      // Backend: POST /api/chat/summarize-material/:materialId { refresh }
      const res = await chatApiAdditions.summarizeMaterial(id, refresh);

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      const body = res.data as {
        success?: boolean;
        data?: {
          summary: string;
          cached: boolean;
          documentInfo?: {
            fileType: string;
            pageCount: number;
            textLength: number;
            truncated: boolean;
          };
        };
        message?: string;
      };

      if (!res.ok) {
        throw new Error(body?.message || `Error ${res.status}`);
      }

      if (!body.data?.summary) {
        throw new Error(body.message || "AI tidak memberikan ringkasan.");
      }

      setMaterialSummaries((prev) => ({
        ...prev,
        [id]: {
          loading: false,
          text: body.data!.summary,
          expanded: true,
          cached: !!body.data!.cached,
          docInfo: body.data!.documentInfo ?? null,
        },
      }));
    } catch (err) {
      logger.error("Summarize material error:", err);
      setMaterialSummaries((prev) => ({
        ...prev,
        [id]: {
          loading: false,
          text: "Terjadi kesalahan saat mengambil ringkasan AI dari dokumen materi.",
          expanded: true,
          cached: false,
          docInfo: null,
        },
      }));
    }
  };

  if (selectedCourse) {
    const participants = selectedCourseDetail?.class?.students ?? [];
    const dosenLabel = getLecturerName(selectedCourseDetail ?? selectedCourse);

    return (
      <AppLayout
        menuTemplate="student"
        sidebarTitle="SIA Dashboard"
        title="Pembelajaran"
        subtitle="Detail materi dan informasi akademik mata kuliah"
      >
        <div className="max-w-7xl mx-auto space-y-6">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCourse(null);
              setSelectedCourseDetail(null);
              setCourseAssignments([]);
              setCourseMaterials([]);
            }}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white border-amber-600 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Info & Participants */}
            <div className="w-full lg:w-1/3 space-y-6">
              <div>
                <h4 className="text-sm text-muted-foreground mb-4">Mata Kuliah</h4>
                <h2 className="text-base font-bold text-gray-900 leading-tight">
                  {selectedCourse.class?.name ? `[${selectedCourse.class.name}]` : ""} {selectedCourse.title}
                </h2>
                <div className="mt-2 text-sm">
                  <span className="font-medium">Dosen:</span>{" "}
                  <span className="text-muted-foreground">{dosenLabel}</span>
                </div>
              </div>

              <div className="border rounded-md shadow-sm overflow-hidden bg-white">
                <div className="bg-gray-50 px-4 py-3 border-b text-sm font-medium">
                  Peserta Kuliah ({participants.length || 0})
                </div>
                <div className="divide-y max-h-[300px] overflow-y-auto">
                  {participants.length > 0 ? (
                    participants.map((p, idx) => (
                      <div key={idx} className={`p-3 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                        <p className="text-sm font-medium">{p.student?.user?.fullName ?? "Tanpa Nama"}</p>
                        <p className="text-xs text-muted-foreground">{p.student?.nim ?? p.student?.studentDataId ?? "-"}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {loadingDetails ? "Memuat peserta..." : "Belum ada peserta."}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Tabs */}
            <div className="w-full lg:w-2/3">
              <Tabs defaultValue="materi" className="w-full">
                <TabsList className="flex flex-wrap h-auto bg-transparent p-0 justify-start gap-1">
                  <TabsTrigger value="pengumuman" className="rounded-none bg-gray-100 data-[state=active]:bg-[#3498db] data-[state=active]:text-white px-4 py-2 shadow-sm border-b-0">Pengumuman</TabsTrigger>
                  <TabsTrigger value="silabus" className="rounded-none bg-gray-100 data-[state=active]:bg-[#3498db] data-[state=active]:text-white px-4 py-2 shadow-sm border-b-0">Silabus</TabsTrigger>
                  <TabsTrigger value="materi" className="rounded-none bg-gray-100 data-[state=active]:bg-[#3498db] data-[state=active]:text-white px-4 py-2 shadow-sm border-b-0">Materi</TabsTrigger>
                  <TabsTrigger value="tugas" className="rounded-none bg-gray-100 data-[state=active]:bg-[#3498db] data-[state=active]:text-white px-4 py-2 shadow-sm border-b-0">Tugas</TabsTrigger>
                  <TabsTrigger value="ujian" className="rounded-none bg-gray-100 data-[state=active]:bg-[#3498db] data-[state=active]:text-white px-4 py-2 shadow-sm border-b-0">Ujian</TabsTrigger>
                  <TabsTrigger value="cbt" className="rounded-none bg-gray-100 data-[state=active]:bg-[#3498db] data-[state=active]:text-white px-4 py-2 shadow-sm border-b-0">CBT</TabsTrigger>
                  <TabsTrigger value="diskusi" className="rounded-none bg-gray-100 data-[state=active]:bg-[#3498db] data-[state=active]:text-white px-4 py-2 shadow-sm border-b-0">Diskusi</TabsTrigger>
                </TabsList>

                <div className="border bg-white p-6 min-h-[300px] mt-2 shadow-sm">
                  <TabsContent value="pengumuman" className="mt-0">
                    <div className="p-4 border border-red-200 bg-red-50 text-red-500 rounded-sm text-sm">
                      Perhatian! Mohon maaf, data pengumuman tidak ditemukan.
                    </div>
                  </TabsContent>
                  <TabsContent value="silabus" className="mt-0">
                    <div className="p-4 border border-red-200 bg-red-50 text-red-500 rounded-sm text-sm">
                      Perhatian! Mohon maaf, silabus belum diunggah.
                    </div>
                  </TabsContent>
                  <TabsContent value="materi" className="mt-0 space-y-4">
                    {loadingDetails ? (
                      <div className="text-center py-8 text-muted-foreground">Memuat materi...</div>
                    ) : courseMaterials.length > 0 ? (
                      courseMaterials.map((m: any) => {
                        const summary = materialSummaries[m.id];
                        return (
                          <div key={m.id} className="p-4 border rounded-md shadow-sm bg-gray-50/50">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="font-semibold text-[#0081a7]">{m.title}</h4>
                              <div className="flex items-center gap-2 shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => summarizeMaterial(m)}
                                  disabled={summary?.loading}
                                  className="flex items-center gap-1.5 text-xs border-violet-300 text-violet-700 hover:bg-violet-50 hover:border-violet-400"
                                >
                                  <Sparkles className="h-3.5 w-3.5" />
                                  {summary?.loading
                                    ? "Meringkas..."
                                    : summary?.text
                                      ? summary.expanded
                                        ? <><ChevronUp className="h-3.5 w-3.5" /> Sembunyikan</>
                                        : <><ChevronDown className="h-3.5 w-3.5" /> Tampilkan Ringkasan</>
                                      : "Ringkasan AI"}
                                </Button>
                                {summary?.text && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => summarizeMaterial(m, true)}
                                    disabled={summary?.loading}
                                    className="text-xs text-violet-600 hover:bg-violet-50"
                                    title="Buat ulang ringkasan (lewati cache)"
                                  >
                                    🔄 Regenerasi
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{m.description}</p>
                            {m.fileUrl && (
                              <a href={`http://localhost:8000${m.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-2 inline-flex items-center gap-1 text-sm">
                                <FileText className="h-4 w-4" /> Download Lampiran
                              </a>
                            )}
                            {/* AI Summary panel */}
                            {summary?.expanded && summary?.text && (
                              <div className="mt-3 p-3 rounded-md bg-violet-50 border border-violet-200">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-1.5 text-violet-700 text-xs font-semibold uppercase tracking-wide">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Ringkasan AI
                                  </div>
                                  {summary.cached && (
                                    <Badge variant="outline" className="text-[10px] border-violet-300 text-violet-600">
                                      📦 Cached
                                    </Badge>
                                  )}
                                </div>
                                {summary.docInfo && (
                                  <div className="text-xs text-violet-600/80 mb-2">
                                    📄 {summary.docInfo.fileType?.toUpperCase()} • {summary.docInfo.pageCount} halaman •{" "}
                                    {Math.round(summary.docInfo.textLength / 1000)}K karakter
                                    {summary.docInfo.truncated && " (dipotong)"}
                                  </div>
                                )}
                                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                  {summary.text}
                                </p>
                              </div>
                            )}
                            {summary?.loading && (
                              <div className="mt-3 p-3 rounded-md bg-violet-50 border border-violet-200 flex items-center gap-2 text-sm text-violet-600">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Meminta ringkasan dari AI...
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 border border-red-200 bg-red-50 text-red-500 rounded-sm text-sm">
                        Perhatian! Mohon maaf, data materi belum ditambahkan oleh dosen.
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="tugas" className="mt-0 space-y-4">
                    {loadingDetails ? (
                      <div className="text-center py-8 text-muted-foreground">Memuat tugas...</div>
                    ) : courseAssignments.length > 0 ? (
                      courseAssignments.map((task, idx) => (
                        <div key={idx} className="p-4 border rounded-md shadow-sm bg-gray-50/50">
                          <h4 className="font-semibold text-[#0081a7]">{task.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Tenggat: {task.dueDate ? new Date(task.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => navigate(`/mahasiswa/assignments/${task.id}`)}
                              className="bg-[#0081a7] hover:bg-[#005f7a] text-white"
                            >
                              Lihat & Kumpulkan Tugas
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 border border-red-200 bg-red-50 text-red-500 rounded-sm text-sm">
                        Perhatian! Mohon maaf, tidak ada tugas saat ini.
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="ujian" className="mt-0">
                    <div className="p-4 border border-red-200 bg-red-50 text-red-500 rounded-sm text-sm">
                      Perhatian! Jadwal ujian belum tersedia.
                    </div>
                  </TabsContent>
                  <TabsContent value="cbt" className="mt-0">
                    <div className="p-4 border border-red-200 bg-red-50 text-red-500 rounded-sm text-sm">
                      Perhatian! Belum ada ujian CBT yang dijadwalkan.
                    </div>
                  </TabsContent>
                  <TabsContent value="diskusi" className="mt-0">
                    <div className="p-4 border border-red-200 bg-red-50 text-red-500 rounded-sm text-sm">
                      Perhatian! Belum ada diskusi yang dibuat.
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              <div className="mt-6 border rounded-md shadow-sm bg-white overflow-hidden">
                <div className="bg-[#eef5f9] px-4 py-3 border-b text-sm font-medium text-[#0081a7] flex items-center justify-between">
                  Layanan Akademik
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="p-4 text-sm text-muted-foreground">
                  Silakan hubungi Operator SIA Akademik Fakultas/Sekolah/Departemen untuk informasi lebih rinci.
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
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
          onClick={() => navigate("/mahasiswa")}
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
                onClick={() => handleSelectCourse(course)}
                className="shadow-sm border rounded-lg overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-primary/30 transition-all bg-white group cursor-pointer"
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