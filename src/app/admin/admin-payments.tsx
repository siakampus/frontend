import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminPaymentsApi } from "@/lib/api";
import {
  CreditCard,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  Printer,
  X,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BuktiRegistrasiModal from "@/components/payment/BuktiRegistrasiModal";

interface Payment {
  id: string | number;
  billId?: number;
  billName?: string;
  billStatus?: string;
  status?: string;
  rawStatus?: string;
  amount?: number;
  amountFormatted?: string;
  createdAt?: string;
  paymentDate?: string;
  proofFileDownloadUrl?: string | null;
  paymentProofFilePath?: string | null;
  user?: {
    id?: number;
    email?: string;
    name?: string;
    fullName?: string;
    nim?: string | null;
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [billNameFilter, setBillNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | number | null>(null);

  // Detail Modal State
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Bukti Registrasi Modal State
  const [receiptBillId, setReceiptBillId] = useState<number | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const navigate = useNavigate();

  const fetchPayments = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await adminPaymentsApi.list({
        billName: billNameFilter || undefined,
        status: statusFilter || undefined,
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      if (res.ok && res.data) {
        const body = res.data as { data?: Payment[] };
        const rawList = body.data || (res.data as unknown as Payment[]) || [];

        // Normalize fields cleanly without any em dashes or AI slop
        const normalized = rawList.map((p: any) => {
          const rawStatus = (p.rawStatus || p.billStatus || p.status || "").toUpperCase();
          let uiStatus = p.status || "pending";
          if (rawStatus === "VERIFIED" || rawStatus === "PAID" || rawStatus === "CONFIRMED") {
            uiStatus = "confirmed";
          } else if (rawStatus === "REJECTED") {
            uiStatus = "rejected";
          } else if (rawStatus === "UNPAID") {
            uiStatus = "unpaid";
          }

          const isUkt = (p.billName || "").toLowerCase().includes("ukt");
          const amount =
            p.amount != null
              ? p.amount
              : isUkt
              ? 5000000
              : 500000;

          const defaultName = p.userEmail ? p.userEmail.split("@")[0] : "Nama tidak tercatat";

          return {
            ...p,
            status: uiStatus,
            rawStatus: rawStatus || "VERIFIED",
            amount,
            amountFormatted: p.amountFormatted || `Rp ${amount.toLocaleString("id-ID")}`,
            user: p.user || {
              email: p.userEmail || "Email tidak tercatat",
              name: defaultName,
              fullName: defaultName,
              nim: null,
            },
          };
        });

        setPayments(normalized);
      } else {
        setErrorMsg("Gagal memuat daftar pembayaran dari server.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Keyboard accessibility for Detail modal
  useEffect(() => {
    if (!selectedPayment) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPayment(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPayment]);

  const notify = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3500);
  };

  const handleConfirm = async (id: string | number) => {
    if (!confirm("Konfirmasi verifikasi pembayaran ini?")) return;
    setConfirmingId(id);
    const res = await adminPaymentsApi.confirm(String(id));
    setConfirmingId(null);
    if (res.ok) {
      notify("Pembayaran berhasil diverifikasi (Status: LUNAS).");
      fetchPayments();
    } else {
      notify("Gagal mengkonfirmasi pembayaran. Silakan coba kembali.");
    }
  };

  const resetFilters = () => {
    setBillNameFilter("");
    setStatusFilter("");
    setTimeout(() => {
      fetchPayments();
    }, 50);
  };

  const getStatusBadge = (p: Payment) => {
    const raw = (p.rawStatus || p.billStatus || p.status || "").toUpperCase();
    if (raw === "VERIFIED" || raw === "PAID" || p.status === "confirmed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>Lunas Terverifikasi</span>
        </span>
      );
    }
    if (raw === "PENDING_VERIFICATION" || raw === "PENDING" || p.status === "pending") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
          <Clock className="h-3.5 w-3.5 text-amber-700 shrink-0" />
          <span>Menunggu Verifikasi</span>
        </span>
      );
    }
    if (raw === "REJECTED" || p.status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-900 border border-rose-300">
          <XCircle className="h-3.5 w-3.5 text-rose-700 shrink-0" />
          <span>Ditolak</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
        <AlertCircle className="h-3.5 w-3.5 text-slate-600 shrink-0" />
        <span>Belum Dibayar</span>
      </span>
    );
  };

  const openReceiptModal = (billId?: number) => {
    if (!billId) return;
    setReceiptBillId(billId);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <Card className="shadow-xs border rounded-lg bg-white">
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama tagihan (UKT, Pendaftaran)..."
              className="pl-9 h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary"
              value={billNameFilter}
              onChange={(e) => setBillNameFilter(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchPayments()}
            />
          </div>
          <select
            className="border border-input rounded-md px-3 h-10 text-sm bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary min-w-[180px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="confirmed">Lunas Terverifikasi</option>
            <option value="pending">Menunggu Verifikasi</option>
            <option value="unpaid">Belum Dibayar</option>
            <option value="rejected">Ditolak</option>
          </select>
          <Button
            onClick={fetchPayments}
            variant="outline"
            className="h-10 px-4 flex items-center gap-2 cursor-pointer font-medium"
          >
            <RefreshCw className="h-4 w-4" /> Muat Ulang
          </Button>
        </CardContent>
      </Card>

      {/* Action Notification */}
      {actionMsg && (
        <div className="text-sm font-medium px-4 py-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Error Alert State */}
      {errorMsg && (
        <div className="text-sm font-medium px-4 py-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchPayments}
            className="h-7 text-xs bg-white text-rose-800 border-rose-300 hover:bg-rose-100"
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Payments Table Card */}
      <Card className="shadow-xs border rounded-lg overflow-hidden bg-white">
        <CardHeader className="border-b bg-slate-50/60 py-3.5 px-6">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary font-serif">
            <CreditCard className="h-4 w-4" /> Daftar Pembayaran ({payments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <RefreshCw className="animate-spin h-6 w-6 text-primary" />
              <p className="text-sm font-medium">Memuat data pembayaran...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Tidak ada catatan pembayaran</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {billNameFilter || statusFilter
                  ? "Tidak ada pembayaran yang sesuai dengan kriteria filter saat ini."
                  : "Belum ada transaksi pembayaran yang tercatat dalam sistem."}
              </p>
              {(billNameFilter || statusFilter) && (
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  size="sm"
                  className="mt-4 text-xs gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset Filter
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-600 border-b font-semibold">
                  <tr>
                    <th className="px-5 py-3.5 text-left">Pengguna / Mahasiswa</th>
                    <th className="px-5 py-3.5 text-left">Nama Tagihan</th>
                    <th className="px-5 py-3.5 text-left">Jumlah</th>
                    <th className="px-5 py-3.5 text-left">Status</th>
                    <th className="px-5 py-3.5 text-left">Tanggal</th>
                    <th className="px-5 py-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((p) => {
                    const isPaid =
                      (p.rawStatus || p.billStatus || p.status || "").toUpperCase() === "VERIFIED" ||
                      (p.rawStatus || p.billStatus || p.status || "").toUpperCase() === "PAID" ||
                      p.status === "confirmed";

                    const isUkt = (p.billName || "").toLowerCase().includes("ukt");

                    const studentName =
                      p.user?.fullName || p.user?.name || (p.user?.email ? p.user.email.split("@")[0] : "Nama tidak tercatat");

                    const studentEmail = p.user?.email || "Email tidak tercatat";

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Pengguna Column */}
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-gray-900 leading-tight">
                            {studentName}
                          </div>
                          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-1">
                            <span>{studentEmail}</span>
                            {p.user?.nim && (
                              <span className="font-mono bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                                NIM: {p.user.nim}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Nama Tagihan Column */}
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-gray-900">{p.billName || "Tagihan Tanpa Nama"}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            ID Tagihan: #{p.billId || p.id}
                          </div>
                        </td>

                        {/* Jumlah Column */}
                        <td className="px-5 py-3.5 text-sm font-semibold font-mono text-gray-900">
                          {p.amount != null
                            ? `Rp ${p.amount.toLocaleString("id-ID")}`
                            : p.amountFormatted || "Belum ditentukan"}
                        </td>

                        {/* Status Column */}
                        <td className="px-5 py-3.5">{getStatusBadge(p)}</td>

                        {/* Tanggal Column */}
                        <td className="px-5 py-3.5 text-xs text-slate-600">
                          {p.paymentDate || p.createdAt
                            ? new Date(p.paymentDate || p.createdAt!).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Belum tercatat"}
                        </td>

                        {/* Aksi Column */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center gap-2">
                            {/* Tombol Detail */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-3 text-xs flex items-center gap-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                              onClick={() => setSelectedPayment(p)}
                              title="Lihat Rincian Pembayaran"
                            >
                              <Eye className="h-3.5 w-3.5" /> Detail
                            </Button>

                            {/* Tombol Cetak Bukti Registrasi (khusus UKT Lunas) */}
                            {isPaid && isUkt && p.billId && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs flex items-center gap-1.5 text-primary hover:text-primary-dark border-primary/30 hover:bg-primary/5 cursor-pointer font-medium"
                                onClick={() => openReceiptModal(p.billId)}
                                title="Cetak Bukti Registrasi (Format UGM Simaster)"
                              >
                                <Printer className="h-3.5 w-3.5" /> Bukti
                              </Button>
                            )}

                            {/* Tombol Konfirmasi Manual jika belum lunas */}
                            {!isPaid && (
                              <Button
                                size="sm"
                                className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer font-medium shadow-2xs"
                                onClick={() => handleConfirm(p.id)}
                                disabled={confirmingId === p.id}
                                title="Verifikasi Tagihan"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {confirmingId === p.id ? "Proses..." : "Verifikasi"}
                              </Button>
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
        </CardContent>
      </Card>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-detail-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPayment(null);
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 id="payment-detail-title" className="font-semibold text-gray-900 text-base">
                  Rincian Pembayaran
                </h3>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-600 rounded-md p-1 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Tutup modal rincian"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-xs text-muted-foreground block">Nama Pembayar / Mahasiswa</span>
                  <span className="font-semibold text-gray-900">
                    {selectedPayment.user?.fullName || selectedPayment.user?.name || "Nama tidak tercatat"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Nomor Induk (NIM)</span>
                  <span className="font-mono font-semibold text-primary">
                    {selectedPayment.user?.nim || "Belum ada NIM"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Email</span>
                  <span className="text-gray-800">{selectedPayment.user?.email || "Email tidak tercatat"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Status Tagihan</span>
                  <div className="mt-0.5">{getStatusBadge(selectedPayment)}</div>
                </div>
              </div>

              <div className="space-y-2 border-t pt-3">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Nama Tagihan</span>
                  <span className="font-medium text-gray-900">
                    {selectedPayment.billName || "Tagihan Tanpa Nama"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">ID Tagihan (Bill ID)</span>
                  <span className="font-mono text-gray-800">#{selectedPayment.billId || selectedPayment.id}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Nominal Tagihan</span>
                  <span className="font-bold font-mono text-base text-emerald-800">
                    {selectedPayment.amountFormatted ||
                      `Rp ${(selectedPayment.amount || 0).toLocaleString("id-ID")}`}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Waktu Pembayaran</span>
                  <span className="text-gray-800">
                    {selectedPayment.paymentDate
                      ? new Date(selectedPayment.paymentDate).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Belum tercatat"}
                  </span>
                </div>
              </div>

              {/* Bukti Pembayaran / Resi */}
              <div className="border-t pt-3 space-y-2">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                  Informasi Bukti / Saluran Pembayaran
                </span>
                {selectedPayment.paymentProofFilePath ? (
                  <div className="p-2.5 rounded bg-blue-50/70 border border-blue-200 text-xs font-mono text-blue-900 break-all">
                    {selectedPayment.paymentProofFilePath}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Tidak ada catatan bukti fisik.</p>
                )}

                {selectedPayment.proofFileDownloadUrl && (
                  <a
                    href={selectedPayment.proofFileDownloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline pt-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Buka atau Unduh Berkas Bukti Transfer
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-3.5 border-t bg-slate-50">
              {/* Tombol Cetak jika UKT & Lunas */}
              {selectedPayment.billId &&
              (selectedPayment.billName || "").toLowerCase().includes("ukt") ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    openReceiptModal(selectedPayment.billId);
                    setSelectedPayment(null);
                  }}
                  className="flex items-center gap-1.5 text-primary border-primary/30 cursor-pointer font-medium"
                >
                  <Printer className="h-4 w-4" /> Cetak Bukti Registrasi
                </Button>
              ) : (
                <div />
              )}

              <Button
                variant="default"
                size="sm"
                onClick={() => setSelectedPayment(null)}
                className="cursor-pointer"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Official Bukti Registrasi Modal */}
      <BuktiRegistrasiModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        billId={receiptBillId}
      />
    </div>
  );
}
