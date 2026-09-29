import { useState, useEffect } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  paymentGatewayApi,
  type MyBillResponse,
  type VirtualAccountItem,
  type BuktiRegistrasiResponse,
} from "@/lib/api";
import BuktiRegistrasiModal from "@/components/payment/BuktiRegistrasiModal";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  CalendarDays,
  BookOpen,
  Copy,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building2,
  Smartphone,
  Info,
  Sparkles,
  History,
} from "lucide-react";

export default function HeregistrasiPage() {
  const [activeTab, setActiveTab] = useState<"pembayaran" | "riwayat">("pembayaran");
  const [billData, setBillData] = useState<MyBillResponse | null>(null);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [selectedBankCode, setSelectedBankCode] = useState<string>("MANDIRI");
  const [instructionChannel, setInstructionChannel] = useState<"MBANKING" | "ATM" | "IBANKING" | "TELLER">("MBANKING");
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Receipt modal state
  const [receiptData, setReceiptData] = useState<BuktiRegistrasiResponse | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch active bill & virtual accounts
      const billRes = await paymentGatewayApi.getMyBill();
      if (billRes.ok && billRes.data?.data) {
        setBillData(billRes.data.data);
      }

      // 2. Fetch complete registration & payment history
      const historyRes = await paymentGatewayApi.getHistory();
      if (historyRes.ok && (historyRes.data as any)?.data) {
        setHistoryRecords((historyRes.data as any).data);
      }
    } catch (e: any) {
      console.error("Error fetching heregistrasi data:", e);
      setError("Terjadi kesalahan saat memuat data pembayaran dan riwayat registrasi.");
    } finally {
      setLoading(false);
    }
  };

  // Currently selected Virtual Account
  const selectedVa: VirtualAccountItem | undefined = billData?.virtualAccounts.find(
    (va) => va.bankCode === selectedBankCode
  ) || billData?.virtualAccounts[0];

  const handleCopyVa = () => {
    if (selectedVa?.vaNumber) {
      navigator.clipboard.writeText(selectedVa.vaNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Simulate payment via the Virtual Account payment framework
  const handlePayViaVa = async () => {
    if (!selectedVa) return;

    if (
      !confirm(
        `Konfirmasi pembayaran UKT ${billData?.bill.name} sebesar ${billData?.bill.amountFormatted} via ${selectedVa.bankName} Virtual Account (${selectedVa.vaNumber})?`
      )
    ) {
      return;
    }

    setPaying(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await paymentGatewayApi.payVa({
        vaNumber: selectedVa.vaNumber,
        bankCode: selectedVa.bankCode,
        billId: billData?.bill.id,
        amount: billData?.bill.amount,
      });

      if (res.ok) {
        setSuccessMsg(
          `✓ Pembayaran via ${selectedVa.bankName} Virtual Account berhasil! Status Heregistrasi Anda telah AKTIF.`
        );
        // Refresh data to show verified status
        await fetchData();
        // Automatically open the receipt modal so student can view/print immediately
        if (billData?.bill.id) {
          handleOpenReceipt(billData.bill.id);
        }
      } else {
        const errJson = res.data as any;
        setError(errJson?.message || "Gagal memproses pembayaran via Virtual Account.");
      }
    } catch (e: any) {
      setError(e.message || "Gagal menghubungi gateway pembayaran.");
    } finally {
      setPaying(false);
    }
  };

  // Fetch official receipt and open modal
  const handleOpenReceipt = async (billId: number | string) => {
    setLoadingReceipt(true);
    try {
      const res = await paymentGatewayApi.getReceipt(billId);
      if (res.ok && res.data?.data) {
        setReceiptData(res.data.data);
        setIsReceiptOpen(true);
      } else {
        alert("Bukti registrasi belum tersedia atau tagihan belum lunas.");
      }
    } catch (err: any) {
      alert("Gagal memuat bukti registrasi: " + err.message);
    } finally {
      setLoadingReceipt(false);
    }
  };

  if (loading) {
    return (
      <AppLayout
        menuTemplate="student"
        title="Pembayaran &amp; Heregistrasi"
        subtitle="Sistem Pembayaran Virtual Account &amp; Riwayat Registrasi UGN Simaster"
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat data Virtual Account dan riwayat registrasi...</p>
        </div>
      </AppLayout>
    );
  }

  const isBillVerified = billData?.bill?.isVerified ?? false;
  const nim = billData?.studentIdentity?.nim || "—";
  const studentName = billData?.studentIdentity?.fullName || "Mahasiswa";
  const prodi = billData?.studentIdentity?.majorName || "Teknik Informatika";
  const fakultas = billData?.studentIdentity?.facultyName || "Fakultas Teknik";

  return (
    <AppLayout
      menuTemplate="student"
      title="Pembayaran &amp; Heregistrasi"
      subtitle="Sistem Pembayaran Virtual Account &amp; Riwayat Registrasi UGN Simaster"
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* TOP STUDENT IDENTITY CARD (UGM Simaster Style) */}
        <Card className="border-blue-100 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white shadow-md overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 font-serif font-black text-xl shrink-0">
                  UGN
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold">
                      Identitas Akademik Mahasiswa
                    </span>
                    <Badge className="bg-white/20 text-white hover:bg-white/20 text-[10px] border-none">
                      {isBillVerified ? "Status: AKTIF" : "Status: MENUNGGU HEREGISTRASI"}
                    </Badge>
                  </div>
                  <h1 className="text-xl font-bold text-white mt-0.5">{studentName}</h1>
                  <p className="text-sm text-blue-200 mt-0.5">
                    NIM: <span className="font-mono font-bold text-white tracking-wider">{nim}</span> • {prodi} ({fakultas})
                  </p>
                </div>
              </div>

              {/* Status Action / Badge */}
              <div className="shrink-0 flex items-center gap-3">
                {isBillVerified ? (
                  <Button
                    onClick={() => billData?.bill?.id && handleOpenReceipt(billData.bill.id)}
                    disabled={loadingReceipt}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium shadow-sm cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    {loadingReceipt ? "Memuat..." : "Cetak Bukti Registrasi"}
                  </Button>
                ) : (
                  <Badge className="bg-amber-500/20 text-amber-300 border border-amber-400/40 px-3 py-1.5 text-xs font-semibold gap-1.5">
                    <Clock className="h-4 w-4" /> Menunggu Pembayaran UKT
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FEEDBACK ALERTS */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 p-4 text-red-800 text-sm">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </CardContent>
          </Card>
        )}

        {successMsg && (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="flex items-center gap-3 p-4 text-emerald-800 text-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </CardContent>
          </Card>
        )}

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-gray-200 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("pembayaran")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === "pembayaran"
                ? "border-blue-900 text-blue-900"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <CreditCard className="h-4 w-4" /> Pembayaran UKT &amp; Virtual Account
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === "riwayat"
                ? "border-blue-900 text-blue-900"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <History className="h-4 w-4" /> Riwayat Heregistrasi ({historyRecords.length} Semester)
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: PEMBAYARAN UKT & VIRTUAL ACCOUNT (UGM STYLE)             */}
        {/* ============================================================== */}
        {activeTab === "pembayaran" && (
          <div className="space-y-6">

            {/* If bill is already verified / paid */}
            {isBillVerified ? (
              <Card className="border-emerald-200 bg-emerald-50/50 shadow-xs">
                <CardHeader className="pb-3 border-b border-emerald-100">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-lg">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      Heregistrasi Semester Berjalan Selesai (LUNAS)
                    </div>
                    <Badge className="bg-emerald-600 text-white font-semibold">
                      Status Akademik: AKTIF
                    </Badge>
                  </div>
                  <CardDescription className="text-emerald-700 mt-1">
                    Anda telah menyelesaikan kewajiban pembayaran UKT untuk {billData?.bill.name}. Anda berhak melakukan pengisian Rencana Studi (KRS).
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-white rounded-lg border border-emerald-200">
                      <span className="text-xs text-gray-500 block">Total Pembayaran</span>
                      <span className="text-lg font-bold text-emerald-900 font-mono">
                        {billData?.bill.amountFormatted}
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-emerald-200">
                      <span className="text-xs text-gray-500 block">Status KRS</span>
                      <span className="text-sm font-semibold text-blue-800 flex items-center gap-1 mt-1">
                        <BookOpen className="h-4 w-4" /> Berhak Mengisi KRS
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-emerald-200">
                      <span className="text-xs text-gray-500 block">Dokumen Resmi</span>
                      <span className="text-sm font-semibold text-gray-800 flex items-center gap-1 mt-1">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" /> Bukti Registrasi Sah
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-gray-600">
                      Simpan atau cetak bukti registrasi sebagai arsip administrasi resmi perkuliahan Anda.
                    </p>
                    <Button
                      onClick={() => billData?.bill.id && handleOpenReceipt(billData.bill.id)}
                      disabled={loadingReceipt}
                      className="bg-blue-900 hover:bg-blue-950 text-white gap-2 font-medium cursor-pointer shadow-xs"
                    >
                      <Printer className="h-4 w-4" />
                      {loadingReceipt ? "Memuat Slip..." : "Cetak Bukti Registrasi Sekarang"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* If bill is UNPAID */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Bank Selection & VA Card (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  
                  {/* Active Bill Summary Card */}
                  <Card className="shadow-xs border-gray-200">
                    <CardHeader className="pb-3 border-b bg-gray-50/60">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base text-gray-900 font-bold">
                            {billData?.bill.name || "Tagihan UKT Semester"}
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            Batas Pembayaran: <span className="font-semibold text-gray-800">{billData?.bill.deadline}</span>
                          </CardDescription>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-semibold">
                          Belum Dibayar
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-gray-500 font-medium">Nominal UKT</span>
                        <span className="text-2xl font-black text-blue-950 font-mono">
                          {billData?.bill.amountFormatted}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bank Partner Selector */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 block flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-blue-900" />
                      Pilih Bank Mitra Virtual Account (UGM Formula: [Kode Bank] + [NIM]):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {billData?.virtualAccounts.map((va) => {
                        const isSelected = va.bankCode === selectedBankCode;
                        return (
                          <button
                            key={va.bankCode}
                            onClick={() => setSelectedBankCode(va.bankCode)}
                            className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                              isSelected
                                ? "border-blue-900 bg-blue-50/80 shadow-xs ring-1 ring-blue-900"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-gray-900">{va.bankName}</span>
                              {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-blue-900" />}
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono">
                              Prefix: <span className="font-semibold text-blue-900">{va.prefix}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* VIRTUAL ACCOUNT CARD (Highlighted UGM Style) */}
                  {selectedVa && (
                    <Card className="border-2 border-blue-900/40 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white shadow-sm overflow-hidden">
                      <div className="bg-blue-900 text-white px-5 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-amber-300" />
                          <span className="font-bold text-xs uppercase tracking-wider">
                            Nomor Virtual Account {selectedVa.bankName}
                          </span>
                        </div>
                        <span className="text-[11px] text-blue-200 font-mono">NIM Mahasiswa: {selectedVa.nim}</span>
                      </div>

                      <CardContent className="p-6 space-y-4">
                        {/* VA Number Display & Copy Button */}
                        <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold block">
                              Nomor Pembayaran (Virtual Account)
                            </span>
                            <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-blue-950">
                              {selectedVa.vaNumber}
                            </span>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-600">
                              <span className="inline-block px-1.5 py-0.5 bg-blue-100 rounded text-blue-900 font-mono font-semibold">
                                {selectedVa.prefix} (Kode Bank)
                              </span>
                              <span>+</span>
                              <span className="inline-block px-1.5 py-0.5 bg-indigo-100 rounded text-indigo-900 font-mono font-semibold">
                                {selectedVa.nim} (NIM Anda)
                              </span>
                            </div>
                          </div>

                          <Button
                            onClick={handleCopyVa}
                            variant="outline"
                            size="sm"
                            className="border-blue-300 text-blue-900 hover:bg-blue-50 font-medium gap-1.5 shrink-0 cursor-pointer"
                          >
                            {isCopied ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                Tersalin!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Salin VA
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Payment Framework Execution Button (Simulation Gateway) */}
                        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white space-y-3">
                          <div className="flex items-start gap-2.5">
                            <Sparkles className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-white">Simulasi Pembayaran Virtual Account (Gateway)</p>
                              <p className="text-[11px] text-blue-200 mt-0.5">
                                Klik tombol di bawah untuk menyimulasikan penyelesaian pembayaran via Virtual Account {selectedVa.bankName}.
                                Status heregistrasi Anda akan langsung aktif dan bukti registrasi dapat dicetak.
                              </p>
                            </div>
                          </div>

                          <Button
                            onClick={handlePayViaVa}
                            disabled={paying}
                            className="w-full bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-sm h-11 gap-2 cursor-pointer shadow-md"
                          >
                            {paying ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Memproses Transaksi...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" /> Bayar Sekarang via Virtual Account ({selectedVa.bankName})
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                </div>

                {/* Right Column: Step-by-Step Payment Instructions (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <Card className="border-gray-200 shadow-xs h-full flex flex-col">
                    <CardHeader className="pb-3 border-b bg-gray-50/70">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900">
                        <Info className="h-4 w-4 text-blue-900" />
                        Petunjuk Pembayaran ({selectedVa?.bankName})
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Pilih saluran perbankan yang ingin Anda gunakan
                      </CardDescription>

                      {/* Channel Subtabs */}
                      <div className="grid grid-cols-4 gap-1 pt-2">
                        {[
                          { key: "MBANKING", label: "M-Banking" },
                          { key: "ATM", label: "ATM" },
                          { key: "IBANKING", label: "i-Banking" },
                          { key: "TELLER", label: "Teller" },
                        ].map((ch) => (
                          <button
                            key={ch.key}
                            onClick={() => setInstructionChannel(ch.key as any)}
                            className={`py-1 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                              instructionChannel === ch.key
                                ? "bg-blue-900 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {ch.label}
                          </button>
                        ))}
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 flex-1 text-xs text-gray-700">
                      {selectedVa?.instructions
                        .filter((inst) => inst.channel === instructionChannel)
                        .map((inst, i) => (
                          <div key={i} className="space-y-3">
                            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-900" />
                              {inst.title}
                            </h4>
                            <ol className="space-y-2 text-gray-600 pl-4 list-decimal leading-relaxed">
                              {inst.steps.map((step, sIdx) => (
                                <li key={sIdx} className="pl-1">
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: RIWAYAT HEREGISTRASI & RECORD (UGM SIMASTER STYLE)       */}
        {/* ============================================================== */}
        {activeTab === "riwayat" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-gray-900">Riwayat Heregistrasi Mahasiswa</h3>
                <p className="text-xs text-muted-foreground">
                  Catatan pendaftaran ulang per semester beserta rincian UKT dan bukti registrasi.
                </p>
              </div>
            </div>

            {historyRecords.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground border-dashed">
                <CalendarDays className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm">Belum ada riwayat registrasi tercatat.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {historyRecords.map((item, idx) => {
                  const isAktif = item.registrationStatus === "AKTIF";
                  return (
                    <Card
                      key={item.academicTermId || idx}
                      className={`shadow-xs transition-all overflow-hidden border ${
                        item.isActive
                          ? "border-blue-300 ring-1 ring-blue-100 bg-white"
                          : "border-gray-200 bg-gray-50/40"
                      }`}
                    >
                      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Semester & KRS status */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{item.academicTermName}</span>
                            {item.isActive && (
                              <Badge className="bg-blue-100 text-blue-900 text-[10px] font-semibold border-none">
                                Semester Berjalan
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                            <span>
                              Status KRS: <span className="font-semibold text-gray-800">{item.krs?.status || "—"}</span>
                            </span>
                            <span>•</span>
                            <span>
                              Beban SKS: <span className="font-semibold text-blue-900">{item.krs?.totalCredits ?? 0} SKS</span>
                            </span>
                            {item.bill?.bankName && (
                              <>
                                <span>•</span>
                                <span>
                                  Channel: <span className="font-semibold text-gray-800">{item.bill.bankName}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* UKT & Status */}
                        <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                          <div className="text-right">
                            <span className="text-[11px] text-gray-500 block">Nominal UKT</span>
                            <span className="font-mono font-bold text-gray-900 text-sm">
                              {item.bill?.amountFormatted || "Rp 5.000.000"}
                            </span>
                          </div>

                          <div className="text-right">
                            {isAktif ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold gap-1 text-xs">
                                <CheckCircle2 className="h-3.5 w-3.5" /> LUNAS (AKTIF)
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-semibold gap-1 text-xs">
                                <Clock className="h-3.5 w-3.5" /> Belum Heregistrasi
                              </Badge>
                            )}
                          </div>

                          {/* Print Action Button */}
                          <div>
                            {item.canPrintReceipt && item.bill?.id ? (
                              <Button
                                onClick={() => handleOpenReceipt(item.bill.id)}
                                size="sm"
                                variant="outline"
                                className="border-blue-300 text-blue-900 hover:bg-blue-50 gap-1.5 h-8 text-xs font-semibold cursor-pointer"
                              >
                                <Printer className="h-3.5 w-3.5" /> Cetak Bukti
                              </Button>
                            ) : (
                              <Button
                                onClick={() => setActiveTab("pembayaran")}
                                size="sm"
                                className="bg-blue-900 hover:bg-blue-950 text-white gap-1 h-8 text-xs font-semibold cursor-pointer"
                              >
                                Bayar UKT <ChevronRight className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL CETAK BUKTI REGISTRASI RESMI (UGM SIMASTER) */}
      <BuktiRegistrasiModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        data={receiptData}
      />
    </AppLayout>
  );
}
