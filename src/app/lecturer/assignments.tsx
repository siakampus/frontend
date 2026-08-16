import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { assignmentsApi, coursesApi } from "@/lib/api";
import {
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Users,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Course {
  id: number;
  title: string;
}

interface Assignment {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  _count?: { submissions?: number };
}

interface Submission {
  id: number;
  content?: string;
  grade?: number;
  feedback?: string;
  createdAt?: string;
  student?: { email?: string; name?: string };
}

export default function LecturerAssignmentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [expandedAssignment, setExpandedAssignment] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<Record<number, Submission[]>>({});
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState<Record<number, boolean>>({});
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoadingCourses(true);
    const res = await coursesApi.list({ take: 50 });
    if (res.status === 401) { navigate("/login"); return; }
    if (res.ok && res.data) {
      const body = res.data as { data?: Course[] };
      setCourses(body.data || []);
    }
    setLoadingCourses(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const fetchAssignments = async (courseId: number) => {
    setLoadingAssignments(true);
    setSelectedCourse(courseId);
    setAssignments([]);
    setExpandedAssignment(null);
    const res = await assignmentsApi.listByCourse(courseId);
    if (res.ok && res.data) {
      const body = res.data as { data?: Assignment[] };
      setAssignments(body.data || []);
    }
    setLoadingAssignments(false);
  };

  const fetchSubmissions = async (assignmentId: number) => {
    if (submissions[assignmentId]) return; // Already fetched
    setLoadingSubmissions((prev) => ({ ...prev, [assignmentId]: true }));
    const res = await assignmentsApi.listSubmissions(assignmentId);
    if (res.ok && res.data) {
      const body = res.data as { data?: Submission[] };
      setSubmissions((prev) => ({ ...prev, [assignmentId]: body.data || [] }));
    }
    setLoadingSubmissions((prev) => ({ ...prev, [assignmentId]: false }));
  };

  const toggleAssignment = (id: number) => {
    if (expandedAssignment === id) {
      setExpandedAssignment(null);
    } else {
      setExpandedAssignment(id);
      fetchSubmissions(id);
    }
  };

  const notify = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const handleGrade = async (submissionId: number) => {
    const grade = parseFloat(gradeInput);
    if (isNaN(grade)) { notify("Masukkan nilai yang valid."); return; }
    const res = await assignmentsApi.gradeSubmission(submissionId, grade, feedbackInput || undefined);
    notify(res.ok ? "Nilai berhasil disimpan." : "Gagal menyimpan nilai.");
    setGradingId(null);
    setGradeInput("");
    setFeedbackInput("");
    // Refresh submissions for expanded assignment
    if (expandedAssignment) {
      setSubmissions((prev) => {
        const updated = { ...prev };
        delete updated[expandedAssignment];
        return updated;
      });
      fetchSubmissions(expandedAssignment);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setIsCreatingAssignment(true);
    const res = await assignmentsApi.create({
      courseId: selectedCourse,
      title: newTitle,
      description: newDesc,
      dueDate: newDueDate ? new Date(newDueDate).toISOString() : undefined
    });
    if (res.ok) {
      notify("Tugas berhasil ditambahkan.");
      setIsDialogOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewDueDate("");
      fetchAssignments(selectedCourse);
    } else {
      notify("Gagal menambahkan tugas.");
    }
    setIsCreatingAssignment(false);
  };

  return (
    <AppLayout
      menuTemplate="lecturer"
      sidebarTitle="SIA Dosen"
      title="Manajemen Tugas"
      subtitle="Kelola tugas dan nilai mahasiswa"
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {actionMsg && (
          <div className="text-sm font-medium px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
            {actionMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Course list */}
          <Card className="shadow-sm border rounded-lg overflow-hidden col-span-1 h-fit">
            <CardHeader className="border-b bg-muted/10 pb-3">
              <CardTitle className="text-sm font-serif text-primary">Mata Kuliah</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {loadingCourses ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="animate-spin h-4 w-4 text-muted-foreground" />
                </div>
              ) : courses.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Tidak ada mata kuliah.</p>
              ) : (
                <div className="space-y-1">
                  {courses.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => fetchAssignments(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCourse === c.id
                          ? "bg-primary text-white font-medium"
                          : "hover:bg-muted/30 text-gray-700"
                      }`}
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignments */}
          <div className="col-span-3 space-y-3">
            {!selectedCourse ? (
              <Card className="shadow-sm border rounded-lg">
                <CardContent className="py-16 text-center text-muted-foreground text-sm">
                  Pilih mata kuliah untuk melihat daftar tugas.
                </CardContent>
              </Card>
            ) : loadingAssignments ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <RefreshCw className="animate-spin h-5 w-5 mr-2" /> Memuat tugas...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="font-medium text-gray-900">
                    Tugas: {courses.find(c => c.id === selectedCourse)?.title}
                  </h3>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                            value={newTitle} 
                            onChange={(e) => setNewTitle(e.target.value)} 
                            placeholder="Contoh: Tugas 1: Membuat API" 
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Deskripsi</label>
                          <Textarea 
                            value={newDesc} 
                            onChange={(e) => setNewDesc(e.target.value)} 
                            placeholder="Deskripsi tugas..." 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Deadline (Tenggat Waktu)</label>
                          <Input 
                            type="datetime-local"
                            value={newDueDate} 
                            onChange={(e) => setNewDueDate(e.target.value)} 
                          />
                        </div>
                        <div className="flex justify-end pt-4">
                          <Button type="submit" disabled={isCreatingAssignment}>
                            {isCreatingAssignment ? "Menyimpan..." : "Simpan"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {assignments.length === 0 ? (
                  <Card className="shadow-sm border rounded-lg">
                    <CardContent className="py-16 text-center text-muted-foreground text-sm">
                      Tidak ada tugas untuk mata kuliah ini.
                    </CardContent>
                  </Card>
                ) : (
                  assignments.map((a) => (
                <Card key={a.id} className="shadow-sm border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleAssignment(a.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-primary" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900 text-sm">{a.title}</div>
                        {a.dueDate && (
                          <div className="text-xs text-muted-foreground">
                            Deadline: {new Date(a.dueDate).toLocaleDateString("id-ID")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {a._count?.submissions ?? 0} pengumpulan
                      </span>
                      {expandedAssignment === a.id ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {expandedAssignment === a.id && (
                    <div className="border-t bg-muted/5 p-4">
                      {loadingSubmissions[a.id] ? (
                        <div className="flex justify-center py-6">
                          <RefreshCw className="animate-spin h-4 w-4 text-muted-foreground" />
                        </div>
                      ) : (submissions[a.id] || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Belum ada pengumpulan tugas.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {(submissions[a.id] || []).map((sub) => (
                            <div
                              key={sub.id}
                              className="border bg-white rounded-lg p-3 flex items-start justify-between gap-4"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900">
                                  {sub.student?.name || sub.student?.email || `#${sub.id}`}
                                </div>
                                {sub.content && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {sub.content}
                                  </p>
                                )}
                                <div className="text-xs text-muted-foreground mt-1">
                                  {sub.createdAt
                                    ? new Date(sub.createdAt).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </div>
                              </div>
                              <div className="flex-shrink-0 text-right">
                                {sub.grade != null ? (
                                  <div className="flex items-center gap-1.5">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="font-bold text-green-700 text-sm">
                                      {sub.grade}
                                    </span>
                                  </div>
                                ) : gradingId === sub.id ? (
                                  <div className="flex flex-col gap-2 items-end">
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      placeholder="Nilai (0-100)"
                                      value={gradeInput}
                                      onChange={(e) => setGradeInput(e.target.value)}
                                      className="w-32 text-right text-sm"
                                    />
                                    <Input
                                      placeholder="Feedback (opsional)"
                                      value={feedbackInput}
                                      onChange={(e) => setFeedbackInput(e.target.value)}
                                      className="w-40 text-sm"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleGrade(sub.id)}
                                      >
                                        Simpan
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setGradingId(null)}
                                      >
                                        Batal
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setGradingId(sub.id);
                                      setGradeInput("");
                                      setFeedbackInput("");
                                    }}
                                  >
                                    Beri Nilai
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))
            )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
