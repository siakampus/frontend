import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminUsersApi, adminLecturersApi, jurusanApi } from "@/lib/api";
import { GraduationCap, Search, RefreshCw, UserCheck, UserX, Plus, X, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Lecturer {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  recordStatus?: string;
  createdAt?: string;
  // legacy lecturer profile fields (if present)
  nip?: string;
  fullName?: string;
  faculty?: string;
  department?: string;
  course?: string;
  academics?: string;
}

type Major = { id: number; name: string; facultyId: number };
type Faculty = { id: number; name: string; majors: Major[] };

export default function AdminLecturersPage() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Lecturer & { email: string; password: string }>>({});
  const navigate = useNavigate();

  // Faculty & department dropdown state
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Major[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | "">("");

  // Fetch faculties on mount
  useEffect(() => {
    const fetchFaculties = async () => {
      const res = await jurusanApi.listFaculties();
      if (res.ok && res.data) {
        const body = res.data as { data?: Faculty[]; faculties?: Faculty[] } | Faculty[];
        const list = Array.isArray(body) ? body : ((body as { data?: Faculty[]; faculties?: Faculty[] }).data || (body as { data?: Faculty[]; faculties?: Faculty[] }).faculties || []);
        setFaculties(list);
      }
    };
    fetchFaculties();
  }, []);

  // When faculty changes, update departments
  useEffect(() => {
    if (selectedFacultyId === "") {
      setDepartments([]);
      return;
    }
    const faculty = faculties.find((f) => f.id === selectedFacultyId);
    if (faculty && faculty.majors && faculty.majors.length > 0) {
      setDepartments(faculty.majors);
    } else {
      // Fallback: fetch from API if majors not nested
      const fetchDepartments = async () => {
        const res = await jurusanApi.listMajors(selectedFacultyId as number);
        if (res.ok && res.data) {
          const body = res.data as { data?: Major[]; majors?: Major[] } | Major[];
          const list = Array.isArray(body) ? body : ((body as { data?: Major[]; majors?: Major[] }).data || (body as { data?: Major[]; majors?: Major[] }).majors || []);
          setDepartments(list);
        }
      };
      fetchDepartments();
    }
    // Reset department selection when faculty changes
    setFormData((prev) => ({ ...prev, department: "" }));
  }, [selectedFacultyId, faculties]);

  const fetchLecturers = async () => {
    setLoading(true);
    const res = await adminLecturersApi.list({
      search: search || undefined,
      take: 50,
    });
    if (res.status === 401) { navigate("/login"); return; }
    if (res.ok && res.data) {
      const body = res.data as { data?: Lecturer[]; users?: Lecturer[]; lecturers?: Lecturer[] };
      setLecturers(body.data || body.lecturers || body.users || (res.data as unknown as Lecturer[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLecturers(); }, []);

  const notify = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Nonaktifkan dosen ini?")) return;
    const res = await adminUsersApi.updateStatus(id, "inactive");
    notify(res.ok ? "Dosen berhasil dinonaktifkan." : "Gagal menonaktifkan dosen.");
    fetchLecturers();
  };

  const handleReactivate = async (id: string) => {
    const res = await adminUsersApi.updateStatus(id, "active");
    notify(res.ok ? "Dosen berhasil diaktifkan kembali." : "Gagal mengaktifkan dosen.");
    fetchLecturers();
  };

  const handleOpenForm = () => {
    setFormData({});
    setSelectedFacultyId("");
    setDepartments([]);
    setShowForm(true);
  };

  const handleAddLecturer = async () => {
    if (!formData.fullName || !formData.nip || !formData.faculty) {
      alert("Mohon lengkapi Nama, NIP, dan Fakultas.");
      return;
    }
    const payload = {
      ...formData,
      course: formData.department || "",
    };
    const res = await adminLecturersApi.create(payload as Record<string, unknown>);
    if (res.ok) {
      notify("Dosen berhasil ditambahkan.");
      setShowForm(false);
      setFormData({});
      setSelectedFacultyId("");
      fetchLecturers();
    } else {
      const err = res.data as { message?: string };
      notify(`Gagal: ${err?.message || "Error."}`);
    }
  };

  // Fields that remain as text inputs (excluding faculty & department which are now dropdowns)
  const textFields = [
    { label: "Nama Lengkap *", key: "fullName", placeholder: "Nama lengkap" },
    { label: "NIP *", key: "nip", placeholder: "Nomor Induk Pegawai" },
    { label: "NIK", key: "nik", placeholder: "Nomor Induk Kependudukan" },
  ];

  const academicOptions = [
    { value: "D3", label: "D3 (Diploma)" },
    { value: "D4", label: "D4 (Sarjana Terapan)" },
    { value: "S1", label: "S1 (Sarjana)" },
    { value: "S2", label: "S2 (Magister)" },
    { value: "S3", label: "S3 (Doktor)" },
    { value: "Profesi", label: "Profesi" },
  ];

  const textFieldsAfter = [
    { label: "Telepon", key: "phoneNumber", placeholder: "Nomor telepon" },
    { label: "Email Akun *", key: "email", placeholder: "email@ugn.ac.id" },
    { label: "Password Sementara *", key: "password", placeholder: "Min. 8 karakter" },
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card className="shadow-sm border rounded-lg">
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email dosen..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchLecturers()}
            />
          </div>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
          <Button onClick={fetchLecturers} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Cari
          </Button>
          <Button className="flex items-center gap-2 ml-auto" onClick={handleOpenForm}>
            <Plus className="h-4 w-4" /> Tambah Dosen
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
            <GraduationCap className="h-5 w-5" /> Daftar Dosen ({lecturers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="animate-spin h-5 w-5 mr-2" /> Memuat data...
            </div>
          ) : lecturers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              Tidak ada dosen ditemukan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/20 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Nama / NIP</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Fakultas</th>
                    <th className="px-4 py-3 text-left">Departemen</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lecturers.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{l.fullName || l.name || "—"}</div>
                        <div className="text-xs text-muted-foreground">NIP: {l.nip || "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{l.email || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">{l.faculty || "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{l.department || l.course || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={l.recordStatus === "active" ? "default" : "outline"} className="text-xs">
                          {l.recordStatus === "active" ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {l.recordStatus === "active" ? (
                            <button
                              title="Nonaktifkan"
                              onClick={() => handleDeactivate(l.id)}
                              className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              title="Aktifkan Kembali"
                              onClick={() => handleReactivate(l.id)}
                              className="p-1.5 rounded hover:bg-green-50 text-green-600 transition-colors"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          )}
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

      {/* Add Lecturer Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="font-bold text-lg">Tambah Dosen Baru</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-3">
              {/* Text fields before dropdowns */}
              {textFields.map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-sm font-medium">{label}</label>
                  <Input
                    placeholder={placeholder}
                    value={(formData as Record<string, string>)[key] || ""}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  />
                </div>
              ))}

              {/* Fakultas Dropdown */}
              <div>
                <label className="text-sm font-medium">Fakultas *</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={selectedFacultyId}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : "";
                    setSelectedFacultyId(id);
                    const facultyName = faculties.find((f) => f.id === id)?.name || "";
                    setFormData({ ...formData, faculty: facultyName });
                  }}
                >
                  <option value="">— Pilih Fakultas —</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Departemen Dropdown */}
              <div>
                <label className="text-sm font-medium">Departemen</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:bg-gray-100 disabled:text-gray-400"
                  value={(formData as Record<string, string>).department || ""}
                  disabled={selectedFacultyId === "" || departments.length === 0}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="">
                    {selectedFacultyId === ""
                      ? "— Pilih Fakultas terlebih dahulu —"
                      : departments.length === 0
                        ? "— Tidak ada departemen —"
                        : "— Pilih Departemen —"}
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Akademik Dropdown */}
              <div>
                <label className="text-sm font-medium">Akademik</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={(formData as Record<string, string>).academics || ""}
                  onChange={(e) => setFormData({ ...formData, academics: e.target.value })}
                >
                  <option value="">— Pilih Program Akademik —</option>
                  {academicOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Text fields after dropdowns */}
              {textFieldsAfter.map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-sm font-medium">{label}</label>
                  <Input
                    placeholder={placeholder}
                    type={key === "password" ? "password" : "text"}
                    value={(formData as Record<string, string>)[key] || ""}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
              <Button onClick={handleAddLecturer} className="flex items-center gap-2">
                <Save className="h-4 w-4" /> Simpan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
