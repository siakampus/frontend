import { useState, useEffect } from "react";
import { thesisApi } from "@/lib/api";

export default function InformasiUjianContent() {
  const [theses, setTheses] = useState<any[]>([]);
  const [selectedThesisId, setSelectedThesisId] = useState<number | null>(null);
  const [examRequest, setExamRequest] = useState<any>(null);
  const [examInfo, setExamInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTheses();
  }, []);

  useEffect(() => {
    if (selectedThesisId) {
      fetchExamData(selectedThesisId);
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

  async function fetchExamData(thesisId: number) {
    const [reqRes, infoRes] = await Promise.all([
      thesisApi.getExamRequest(thesisId),
      thesisApi.getExamInfo(thesisId),
    ]);
    if (reqRes.ok && reqRes.data?.data) setExamRequest(reqRes.data.data);
    else setExamRequest(null);

    if (infoRes.ok && infoRes.data?.data) setExamInfo(infoRes.data.data);
    else setExamInfo(null);
  }

  const RESULT_LABELS: Record<string, { label: string; color: string }> = {
    LULUS: { label: "LULUS", color: "text-green-700 bg-green-100" },
    LULUS_REVISI: { label: "LULUS DENGAN REVISI", color: "text-yellow-700 bg-yellow-100" },
    TIDAK_LULUS: { label: "TIDAK LULUS", color: "text-red-700 bg-red-100" },
  };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Informasi Ujian Sidang</h2>
          <p className="text-sm text-gray-500">Jadwal dan hasil ujian sidang tugas akhir</p>
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

      {!examRequest ? (
        <div className="bg-gray-50 border rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-600 font-medium">Belum ada pengajuan ujian untuk tugas akhir ini.</p>
          <p className="text-sm text-gray-400 mt-1">
            Ajukan ujian sidang melalui menu Pengajuan Ujian jika telah memenuhi seluruh persyaratan.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
            <h3 className="font-semibold text-gray-900 mb-3">Jadwal & Lokasi Ujian</h3>
            {examInfo?.scheduledDate ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">Tanggal</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {new Date(examInfo.scheduledDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">Waktu</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {examInfo.startTime} - {examInfo.endTime}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">Ruangan</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{examInfo.room || "-"}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Jadwal ujian belum ditentukan oleh program studi.</p>
            )}
          </div>

          {examInfo?.examiners && examInfo.examiners.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
              <h3 className="font-semibold text-gray-900 mb-4">Dewan Penguji</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {examInfo.examiners.map((ex: any) => (
                  <div key={ex.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/70">
                    <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
                      {ex.role.replace("_", " ")}
                    </p>
                    <p className="font-semibold text-sm text-gray-900">{ex.lecturer?.fullName}</p>
                    <p className="text-xs text-gray-500">NIP: {ex.lecturer?.nip || "-"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {examInfo?.result && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
              <h3 className="font-semibold text-gray-900 mb-3">Hasil Ujian Sidang</h3>
              <div className="flex items-center gap-4">
                <span
                  className={`text-sm px-3 py-1 rounded-full font-bold ${
                    RESULT_LABELS[examInfo.result]?.color || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {RESULT_LABELS[examInfo.result]?.label || examInfo.result}
                </span>
                {examInfo.score && (
                  <span className="text-sm font-semibold text-gray-700">Nilai: {examInfo.score}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
