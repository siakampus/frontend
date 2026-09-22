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

function LectureDetails({ lectureId, onLecturerChanged }: { lectureId: string; onLecturerChanged?: () => void }) {
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add lecturer state
  const [showAddLecturer, setShowAddLecturer] = useState(false);
  const [lecturerSearch, setLecturerSearch] = useState("");
  const [lecturerResults, setLecturerResults] = useState<any[]>([]);
  const [searchingLecturers, setSearchingLecturers] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [detailMsg, setDetailMsg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lecRes, stuRes] = await Promise.all([
        adminLecturesApi.listLecturers(lectureId),
        adminUsersApi.list({ role: "student", classId: lectureId }),
      ]);

      if (lecRes.ok && lecRes.data) {
        const lData = lecRes.data as any;
        setLecturers(lData.data || lData.lecturers || []);
      }

      if (stuRes.ok && stuRes.data) {
        const sData = stuRes.data as any;
        setStudents(sData.data || sData.users || []);
      }
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
        const list = body.data || body.lecturers || [];
        // Filter out lecturers already assigned
        const assignedIds = new Set(lecturers.map((l: any) => String(l.lecturerId || l.lecturer?.id || l.id)));
        setLecturerResults(list.filter((l: any) => !assignedIds.has(String(l.id))));
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
      const lecturerId = parseInt(String(lecturer.id), 10);
      const res = await adminLecturesApi.assignLecturer(lectureId, String(lecturerId));
      if (res.ok) {
        notifyDetail(`Dosen "${lecturer.fullName || lecturer.name}" berhasil ditambahkan.`);
        setLecturerSearch("");
        setLecturerResults([]);
        setShowAddLecturer(false);
        fetchData();
        onLecturerChanged?.();
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
    const lecturerId = lecturerEntry.lecturerId || lecturerEntry.lecturer?.id || lecturerEntry.id;
    const lecturerName = lecturerEntry.lecturer?.fullName || lecturerEntry.lecturer?.name || lecturerEntry.fullName || lecturerEntry.name || "Dosen";
    if (!confirm(`Hapus dosen "${lecturerName}" dari kelas ini?`)) return;

    try {
      const res = await adminLecturesApi.removeLecturer(lectureId, String(lecturerId));
      if (res.ok) {
        notifyDetail(`Dosen "${lecturerName}" berhasil dihapus dari kelas.`);
        fetchData();
        onLecturerChanged?.();
      } else {
        alert("Gagal menghapus dosen dari kelas.");
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
            <GraduationCap className="h-3.5 w-3.5" /> Dosen
          </TabsTrigger>
          <TabsTrigger value="mahasiswa" className="gap-2 text-xs">
            <Users className="h-3.5 w-3.5" /> Mahasiswa
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
                    {lecturerResults.map((lr: any) => (
                      <div
                        key={lr.id}
                        className="p-2.5 flex items-center justify-between hover:bg-muted/20 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-gray-900">
                            {lr.fullName || lr.name || "—"}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {lr.email || lr.nip || "—"}
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
                    ))}
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
                {lecturers.map((l: any) => (
                  <div key={l.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/30 transition-colors gap-2">
                    <div>
                      <div className="text-sm font-semibold text-primary">{l.lecturer?.fullName || l.lecturer?.name || l.fullName || l.name || "—"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {l.lecturer?.email || l.email || "—"}
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
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="mahasiswa" className="mt-0 outline-none">
          <Card className="border shadow-sm bg-background">
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
                {students.map((s: any) => (
                  <div key={s.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/30 transition-colors gap-2">
                    <div>
                      <div className="text-sm font-semibold text-primary">{s.student?.name || s.name || "—"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {s.student?.email || s.email || "—"}
                      </div>
                    </div>
                    {(s.student?.registration?.nim || s.registration?.nim) && (
                      <Badge variant="outline" className="text-[10px]">
                        NIM: {s.student?.registration?.nim || s.registration?.nim}
                      </Badge>
                    )}
                  </div>
                ))}
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
  semester?: string;
  recordStatus?: string;
  createdAt?: string;
  _count?: { students?: number; lecturers?: number };
}

export default function AdminLecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
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
      const body = res.data as { data?: Lecture[] };
      setLectures(body.data || (res.data as unknown as Lecture[]) || []);
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
              placeholder="Semester (mis: 2024/2025)"
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
                            <td className="px-4 py-3 text-muted-foreground text-xs">{l.semester || "—"}</td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                {l._count?.students ?? "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {l._count?.lecturers ?? "—"}
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
                                <LectureDetails lectureId={l.id} onLecturerChanged={fetchLectures} />
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

