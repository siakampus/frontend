import { useState, useEffect } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { thesisApi } from "@/lib/api";

export default function DosenPembimbingPage() {
  const [thesis, setThesis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const res = await thesisApi.getMyThesis();
      if (res.ok && res.data?.data) {
        setThesis(res.data.data);
      }
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <AppLayout menuTemplate="student" title="Dosen Pembimbing">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </AppLayout>
    );
  }

  if (!thesis) {
    return (
      <AppLayout menuTemplate="student" title="Dosen Pembimbing">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Anda belum memiliki pengajuan tugas akhir.</p>
        </div>
      </AppLayout>
    );
  }

  const supervisors = thesis.supervisors || [];

  return (
    <AppLayout menuTemplate="student" title="Dosen Pembimbing" subtitle="Informasi dosen pembimbing tugas akhir Anda">
      {supervisors.length === 0 ? (
        <div className="bg-gray-50 border rounded-lg p-8 text-center">
          <div className="text-4xl mb-3">👤</div>
          <p className="text-gray-600">Dosen pembimbing belum ditugaskan.</p>
          <p className="text-sm text-gray-400 mt-1">Silakan tunggu admin untuk menugaskan dosen pembimbing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {supervisors.map((sup: any) => (
            <div key={sup.id} className="bg-white rounded-lg border overflow-hidden">
              <div className={`px-4 py-2 text-sm font-semibold text-white ${sup.role === "PEMBIMBING_1" ? "bg-blue-600" : "bg-indigo-600"}`}>
                {sup.role === "PEMBIMBING_1" ? "Pembimbing 1" : "Pembimbing 2"}
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-400 shrink-0">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{sup.lecturer.fullName}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium text-gray-700">NIP:</span> {sup.lecturer.nip}</p>
                      <p><span className="font-medium text-gray-700">Fakultas:</span> {sup.lecturer.faculty}</p>
                      {sup.lecturer.academics && (
                        <p><span className="font-medium text-gray-700">Bidang:</span> {sup.lecturer.academics}</p>
                      )}
                      {sup.lecturer.phoneNumber && (
                        <p><span className="font-medium text-gray-700">No. HP:</span> {sup.lecturer.phoneNumber}</p>
                      )}
                    </div>
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-3">Info Tugas Akhir</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium text-gray-700">Judul:</span> {thesis.title}</p>
          {thesis.topic && <p><span className="font-medium text-gray-700">Topik:</span> {thesis.topic}</p>}
          <p><span className="font-medium text-gray-700">Status:</span> {thesis.status}</p>
        </div>
      </div>
    </AppLayout>
  );
}
