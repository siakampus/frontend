import { useState, useEffect } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { thesisApi } from "@/lib/api";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  SUBMITTED: { label: "Diajukan", color: "bg-blue-100 text-blue-700" },
  APPROVED: { label: "Disetujui", color: "bg-green-100 text-green-700" },
  REVISION: { label: "Perlu Revisi", color: "bg-yellow-100 text-yellow-700" },
  REJECTED: { label: "Ditolak", color: "bg-red-100 text-red-700" },
  COMPLETED: { label: "Selesai", color: "bg-emerald-100 text-emerald-800" },
};

export default function PengajuanTAPage() {
  const [thesis, setThesis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    topic: "",
    abstract: "",
    notes: "",
  });

  useEffect(() => {
    fetchThesis();
  }, []);

  async function fetchThesis() {
    setLoading(true);
    const res = await thesisApi.getMyThesis();
    if (res.ok && res.data?.data) {
      const t = res.data.data;
      setThesis(t);
      setForm({
        title: t.title || "",
        topic: t.topic || "",
        abstract: t.abstract || "",
        notes: t.notes || "",
      });
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Judul tugas akhir wajib diisi");
      setSaving(false);
      return;
    }

    let res;
    if (thesis) {
      res = await thesisApi.updateThesis(thesis.id, form);
    } else {
      res = await thesisApi.createThesis(form);
    }

    if (res.ok) {
      setSuccess("Data berhasil disimpan");
      await fetchThesis();
    } else {
      setError((res.data as any)?.message || "Gagal menyimpan data");
    }
    setSaving(false);
  }

  async function handleSubmit() {
    if (!thesis) return;
    if (!confirm("Apakah Anda yakin ingin mengajukan tugas akhir ini?")) return;

    setSaving(true);
    setError("");
    const res = await thesisApi.submitForReview(thesis.id);
    if (res.ok) {
      setSuccess("Pengajuan berhasil dikirim");
      await fetchThesis();
    } else {
      setError((res.data as any)?.message || "Gagal mengirim pengajuan");
    }
    setSaving(false);
  }

  const isEditable = !thesis || thesis.status === "DRAFT" || thesis.status === "REVISION";
  const statusInfo = thesis ? STATUS_LABELS[thesis.status] || { label: thesis.status, color: "bg-gray-100" } : null;

  if (loading) {
    return (
      <AppLayout menuTemplate="student" title="Pengajuan Tugas Akhir">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout menuTemplate="student" title="Pengajuan Tugas Akhir" subtitle="Ajukan judul dan topik tugas akhir Anda">
      {/* Status banner */}
      {thesis && statusInfo && (
        <div className={`rounded-lg px-4 py-3 flex items-center justify-between ${statusInfo.color}`}>
          <div>
            <span className="font-semibold">Status: </span>
            <span>{statusInfo.label}</span>
          </div>
          {thesis.submittedAt && (
            <span className="text-sm opacity-75">
              Diajukan: {new Date(thesis.submittedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
        </div>
      )}

      {/* Rejection / Revision notes */}
      {thesis && (thesis.status === "REJECTED" || thesis.status === "REVISION") && thesis.notes && (
        <div className={`rounded-lg px-4 py-3 ${thesis.status === "REJECTED" ? "bg-red-50 border border-red-200" : "bg-yellow-50 border border-yellow-200"}`}>
          <p className="font-semibold text-sm mb-1">{thesis.status === "REJECTED" ? "Alasan Penolakan:" : "Catatan Revisi:"}</p>
          <p className="text-sm">{thesis.notes}</p>
        </div>
      )}

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      {/* Form */}
      <div className="bg-white rounded-lg border p-6 space-y-5">
        <h2 className="font-semibold text-lg">Data Tugas Akhir</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Judul Tugas Akhir <span className="text-red-500">*</span></label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            disabled={!isEditable}
            placeholder="Masukkan judul tugas akhir"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Topik / Bidang</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            disabled={!isEditable}
            placeholder="Contoh: Machine Learning, Jaringan Komputer, dll."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Abstrak</label>
          <textarea
            rows={4}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 resize-none"
            value={form.abstract}
            onChange={(e) => setForm({ ...form, abstract: e.target.value })}
            disabled={!isEditable}
            placeholder="Deskripsi singkat tentang tugas akhir Anda"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Catatan Tambahan</label>
          <textarea
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 resize-none"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            disabled={!isEditable}
            placeholder="Catatan atau keterangan tambahan"
          />
        </div>

        {isEditable && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition"
            >
              {saving ? "Menyimpan..." : "Simpan Draft"}
            </button>
            {thesis && (
              <button
                onClick={handleSubmit}
                disabled={saving || !form.title.trim()}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                Ajukan Pengajuan
              </button>
            )}
          </div>
        )}
      </div>

      {/* Supervisors (if assigned) */}
      {thesis?.supervisors && thesis.supervisors.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-lg mb-4">Dosen Pembimbing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {thesis.supervisors.map((s: any) => (
              <div key={s.id} className="border rounded-lg p-4 bg-gray-50">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{s.role.replace("_", " ")}</p>
                <p className="font-medium">{s.lecturer.fullName}</p>
                <p className="text-sm text-gray-600">NIP: {s.lecturer.nip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
