import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { adminLecturesApi, adminUsersApi, adminLecturersApi } from "@/lib/api";
import {
  BookOpen,
  Search,
  RefreshCw,
  Trash2,
  Users,
  ChevronDown,
  ChevronRight,
  Loader2,
  GraduationCap,
  Plus,
  UserPlus,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function LectureDetails({
  lectureId,
  onLectureChanged,
}: {
  lectureId: string;
  onLectureChanged?: (lectureId: string, counts: { lecturers: number; students: number }) => void;
}) {
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add lecturer state
  const [showAddLecturer, setShowAddLecturer] = useState(false);
  const [lecturerSearch, setLecturerSearch] = useState("");
  const [lecturerResults, setLecturerResults] = useState<any[]>([]);
  const [searchingLecturers, setSearchingLecturers] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Add student state
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState(false);

  const [detailMsg, setDetailMsg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lecRes, stuRes, stuClassRes] = await Promise.all([
        adminLecturesApi.listLecturers(lectureId),
        adminLecturesApi.listStudents(lectureId).catch(() => null),
        adminUsersApi.list({ role: "student", classId: lectureId }).catch(() => null),
      ]);

      let lecturerList: any[] = [];
      if (lecRes && lecRes.ok && lecRes.data) {
        const lData = lecRes.data as any;
        lecturerList = lData.data || lData.lecturers || (Array.isArray(lData) ? lData : []);
        setLecturers(lecturerList);
      }

      let studentList: any[] = [];
      if (stuRes && stuRes.ok && stuRes.data) {
        const sData = stuRes.data as any;
        studentList = sData.data || sData.students || (Array.isArray(sData) ? sData : []);
      }
      if (studentList.length === 0 && stuClassRes && stuClassRes.ok && stuClassRes.data) {
        const sData = stuClassRes.data as any;
        studentList = sData.data || sData.users || (Array.isArray(sData) ? sData : []);
      }
      setStudents(studentList);

      onLectureChanged?.(lectureId, {
        lecturers: lecturerList.length,
        students: studentList.length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lectureId]);

  const notifyDetail = (msg: string) => {
    setDetailMsg(msg);
    setTimeout(() => setDetailMsg(""), 3000);
  };

  // Search lecturers from the system
  const handleSearchLecturers = async (query: string) => {
    setLecturerSearch(query);
    if (query.trim().length < 2) {
      setLecturerResults([]);
      return;
    }
    setSearchingLecturers(true);
    try {
      const res = await adminLecturersApi.list({ search: query.trim(), take: 10 });
      if (res.ok && res.data) {
        const body = res.data as any;
        const list = body.data || body.lecturers || body.users || (Array.isArray(body) ? body : []);
        // Filter out lecturers already assigned
        const assignedIds = new Set(
          lecturers.map((l: any) =>
            String(l.lecturerId ?? l.lecturer?.id ?? l.id ?? l.lecturer?.userId ?? l.userId)
          )
        );
        setLecturerResults(
          list.filter((l: any) => {
            const id1 = String(l.id);
            const id2 = String(l.lecturerId);
            const id3 = String(l.userId);
            return !assignedIds.has(id1) && !assignedIds.has(id2) && !assignedIds.has(id3);
          })
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingLecturers(false);
    }
  };

  const handleAssignLecturer = async (lecturer: any) => {
    setAssigning(true);
    try {
      const rawId = lecturer.id ?? lecturer.lecturerId ?? lecturer.userId;
      const numId = parseInt(String(rawId), 10);
      const lecturerId = !isNaN(numId) ? numId : rawId;
      const res = await adminLecturesApi.assignLecturer(lectureId, lecturerId);
      if (res.ok) {
        const lecturerName =
          lecturer.fullName ||
          lecturer.name ||
          lecturer.user?.fullName ||
          lecturer.user?.name ||
          "Dosen";
        notifyDetail(`Dosen "${lecturerName}" berhasil ditambahkan.`);
        setLecturerSearch("");
        setLecturerResults([]);
        setShowAddLecturer(false);
        fetchData();
      } else {
        const errData = res.data as any;
        alert(errData?.message || "Gagal menambahkan dosen.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menambahkan dosen.");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveLecturer = async (lecturerEntry: any) => {
    const rawId = lecturerEntry.lecturerId ?? lecturerEntry.lecturer?.id ?? lecturerEntry.id;
    const lecturerName =
      lecturerEntry.lecturer?.fullName ||
      lecturerEntry.lecturer?.name ||
      lecturerEntry.fullName ||
      lecturerEntry.name ||
      "Dosen";
    if (!confirm(`Hapus dosen "${lecturerName}" dari kelas ini?`)) return;

    try {
      const res = await adminLecturesApi.removeLecturer(lectureId, rawId);
      if (res.ok) {
        notifyDetail(`Dosen "${lecturerName}" berhasil dihapus dari kelas.`);
        fetchData();
      } else {
        alert("Gagal menghapus dosen dari kelas.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };

  // Search students from the system
  const handleSearchStudents = async (query: string) => {
    setStudentSearch(query);
    if (query.trim().length < 2) {
      setStudentResults([]);
      return;
    }
    setSearchingStudents(true);
    try {
      const res = await adminUsersApi.list({ role: "student", search: query.trim(), take: 10 });
      if (res.ok && res.data) {
        const body = res.data as any;
        const list = body.data || body.users || (Array.isArray(body) ? body : []);
        const assignedIds = new Set(
          students.map((s: any) =>
            String(s.studentId ?? s.student?.id ?? s.id ?? s.student?.userId ?? s.userId)
          )
        );
        setStudentResults(
          list.filter((s: any) => {
            const id1 = String(s.id);
            const id2 = String(s.studentId);
            const id3 = String(s.userId);
            return !assignedIds.has(id1) && !assignedIds.has(id2) && !assignedIds.has(id3);
          })
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingStudents(false);
    }
  };

  const handleAddStudent = async (student: any) => {
    setAssigningStudent(true);
    try {
      const rawId = student.id ?? student.studentId ?? student.userId;
      const numId = parseInt(String(rawId), 10);
      const studentId = !isNaN(numId) ? numId : rawId;
      const res = await adminLecturesApi.addStudent(lectureId, studentId);
      if (res.ok) {
        const studentName =
          student.fullName ||
          student.name ||
          student.user?.fullName ||
          student.user?.name ||
          "Mahasiswa";
        notifyDetail(`Mahasiswa "${studentName}" berhasil ditambahkan.`);
        setStudentSearch("");
        setStudentResults([]);
        setShowAddStudent(false);
        fetchData();
      } else {
        const errData = res.data as any;
        alert(errData?.message || "Gagal menambahkan mahasiswa.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menambahkan mahasiswa.");
    } finally {
      setAssigningStudent(false);
    }
  };

  const handleRemoveStudent = async (studentEntry: any) => {
    const rawId = studentEntry.studentId ?? studentEntry.student?.id ?? studentEntry.id;
    const studentName =
      studentEntry.student?.fullName ||
      studentEntry.student?.name ||
      studentEntry.fullName ||
      studentEntry.name ||
      "Mahasiswa";
    if (!confirm(`Hapus mahasiswa "${studentName}" dari kelas ini?`)) return;

    try {
      const res = await adminLecturesApi.removeStudent(lectureId, rawId);
      if (res.ok) {
        notifyDetail(`Mahasiswa "${studentName}" berhasil dihapus dari kelas.`);
        fetchData();
      } else {
        alert("Gagal menghapus mahasiswa dari kelas.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };

  return (
    <div className="bg-muted/5 border-t px-6 py-4">
      {detailMsg && (
        <div className="text-xs font-medium px-3 py-2 rounded-md bg-primary/10 text-primary border border-primary/20 mb-3">
          {detailMsg}
        </div>
      )}
      <Tabs defaultValue="dosen" className="w-full">
        <TabsList className="mb-4 bg-background border shadow-sm">
          <TabsTrigger value="dosen" className="gap-2 text-xs">
            <GraduationCap className="h-3.5 w-3.5" /> Dosen ({lecturers.length})
          </TabsTrigger>
          <TabsTrigger value="mahasiswa" className="gap-2 text-xs">
            <Users className="h-3.5 w-3.5" /> Mahasiswa ({students.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dosen" className="mt-0 outline-none">
          <Card className="border shadow-sm bg-background">
            {/* Header with add button */}
            <div className="p-3 border-b flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {lecturers.length} dosen terdaftar
              </span>
              <Button
                size="sm"
                variant={showAddLecturer ? "outline" : "default"}
                className="h-7 text-xs gap-1.5"
                onClick={() => {
                  setShowAddLecturer(!showAddLecturer);
                  setLecturerSearch("");
                  setLecturerResults([]);
                }}
              >
                {showAddLecturer ? (
                  <><X className="h-3 w-3" /> Tutup</>
                ) : (
                  <><UserPlus className="h-3 w-3" /> Tambah Dosen</>
                )}
              </Button>
            </div>

            {/* Add lecturer search panel */}
            {showAddLecturer && (
              <div className="p-3 border-b bg-muted/5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Cari dosen berdasarkan nama atau email..."
                    className="pl-8 h-8 text-xs"
                    value={lecturerSearch}
                    onChange={(e) => handleSearchLecturers(e.target.value)}
                    autoFocus
                  />
                </div>
                {searchingLecturers && (
                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" /> Mencari...
                  </div>
                )}
                {!searchingLecturers && lecturerSearch.trim().length >= 2 && lecturerResults.length === 0 && (
                  <div className="mt-2 text-xs text-muted-foreground italic">
                    Tidak ada dosen ditemukan.
                  </div>
                )}
                {lecturerResults.length > 0 && (
                  <div className="mt-2 border rounded-md divide-y bg-background max-h-[200px] overflow-y-auto">
                    {lecturerResults.map((lr: any) => {
                      const name = lr.fullName || lr.name || lr.user?.fullName || lr.user?.name || "—";
                      const email = lr.email || lr.user?.email || "";
                      const nip = lr.nip || lr.user?.nip || "";
                      const facultyDept = [lr.department, lr.faculty].filter(Boolean).join(" • ");

                      return (
                        <div
                          key={lr.id || lr.lecturerId}
                          className="p-2.5 flex items-center justify-between hover:bg-muted/20 transition-colors"
                        >
                          <div>
                            <div className="text-xs font-semibold text-gray-900">
                              {name}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-1.5">
                              {email && <span>{email}</span>}
                              {nip && <span>• NIP: {nip}</span>}
                              {facultyDept && <span>• {facultyDept}</span>}
                              {!email && !nip && !facultyDept && <span>—</span>}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="h-6 text-[10px] gap-1 px-2"
                            disabled={assigning}
                            onClick={() => handleAssignLecturer(lr)}
                          >
                            {assigning ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <><Plus className="h-3 w-3" /> Tambah</>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Existing lecturers list */}
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat data dosen...
              </div>
            ) : lecturers.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground italic bg-muted/10">
                Belum ada data dosen untuk kelas ini.
              </div>
            ) : (
              <div className="divide-y max-h-[300px] overflow-y-auto">
                {lecturers.map((l: any) => {
                  const name =
                    l.lecturer?.fullName ||
                    l.lecturer?.name ||
                    l.lecturer?.user?.fullName ||
                    l.lecturer?.user?.name ||
                    l.user?.fullName ||
                    l.user?.name ||
                    l.fullName ||
                    l.name ||
                    "—";
                  const email =
                    l.lecturer?.email ||
                    l.lecturer?.user?.email ||
                    l.user?.email ||
                    l.email ||
                    "";
                  const nip =
                    l.lecturer?.nip ||
                    l.lecturer?.user?.nip ||
                    l.user?.nip ||
                    l.nip ||
                    "";
                  const facultyDept = [
                    l.lecturer?.department || l.department,
                    l.lecturer?.faculty || l.faculty,
                  ]
                    .filter(Boolean)
                    .join(" • ");

                  return (
                    <div
                      key={l.id || l.lecturerId || l.lecturer?.id}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/30 transition-colors gap-2"
                    >
                      <div>
                        <div className="text-sm font-semibold text-primary">{name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2">
                          {email && <span>{email}</span>}
                          {nip && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                              NIP: {nip}
                            </Badge>
                          )}
                          {facultyDept && (
                            <span className="text-[11px] text-muted-foreground/80">
                              {facultyDept}
                            </span>
                          )}
                          {!email && !nip && !facultyDept && <span>—</span>}
                        </div>
                      </div>
                      <button
                        title="Hapus dosen dari kelas"
                        onClick={() => handleRemoveLecturer(l)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors self-end sm:self-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="mahasiswa" className="mt-0 outline-none">
          <Card className="border shadow-sm bg-background">
            {/* Header with add button */}
            <div className="p-3 border-b flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {students.length} mahasiswa terdaftar
              </span>
              <Button
                size="sm"
                variant={showAddStudent ? "outline" : "default"}
                className="h-7 text-xs gap-1.5"
                onClick={() => {
                  setShowAddStudent(!showAddStudent);
                  setStudentSearch("");
                  setStudentResults([]);
                }}
              >
                {showAddStudent ? (
                  <><X className="h-3 w-3" /> Tutup</>
                ) : (
                  <><UserPlus className="h-3 w-3" /> Tambah Mahasiswa</>
                )}
              </Button>
            </div>

            {/* Add student search panel */}
            {showAddStudent && (
              <div className="p-3 border-b bg-muted/5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Cari mahasiswa berdasarkan nama atau email..."
                    className="pl-8 h-8 text-xs"
                    value={studentSearch}
                    onChange={(e) => handleSearchStudents(e.target.value)}
                    autoFocus
                  />
                </div>
                {searchingStudents && (
                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" /> Mencari...
                  </div>
                )}
                {!searchingStudents && studentSearch.trim().length >= 2 && studentResults.length === 0 && (
                  <div className="mt-2 text-xs text-muted-foreground italic">
                    Tidak ada mahasiswa ditemukan.
                  </div>
                )}
                {studentResults.length > 0 && (
                  <div className="mt-2 border rounded-md divide-y bg-background max-h-[200px] overflow-y-auto">
                    {studentResults.map((sr: any) => {
                      const name = sr.fullName || sr.name || sr.user?.fullName || sr.user?.name || "—";
                      const email = sr.email || sr.user?.email || "";
                      const nim = sr.registration?.nim || sr.nim || "";

                      return (
                        <div
                          key={sr.id || sr.studentId}
                          className="p-2.5 flex items-center justify-between hover:bg-muted/20 transition-colors"
                        >
                          <div>
                            <div className="text-xs font-semibold text-gray-900">
                              {name}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-1.5">
                              {email && <span>{email}</span>}
                              {nim && <span>• NIM: {nim}</span>}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="h-6 text-[10px] gap-1 px-2"
                            disabled={assigningStudent}
                            onClick={() => handleAddStudent(sr)}
                          >
                            {assigningStudent ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <><Plus className="h-3 w-3" /> Tambah</>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Existing students list */}
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat data mahasiswa...
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground italic bg-muted/10">
                Belum ada data mahasiswa untuk kelas ini.
              </div>
            ) : (
              <div className="divide-y max-h-[300px] overflow-y-auto">
                {students.map((s: any) => {
                  const studentName =
                    s.student?.fullName ||
                    s.student?.name ||
                    s.student?.user?.fullName ||
                    s.student?.user?.name ||
                    s.user?.fullName ||
                    s.user?.name ||
                    s.fullName ||
                    s.name ||
                    "—";
                  const studentEmail =
                    s.student?.email ||
                    s.student?.user?.email ||
                    s.user?.email ||
                    s.email ||
                    "";
                  const nim =
                    s.student?.registration?.nim ||
                    s.registration?.nim ||
                    s.student?.nim ||
                    s.nim ||
                    "";

                  return (
                    <div
                      key={s.id || s.studentId}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/30 transition-colors gap-2"
                    >
                      <div>
                        <div className="text-sm font-semibold text-primary">{studentName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {studentEmail || "—"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {nim && (
                          <Badge variant="outline" className="text-[10px]">
                            NIM: {nim}
                          </Badge>
                        )}
                        <button
                          title="Hapus mahasiswa dari kelas"
                          onClick={() => handleRemoveStudent(s)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface Lecture {
  id: string;
  name: string;
  semester?: string | number;
  academicYear?: string;
  academicTerm?: string;
  term?: string;
  recordStatus?: string;
  createdAt?: string;
  students?: any[];
  lecturers?: any[];
  _count?: {
    students?: number;
    lecturers?: number;
    lectureStudents?: number;
    lectureLecturers?: number;
    classStudents?: number;
    classLecturers?: number;
  };
}

function getSemesterDisplay(l: Lecture): string {
  const sem =
    l.semester ??
    l.academicTerm ??
    l.term ??
    l.academicYear ??
    (l as any).period ??
    (l as any).academicPeriod;

  if (sem !== undefined && sem !== null && String(sem).trim() !== "") {
    const s = String(sem).trim();
    if (/^\d+$/.test(s)) {
      return `Semester ${s}`;
    }
    return s;
  }
  return "—";
}

export default function AdminLecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [countsMap, setCountsMap] = useState<Record<string, { lecturers?: number; students?: number }>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const navigate = useNavigate();

  const [expandedLectures, setExpandedLectures] = useState<Set<string>>(new Set());

  // Create dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    semester: "",
    description: "",
  });

  const toggleLecture = (id: string) => {
    setExpandedLectures((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateLectureCounts = (lectureId: string, counts: { lecturers: number; students: number }) => {
    setCountsMap((prev) => ({
      ...prev,
      [lectureId]: counts,
    }));
  };

  const fetchLectures = async () => {
    setLoading(true);
    const res = await adminLecturesApi.list({
      search: search || undefined,
      semester: semester || undefined,
      recordStatus: statusFilter || undefined,
      take: 50,
    });
    if (res.status === 401) { navigate("/login"); return; }
    if (res.ok && res.data) {
      const body = res.data as { data?: Lecture[]; lectures?: Lecture[] };
      const list = body.data || body.lectures || (Array.isArray(body) ? body : []);
      setLectures(list);

      // Fetch accurate counts in background for each lecture
      list.forEach(async (lec: Lecture) => {
        try {
          const lecId = String(lec.id);
          const [lecRes, stuRes, stuClassRes] = await Promise.all([
            adminLecturesApi.listLecturers(lecId).catch(() => null),
            adminLecturesApi.listStudents(lecId).catch(() => null),
            adminUsersApi.list({ role: "student", classId: lecId }).catch(() => null),
          ]);

          let lecturerCount = 0;
          if (lecRes && lecRes.ok && lecRes.data) {
            const d = lecRes.data as any;
            const arr = d.data || d.lecturers || (Array.isArray(d) ? d : []);
            lecturerCount = arr.length;
          }

          let studentCount = 0;
          if (stuRes && stuRes.ok && stuRes.data) {
            const d = stuRes.data as any;
            const arr = d.data || d.students || (Array.isArray(d) ? d : []);
            studentCount = arr.length;
          } else if (stuClassRes && stuClassRes.ok && stuClassRes.data) {
            const d = stuClassRes.data as any;
            const arr = d.data || d.users || (Array.isArray(d) ? d : []);
            studentCount = arr.length;
          }

          setCountsMap((prev) => ({
            ...prev,
            [lecId]: { lecturers: lecturerCount, students: studentCount },
          }));
        } catch (e) {
          console.error(e);
        }
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchLectures(); }, []);

  const notify = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus kelas "${name}"?`)) return;
    const res = await adminLecturesApi.delete(id);
    notify(res.ok ? "Kelas berhasil dihapus." : "Gagal menghapus kelas.");
    fetchLectures();
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      alert("Nama kelas wajib diisi.");
      return;
    }

    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        name: createForm.name.trim(),
      };
      if (createForm.semester.trim()) {
        payload.semester = parseInt(createForm.semester.trim()) || createForm.semester.trim();
      }
      if (createForm.description.trim()) {
        payload.description = createForm.description.trim();
      }

      const res = await adminLecturesApi.create(payload);

      if (res.ok) {
        notify("Kelas baru berhasil ditambahkan.");
        setIsCreateOpen(false);
        setCreateForm({ name: "", semester: "", description: "" });
        fetchLectures();
      } else {
        const errData = res.data as any;
        alert(errData?.message || "Gagal menambahkan kelas.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menambahkan kelas.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
        <Card className="shadow-sm border rounded-lg">
          <CardContent className="p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari kelas..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchLectures()}
              />
            </div>
            <Input
              placeholder="Semester (mis: 1 atau 2024/2025)"
              className="w-52"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            />
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
            <Button onClick={fetchLectures} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Cari
            </Button>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Tambah Kelas
            </Button>
          </CardContent>
        </Card>

        {actionMsg && (
          <div className="text-sm font-medium px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
            {actionMsg}
          </div>
        )}

        <Card className="shadow-sm border rounded-lg overflow-hidden">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 font-serif text-primary">
              <BookOpen className="h-5 w-5" /> Daftar Kelas ({lectures.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <RefreshCw className="animate-spin h-5 w-5 mr-2" /> Memuat data...
              </div>
            ) : lectures.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm">
                Tidak ada kelas ditemukan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Nama Kelas</th>
                      <th className="px-4 py-3 text-left">Semester</th>
                      <th className="px-4 py-3 text-left">Mahasiswa</th>
                      <th className="px-4 py-3 text-left">Dosen</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {lectures.map((l) => {
                      const isExpanded = expandedLectures.has(l.id);
                      const lecId = String(l.id);
                      const lecturerCount =
                        l._count?.lecturers ??
                        l._count?.lectureLecturers ??
                        l._count?.classLecturers ??
                        (Array.isArray(l.lecturers) ? l.lecturers.length : undefined) ??
                        (l as any).lecturerCount ??
                        (l as any).lecturersCount ??
                        countsMap[lecId]?.lecturers;

                      const studentCount =
                        l._count?.students ??
                        l._count?.lectureStudents ??
                        l._count?.classStudents ??
                        (Array.isArray(l.students) ? l.students.length : undefined) ??
                        (l as any).studentCount ??
                        (l as any).studentsCount ??
                        countsMap[lecId]?.students;

                      return (
                        <React.Fragment key={l.id}>
                          <tr 
                            className="hover:bg-muted/10 transition-colors cursor-pointer"
                            onClick={() => toggleLecture(l.id)}
                          >
                            <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                              {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                              {l.name}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">{getSemesterDisplay(l)}</td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                {studentCount !== undefined ? studentCount : "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {lecturerCount !== undefined ? lecturerCount : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={l.recordStatus === "active" ? "default" : "outline"} className="text-xs">
                                {l.recordStatus === "active" ? "Aktif" : "Tidak Aktif"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center">
                                <button
                                  title="Hapus Kelas"
                                  onClick={(e) => { e.stopPropagation(); handleDelete(l.id, l.name); }}
                                  className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="p-0 border-b">
                                <LectureDetails
                                  lectureId={l.id}
                                  onLectureChanged={updateLectureCounts}
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog Tambah Kelas */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <Plus className="h-5 w-5" /> Tambah Kelas Baru
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="create-name">
                  Nama Kelas <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="create-name"
                  placeholder="Contoh: TI-2026-B"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-semester">Semester</Label>
                <Input
                  id="create-semester"
                  placeholder="Contoh: 1"
                  value={createForm.semester}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, semester: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-description">Deskripsi</Label>
                <Textarea
                  id="create-description"
                  placeholder="Deskripsi kelas (opsional)"
                  rows={3}
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={creating}
              >
                Batal
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating || !createForm.name.trim()}
                className="flex items-center gap-2"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                {creating ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
