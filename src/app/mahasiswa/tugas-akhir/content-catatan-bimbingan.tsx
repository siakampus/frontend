import { useState, useEffect } from "react";
import { thesisApi } from "@/lib/api";

export default function CatatanBimbinganContent() {
  const [theses, setTheses] = useState<any[]>([]);
  const [selectedThesisId, setSelectedThesisId] = useState<number | null>(null);
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
    fetchTheses();
  }, []);

  useEffect(() => {
    if (selectedThesisId) {
      fetchLogs(selectedThesisId);
    }
  }, [selectedThesisId]);

  async function fetchTheses() {
    setLoading(true);
    const res = await thesisApi.getMyTheses();
    if (res.ok && res.data?.data) {
      const list: any[] = res.data.data;
      setTheses(list);
      if (list.length > 0) {
        setSelectedThesisId(list[0].id);
      }
    }
    setLoading(false);
  }

  async function fetchLogs(thesisId: number) {
    const logsRes = await thesisApi.getGuidanceLogs(thesisId);
    if (logsRes.ok && logsRes.data?.data) {
      setLogs(logsRes.data.data);
    } else {
      setLogs([]);
    }
  }

  async function handleSubmit() {
    if (!selectedThesis) return;
    setSaving(true);
    setError("");
    setSuccess("");

    if (!form.supervisorId || !form.date || !form.topic || !form.notes) {
      setError("Pembimbing, tanggal, topik, dan catatan wajib diisi");
      setSaving(false);
      return;
    }

    const res = await thesisApi.addGuidanceLog(selectedThesis.id, {
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
      setForm({
        supervisorId: "",
        date: new Date().toISOString().split("T")[0],
        topic: "",
        notes: "",
        studentNotes: "",
        progress: "",
      });
      await fetchLogs(selectedThesis.id);
    } else {
      setError((res.data as any)?.message || "Gagal menyimpan catatan");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (theses.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">Anda belum memiliki pengajuan tugas akhir. Silakan ajukan terlebih dahulu.</p>
      </div>
    );
  }

  const selectedThesis = theses.find((t) => t.id === selectedThesisId) || theses[0];
  const confirmedCount = logs.filter((l) => l.status === "CONFIRMED").length;

  return (
    <div className="space-y-6">
      {/* Header and selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Catatan Bimbingan</h2>
          <p className="text-sm text-gray-500">Riwayat dan log bimbingan tugas akhir Anda</p>
        </div>

        {theses.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Pilih Tugas Akhir:
            </label>
            <select
              className="border rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-primary focus:border-primary max-w-xs truncate"
              value={selectedThesisId || ""}
              onChange={(e) => setSelectedThesisId(Number(e.target.value))}
            >
              {theses.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Selected thesis banner */}
      <div className="bg-gray-50 border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
        <div>
          <span className="font-semibold text-gray-700">Tugas Akhir: </span>
          <span className="font-bold text-gray-900">{selectedThesis.title}</span>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-100 text-blue-700 w-fit">
          Status: {selectedThesis.status}
        </span>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Progres Bimbingan</h3>
          <span className="text-sm font-medium text-gray-500">
            {confirmedCount} dikonfirmasi dari {logs.length} pertemuan
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full transition-all"
            style={{ width: `${Math.min(100, (confirmedCount / 16) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">Target: 16 pertemuan (minimal 8 dikonfirmasi untuk sidang)</p>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm border border-green-200">{success}</div>}

      {/* Add button */}
      {selectedThesis.supervisors && selectedThesis.supervisors.length > 0 && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition cursor-pointer shadow-xs"
        >
          {showForm ? "Batal" : "+ Tambah Catatan Bimbingan"}
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-xs">
          <h3 className="font-semibold text-gray-900">Tambah Catatan Bimbingan</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dosen Pembimbing <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                value={form.supervisorId}
                onChange={(e) => setForm({ ...form, supervisorId: e.target.value })}
              >
                <option value="">-- Pilih Pembimbing --</option>
                {selectedThesis.supervisors?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.lecturer?.fullName} ({s.role === "PEMBIMBING_1" ? "Pembimbing 1" : "Pembimbing 2"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Bimbingan <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topik Pembahasan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              placeholder="Contoh: Revisi Bab 3 — Metodologi Penelitian"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan & Arahan Pembimbing <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Hasil diskusi dan arahan dari dosen pembimbing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan Mahasiswa</label>
            <textarea
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              value={form.studentNotes}
              onChange={(e) => setForm({ ...form, studentNotes: e.target.value })}
              placeholder="Catatan dari Anda untuk pertemuan ini"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Progres Penyusunan</label>
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
            className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition cursor-pointer shadow-xs"
          >
            {saving ? "Menyimpan..." : "Simpan Catatan Bimbingan"}
          </button>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
        <h3 className="font-semibold text-gray-900 mb-4">Riwayat Catatan Bimbingan</h3>
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Belum ada catatan bimbingan untuk tugas akhir ini.</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log, idx) => (
              <div key={log.id} className="relative pl-8 pb-4">
                {idx < logs.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200" />
                )}
                <div
                  className={`absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    log.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {log.status === "CONFIRMED" ? "✓" : "○"}
                </div>

                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/70">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-sm text-gray-900">{log.topic}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(log.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        log.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {log.status === "CONFIRMED" ? "Dikonfirmasi" : "Menunggu Konfirmasi"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-medium text-gray-700">Pembimbing:</span>{" "}
                    {log.supervisor?.lecturer?.fullName || "-"}
                  </p>
                  <p className="text-sm text-gray-800">{log.notes}</p>
                  {log.studentNotes && (
                    <p className="text-xs text-blue-700 mt-1.5 bg-blue-50/70 p-2 rounded-lg">
                      <span className="font-semibold">Catatan mahasiswa:</span> {log.studentNotes}
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
    </div>
  );
}
