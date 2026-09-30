import { useState, useEffect } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { thesisApi } from "@/lib/api";

export default function PengajuanUjianPage() {
  const [thesis, setThesis] = useState<any>(null);
  const [examRequest, setExamRequest] = useState<any>(null);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notes, setNotes] = useState("");

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
        const [examRes, countRes] = await Promise.all([
          thesisApi.getExamRequest(t.id),
          thesisApi.getConfirmedCount(t.id),
        ]);
        if (examRes.ok && examRes.data?.data) setExamRequest(examRes.data.data);
        if (countRes.ok && countRes.data?.data) setConfirmedCount(countRes.data.data.confirmedCount);
      }
    }
    setLoading(false);
  }

  async function handleSubmit() {
    if (!thesis) return;
    if (!confirm("Apakah Anda yakin ingin mengajukan ujian sidang?")) return;

    setSaving(true);
    setError("");
    const res = await thesisApi.requestExam(thesis.id, notes || undefined);
    if (res.ok) {
      setSuccess("Pengajuan ujian berhasil dikirim");
      await fetchData();
    } else {
      setError((res.data as any)?.message || "Gagal mengirim pengajuan ujian");
    }
    setSaving(false);
  }

  const requirements = [
    { label: "Tugas akhir disetujui", met: thesis?.status === "APPROVED" || thesis?.status === "COMPLETED" },
    { label: "Dosen pembimbing ditugaskan", met: (thesis?.supervisors?.length || 0) > 0 },
    { label: "Minimal 8 bimbingan dikonfirmasi", met: confirmedCount >= 8 },
  ];
  const allMet = requirements.every((r) => r.met);

  if (loading) {
    return (
      <AppLayout menuTemplate="student" title="Pengajuan Ujian">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </AppLayout>
    );
  }

  if (!thesis) {
    return (
      <AppLayout menuTemplate="student" title="Pengajuan Ujian">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Anda belum memiliki pengajuan tugas akhir.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout menuTemplate="student" title="Pengajuan Ujian Sidang" subtitle="Ajukan ujian sidang tugas akhir">
      {/* Requirements checklist */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Syarat Pengajuan Ujian</h3>
        <div className="space-y-3">
          {requirements.map((req, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${req.met ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {req.met ? "✓" : "✗"}
              </span>
              <span className={`text-sm ${req.met ? "text-gray-700" : "text-red-600"}`}>
                {req.label}
                {idx === 2 && ` (saat ini: ${confirmedCount})`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      {/* Existing request status */}
      {examRequest && (
        <div className={`rounded-lg border p-6 ${
          examRequest.status === "PENDING" ? "bg-blue-50 border-blue-200" :
          examRequest.status === "APPROVED" || examRequest.status === "SCHEDULED" ? "bg-green-50 border-green-200" :
          examRequest.status === "REJECTED" ? "bg-red-50 border-red-200" :
          "bg-gray-50"
        }`}>
          <h3 className="font-semibold mb-2">Status Pengajuan Ujian</h3>
          <p className="text-sm mb-1"><span className="font-medium">Status:</span> {examRequest.status}</p>
          <p className="text-sm mb-1">
            <span className="font-medium">Tanggal Pengajuan:</span>{" "}
            {new Date(examRequest.requestDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          {examRequest.notes && (
            <p className="text-sm"><span className="font-medium">Catatan:</span> {examRequest.notes}</p>
          )}
          {examRequest.rejectionReason && (
            <p className="text-sm text-red-700 mt-2">
              <span className="font-medium">Alasan ditolak:</span> {examRequest.rejectionReason}
            </p>
          )}
        </div>
      )}

      {/* Form (only if no existing request) */}
      {!examRequest && (
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h3 className="font-semibold">Formulir Pengajuan Ujian</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Catatan Pengajuan</label>
            <textarea
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan untuk pengajuan ujian (opsional)"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!allMet || saving}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? "Mengirim..." : "Ajukan Ujian Sidang"}
          </button>
          {!allMet && (
            <p className="text-xs text-red-500">Semua syarat harus terpenuhi sebelum mengajukan ujian.</p>
          )}
        </div>
      )}
    </AppLayout>
  );
}
