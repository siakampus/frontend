import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Search,
  Calendar,
  Building2,
  Wallet,
  Receipt,
  FileCheck,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminPaymentsApi } from "@/lib/api";

interface EligibleBill {
  billId: number;
  billName: string;
  billStatus: string;
  userId: number;
  userEmail: string;
  studentName: string;
  nim: string | null;
  amount: number;
  amountFormatted: string;
}

interface StudentSearchItem {
  id: number;
  email: string;
  name: string;
  nim: string | null;
  role: string;
  tuitionFee: number;
}

interface CatatPembayaranModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentInfo: { billId: number; billName: string; isUkt: boolean }) => void;
}

export default function CatatPembayaranModal({
  isOpen,
  onClose,
  onSuccess,
}: CatatPembayaranModalProps) {
  const [activeTab, setActiveTab] = useState<"pay" | "create_bill">("pay");

  // Tab 1: Catat Pembayaran
  const [eligibleBills, setEligibleBills] = useState<EligibleBill[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [referenceNote, setReferenceNote] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [submittingPay, setSubmittingPay] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Tab 2: Terbitkan Tagihan UKT Baru
  const [studentQuery, setStudentQuery] = useState("");
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [searchResults, setSearchResults] = useState<StudentSearchItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchItem | null>(null);
  const [termName, setTermName] = useState("Ganjil 2026/2027");
  const [customTerm, setCustomTerm] = useState("");
  const [billAmount, setBillAmount] = useState<number>(5000000);
  const [creatingBill, setCreatingBill] = useState(false);
  const [createBillError, setCreateBillError] = useState<string | null>(null);

  // Fetch eligible bills when modal opens or tab switches
  const loadEligibleBills = async () => {
    setLoadingBills(true);
    setPayError(null);
    try {
      const res = await adminPaymentsApi.getEligibleBills();
      if (res.ok && res.data?.data) {
        setEligibleBills(res.data.data);
      } else {
        setPayError("Gagal memuat daftar tagihan belum lunas dari server.");
      }
    } catch (err: any) {
      setPayError(err.message || "Terjadi kesalahan saat memuat tagihan.");
    } finally {
      setLoadingBills(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEligibleBills();
      // Reset forms
      setSelectedBillId("");
      setReferenceNote("");
      setPayError(null);
      setCreateBillError(null);
      setSelectedStudent(null);
      setStudentQuery("");
      setSearchResults([]);
    }
  }, [isOpen]);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Selected Bill details
  const currentBill = eligibleBills.find((b) => String(b.billId) === selectedBillId);

  // Search students for Tab 2
  const handleSearchStudents = async (queryText: string) => {
    setStudentQuery(queryText);
    if (!queryText.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchingStudents(true);
    setCreateBillError(null);
    try {
      const res = await adminPaymentsApi.searchStudents(queryText.trim());
      if (res.ok && res.data?.data) {
        setSearchResults(res.data.data);
      }
    } catch (err: any) {
      setCreateBillError(err.message || "Gagal mencari data mahasiswa.");
    } finally {
      setSearchingStudents(false);
    }
  };

  const handleSelectStudent = (student: StudentSearchItem) => {
    setSelectedStudent(student);
    setSearchResults([]);
    if (student.tuitionFee) {
      setBillAmount(Math.round(student.tuitionFee));
    }
  };

  // Submit Tab 1: Catat Pembayaran
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillId) {
      setPayError("Silakan pilih tagihan mahasiswa yang akan dibayar.");
      return;
    }

    setSubmittingPay(true);
    setPayError(null);

    try {
      const res = await adminPaymentsApi.recordManualPayment({
        billId: Number(selectedBillId),
        paymentMethod,
        paymentDate: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
        referenceNote: referenceNote.trim() || undefined,
      });

      if (res.ok && res.data) {
        const isUkt = (currentBill?.billName || "").toLowerCase().includes("ukt");
        onSuccess({
          billId: Number(selectedBillId),
          billName: currentBill?.billName || "Tagihan Pembayaran",
          isUkt,
        });
        onClose();
      } else {
        setPayError(res.error || "Gagal mencatat pembayaran. Silakan coba kembali.");
      }
    } catch (err: any) {
      setPayError(err.message || "Terjadi kesalahan saat memproses pembayaran.");
    } finally {
      setSubmittingPay(false);
    }
  };

  // Submit Tab 2: Terbitkan Tagihan UKT Baru
  const handleCreateHeregistrasiBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setCreateBillError("Silakan pilih mahasiswa penerima tagihan.");
      return;
    }

    const finalTerm = termName === "CUSTOM" ? customTerm.trim() : termName;
    if (!finalTerm) {
      setCreateBillError("Silakan masukkan nama semester / tahun akademik.");
      return;
    }

    if (!billAmount || billAmount <= 0) {
      setCreateBillError("Nominal UKT harus lebih besar dari 0.");
      return;
    }

    setCreatingBill(true);
    setCreateBillError(null);

    try {
      const res = await adminPaymentsApi.createHeregistrasiBill({
        userId: selectedStudent.id,
        termName: finalTerm,
        amount: billAmount,
      });

      if (res.ok && res.data?.bill) {
        const created = res.data.bill;
        // Reload eligible bills and switch to Tab 1 to allow immediate payment recording
        await loadEligibleBills();
        setSelectedBillId(String(created.id));
        setActiveTab("pay");
      } else {
        setCreateBillError(res.error || "Gagal menerbitkan tagihan Heregistrasi.");
      }
    } catch (err: any) {
      setCreateBillError(err.message || "Terjadi kesalahan saat menerbitkan tagihan.");
    } finally {
      setCreatingBill(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catat-pembayaran-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 id="catat-pembayaran-title" className="font-semibold text-gray-900 text-base">
                Catat Pembayaran Heregistrasi & Tagihan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencatatan pembayaran manual loket kasir atau penerbitan tagihan UKT mahasiswa.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 rounded-md p-1.5 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2 border-b bg-white flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("pay")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition-colors border ${
              activeTab === "pay"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>1. Catat Pembayaran Tagihan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("create_bill")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition-colors border ${
              activeTab === "create_bill"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>2. Terbitkan Tagihan UKT Baru</span>
          </button>
        </div>

        {/* Tab 1: Catat Pembayaran Tagihan */}
        {activeTab === "pay" && (
          <form onSubmit={handleRecordPayment} className="p-6 space-y-4 text-sm">
            {payError && (
              <div className="p-3.5 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{payError}</span>
              </div>
            )}

            {/* Bill Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 block">
                  Pilih Tagihan Mahasiswa (Belum Lunas) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={loadEligibleBills}
                  className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${loadingBills ? "animate-spin" : ""}`} />
                  <span>Segarkan</span>
                </button>
              </div>

              {loadingBills ? (
                <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                  <span>Memuat daftar tagihan...</span>
                </div>
              ) : eligibleBills.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center space-y-2">
                  <p>Tidak ada tagihan yang menunggu pembayaran saat ini.</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("create_bill")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1" /> Terbitkan Tagihan UKT Baru
                  </Button>
                </div>
              ) : (
                <select
                  value={selectedBillId}
                  onChange={(e) => setSelectedBillId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                >
                  <option value="">Pilih tagihan mahasiswa...</option>
                  {eligibleBills.map((b) => (
                    <option key={b.billId} value={b.billId}>
                      {b.studentName} {b.nim ? `(${b.nim})` : `(${b.userEmail})`} : {b.billName} - {b.amountFormatted}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Bill Info Card */}
            {currentBill && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">
                      Mahasiswa Terpilih
                    </span>
                    <h4 className="font-semibold text-gray-900 text-sm mt-0.5">
                      {currentBill.studentName}
                    </h4>
                    <p className="text-xs text-slate-600 font-mono mt-0.5">
                      {currentBill.nim ? `NIM: ${currentBill.nim}` : currentBill.userEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">
                      Nominal Pembayaran
                    </span>
                    <span className="text-base font-bold font-mono text-emerald-800 block mt-0.5">
                      {currentBill.amountFormatted}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                  <span>Nama Tagihan: <strong className="text-gray-800">{currentBill.billName}</strong></span>
                  <span className="font-mono">ID Tagihan: #{currentBill.billId}</span>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                Metode Pembayaran <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: "CASH",
                    label: "Tunai di Kasir",
                    desc: "Loket Keuangan Kampus",
                    icon: Wallet,
                  },
                  {
                    id: "BANK_TRANSFER",
                    label: "Transfer Bank Manual",
                    desc: "Mandiri, BNI, BRI, BCA",
                    icon: Building2,
                  },
                  {
                    id: "SCHOLARSHIP",
                    label: "Beasiswa / KIP-K",
                    desc: "Pembebasan UKT / Yayasan",
                    icon: FileCheck,
                  },
                  {
                    id: "VA_RECONCILE",
                    label: "Rekonsiliasi VA Offline",
                    desc: "Setoran VA Terkonfirmasi",
                    icon: CreditCard,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = paymentMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary text-gray-900"
                          : "border-gray-200 bg-white hover:bg-slate-50 text-gray-700"
                      }`}
                    >
                      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isSelected ? "text-primary" : "text-slate-500"}`} />
                      <div>
                        <div className="font-semibold text-xs leading-snug">{item.label}</div>
                        <div className="text-[11px] text-slate-500">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reference Note & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">
                  Nomor Bukti / Kwitansi / Referensi
                </label>
                <Input
                  placeholder="Contoh: KWT-2026-0081 atau Slip #83910"
                  value={referenceNote}
                  onChange={(e) => setReferenceNote(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">
                  Tanggal Pembayaran <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="cursor-pointer"
                disabled={submittingPay}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer shadow-xs"
                disabled={submittingPay || !selectedBillId}
              >
                {submittingPay ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Simpan & Verifikasi Pembayaran
                  </span>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Terbitkan Tagihan UKT Baru */}
        {activeTab === "create_bill" && (
          <form onSubmit={handleCreateHeregistrasiBill} className="p-6 space-y-4 text-sm">
            {createBillError && (
              <div className="p-3.5 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{createBillError}</span>
              </div>
            )}

            {/* Student Search */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                Cari Mahasiswa (Nama, NIM, atau Email) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Ketik nama mahasiswa atau NIM (contoh: 20260003)..."
                  value={studentQuery}
                  onChange={(e) => handleSearchStudents(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
                {searchingStudents && (
                  <RefreshCw className="absolute right-3 top-2.5 h-4 w-4 text-primary animate-spin" />
                )}
              </div>

              {/* Search Suggestions Dropdown */}
              {searchResults.length > 0 && (
                <div className="border border-gray-200 rounded-md bg-white shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-100 z-10 relative">
                  {searchResults.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleSelectStudent(st)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-gray-900">{st.name}</div>
                        <div className="text-slate-500 text-[11px]">
                          {st.nim ? `NIM: ${st.nim}` : st.email}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-slate-700">
                          UKT: Rp {st.tuitionFee?.toLocaleString("id-ID") || "5.000.000"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Student Confirmation */}
            {selectedStudent ? (
              <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="h-5 w-5 text-emerald-700 shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">{selectedStudent.name}</div>
                    <div className="text-slate-600 font-mono text-[11px]">
                      {selectedStudent.nim ? `NIM: ${selectedStudent.nim}` : selectedStudent.email}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Pilih salah satu mahasiswa dari hasil pencarian di atas.
              </p>
            )}

            {/* Semester / Academic Term */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                Semester / Tahun Akademik <span className="text-rose-500">*</span>
              </label>
              <select
                value={termName}
                onChange={(e) => setTermName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Ganjil 2026/2027">Ganjil 2026/2027</option>
                <option value="Genap 2026/2027">Genap 2026/2027</option>
                <option value="Pendek 2026/2027">Antara / Pendek 2026/2027</option>
                <option value="CUSTOM">Lainnya (Ketik Manual)...</option>
              </select>

              {termName === "CUSTOM" && (
                <Input
                  placeholder="Contoh: Gasal 2027/2028"
                  value={customTerm}
                  onChange={(e) => setCustomTerm(e.target.value)}
                  className="h-9 text-xs mt-2"
                  required
                />
              )}
            </div>

            {/* Nominal UKT */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                Nominal Tagihan UKT (Rupiah) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min={100000}
                step={50000}
                value={billAmount}
                onChange={(e) => setBillAmount(Number(e.target.value))}
                className="h-9 text-xs font-mono font-semibold"
                required
              />
              <p className="text-[11px] text-slate-500">
                Terbilang: Rp {billAmount.toLocaleString("id-ID")}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="cursor-pointer"
                disabled={creatingBill}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary hover:bg-primary-dark text-white font-medium cursor-pointer shadow-xs"
                disabled={creatingBill || !selectedStudent}
              >
                {creatingBill ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Menerbitkan Tagihan...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <PlusCircle className="h-3.5 w-3.5" /> Terbitkan Tagihan UKT
                  </span>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
