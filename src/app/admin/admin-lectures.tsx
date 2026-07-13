import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminLecturesApi } from "@/lib/api";
import { BookOpen, Search, RefreshCw, Trash2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    notify(res.ok ? "✅ Kelas berhasil dihapus." : "❌ Gagal menghapus kelas.");
    fetchLectures();
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
                    {lectures.map((l) => (
                      <tr key={l.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{l.name}</td>
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
                              onClick={() => handleDelete(l.id, l.name)}
                              className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
