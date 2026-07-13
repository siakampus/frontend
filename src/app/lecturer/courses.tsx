import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { coursesApi } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { BookOpen, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Course {
  id: number;
  title: string;
  description?: string;
  credits?: number;
  capacity?: number;
}

export default function LecturerCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  
  // Create state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState(3);
  const [capacity, setCapacity] = useState(40);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-serif font-bold text-primary">Daftar Mata Kuliah</h2>
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
            <div className="col-span-full py-16 text-center">
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
              <Card key={course.id} className="shadow-sm border rounded-lg hover:shadow-md transition-shadow">
                <CardHeader className="border-b bg-muted/5 pb-3">
                  <CardTitle className="text-md font-medium text-primary line-clamp-2">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3 min-h-[4.5rem]">
                    {course.description || "Tidak ada deskripsi"}
                  </p>
                  <div className="flex items-center justify-between pt-2 text-xs font-medium text-gray-500 border-t">
                    <span>SKS: {course.credits || 3}</span>
                    <span>Kapasitas: {course.capacity || 40}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
