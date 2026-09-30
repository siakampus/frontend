import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/ui/app-layout";
import { thesisApi } from "@/lib/api";

export default function LecturerCatatanBimbinganPage() {
  const { thesisId } = useParams<{ thesisId: string }>();
  const [thesis, setThesis] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<number | null>(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (thesisId) fetchData();
  }, [thesisId]);

  async function fetchData() {
    setLoading(true);
    const id = parseInt(thesisId!);
    const [thesisRes, logsRes] = await Promise.all([
      thesisApi.getThesisById(id),
      thesisApi.getGuidanceLogs(id),
    ]);
    if (thesisRes.ok && thesisRes.data?.data) setThesis(thesisRes.data.data);
    if (logsRes.ok && logsRes.data?.data) setLogs(logsRes.data.data);
    setLoading(false);
  }

  async function handleConfirm(logId: number) {
    if (!thesisId) return;
    setConfirming(logId);
    setSuccess("");
    const res = await thesisApi.confirmGuidanceLog(parseInt(thesisId), logId);
    if (res.ok) {
      setSuccess("Catatan bimbingan dikonfirmasi");
      await fetchData();
    }
    setConfirming(null);
  }

  if (loading) {
    return (
      <AppLayout menuTemplate="lecturer" title="Catatan Bimbingan">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </AppLayout>
    );
  }

  const confirmedCount = logs.filter((l) => l.status === "CONFIRMED").length;

  return (
    <AppLayout
      menuTemplate="lecturer"
      title="Catatan Bimbingan"
      subtitle={thesis ? `${thesis.title}` : ""}
      backTo="/lecturer/tugas-akhir/mahasiswa-bimbingan"
    >
      {/* Student info */}
      {thesis && (
        <div className="bg-white rounded-lg border p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold">{thesis.title}</p>
            <p className="text-sm text-gray-600">
              NIM: {thesis.student?.studentDataId} — {thesis.student?.user?.email}
            </p>
            {thesis.topic && <p className="text-xs text-gray-500 mt-1">Topik: {thesis.topic}</p>}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            thesis.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          }`}>
            {thesis.status}
          </span>
        </div>
      )}

      {/* Progress */}
      <div className="bg-white rounded-lg border p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progres Bimbingan</span>
          <span className="text-sm text-gray-500">{confirmedCount} / {logs.length} dikonfirmasi</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${logs.length ? (confirmedCount / logs.length) * 100 : 0}%` }} />
        </div>
      </div>

      {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      {/* Logs */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Daftar Catatan ({logs.length})</h3>
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Belum ada catatan bimbingan</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className={`border rounded-lg p-4 ${log.status === "CONFIRMED" ? "bg-green-50 border-green-200" : "bg-white"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{log.topic}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${log.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {log.status === "CONFIRMED" ? "✓ Dikonfirmasi" : "Menunggu"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {new Date(log.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="text-sm text-gray-700">{log.notes}</p>
                    {log.studentNotes && (
                      <p className="text-sm text-blue-600 mt-1">Catatan mahasiswa: {log.studentNotes}</p>
                    )}
                    {log.progress && (
                      <p className="text-xs text-gray-500 mt-1">Progres: {log.progress}</p>
                    )}
                  </div>
                  {log.status !== "CONFIRMED" && (
                    <button
                      onClick={() => handleConfirm(log.id)}
                      disabled={confirming === log.id}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50 whitespace-nowrap transition"
                    >
                      {confirming === log.id ? "..." : "Konfirmasi"}
                    </button>
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
