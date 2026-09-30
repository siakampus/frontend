import { useState, useEffect } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { thesisApi, lecturerApi } from "@/lib/api";

export default function AdminDosenPembimbingPage() {
  const [theses, setTheses] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [assignModal, setAssignModal] = useState<{ thesisId: number; thesisTitle: string } | null>(null);
  const [assignForm, setAssignForm] = useState({ lecturerId: "", role: "PEMBIMBING_1" });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [thesesRes, lecturersRes] = await Promise.all([
      thesisApi.getAllTheses("status=APPROVED&limit=100"),
      typeof lecturerApi !== "undefined"
        ? lecturerApi.getAll?.()
        : fetch("/admin/lecturers", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, credentials: "include" }).then(r => r.json()),
    ]);
    if (thesesRes.ok && thesesRes.data?.data) {
      setTheses(thesesRes.data.data.theses || []);
    }
    if (lecturersRes?.ok !== false) {
      const data = lecturersRes?.data?.data || lecturersRes?.lecturers || lecturersRes?.data || [];
      setLecturers(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }

  async function handleAssign() {
    if (!assignModal || !assignForm.lecturerId) return;
    setSaving(true);
    setError("");
    setSuccess("");

    const res = await thesisApi.assignSupervisor(assignModal.thesisId, {
      lecturerId: parseInt(assignForm.lecturerId),
      role: assignForm.role,
    });

    if (res.ok) {
      setSuccess("Dosen pembimbing berhasil ditugaskan");
      setAssignModal(null);
      setAssignForm({ lecturerId: "", role: "PEMBIMBING_1" });
      await fetchData();
    } else {
      setError((res.data as any)?.message || "Gagal menugaskan dosen");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <AppLayout menuTemplate="admin" title="Assign Dosen Pembimbing">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout menuTemplate="admin" title="Assign Dosen Pembimbing" subtitle="Tugaskan dosen pembimbing untuk tugas akhir">
      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">NIM</th>
              <th className="text-left px-4 py-3 font-medium">Judul TA</th>
              <th className="text-left px-4 py-3 font-medium">Pembimbing 1</th>
              <th className="text-left px-4 py-3 font-medium">Pembimbing 2</th>
              <th className="text-left px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {theses.map((t) => {
              const p1 = t.supervisors?.find((s: any) => s.role === "PEMBIMBING_1");
              const p2 = t.supervisors?.find((s: any) => s.role === "PEMBIMBING_2");
              return (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{t.student?.studentDataId || "-"}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-xs">{t.title}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {p1 ? (
                      <span className="text-green-700">{p1.lecturer?.fullName}</span>
                    ) : (
                      <span className="text-gray-400">— kosong —</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {p2 ? (
                      <span className="text-green-700">{p2.lecturer?.fullName}</span>
                    ) : (
                      <span className="text-gray-400">— kosong —</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setAssignModal({ thesisId: t.id, thesisTitle: t.title })}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      + Assign
                    </button>
                  </td>
                </tr>
              );
            })}
            {theses.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Tidak ada TA yang disetujui</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="font-semibold mb-1">Assign Dosen Pembimbing</h3>
            <p className="text-sm text-gray-500 mb-4 truncate">{assignModal.thesisTitle}</p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Peran</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={assignForm.role}
                  onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })}
                >
                  <option value="PEMBIMBING_1">Pembimbing 1</option>
                  <option value="PEMBIMBING_2">Pembimbing 2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dosen</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={assignForm.lecturerId}
                  onChange={(e) => setAssignForm({ ...assignForm, lecturerId: e.target.value })}
                >
                  <option value="">Pilih dosen</option>
                  {lecturers.map((l: any) => (
                    <option key={l.id} value={l.id}>
                      {l.fullName || l.full_name} — {l.nip}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setAssignModal(null)} className="px-4 py-2 border rounded-lg text-sm">
                Batal
              </button>
              <button
                onClick={handleAssign}
                disabled={!assignForm.lecturerId || saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
