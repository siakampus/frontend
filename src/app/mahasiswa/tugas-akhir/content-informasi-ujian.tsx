import { useState, useEffect } from "react";
import { thesisApi } from "@/lib/api";

export default function InformasiUjianContent() {
  const [thesis, setThesis] = useState<any>(null);
  const [examRequest, setExamRequest] = useState<any>(null);
  const [examInfo, setExamInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const thesisRes = await thesisApi.getMyThesis();
      if (thesisRes.ok && thesisRes.data?.data) {
        const t = thesisRes.data.data;
        setThesis(t);
        if (t.id) {
          const [reqRes, infoRes] = await Promise.all([
            thesisApi.getExamRequest(t.id),
            thesisApi.getExamInfo(t.id),
          ]);
          if (reqRes.ok && reqRes.data?.data) setExamRequest(reqRes.data.data);
          if (infoRes.ok && infoRes.data?.data) setExamInfo(infoRes.data.data);
        }
      }
      setLoading(false);
    }
    fetch();
  }, []);

  const RESULT_LABELS: Record<string, { label: string; color: string }> = {
    LULUS: { label: "LULUS", color: "text-green-700 bg-green-100" },
    LULUS_REVISI: { label: "LULUS DENGAN REVISI", color: "text-yellow-700 bg-yellow-100" },
    TIDAK_LULUS: { label: "TIDAK LULUS", color: "text-red-700 bg-red-100" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!thesis) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">Anda belum memiliki pengajuan tugas akhir.</p>
      </div>
    );
  }

  if (!examRequest) {
    return (
      <>
        <h2 className="text-lg font-semibold text-gray-900">Informasi Ujian</h2>
        <div className="bg-gray-50 border rounded-lg p-8 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-600">Belum ada pengajuan ujian.</p>
          <p className="text-sm text-gray-400 mt-1">Ajukan ujian sidang melalui tab Pengajuan Ujian.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-900">Informasi Ujian</h2>
      <p className="text-sm text-gray-500 -mt-4">Detail jadwal dan hasil ujian sidang</p>

      {/* Exam schedule */}
      {examInfo ? (
        <>
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              📅 Jadwal Ujian Sidang
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Tanggal</p>
                <p className="font-semibold text-lg">
                  {new Date(examInfo.examDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Waktu</p>
                <p className="font-semibold text-lg">{examInfo.examTime} WIB</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Ruang</p>
                <p className="font-semibold text-lg">{examInfo.room || "TBA"}</p>
              </div>
            </div>
          </div>

          {/* Examiners */}
          {examInfo.examiners && examInfo.examiners.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                👥 Dewan Penguji
              </h3>
              <div className="space-y-3">
                {examInfo.examiners.map((ex: any) => (
                  <div key={ex.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                      {ex.role === "KETUA" ? "K" : ex.role === "PENGUJI_1" ? "P1" : "P2"}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{ex.lecturer.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {ex.role.replace("_", " ")} — NIP: {ex.lecturer.nip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {examInfo.result && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                📊 Hasil Ujian
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Keputusan:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${RESULT_LABELS[examInfo.result]?.color || "bg-gray-100"}`}>
                    {RESULT_LABELS[examInfo.result]?.label || examInfo.result}
                  </span>
                </div>
                {examInfo.grade && (
                  <p className="text-sm"><span className="font-medium text-gray-700">Nilai:</span> {examInfo.grade}{examInfo.score != null ? ` (${examInfo.score})` : ""}</p>
                )}
                {examInfo.revisionNotes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Catatan Revisi:</p>
                    <p className="text-sm text-yellow-700">{examInfo.revisionNotes}</p>
                    {examInfo.revisionDeadline && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Batas Revisi: {new Date(examInfo.revisionDeadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">Pengajuan ujian telah dikirim. Menunggu penjadwalan dari admin.</p>
          <p className="text-sm text-blue-600 mt-1">Status: {examRequest.status}</p>
        </div>
      )}
    </>
  );
}
