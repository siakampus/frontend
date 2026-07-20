import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { coursesApi, assignmentsApi, filesApi } from "@/lib/api";
import { 
  BookOpen, 
  Plus, 
  RefreshCw, 
  ArrowLeft,
  Calendar,
  FileText,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Course {
  id: number;
  title: string;
  description?: string;
  credits?: number;
  capacity?: number;
  class?: {
    id: number;
    name: string;
  };
  _count?: {
    assignments: number;
  };
}

interface Assignment {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  _count?: { submissions?: number };
}

export default function LecturerCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  
  // Create Course state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState(3);
  const [capacity, setCapacity] = useState(40);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Detail View State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseAssignments, setCourseAssignments] = useState<Assignment[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Edit Materi State
  const [editMateriDesc, setEditMateriDesc] = useState("");
  const [materiFile, setMateriFile] = useState<File | null>(null);
  const [isUpdatingMateri, setIsUpdatingMateri] = useState(false);

  // Create Assignment State
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [newAssignTitle, setNewAssignTitle] = useState("");
  const [newAssignDesc, setNewAssignDesc] = useState("");
  const [newAssignDueDate, setNewAssignDueDate] = useState("");
  const [newAssignFile, setNewAssignFile] = useState<File | null>(null);
  const [isCreatingAssign, setIsCreatingAssign] = useState(false);

  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    const res = await coursesApi.list({ take: 50 });
    if (res.status === 401) { navigate("/login"); return; }
    if (res.ok && res.data) {
      const body = res.data as { data?: Course[] };
      setCourses(body.data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const notify = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    const res = await coursesApi.create({
      title,
      description,
      credits,
      capacity
    } as any);
    if (res.ok) {
      notify("✅ Mata Kuliah berhasil ditambahkan.");
      setIsDialogOpen(false);
      setTitle("");
      setDescription("");
      setCredits(3);
      setCapacity(40);
      fetchCourses();
    } else {
      notify("❌ Gagal menambahkan mata kuliah.");
    }
    setIsCreating(false);
  };

  const handleSelectCourse = async (course: Course) => {
    setSelectedCourse(course);
    setEditMateriDesc(course.description || "");
    setMateriFile(null);
    setLoadingDetails(true);
    try {
      const res = await assignmentsApi.listByCourse(course.id);
      if (res.ok && res.data) {
        const body = res.data as { data?: Assignment[] };
        setCourseAssignments(body.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch course details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdateMateri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setIsUpdatingMateri(true);
    
    try {
      let finalDesc = editMateriDesc;
      if (materiFile) {
        const fileRes = await filesApi.upload(materiFile);
        if (fileRes.ok && fileRes.data) {
          const data: any = fileRes.data;
          let fileId = data.file?.id || data.id || (typeof data === 'string' ? data : null);
          if (fileId) {
             const fileUrl = filesApi.getFileUrl(fileId);
             finalDesc += `\n\n[Materi Lampiran: ${materiFile.name}](${fileUrl})`;
          } else if (data.url) {
             finalDesc += `\n\n[Materi Lampiran: ${materiFile.name}](${data.url})`;
          }
        } else {
          notify("❌ Gagal mengunggah file materi.");
          setIsUpdatingMateri(false);
          return;
        }
      }

      const res = await coursesApi.update(selectedCourse.id, { description: finalDesc });
      if (res.ok) {
        notify("✅ Materi berhasil diperbarui.");
        setEditMateriDesc(finalDesc);
        setMateriFile(null);
        // Update the course list
        setCourses(courses.map(c => c.id === selectedCourse.id ? { ...c, description: finalDesc } : c));
        setSelectedCourse({ ...selectedCourse, description: finalDesc });
      } else {
        notify("❌ Gagal memperbarui materi.");
      }
    } catch (err) {
      notify("❌ Terjadi kesalahan saat memperbarui materi.");
    } finally {
      setIsUpdatingMateri(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setIsCreatingAssign(true);
    
    try {
      let finalDesc = newAssignDesc;
      if (newAssignFile) {
        const fileRes = await filesApi.upload(newAssignFile);
        if (fileRes.ok && fileRes.data) {
          const data: any = fileRes.data;
          let fileId = data.file?.id || data.id || (typeof data === 'string' ? data : null);
          if (fileId) {
             const fileUrl = filesApi.getFileUrl(fileId);
             finalDesc += `\n\n[Lampiran Tugas: ${newAssignFile.name}](${fileUrl})`;
          } else if (data.url) {
             finalDesc += `\n\n[Lampiran Tugas: ${newAssignFile.name}](${data.url})`;
          }
        } else {
          notify("❌ Gagal mengunggah file tugas.");
          setIsCreatingAssign(false);
          return;
        }
      }

      const res = await assignmentsApi.create({
        courseId: selectedCourse.id,
        title: newAssignTitle,
        description: finalDesc,
        dueDate: newAssignDueDate ? new Date(newAssignDueDate).toISOString() : undefined
      });

      if (res.ok) {
        notify("✅ Tugas berhasil ditambahkan.");
        setIsAssignDialogOpen(false);
        setNewAssignTitle("");
        setNewAssignDesc("");
        setNewAssignDueDate("");
        setNewAssignFile(null);
        // Refresh assignments
        const listRes = await assignmentsApi.listByCourse(selectedCourse.id);
        if (listRes.ok && listRes.data) {
           const body = listRes.data as { data?: Assignment[] };
           setCourseAssignments(body.data || []);
        }
      } else {
        notify("❌ Gagal menambahkan tugas.");
      }
    } catch (err) {
       notify("❌ Terjadi kesalahan saat membuat tugas.");
    } finally {
      setIsCreatingAssign(false);
    }
  };

  if (selectedCourse) {
    return (
      <AppLayout
        menuTemplate="lecturer"
        sidebarTitle="SIA Dosen"
        title="Detail Mata Kuliah"
        subtitle="Kelola materi dan tugas mata kuliah"
      >
        <div className="max-w-7xl mx-auto space-y-6">
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedCourse(null);
              setCourseAssignments([]);
            }} 
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white border-amber-600 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>

          {actionMsg && (
            <div className="text-sm font-medium px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
              {actionMsg}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Info */}
            <div className="w-full lg:w-1/3 space-y-6">
              <div>
                <h4 className="text-sm text-muted-foreground mb-4">Mata Kuliah</h4>
                <h2 className="text-base font-bold text-gray-900 leading-tight">
                  {selectedCourse.class?.name ? `[${selectedCourse.class.name}] ` : ""}{selectedCourse.title}
                </h2>
                <div className="mt-2 text-sm flex gap-4">
                  <span className="font-medium">SKS: <span className="text-muted-foreground">{selectedCourse.credits || 3}</span></span>
                  <span className="font-medium">Kapasitas: <span className="text-muted-foreground">{selectedCourse.capacity || 40}</span></span>
                </div>
              </div>

              <div className="border rounded-md shadow-sm overflow-hidden bg-white">
                <div className="bg-gray-50 px-4 py-3 border-b text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" /> Manajemen Kelas
                </div>
                <div className="p-4 text-sm text-muted-foreground">
                  Gunakan menu Manajemen Tugas untuk menilai tugas yang telah dikumpulkan oleh mahasiswa.
                </div>
                <div className="px-4 pb-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => navigate("/assignments")}
                  >
                    Buka Manajemen Tugas
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Tabs */}
            <div className="w-full lg:w-2/3">
              <Tabs defaultValue="materi" className="w-full">
                <TabsList className="flex flex-wrap h-auto bg-transparent p-0 justify-start gap-1">
                  <TabsTrigger value="materi" className="rounded-none bg-gray-100 data-[state=active]:bg-[#3498db] data-[state=active]:text-white px-4 py-2 shadow-sm border-b-0">Materi Mata Kuliah</TabsTrigger>
                  <TabsTrigger value="tugas" className="rounded-none bg-gray-100 data-[state=active]:bg-[#3498db] data-[state=active]:text-white px-4 py-2 shadow-sm border-b-0">Daftar Tugas</TabsTrigger>
                </TabsList>

                <div className="border bg-white p-6 min-h-[300px] mt-2 shadow-sm">
                  
                  {/* Materi Tab */}
                  <TabsContent value="materi" className="mt-0 space-y-4">
                    <div className="p-4 border rounded-md shadow-sm bg-gray-50/50">
                      <h4 className="font-semibold text-[#0081a7] mb-2">Isi / Deskripsi Mata Kuliah Saat Ini</h4>
                      {selectedCourse.description ? (
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {selectedCourse.description}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Belum ada deskripsi materi.</p>
                      )}
                    </div>

                    <form onSubmit={handleUpdateMateri} className="border p-4 rounded-md shadow-sm space-y-4">
                      <h4 className="font-semibold text-gray-900">Perbarui Materi</h4>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Isi Materi / Deskripsi</label>
                        <Textarea 
                          value={editMateriDesc} 
                          onChange={(e) => setEditMateriDesc(e.target.value)} 
                          placeholder="Ketik isi materi mata kuliah di sini..." 
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Upload File Materi (PDF, dll) - <span className="text-muted-foreground font-normal">Opsional</span></label>
                        <input
                          type="file"
                          onChange={(e) => setMateriFile(e.target.files?.[0] || null)}
                          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                        />
                        {materiFile && <p className="text-xs text-muted-foreground mt-1">Terpilih: {materiFile.name}</p>}
                      </div>
                      <Button type="submit" disabled={isUpdatingMateri} className="w-full sm:w-auto">
                        {isUpdatingMateri ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</> : "Simpan Materi"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Tugas Tab */}
                  <TabsContent value="tugas" className="mt-0 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-900">Tugas Mahasiswa</h4>
                      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Buat Tugas
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Buat Tugas Baru</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleCreateAssignment} className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Judul Tugas</label>
                              <Input 
                                value={newAssignTitle} 
                                onChange={(e) => setNewAssignTitle(e.target.value)} 
                                placeholder="Contoh: Tugas 1: Algoritma Pencarian" 
                                required 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Deskripsi Tugas</label>
                              <Textarea 
                                value={newAssignDesc} 
                                onChange={(e) => setNewAssignDesc(e.target.value)} 
                                placeholder="Jelaskan instruksi tugas..." 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Deadline (Tenggat Waktu)</label>
                              <Input 
                                type="datetime-local"
                                value={newAssignDueDate} 
                                onChange={(e) => setNewAssignDueDate(e.target.value)} 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Upload File Soal/Tugas (Opsional)</label>
                              <input
                                type="file"
                                onChange={(e) => setNewAssignFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                              />
                              {newAssignFile && <p className="text-xs text-muted-foreground mt-1">Terpilih: {newAssignFile.name}</p>}
                            </div>
                            <div className="flex justify-end pt-4">
                              <Button type="submit" disabled={isCreatingAssign}>
                                {isCreatingAssign ? "Menyimpan..." : "Simpan Tugas"}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {loadingDetails ? (
                      <div className="text-center py-8 text-muted-foreground"><RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2"/> Memuat tugas...</div>
                    ) : courseAssignments.length > 0 ? (
                      courseAssignments.map((task, idx) => (
                        <div key={idx} className="p-4 border rounded-md shadow-sm bg-gray-50/50">
                          <h4 className="font-semibold text-[#0081a7] flex items-center gap-2">
                            <FileText className="h-4 w-4"/> {task.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{task.description}</p>
                          <div className="mt-4 flex items-center justify-between border-t pt-3">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              Tenggat: {task.dueDate ? new Date(task.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-white px-2 py-1 rounded shadow-sm border">
                              <Users className="h-3.5 w-3.5" />
                              {task._count?.submissions ?? 0} Pengumpulan
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 border border-amber-200 bg-amber-50 text-amber-700 rounded-sm text-sm">
                        Belum ada tugas untuk mata kuliah ini.
                      </div>
                    )}
                  </TabsContent>

                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      menuTemplate="lecturer"
      sidebarTitle="SIA Dosen"
      title="Manajemen Mata Kuliah"
      subtitle="Kelola dan tambahkan mata kuliah"
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {actionMsg && (
          <div className="text-sm font-medium px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
            {actionMsg}
          </div>
        )}

        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
          <h2 className="text-lg font-serif font-bold text-primary">Daftar Mata Kuliah Anda</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Buat Mata Kuliah
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Buat Mata Kuliah Baru</DialogTitle>
                <DialogDescription className="sr-only">
                  Form untuk membuat mata kuliah baru
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCourse} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Judul Mata Kuliah</label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Contoh: Algoritma dan Struktur Data" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deskripsi</label>
                  <Textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Deskripsi mata kuliah..." 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SKS</label>
                    <Input 
                      type="number"
                      value={credits} 
                      onChange={(e) => setCredits(parseInt(e.target.value) || 0)} 
                      min="1" max="6"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kapasitas</label>
                    <Input 
                      type="number"
                      value={capacity} 
                      onChange={(e) => setCapacity(parseInt(e.target.value) || 0)} 
                      min="1"
                      required 
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-16">
              <RefreshCw className="animate-spin h-6 w-6 text-muted-foreground" />
            </div>
          ) : courses.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-lg border shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Belum ada mata kuliah yang tersedia.</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Tambah Sekarang
              </Button>
            </div>
          ) : (
            courses.map((course) => (
              <Card 
                key={course.id} 
                onClick={() => handleSelectCourse(course)}
                className="shadow-sm border rounded-lg hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group bg-white flex flex-col justify-between"
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
                    <Users className="h-3.5 w-3.5" />
                    Kapasitas: {course.capacity || 40}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
