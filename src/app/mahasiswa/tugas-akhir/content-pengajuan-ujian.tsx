import { useState, useEffect } from "react";
import { thesisApi } from "@/lib/api";

export default function PengajuanUjianContent() {
  const [theses, setTheses] = useState<any[]>([]);
  const [selectedThesisId, setSelectedThesisId] = useState<number | null>(null);
  const [examRequest, setExamRequest] = useState<any>(null);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchTheses();
  }, []);

  useEffect(() => {
    if (selectedThesisId) {
      fetchThesisData(selectedThesisId);
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

  async function fetchThesisData(thesisId: number) {
    const [examRes, countRes] = await Promise.all([
      thesisApi.getExamRequest(thesisId),
      thesisApi.getConfirmedCount(thesisId),
    ]);
    if (examRes.ok && examRes.data?.data) setExamRequest(examRes.data.data);
    else setExamRequest(null);

    if (countRes.ok && countRes.data?.data) setConfirmedCount(countRes.data.data.confirmedCount);
    else setConfirmedCount(0);
  }

  async function handleSubmit() {
    if (!selectedThesis) return;
    if (!confirm("Apakah Anda yakin ingin mengajukan ujian sidang untuk tugas akhir ini?")) return;

    setSaving(true);
    setError("");
    const res = await thesisApi.requestExam(selectedThesis.id, notes || undefined);
    if (res.ok) {
      setSuccess("Pengajuan ujian berhasil dikirim");
      await fetchThesisData(selectedThesis.id);
    } else {
      setError((res.data as any)?.message || "Gagal mengirim pengajuan ujian");
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
        <p className="text-yellow-800">Anda belum memiliki pengajuan tugas akhir.</p>
      </div>
    );
  }

  const selectedThesis = theses.find((t) => t.id === selectedThesisId) || theses[0];
  const requirements = [
    { label: "Tugas akhir disetujui", met: selectedThesis?.status === "APPROVED" || selectedThesis?.status === "COMPLETED" },
    { label: "Dosen pembimbing ditugaskan", met: (selectedThesis?.supervisors?.length || 0) > 0 },
    { label: "Minimal 8 bimbingan dikonfirmasi", met: confirmedCount >= 8 },
  ];
  const allMet = requirements.every((r) => r.met);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pengajuan Ujian Sidang</h2>
          <p className="text-sm text-gray-500">Ajukan pendaftaran ujian sidang tugas akhir Anda</p>
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

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm border border-green-200">{success}</div>}

      {/* Syarat Pendaftaran */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
        <h3 className="font-semibold text-gray-900 mb-3">Syarat Pendaftaran Ujian</h3>
        <div className="space-y-2">
          {requirements.map((r, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${r.met ? "bg-green-600" : "bg-gray-300"}`}>
                {r.met ? "✓" : "✗"}
              </span>
              <span className={r.met ? "text-gray-900" : "text-gray-400"}>{r.label}</span>
              {i === 2 && (
                <span className="text-xs text-gray-500 font-mono">({confirmedCount}/8)</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form pengajuan or status */}
      {examRequest ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h3 className="font-semibold text-gray-900">Status Pengajuan Ujian</h3>
          <div className="p-4 rounded-lg bg-gray-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status: <span className="font-bold">{examRequest.status}</span></p>
              <p className="text-xs text-gray-500 mt-1">
                Diajukan pada: {new Date(examRequest.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h3 className="font-semibold text-gray-900">Form Pengajuan Ujian</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
            <textarea
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan untuk pendaftaran ujian"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!allMet || saving}
            className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition cursor-pointer shadow-xs"
          >
            {saving ? "Mengirim..." : "Ajukan Ujian Sidang"}
          </button>
        </div>
      )}
    </div>
  );
}
