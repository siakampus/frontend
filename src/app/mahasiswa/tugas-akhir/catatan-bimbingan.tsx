import { useState, useEffect } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { thesisApi } from "@/lib/api";

export default function CatatanBimbinganPage() {
  const [thesis, setThesis] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    supervisorId: "",
    date: new Date().toISOString().split("T")[0],
    topic: "",
    notes: "",
    studentNotes: "",
    progress: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const thesisRes = await thesisApi.getMyThesis();
    if (thesisRes.ok && thesisRes.data?.data) {
      const t = thesisRes.data.data;
      setThesis(t);
      if (t.id) {
        const logsRes = await thesisApi.getGuidanceLogs(t.id);
        if (logsRes.ok && logsRes.data?.data) {
          setLogs(logsRes.data.data);
        }
      }
    }
    setLoading(false);
  }

  async function handleSubmit() {
    if (!thesis) return;
    setSaving(true);
    setError("");
    setSuccess("");

    if (!form.supervisorId || !form.date || !form.topic || !form.notes) {
      setError("Pembimbing, tanggal, topik, dan catatan wajib diisi");
      setSaving(false);
      return;
    }

    const res = await thesisApi.addGuidanceLog(thesis.id, {
      supervisorId: parseInt(form.supervisorId),
      date: form.date,
      topic: form.topic,
      notes: form.notes,
      studentNotes: form.studentNotes || undefined,
      progress: form.progress || undefined,
    });

    if (res.ok) {
      setSuccess("Catatan bimbingan berhasil ditambahkan");
      setShowForm(false);
      setForm({ supervisorId: "", date: new Date().toISOString().split("T")[0], topic: "", notes: "", studentNotes: "", progress: "" });
      await fetchData();
    } else {
      setError((res.data as any)?.message || "Gagal menyimpan catatan");
    }
    setSaving(false);
  }

  const confirmedCount = logs.filter((l) => l.status === "CONFIRMED").length;

  if (loading) {
    return (
      <AppLayout menuTemplate="student" title="Catatan Bimbingan">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </AppLayout>
    );
  }

  if (!thesis) {
    return (
      <AppLayout menuTemplate="student" title="Catatan Bimbingan">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Anda belum memiliki pengajuan tugas akhir. Silakan ajukan terlebih dahulu.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout menuTemplate="student" title="Catatan Bimbingan" subtitle="Riwayat bimbingan tugas akhir Anda">
      {/* Progress */}
      <div className="bg-white rounded-lg border p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Progres Bimbingan</h3>
          <span className="text-sm text-gray-500">
            {confirmedCount} dikonfirmasi dari {logs.length} pertemuan
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all"
            style={{ width: `${Math.min(100, (confirmedCount / 16) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Target: 16 pertemuan (minimal 8 dikonfirmasi untuk sidang)</p>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      {/* Add button */}
      {thesis.supervisors && thesis.supervisors.length > 0 && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          {showForm ? "Batal" : "+ Tambah Catatan Bimbingan"}
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h3 className="font-semibold">Tambah Catatan Bimbingan</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Dosen Pembimbing <span className="text-red-500">*</span></label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.supervisorId}
                onChange={(e) => setForm({ ...form, supervisorId: e.target.value })}
              >
                <option value="">Pilih pembimbing</option>
                {thesis.supervisors?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.lecturer.fullName} ({s.role.replace("_", " ")})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tanggal <span className="text-red-500">*</span></label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Topik Pembahasan <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              placeholder="Contoh: Revisi Bab 3 — Metodologi Penelitian"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Catatan Bimbingan <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Hasil diskusi dan arahan dari dosen"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Catatan Mahasiswa</label>
            <textarea
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              value={form.studentNotes}
              onChange={(e) => setForm({ ...form, studentNotes: e.target.value })}
              placeholder="Catatan tambahan dari Anda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Progres</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: e.target.value })}
              placeholder="Contoh: Bab 3 selesai 70%"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {saving ? "Menyimpan..." : "Simpan Catatan"}
          </button>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Riwayat Bimbingan</h3>
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Belum ada catatan bimbingan</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log, idx) => (
              <div key={log.id} className="relative pl-8 pb-4">
                {/* Timeline connector */}
                {idx < logs.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200" />
                )}
                {/* Dot */}
                <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${log.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {log.status === "CONFIRMED" ? "✓" : "○"}
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-sm">{log.topic}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(log.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${log.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {log.status === "CONFIRMED" ? "Dikonfirmasi" : "Menunggu Konfirmasi"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Pembimbing:</span> {log.supervisor?.lecturer?.fullName || "-"}
                  </p>
                  <p className="text-sm text-gray-700">{log.notes}</p>
                  {log.studentNotes && (
                    <p className="text-sm text-blue-600 mt-1">
                      <span className="font-medium">Catatan mahasiswa:</span> {log.studentNotes}
                    </p>
                  )}
                  {log.progress && (
                    <p className="text-xs text-gray-500 mt-1">Progres: {log.progress}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
