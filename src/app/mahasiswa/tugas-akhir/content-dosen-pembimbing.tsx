import { useState, useEffect } from "react";
import { thesisApi } from "@/lib/api";

export default function DosenPembimbingContent() {
  const [theses, setTheses] = useState<any[]>([]);
  const [selectedThesisId, setSelectedThesisId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
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
    fetch();
  }, []);

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

  const thesis = theses.find((t) => t.id === selectedThesisId) || theses[0];
  const supervisors = thesis?.supervisors || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dosen Pembimbing</h2>
          <p className="text-sm text-gray-500">Informasi dosen pembimbing tugas akhir Anda</p>
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

      {supervisors.length === 0 ? (
        <div className="bg-gray-50 border rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">👤</div>
          <p className="text-gray-700 font-medium">Dosen pembimbing belum dipilih atau ditugaskan.</p>
          <p className="text-sm text-gray-500 mt-1">
            Anda dapat memilih dosen pembimbing saat mengisi formulir Pengajuan Tugas Akhir.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {supervisors.map((sup: any) => (
            <div key={sup.id} className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div
                className={`px-4 py-2.5 text-xs font-semibold text-white uppercase tracking-wider ${
                  sup.role === "PEMBIMBING_1" ? "bg-primary" : "bg-indigo-600"
                }`}
              >
                {sup.role === "PEMBIMBING_1" ? "Pembimbing 1 (Utama)" : "Pembimbing 2 (Pendamping)"}
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-100 text-primary font-bold flex items-center justify-center text-xl shrink-0">
                    {sup.lecturer?.fullName?.charAt(0) || "👤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-gray-900">{sup.lecturer?.fullName}</h3>
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      <p>
                        <span className="font-medium text-gray-700">NIP:</span> {sup.lecturer?.nip || "-"}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Fakultas:</span> {sup.lecturer?.faculty || "-"}
                      </p>
                      {sup.lecturer?.academics && (
                        <p>
                          <span className="font-medium text-gray-700">Bidang:</span> {sup.lecturer?.academics}
                        </p>
                      )}
                      {sup.lecturer?.phoneNumber && (
                        <p>
                          <span className="font-medium text-gray-700">No. HP:</span> {sup.lecturer?.phoneNumber}
                        </p>
                      )}
                    </div>
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800">
                        ● Aktif
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Thesis info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6">
        <h3 className="font-semibold text-base text-gray-900 mb-3">Informasi Tugas Akhir</h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium text-gray-600">Judul:</span> {thesis.title}
          </p>
          {thesis.topic && (
            <p>
              <span className="font-medium text-gray-600">Topik / Bidang:</span> {thesis.topic}
            </p>
          )}
          <p>
            <span className="font-medium text-gray-600">Status Pengajuan:</span>{" "}
            <span className="font-semibold text-gray-800">{thesis.status}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
