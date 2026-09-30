import { useState, useEffect } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { thesisApi } from "@/lib/api";

export default function AdminUjianTAPage() {
  const [theses, setTheses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Schedule modal
  const [scheduleModal, setScheduleModal] = useState<any>(null);
  const [scheduleForm, setScheduleForm] = useState({
    examDate: "",
    examTime: "",
    room: "",
  });

  // Result modal
  const [resultModal, setResultModal] = useState<any>(null);
  const [resultForm, setResultForm] = useState({
    result: "",
    grade: "",
    score: "",
    revisionNotes: "",
    revisionDeadline: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const res = await thesisApi.getAllTheses("status=APPROVED&limit=100");
    if (res.ok && res.data?.data) {
      const allTheses = res.data.data.theses || [];
      // Fetch exam requests for each thesis
      const enriched = await Promise.all(
        allTheses.map(async (t: any) => {
          const examRes = await thesisApi.getExamRequest(t.id);
          return { ...t, examRequest: examRes.ok ? examRes.data?.data : null };
        })
      );
      setTheses(enriched);
    }
    setLoading(false);
  }

  async function handleApproveExam(thesisId: number) {
    setActionLoading(true);
    setError("");
    const res = await thesisApi.approveExamRequest(thesisId);
    if (res.ok) {
      setSuccess("Pengajuan ujian disetujui");
      await fetchData();
    } else {
      setError((res.data as any)?.message || "Gagal menyetujui");
    }
    setActionLoading(false);
  }

  async function handleRejectExam(thesisId: number) {
    const reason = prompt("Alasan penolakan:");
    if (!reason) return;
    setActionLoading(true);
    setError("");
    const res = await thesisApi.rejectExamRequest(thesisId, reason);
    if (res.ok) {
      setSuccess("Pengajuan ujian ditolak");
      await fetchData();
    } else {
      setError((res.data as any)?.message || "Gagal menolak");
    }
    setActionLoading(false);
  }

  async function handleSchedule() {
    if (!scheduleModal) return;
    setActionLoading(true);
    setError("");
    const res = await thesisApi.scheduleExam(scheduleModal.id, {
      examDate: scheduleForm.examDate,
      examTime: scheduleForm.examTime,
      room: scheduleForm.room || undefined,
    });
    if (res.ok) {
      setSuccess("Ujian berhasil dijadwalkan");
      setScheduleModal(null);
      await fetchData();
    } else {
      setError((res.data as any)?.message || "Gagal menjadwalkan");
    }
    setActionLoading(false);
  }

  async function handleSetResult() {
    if (!resultModal) return;
    setActionLoading(true);
    setError("");
    const res = await thesisApi.setExamResult(resultModal.id, {
      result: resultForm.result,
      grade: resultForm.grade || undefined,
      score: resultForm.score ? parseFloat(resultForm.score) : undefined,
      revisionNotes: resultForm.revisionNotes || undefined,
      revisionDeadline: resultForm.revisionDeadline || undefined,
    });
    if (res.ok) {
      setSuccess("Hasil ujian berhasil disimpan");
      setResultModal(null);
      await fetchData();
    } else {
      setError((res.data as any)?.message || "Gagal menyimpan hasil");
    }
    setActionLoading(false);
  }

  if (loading) {
    return (
      <AppLayout menuTemplate="admin" title="Kelola Ujian TA">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </AppLayout>
    );
  }

  const withExamRequest = theses.filter((t) => t.examRequest);

  return (
    <AppLayout menuTemplate="admin" title="Kelola Ujian Tugas Akhir" subtitle="Manage exam requests, scheduling, and results">
      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      {withExamRequest.length === 0 ? (
        <div className="bg-gray-50 border rounded-lg p-8 text-center">
          <p className="text-gray-600">Belum ada pengajuan ujian.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">NIM</th>
                <th className="text-left px-4 py-3 font-medium">Judul</th>
                <th className="text-left px-4 py-3 font-medium">Status Ujian</th>
                <th className="text-left px-4 py-3 font-medium">Jadwal</th>
                <th className="text-left px-4 py-3 font-medium">Hasil</th>
                <th className="text-left px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {withExamRequest.map((t) => {
                const req = t.examRequest;
                const info = req?.examInfo;
                return (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{t.student?.studentDataId || "-"}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium truncate max-w-xs">{t.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        req.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        req.status === "APPROVED" ? "bg-blue-100 text-blue-700" :
                        req.status === "SCHEDULED" ? "bg-indigo-100 text-indigo-700" :
                        req.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                        req.status === "REJECTED" ? "bg-red-100 text-red-700" :
                        "bg-gray-100"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {info ? (
                        <span>{new Date(info.examDate).toLocaleDateString("id-ID")} {info.examTime}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {info?.result ? (
                        <span className={`font-medium ${info.result === "LULUS" ? "text-green-700" : info.result === "TIDAK_LULUS" ? "text-red-700" : "text-yellow-700"}`}>
                          {info.result.replace("_", " ")}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {req.status === "PENDING" && (
                          <>
                            <button onClick={() => handleApproveExam(t.id)} disabled={actionLoading} className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50">
                              Setujui
                            </button>
                            <button onClick={() => handleRejectExam(t.id)} disabled={actionLoading} className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50">
                              Tolak
                            </button>
                          </>
                        )}
                        {(req.status === "APPROVED" || req.status === "SCHEDULED") && (
                          <button
                            onClick={() => { setScheduleModal(t); setScheduleForm({ examDate: "", examTime: "", room: "" }); }}
                            className="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                          >
                            Jadwalkan
                          </button>
                        )}
                        {req.status === "SCHEDULED" && !info?.result && (
                          <button
                            onClick={() => { setResultModal(t); setResultForm({ result: "", grade: "", score: "", revisionNotes: "", revisionDeadline: "" }); }}
                            className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                          >
                            Input Hasil
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="font-semibold mb-3">Jadwalkan Ujian Sidang</h3>
            <p className="text-sm text-gray-500 mb-4 truncate">{scheduleModal.title}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Ujian</label>
                <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={scheduleForm.examDate} onChange={(e) => setScheduleForm({ ...scheduleForm, examDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Waktu</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={scheduleForm.examTime} onChange={(e) => setScheduleForm({ ...scheduleForm, examTime: e.target.value })} placeholder="09:00 - 11:00" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ruang</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={scheduleForm.room} onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })} placeholder="Lab Sidang 2, Lt. 3" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setScheduleModal(null)} className="px-4 py-2 border rounded-lg text-sm">Batal</button>
              <button onClick={handleSchedule} disabled={!scheduleForm.examDate || !scheduleForm.examTime || actionLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {actionLoading ? "..." : "Jadwalkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {resultModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="font-semibold mb-3">Input Hasil Ujian</h3>
            <p className="text-sm text-gray-500 mb-4 truncate">{resultModal.title}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Keputusan</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={resultForm.result} onChange={(e) => setResultForm({ ...resultForm, result: e.target.value })}>
                  <option value="">Pilih keputusan</option>
                  <option value="LULUS">Lulus</option>
                  <option value="LULUS_REVISI">Lulus dengan Revisi</option>
                  <option value="TIDAK_LULUS">Tidak Lulus</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Nilai Huruf</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" value={resultForm.grade} onChange={(e) => setResultForm({ ...resultForm, grade: e.target.value })} placeholder="A, B+, B, ..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Skor</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={resultForm.score} onChange={(e) => setResultForm({ ...resultForm, score: e.target.value })} placeholder="90" />
                </div>
              </div>
              {resultForm.result === "LULUS_REVISI" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Catatan Revisi</label>
                    <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" value={resultForm.revisionNotes} onChange={(e) => setResultForm({ ...resultForm, revisionNotes: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Deadline Revisi</label>
                    <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={resultForm.revisionDeadline} onChange={(e) => setResultForm({ ...resultForm, revisionDeadline: e.target.value })} />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setResultModal(null)} className="px-4 py-2 border rounded-lg text-sm">Batal</button>
              <button onClick={handleSetResult} disabled={!resultForm.result || actionLoading} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {actionLoading ? "..." : "Simpan Hasil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
