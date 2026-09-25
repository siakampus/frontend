import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminUsersApi } from "@/lib/api";
import {
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  KeyRound,
  Trash2,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Loader2,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  namaLengkap?: string;
  role: string;
  recordStatus: string;
  createdAt: string;
  lecturer?: { fullName?: string; name?: string; nip?: string };
  lecturerProfile?: { fullName?: string; name?: string; nip?: string };
  student?: { fullName?: string; name?: string; nim?: string };
  studentProfile?: { fullName?: string; name?: string; nim?: string };
  registration?: { fullName?: string; name?: string; namaLengkap?: string; nim?: string };
  registrationData?: { fullName?: string; name?: string; namaLengkap?: string; nim?: string };
  profile?: { fullName?: string; name?: string };
  guestProfile?: { fullName?: string; name?: string };
}

function getUserDisplayName(u: User): string {
  const name =
    u.fullName ||
    u.name ||
    u.namaLengkap ||
    u.lecturer?.fullName ||
    u.lecturer?.name ||
    u.lecturerProfile?.fullName ||
    u.lecturerProfile?.name ||
    u.student?.fullName ||
    u.student?.name ||
    u.studentProfile?.fullName ||
    u.studentProfile?.name ||
    u.registration?.fullName ||
    u.registration?.namaLengkap ||
    u.registration?.name ||
    u.registrationData?.fullName ||
    u.registrationData?.namaLengkap ||
    u.registrationData?.name ||
    u.profile?.fullName ||
    u.profile?.name ||
    u.guestProfile?.fullName ||
    u.guestProfile?.name;

  if (name && name.trim()) return name.trim();
  if (u.email) {
    return u.email.split("@")[0];
  }
  return "—";
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  lecturer: "bg-blue-100 text-blue-700",
  assistant_lecturer: "bg-cyan-100 text-cyan-700",
  student: "bg-green-100 text-green-700",
  calon_mahasiswa: "bg-amber-100 text-amber-700",
  guest: "bg-gray-100 text-gray-600",
};

const ROLE_OPTIONS = [
  { value: "guest", label: "Guest" },
  { value: "calon_mahasiswa", label: "Calon Mahasiswa" },
  { value: "student", label: "Mahasiswa" },
  { value: "assistant_lecturer", label: "Asisten Dosen" },
  { value: "lecturer", label: "Dosen" },
  { value: "admin", label: "Admin" },
] as const;

