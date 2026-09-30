import { useState, useEffect } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { thesisApi } from "@/lib/api";

const STATUS_FILTER = [
  { value: "", label: "Semua" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Diajukan" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REVISION", label: "Revisi" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "COMPLETED", label: "Selesai" },
];

export default function AdminPengajuanTAPage() {
  const [theses, setTheses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reasonModal, setReasonModal] = useState<{ id: number; action: string } | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchData();
  }, [page, statusFilter]);

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("limit", "20");
    const res = await thesisApi.getAllTheses(params.toString());
    if (res.ok && res.data?.data) {
      setTheses(res.data.data.theses);
      setTotal(res.data.data.total);
    }
    setLoading(false);
  }

  async function handleAction(id: number, action: string, actionReason?: string) {
    setActionLoading(id);
    setError("");
    setSuccess("");
    let res;
    if (action === "approve") res = await thesisApi.approveThesis(id);
    else if (action === "reject") res = await thesisApi.rejectThesis(id, actionReason || "");
    else if (action === "revision") res = await thesisApi.requestRevision(id, actionReason || "");
    else return;

    if (res!.ok) {
      setSuccess(`Pengajuan berhasil di-${action}`);
      setReasonModal(null);
      setReason("");
      await fetchData();
    } else {
      setError((res!.data as any)?.message || `Gagal ${action}`);
    }
    setActionLoading(null);
  }

  return (
    <AppLayout menuTemplate="admin" title="Pengajuan Tugas Akhir" subtitle="Review dan kelola pengajuan TA mahasiswa">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Filter Status:</label>
        <select
          className="border rounded-lg px-3 py-1.5 text-sm"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          {STATUS_FILTER.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500 ml-auto">{total} pengajuan</span>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">No</th>
                <th className="text-left px-4 py-3 font-medium">NIM</th>
                <th className="text-left px-4 py-3 font-medium">Judul</th>
                <th className="text-left px-4 py-3 font-medium">Topik</th>
                <th className="text-left px-4 py-3 font-medium">Pembimbing</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {theses.map((t, idx) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{(page - 1) * 20 + idx + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs">{t.student?.studentDataId || "-"}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-xs">{t.title}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{t.topic || "-"}</td>
                  <td className="px-4 py-3 text-xs">
                    {t.supervisors?.length > 0
                      ? t.supervisors.map((s: any) => s.lecturer?.fullName).join(", ")
                      : <span className="text-gray-400">Belum ditugaskan</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      t.status === "SUBMITTED" ? "bg-blue-100 text-blue-700" :
                      t.status === "APPROVED" ? "bg-green-100 text-green-700" :
                      t.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      t.status === "REVISION" ? "bg-yellow-100 text-yellow-700" :
                      t.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {t.status === "SUBMITTED" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAction(t.id, "approve")}
                          disabled={actionLoading === t.id}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => setReasonModal({ id: t.id, action: "revision" })}
                          disabled={actionLoading === t.id}
                          className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 disabled:opacity-50"
                        >
                          Revisi
                        </button>
                        <button
                          onClick={() => setReasonModal({ id: t.id, action: "reject" })}
                          disabled={actionLoading === t.id}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {theses.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Prev</button>
          <span className="px-3 py-1 text-sm">Hal {page}</span>
          <button disabled={page * 20 >= total} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
        </div>
      )}

      {/* Reason modal */}
      {reasonModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="font-semibold mb-3">
              {reasonModal.action === "reject" ? "Alasan Penolakan" : "Catatan Revisi"}
            </h3>
            <textarea
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none mb-4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Masukkan alasan..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setReasonModal(null); setReason(""); }}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Batal
              </button>
              <button
                onClick={() => handleAction(reasonModal.id, reasonModal.action, reason)}
                disabled={!reason.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
