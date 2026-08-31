import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { krsApi } from "@/lib/api";
import { Loader2, AlertCircle, CheckCircle, Send } from "lucide-react";

export default function KrsPage() {
  const [activeTerm, setActiveTerm] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [myKrs, setMyKrs] = useState<any>(null);
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [termRes, krsRes, coursesRes] = await Promise.all([
        krsApi.getActiveTerm(),
        krsApi.getMyKrs(),
        krsApi.getCourses()
      ]);

      if (termRes.ok && termRes.data) {
        setActiveTerm((termRes.data as any).data);
      }

      let krsData = null;
      if (krsRes.ok && krsRes.data) {
        krsData = (krsRes.data as any).data;
        setMyKrs(krsData);
      }

      if (coursesRes.ok && coursesRes.data) {
        setCourses((coursesRes.data as any).data || []);
      }

      // Pre-select courses if KRS exists
      if (krsData && krsData.krsItems) {
        const initialSelected = krsData.krsItems.map((item: any) => item.course);
        setSelectedCourses(initialSelected);
      }

    } catch (error) {
      console.error("Error fetching KRS data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSks = selectedCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
  const maxSks = 24;

  const isApproved = myKrs?.status === "APPROVED";
  const isSubmitted = myKrs?.status === "SUBMITTED";
  const isReadOnly = isApproved || isSubmitted;

  const handleCheckbox = (course: any, isChecked: boolean) => {
    if (isReadOnly) return;

    if (isChecked) {
      if (totalSks + (course.credits || 0) > maxSks) {
        alert(`Maksimal pengambilan ${maxSks} SKS`);
        return;
      }
      setSelectedCourses([...selectedCourses, course]);
    } else {
      setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedCourses.length === 0) {
      alert("Pilih setidaknya satu mata kuliah");
      return;
    }

    setSubmitting(true);
    try {
      // Determine which courses are new (not already in KRS)
      const existingIds = new Set(
        (myKrs?.krsItems || []).map((item: any) => item.course?.id)
      );
      const newCourses = selectedCourses.filter(c => !existingIds.has(c.id));

      if (newCourses.length === 0) {
        setActionMsg("Semua mata kuliah sudah terdaftar di KRS.");
        setTimeout(() => setActionMsg(""), 3000);
        return;
      }

      // Enroll each new course one-by-one
      const errors: string[] = [];
      for (const course of newCourses) {
        const res = await krsApi.enroll(course.id);
        if (!res.ok) {
          const msg = (res.data as any)?.message || `Gagal menambahkan ${course.title}`;
          errors.push(msg);
        }
      }

      if (errors.length === 0) {
        setActionMsg("KRS berhasil disimpan.");
      } else if (errors.length < newCourses.length) {
        setActionMsg(`Sebagian berhasil. Error: ${errors.join("; ")}`);
      } else {
        alert(`Gagal menyimpan KRS: ${errors.join("; ")}`);
      }

      fetchData();
      setTimeout(() => setActionMsg(""), 5000);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout menuTemplate="student" title="Kartu Rencana Studi" subtitle="Pengisian KRS">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!activeTerm || !activeTerm.isActive) {
    return (
      <AppLayout menuTemplate="student" title="Kartu Rencana Studi" subtitle="Pengisian KRS">
        <Card className="max-w-2xl mx-auto mt-8 border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="h-8 w-8 text-amber-500" />
            <div>
              <h3 className="font-bold text-amber-800">Bukan Periode Pengisian KRS</h3>
              <p className="text-amber-700 text-sm mt-1">Saat ini tidak ada periode akademik yang aktif untuk pengisian KRS. Silakan hubungi bagian akademik untuk informasi lebih lanjut.</p>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout menuTemplate="student" title="Kartu Rencana Studi" subtitle={`Periode Aktif: ${activeTerm.name}`}>
      <div className="max-w-5xl mx-auto space-y-6 pb-24 relative min-h-[calc(100vh-200px)]">
        {actionMsg && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {actionMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status KRS */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg">Status KRS</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Status Saat Ini</div>
                  <Badge variant={
                    myKrs?.status === "APPROVED" ? "default" :
                    myKrs?.status === "SUBMITTED" ? "secondary" : "outline"
                  } className="text-sm px-3 py-1">
                    {myKrs?.status || "BELUM DIISI"}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total SKS Diambil</div>
                  <div className="text-3xl font-bold text-primary">{totalSks} <span className="text-base font-normal text-muted-foreground">/ {maxSks}</span></div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-blue-200 bg-blue-50/50">
              <CardContent className="p-4 text-sm text-blue-800 space-y-2">
                <p><strong>Panduan Pengisian:</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Pilih mata kuliah sesuai dengan jadwal dan kurikulum Anda.</li>
                  <li>Batas maksimal pengambilan adalah <strong>{maxSks} SKS</strong>.</li>
                  <li>Jika sudah yakin, klik <strong>Ajukan KRS</strong> agar dapat diperiksa oleh Dosen Wali.</li>
                  <li>KRS yang sudah diajukan atau disetujui tidak dapat diubah kembali.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Daftar Mata Kuliah */}
          <Card className="lg:col-span-2 shadow-sm flex flex-col h-full">
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <CardTitle className="text-lg">Mata Kuliah Ditawarkan</CardTitle>
              <CardDescription>Pilih mata kuliah yang ingin Anda ambil pada semester ini.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-sm relative">
                  <thead className="bg-muted/10 text-xs uppercase text-muted-foreground sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/80">
                    <tr>
                      <th className="px-4 py-3 text-center w-12 border-b">#</th>
                      <th className="px-4 py-3 text-left border-b">Kode / Nama Mata Kuliah</th>
                      <th className="px-4 py-3 text-center border-b">SKS</th>
                      <th className="px-4 py-3 text-left border-b">Deskripsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {courses.map(course => {
                      const isSelected = selectedCourses.some(c => c.id === course.id);
                      return (
                        <tr key={course.id} className={isSelected ? "bg-primary/5" : "hover:bg-muted/5 transition-colors"}>
                          <td className="px-4 py-3 text-center">
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50 cursor-pointer"
                              checked={isSelected}
                              disabled={isReadOnly}
                              onChange={(e) => handleCheckbox(course, e.target.checked)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">{course.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 font-mono">ID: {course.id}</div>
                          </td>
                          <td className="px-4 py-3 text-center font-medium">
                            {course.credits || 0}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate" title={course.description}>
                            {course.description || "-"}
                          </td>
                        </tr>
                      );
                    })}
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic">
                          Tidak ada mata kuliah yang tersedia.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Banner (Sticky Bottom) */}
        {!isReadOnly && (
          <Card className="absolute bottom-0 left-0 w-full shadow-lg border-t border-t-primary/20 bg-white/95 backdrop-blur z-20">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-gray-900">Total SKS Dipilih</div>
                <div className={`text-xl font-bold ${totalSks > maxSks ? 'text-red-600' : 'text-primary'}`}>
                  {totalSks} <span className="text-sm font-normal text-muted-foreground">/ {maxSks} SKS</span>
                </div>
              </div>
              <div className="flex w-full sm:w-auto gap-3">
                <Button 
                  onClick={() => handleSubmit()}
                  disabled={submitting || totalSks > maxSks || selectedCourses.length === 0}
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <Send className="h-4 w-4" /> Simpan KRS
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
