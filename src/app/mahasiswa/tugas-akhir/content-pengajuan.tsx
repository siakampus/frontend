import { useState, useEffect } from "react";
import { thesisApi } from "@/lib/api";
import { Plus, Trash2, CheckCircle2, AlertCircle, Clock, FileText, UserCheck, ArrowLeft } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700 border-gray-300", icon: Clock },
  SUBMITTED: { label: "Diajukan", color: "bg-blue-100 text-blue-700 border-blue-300", icon: Clock },
  APPROVED: { label: "Disetujui", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle2 },
  REVISION: { label: "Perlu Revisi", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: AlertCircle },
  REJECTED: { label: "Ditolak", color: "bg-red-100 text-red-700 border-red-300", icon: AlertCircle },
  COMPLETED: { label: "Selesai", color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: CheckCircle2 },
};

interface Lecturer {
  id: number;
  fullName: string;
  nip: string;
  faculty: string;
  academics?: string;
  phoneNumber?: string;
  status?: string;
}

export default function PengajuanTAContent() {
  const [theses, setTheses] = useState<any[]>([]);
  const [selectedThesisId, setSelectedThesisId] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    topic: "",
    abstract: "",
    notes: "",
    supervisor1Id: "",
    supervisor2Id: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    setError("");

    // Load available lecturers
    const lecRes = await thesisApi.getAvailableLecturers();
    if (lecRes.ok && lecRes.data?.data) {
      setLecturers(lecRes.data.data);
    }

    // Load student's theses
    await loadTheses();
    setLoading(false);
  }

  async function loadTheses(targetSelectId?: number) {
    const res = await thesisApi.getMyTheses();
    if (res.ok && res.data?.data) {
      const list: any[] = res.data.data;
      setTheses(list);

      if (list.length > 0) {
        // Choose thesis to show: target, or current selected, or first in list
        const activeId = targetSelectId || selectedThesisId || list[0].id;
        const current = list.find((t) => t.id === activeId) || list[0];
        selectThesis(current);
        setIsCreatingNew(false);
      } else {
        setSelectedThesisId(null);
        setIsCreatingNew(true);
        resetForm();
      }
    }
  }

  function resetForm() {
    setForm({
      title: "",
      topic: "",
      abstract: "",
      notes: "",
      supervisor1Id: "",
      supervisor2Id: "",
    });
  }

  function selectThesis(t: any) {
    setSelectedThesisId(t.id);
    setIsCreatingNew(false);
    setError("");
    setSuccess("");

    // Extract supervisors
    const sup1 = t.supervisors?.find((s: any) => s.role === "PEMBIMBING_1" && s.status === "ACTIVE");
    const sup2 = t.supervisors?.find((s: any) => s.role === "PEMBIMBING_2" && s.status === "ACTIVE");

    setForm({
      title: t.title || "",
      topic: t.topic || "",
      abstract: t.abstract || "",
      notes: t.notes || "",
      supervisor1Id: sup1?.lecturerId ? String(sup1.lecturerId) : "",
      supervisor2Id: sup2?.lecturerId ? String(sup2.lecturerId) : "",
    });
  }

  function handleStartCreateNew() {
    setIsCreatingNew(true);
    setSelectedThesisId(null);
    resetForm();
    setError("");
    setSuccess("");
  }

  const selectedThesis = theses.find((t) => t.id === selectedThesisId);
  const isEditable = isCreatingNew || !selectedThesis || selectedThesis.status === "DRAFT" || selectedThesis.status === "REVISION";

  async function handleSaveDraft() {
    setSaving(true);
    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Judul tugas akhir wajib diisi");
      setSaving(false);
      return;
    }

    if (form.supervisor1Id && form.supervisor2Id && form.supervisor1Id === form.supervisor2Id) {
      setError("Dosen Pembimbing 1 dan 2 tidak boleh orang yang sama");
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      topic: form.topic.trim() || undefined,
      abstract: form.abstract.trim() || undefined,
      notes: form.notes.trim() || undefined,
      supervisor1Id: form.supervisor1Id ? Number(form.supervisor1Id) : null,
      supervisor2Id: form.supervisor2Id ? Number(form.supervisor2Id) : null,
    };

    let res;
    if (!isCreatingNew && selectedThesis) {
      res = await thesisApi.updateThesis(selectedThesis.id, payload);
    } else {
      res = await thesisApi.createThesis(payload);
    }

    if (res.ok && res.data?.data) {
      setSuccess("Data tugas akhir berhasil disimpan");
      const createdOrUpdatedId = res.data.data.id;
      await loadTheses(createdOrUpdatedId);
    } else {
      setError((res.data as any)?.message || "Gagal menyimpan data tugas akhir");
    }
    setSaving(false);
  }

  async function handleSubmitForReview() {
    if (!selectedThesis) return;
    if (!confirm("Apakah Anda yakin ingin mengajukan tugas akhir ini untuk ditinjau?")) return;

    setSaving(true);
    setError("");
    setSuccess("");

    // Make sure form changes are saved first if editable
    if (isEditable) {
      const payload = {
        title: form.title.trim(),
        topic: form.topic.trim() || undefined,
        abstract: form.abstract.trim() || undefined,
        notes: form.notes.trim() || undefined,
        supervisor1Id: form.supervisor1Id ? Number(form.supervisor1Id) : null,
        supervisor2Id: form.supervisor2Id ? Number(form.supervisor2Id) : null,
      };
      await thesisApi.updateThesis(selectedThesis.id, payload);
    }

    const res = await thesisApi.submitForReview(selectedThesis.id);
    if (res.ok) {
      setSuccess("Pengajuan tugas akhir berhasil dikirim untuk peninjauan");
      await loadTheses(selectedThesis.id);
    } else {
      setError((res.data as any)?.message || "Gagal mengirim pengajuan");
    }
    setSaving(false);
  }

  async function handleDeleteDraft(id: number, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus draft tugas akhir ini?")) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    const res = await thesisApi.deleteThesis(id);
    if (res.ok) {
      setSuccess("Draft tugas akhir berhasil dihapus");
      await loadTheses();
    } else {
      setError((res.data as any)?.message || "Gagal menghapus draft");
    }
    setDeletingId(null);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary" />
        <p className="text-sm text-gray-500">Memuat data pengajuan tugas akhir...</p>
      </div>
    );
  }

  const selectedLec1 = lecturers.find((l) => String(l.id) === form.supervisor1Id);
  const selectedLec2 = lecturers.find((l) => String(l.id) === form.supervisor2Id);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pengajuan Tugas Akhir</h2>
          <p className="text-sm text-gray-500">
            Ajukan judul, topik, dan pilih dosen pembimbing tugas akhir Anda. Anda dapat mengajukan lebih dari satu topik/tugas akhir.
          </p>
        </div>
        <button
          onClick={handleStartCreateNew}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm cursor-pointer ${
            isCreatingNew
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          <Plus className="h-4 w-4" />
          Ajukan Tugas Akhir Baru
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          <div className="flex-1">{success}</div>
        </div>
      )}

      {/* List of Multiple Submissions */}
      {theses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Daftar Tugas Akhir Saya ({theses.length})
            </h3>
            {isCreatingNew && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                Sedang membuat pengajuan baru
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {theses.map((t) => {
              const isCurrent = !isCreatingNew && selectedThesisId === t.id;
              const statusCfg = STATUS_LABELS[t.status] || {
                label: t.status,
                color: "bg-gray-100 text-gray-700 border-gray-300",
                icon: Clock,
              };
              const StatusIcon = statusCfg.icon;

              const s1 = t.supervisors?.find((s: any) => s.role === "PEMBIMBING_1" && s.status === "ACTIVE");
              const s2 = t.supervisors?.find((s: any) => s.role === "PEMBIMBING_2" && s.status === "ACTIVE");

              return (
                <div
                  key={t.id}
                  onClick={() => selectThesis(t)}
                  className={`relative p-4 rounded-xl border transition cursor-pointer text-left ${
                    isCurrent
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.color}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusCfg.label}
                    </span>

                    {t.status === "DRAFT" && (
                      <button
                        onClick={(e) => handleDeleteDraft(t.id, e)}
                        disabled={deletingId === t.id}
                        title="Hapus Draft"
                        className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1.5" title={t.title}>
                    {t.title}
                  </h4>

                  {t.topic && (
                    <p className="text-xs text-gray-500 mb-2 truncate">
                      <span className="font-medium text-gray-700">Topik:</span> {t.topic}
                    </p>
                  )}

                  <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-0.5">
                    <p className="truncate">
                      <span className="font-medium text-gray-500">Pembimbing 1:</span>{" "}
                      {s1?.lecturer?.fullName || <span className="italic text-gray-400">Belum dipilih</span>}
                    </p>
                    {s2 && (
                      <p className="truncate">
                        <span className="font-medium text-gray-500">Pembimbing 2:</span>{" "}
                        {s2?.lecturer?.fullName}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
                    <span>
                      {t.submittedAt
                        ? `Diajukan: ${new Date(t.submittedAt).toLocaleDateString("id-ID")}`
                        : `Dibuat: ${new Date(t.createdAt).toLocaleDateString("id-ID")}`}
                    </span>
                    <span className={`font-semibold ${isCurrent ? "text-primary" : "text-gray-500"}`}>
                      {isCurrent ? "● Aktif Dipilih" : "Lihat Detail →"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Detail / Submission Form Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Form Title Banner */}
        <div className="px-6 py-4 border-b bg-gray-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-gray-900 text-base">
              {isCreatingNew
                ? "Formulir Pengajuan Tugas Akhir Baru"
                : `Detail Pengajuan Tugas Akhir #${selectedThesis?.id}`}
            </h3>
          </div>
          {isCreatingNew && theses.length > 0 && (
            <button
              onClick={() => {
                if (theses.length > 0) selectThesis(theses[0]);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Pengajuan Terpilih
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Status banner for existing selected thesis */}
          {!isCreatingNew && selectedThesis && (
            <div className="space-y-3">
              {(() => {
                const statusCfg = STATUS_LABELS[selectedThesis.status] || {
                  label: selectedThesis.status,
                  color: "bg-gray-100 text-gray-700 border-gray-300",
                  icon: Clock,
                };
                const StatusIcon = statusCfg.icon;

                return (
                  <div
                    className={`rounded-xl px-4 py-3.5 border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${statusCfg.color}`}
                  >
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-5 w-5 shrink-0" />
                      <div>
                        <span className="font-semibold">Status Pengajuan: </span>
                        <span className="font-bold">{statusCfg.label}</span>
                      </div>
                    </div>
                    {selectedThesis.submittedAt && (
                      <span className="text-xs opacity-85">
                        Diajukan pada:{" "}
                        {new Date(selectedThesis.submittedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Rejection / Revision Note */}
              {(selectedThesis.status === "REJECTED" || selectedThesis.status === "REVISION") && selectedThesis.notes && (
                <div
                  className={`rounded-xl p-4 border ${
                    selectedThesis.status === "REJECTED"
                      ? "bg-red-50/80 border-red-200 text-red-800"
                      : "bg-yellow-50/80 border-yellow-200 text-yellow-900"
                  }`}
                >
                  <p className="font-semibold text-sm mb-1">
                    {selectedThesis.status === "REJECTED" ? "Alasan Penolakan:" : "Catatan Perbaikan / Revisi:"}
                  </p>
                  <p className="text-sm whitespace-pre-line">{selectedThesis.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Form Fields: Judul, Topik, Abstrak, Catatan */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Informasi Tugas Akhir</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Tugas Akhir <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-600 transition"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={!isEditable}
                placeholder="Contoh: Rancang Bangun Sistem Informasi Akademik Berbasis Web..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topik / Bidang Kajian</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-600 transition"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                disabled={!isEditable}
                placeholder="Contoh: Sistem Informasi, Kecerdasan Buatan, IoT, Cloud Computing..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Abstrak / Gambaran Singkat</label>
              <textarea
                rows={4}
                className="w-full border rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-600 resize-none transition"
                value={form.abstract}
                onChange={(e) => setForm({ ...form, abstract: e.target.value })}
                disabled={!isEditable}
                placeholder="Tuliskan latar belakang masalah, tujuan penelitian, dan metode yang akan digunakan..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
              <textarea
                rows={2}
                className="w-full border rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-600 resize-none transition"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                disabled={!isEditable}
                placeholder="Catatan atau keterangan lain yang ingin disampaikan kepada program studi..."
              />
            </div>
          </div>

          {/* Dosen Pembimbing Selection Section */}
          <div className="pt-4 border-t space-y-4">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Pilihan Dosen Pembimbing
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Pilih dosen pembimbing yang akan membimbing penyusunan tugas akhir Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dosen Pembimbing 1 */}
              <div className="space-y-3 bg-gray-50/60 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-primary" />
                    Dosen Pembimbing 1 (Utama)
                  </label>
                  <span className="text-[11px] font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                    Wajib / Utama
                  </span>
                </div>

                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:text-gray-600 transition"
                  value={form.supervisor1Id}
                  onChange={(e) => setForm({ ...form, supervisor1Id: e.target.value })}
                  disabled={!isEditable}
                >
                  <option value="">-- Pilih Dosen Pembimbing 1 --</option>
                  {lecturers.map((lec) => (
                    <option key={lec.id} value={lec.id}>
                      {lec.fullName} {lec.nip ? `(NIP: ${lec.nip})` : ""}
                    </option>
                  ))}
                </select>

                {/* Selected Lecturer 1 Card */}
                {selectedLec1 && (
                  <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-xs flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 text-sm">
                      {selectedLec1.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1 text-xs">
                      <p className="font-semibold text-gray-900 truncate">{selectedLec1.fullName}</p>
                      <p className="text-gray-500">NIP: {selectedLec1.nip || "-"}</p>
                      <p className="text-gray-500">Fakultas: {selectedLec1.faculty || "-"}</p>
                      {selectedLec1.academics && (
                        <p className="text-primary font-medium truncate mt-0.5">Bidang: {selectedLec1.academics}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Dosen Pembimbing 2 */}
              <div className="space-y-3 bg-gray-50/60 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-indigo-600" />
                    Dosen Pembimbing 2 (Pendamping)
                  </label>
                  <span className="text-[11px] font-medium px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md">
                    Opsional
                  </span>
                </div>

                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:text-gray-600 transition"
                  value={form.supervisor2Id}
                  onChange={(e) => setForm({ ...form, supervisor2Id: e.target.value })}
                  disabled={!isEditable}
                >
                  <option value="">-- Pilih Dosen Pembimbing 2 (Opsional) --</option>
                  {lecturers
                    .filter((lec) => String(lec.id) !== form.supervisor1Id)
                    .map((lec) => (
                      <option key={lec.id} value={lec.id}>
                        {lec.fullName} {lec.nip ? `(NIP: ${lec.nip})` : ""}
                      </option>
                    ))}
                </select>

                {/* Selected Lecturer 2 Card */}
                {selectedLec2 && (
                  <div className="p-3 bg-white rounded-lg border border-indigo-200 shadow-xs flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 text-sm">
                      {selectedLec2.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1 text-xs">
                      <p className="font-semibold text-gray-900 truncate">{selectedLec2.fullName}</p>
                      <p className="text-gray-500">NIP: {selectedLec2.nip || "-"}</p>
                      <p className="text-gray-500">Fakultas: {selectedLec2.faculty || "-"}</p>
                      {selectedLec2.academics && (
                        <p className="text-indigo-600 font-medium truncate mt-0.5">Bidang: {selectedLec2.academics}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-3">
            {isEditable ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-5 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-gray-900 disabled:opacity-50 transition cursor-pointer shadow-xs"
                >
                  {saving ? "Menyimpan..." : isCreatingNew ? "Simpan Sebagai Draft" : "Simpan Perubahan"}
                </button>

                {!isCreatingNew && selectedThesis && (
                  <button
                    type="button"
                    onClick={handleSubmitForReview}
                    disabled={saving || !form.title.trim()}
                    className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition cursor-pointer shadow-xs"
                  >
                    Ajukan Pengajuan Sekarang
                  </button>
                )}

                {isCreatingNew && (
                  <button
                    type="button"
                    onClick={() => {
                      if (theses.length > 0) selectThesis(theses[0]);
                    }}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer"
                  >
                    Batal
                  </button>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Pengajuan ini sudah diajukan. Status pengajuan saat ini:{" "}
                <span className="font-semibold text-gray-800">
                  {STATUS_LABELS[selectedThesis?.status]?.label || selectedThesis?.status}
                </span>
              </div>
            )}

            {!isCreatingNew && selectedThesis?.status === "DRAFT" && (
              <button
                type="button"
                onClick={() => handleDeleteDraft(selectedThesis.id)}
                disabled={deletingId === selectedThesis.id}
                className="px-4 py-2.5 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-sm font-medium transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Hapus Draft Ini
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
