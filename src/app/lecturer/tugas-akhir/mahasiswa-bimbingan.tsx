import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/ui/app-layout";
import { thesisApi } from "@/lib/api";

export default function MahasiswaBimbinganPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const res = await thesisApi.getMyStudents();
      if (res.ok && res.data?.data) {
        setStudents(res.data.data);
      }
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <AppLayout menuTemplate="lecturer" title="Mahasiswa Bimbingan">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout menuTemplate="lecturer" title="Mahasiswa Bimbingan" subtitle="Daftar mahasiswa yang Anda bimbing">
      {students.length === 0 ? (
        <div className="bg-gray-50 border rounded-lg p-8 text-center">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-gray-600">Belum ada mahasiswa bimbingan.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">No</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">NIM</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Judul TA</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Peran</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Bimbingan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((sup, idx) => (
                <tr key={sup.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs">{sup.thesis?.student?.studentDataId || "-"}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-xs">{sup.thesis?.title}</p>
                    {sup.thesis?.topic && <p className="text-xs text-gray-500">{sup.thesis.topic}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      sup.thesis?.status === "APPROVED" ? "bg-green-100 text-green-700" :
                      sup.thesis?.status === "SUBMITTED" ? "bg-blue-100 text-blue-700" :
                      sup.thesis?.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {sup.thesis?.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{sup.role?.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">
                      {sup.thesis?._count?.guidanceLogs ?? 0} dikonfirmasi
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/lecturer/tugas-akhir/catatan-bimbingan/${sup.thesis?.id}`)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Lihat Bimbingan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
