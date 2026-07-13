import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  recordStatus: string;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  lecturer: "bg-blue-100 text-blue-700",
  student: "bg-green-100 text-green-700",
  guest: "bg-gray-100 text-gray-600",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const navigate = useNavigate();

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
    notify(res.ok ? "✅ Role berhasil diubah." : "❌ Gagal mengubah role.");
    fetchUsers();
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus: "active" | "inactive" = currentStatus === "active" ? "inactive" : "active";
    const res = await adminUsersApi.updateStatus(id, newStatus);
    notify(res.ok ? `✅ Status diubah ke ${newStatus}.` : "❌ Gagal mengubah status.");
    fetchUsers();
  };

  const handleResetPassword = async (id: string) => {
    if (!confirm("Kirim email reset password ke user ini?")) return;
    const res = await adminUsersApi.resetPassword(id);
    notify(res.ok ? "✅ Email reset password terkirim." : "❌ Gagal mengirim email.");
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Hapus permanen user "${email}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    const res = await adminUsersApi.delete(id);
    notify(res.ok ? "✅ User berhasil dihapus." : "❌ Gagal menghapus user.");
    fetchUsers();
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
                          <div className="font-medium text-gray-900">{u.name || "—"}</div>
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