type RoleValue = (typeof ROLE_OPTIONS)[number]["value"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const navigate = useNavigate();

  // Add-user modal state
  const [addOpen, setAddOpen] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [addRole, setAddRole] = useState<RoleValue>("guest");
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await adminUsersApi.list({
      search: search || undefined,
      role: roleFilter || undefined,
      recordStatus: statusFilter || undefined,
      take: 50,
    });
    if (res.status === 401) { navigate("/login"); return; }
    if (res.ok && res.data) {
      const body = res.data as { data?: User[]; users?: User[] };
      setUsers(body.data || (body as unknown as User[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const notify = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const handleUpdateRole = async (id: string, role: string) => {
    const newRole = prompt(`Masukkan role baru untuk user (admin/lecturer/student/guest):`, role);
    if (!newRole) return;
    const res = await adminUsersApi.updateRole(id, newRole.trim());
    notify(res.ok ? "Role berhasil diubah." : "Gagal mengubah role.");
    fetchUsers();
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus: "active" | "inactive" = currentStatus === "active" ? "inactive" : "active";
    const res = await adminUsersApi.updateStatus(id, newStatus);
    notify(res.ok ? `Status diubah ke ${newStatus}.` : "Gagal mengubah status.");
    fetchUsers();
  };

  const handleResetPassword = async (id: string) => {
    if (!confirm("Kirim email reset password ke user ini?")) return;
    const res = await adminUsersApi.resetPassword(id);
    notify(res.ok ? "Email reset password terkirim." : "Gagal mengirim email.");
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Hapus permanen user "${email}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    const res = await adminUsersApi.delete(id);
    notify(res.ok ? "User berhasil dihapus." : "Gagal menghapus user.");
    fetchUsers();
  };

  // ── Add-user modal handlers ──

  const resetAddForm = () => {
    setAddEmail("");
    setAddName("");
    setAddPassword("");
    setShowPassword(false);
    setAddRole("guest");
    setAddError("");
    setAddSuccess(false);
  };

  const handleAddOpenChange = (open: boolean) => {
    setAddOpen(open);
    if (!open) resetAddForm();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    const email = addEmail.trim().toLowerCase();
    const name = addName.trim();

    if (!email) { setAddError("Email wajib diisi."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setAddError("Format email tidak valid."); return; }
    if (!name) { setAddError("Nama wajib diisi."); return; }
    if (!addPassword) { setAddError("Password wajib diisi."); return; }
    if (addPassword.length < 8) { setAddError("Password minimal 8 karakter."); return; }

    if (addRole === "admin") {
      if (!confirm("Anda akan membuat user dengan role Admin. Lanjutkan?")) return;
    }

    setAddSubmitting(true);
    try {
      const res = await adminUsersApi.create({ email, name, password: addPassword, role: addRole });

      if (!res.ok) {
        const err = res.data as { message?: string; error?: string };
        const msg = err?.message || err?.error || "Gagal membuat user.";
        if (msg.includes("already exists")) {
          setAddError("Email ini sudah terdaftar.");
        } else if (msg.includes("Invalid role")) {
          setAddError("Role tidak valid.");
        } else {
          setAddError(msg);
        }
        return;
      }

      setAddSuccess(true);
      notify(`User "${name}" berhasil dibuat.`);
      fetchUsers();
    } catch {
      setAddError("Terjadi kesalahan jaringan.");
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleCopyPassword = async () => {
    await navigator.clipboard.writeText(addTempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
        {/* Toolbar */}
        <Card className="shadow-sm border rounded-lg">
          <CardContent className="p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari email atau nama..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="lecturer">Dosen</option>
              <option value="student">Mahasiswa</option>
              <option value="guest">Tamu</option>
            </select>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
            <Button onClick={fetchUsers} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Cari
            </Button>

            {/* ── Add User trigger ── */}
            <Dialog open={addOpen} onOpenChange={handleAddOpenChange}>
              <DialogTrigger asChild>
                <Button id="add-user-btn" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Tambah User
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                {addSuccess ? (
                  /* ─── Success state ─── */
                  <div className="space-y-4">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-green-700">
                        <Check className="h-5 w-5" /> User Berhasil Dibuat
                      </DialogTitle>
                      <DialogDescription>
                        Akun baru telah dibuat. Password sementara sudah dikirim via email.
                      </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => handleAddOpenChange(false)}>
                        Tutup
                      </Button>
                      <Button onClick={resetAddForm}>
                        <UserPlus className="h-4 w-4 mr-2" /> Tambah Lagi
                      </Button>
                    </DialogFooter>
                  </div>
                ) : (
                  /* ─── Form state ─── */
                  <form onSubmit={handleAddSubmit}>
                    <DialogHeader>
                      <DialogTitle>Tambah User Baru</DialogTitle>
                      <DialogDescription>
                        Buat akun pengguna baru. Password akan digenerate otomatis dan dikirim ke email.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      {/* Email */}
                      <div className="grid gap-2">
                        <Label htmlFor="add-user-email">Email</Label>
                        <Input
                          id="add-user-email"
                          type="email"
                          placeholder="user@example.com"
                          value={addEmail}
                          onChange={(e) => setAddEmail(e.target.value)}
                          disabled={addSubmitting}
                          autoFocus
                          required
                        />
                      </div>

                      {/* Name */}
                      <div className="grid gap-2">
                        <Label htmlFor="add-user-name">Nama</Label>
                        <Input
                          id="add-user-name"
                          type="text"
                          placeholder="Nama lengkap"
                          value={addName}
                          onChange={(e) => setAddName(e.target.value)}
                          disabled={addSubmitting}
                          required
                        />
                      </div>

                      {/* Password */}
                      <div className="grid gap-2">
                        <Label htmlFor="add-user-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="add-user-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimal 8 karakter"
                            value={addPassword}
                            onChange={(e) => setAddPassword(e.target.value)}
                            disabled={addSubmitting}
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {addPassword.length > 0 && addPassword.length < 8 && (
                          <p className="text-xs text-amber-600">Masih kurang {8 - addPassword.length} karakter</p>
                        )}
                      </div>

                      {/* Role */}
                      <div className="grid gap-2">
                        <Label htmlFor="add-user-role">Role</Label>
                        <Select
                          value={addRole}
                          onValueChange={(v) => setAddRole(v as RoleValue)}
                          disabled={addSubmitting}
                        >
                          <SelectTrigger id="add-user-role" className="w-full">
                            <SelectValue placeholder="Pilih role" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Admin role warning */}
                      {addRole === "admin" && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                          ⚠ Role Admin memberikan akses penuh ke seluruh sistem.
                        </div>
                      )}

                      {/* Error message */}
                      {addError && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                          {addError}
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddOpenChange(false)}
                        disabled={addSubmitting}
                      >
                        Batal
                      </Button>
                      <Button type="submit" disabled={addSubmitting} className="min-w-[100px]">
                        {addSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Membuat...
                          </>
                        ) : (
                          "Buat User"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Action feedback */}
        {actionMsg && (
          <div className="text-sm font-medium px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
            {actionMsg}
          </div>
        )}

        {/* Table */}
        <Card className="shadow-sm border rounded-lg overflow-hidden">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 font-serif text-primary">
              <Users className="h-5 w-5" /> Daftar Pengguna ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <RefreshCw className="animate-spin h-5 w-5 mr-2" /> Memuat data...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm">
                Tidak ada pengguna ditemukan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Email / Nama</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Bergabung</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{getUserDisplayName(u)}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-600"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={u.recordStatus === "active" ? "default" : "outline"} className="text-xs">
                            {u.recordStatus === "active" ? "Aktif" : "Tidak Aktif"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              title="Ubah Role"
                              onClick={() => handleUpdateRole(u.id, u.role)}
                              className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors"
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </button>
                            <button
                              title="Toggle Status"
                              onClick={() => handleToggleStatus(u.id, u.recordStatus)}
                              className="p-1.5 rounded hover:bg-amber-50 text-amber-600 transition-colors"
                            >
                              {u.recordStatus === "active" ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              title="Reset Password"
                              onClick={() => handleResetPassword(u.id)}
                              className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                            >
                              <KeyRound className="h-4 w-4" />
                            </button>
                            <button
                              title="Hapus User"
                              onClick={() => handleDelete(u.id, u.email)}
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
