import { useState, useEffect } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { heregistrasiApi } from "@/lib/api";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  CalendarDays,
  BookOpen,
  FileText,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_PUBLIC_API_URL ?? "";

// Payment status values come from the backend PaymentStatus enum.
type PaymentStatus = "UNPAID" | "PENDING_VERIFICATION" | "VERIFIED";

interface Payment {
  id: number;
  paymentDate: string;
  fileUrl: string | null;
  fileId: number | null;
}

interface Bill {
  id: number;
  name: string;
  status: PaymentStatus | string;
  createdAt: string;
  payment: Payment | null;
}

interface AcademicTerm {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface HistoryEntry {
  academicTerm: AcademicTerm;
  krs: { id: number; status: string; totalCredits: number };
  paymentStatus: PaymentStatus | string;
  bills: Bill[];
}

interface HistoryResponse {
  history: HistoryEntry[];
  unmatchedBills: Bill[];
}

// ── Status badge helper ───────────────────────────────────────────────────────
function PaymentStatusBadge({ status }: { status: PaymentStatus | string }) {
  const s = (status || "").toUpperCase();
  switch (s) {
    case "VERIFIED":
    case "PAID":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200 gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" /> Lunas
        </Badge>
      );
    case "PENDING_VERIFICATION":
    case "PENDING":
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border border-amber-200 gap-1">
          <Clock className="h-3.5 w-3.5" /> Pending Verifikasi
        </Badge>
      );
    default:
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border border-red-200 gap-1">
          <XCircle className="h-3.5 w-3.5" /> Belum Bayar
        </Badge>
      );
  }
}

function KrsStatusBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED")
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border border-green-200">Disetujui</Badge>;
  if (s === "SUBMITTED")
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200">Diajukan</Badge>;
  if (s === "DRAFT")
    return <Badge variant="outline">Draft</Badge>;
  return <Badge variant="outline">{status || "Belum Diisi"}</Badge>;
}

function fmtDate(d?: string | null) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return "-";
  }
}

export default function HeregistrasiPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [unmatchedBills, setUnmatchedBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await heregistrasiApi.getMyHistory();
      if (res.ok && res.data) {
        const body = (res.data as { data?: HistoryResponse }).data;
        setHistory(body?.history || []);
        setUnmatchedBills(body?.unmatchedBills || []);
      } else if (res.status === 404) {
        setError("Data mahasiswa tidak ditemukan untuk akun ini.");
      } else {
        setError("Gagal memuat riwayat heregistrasi.");
      }
    } catch (e) {
      console.error("Error fetching heregistrasi history:", e);
      setError("Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout menuTemplate="student" title="Riwayat Heregistrasi" subtitle="Riwayat pendaftaran ulang & pembayaran UKT">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const hasData = history.length > 0 || unmatchedBills.length > 0;

  return (
    <AppLayout menuTemplate="student" title="Riwayat Heregistrasi" subtitle="Riwayat pendaftaran ulang & pembayaran UKT">
      <div className="max-w-5xl mx-auto space-y-6">
        {error && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex items-center gap-4 p-6">
              <AlertCircle className="h-8 w-8 text-amber-500 shrink-0" />
              <div>
                <h3 className="font-bold text-amber-800">Tidak Dapat Menampilkan Data</h3>
                <p className="text-amber-700 text-sm mt-1">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!error && !hasData && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="flex items-center gap-4 p-6">
              <CalendarDays className="h-8 w-8 text-blue-500 shrink-0" />
              <div>
                <h3 className="font-bold text-blue-800">Belum Ada Riwayat</h3>
                <p className="text-blue-700 text-sm mt-1">
                  Anda belum memiliki riwayat pendaftaran ulang atau tagihan UKT.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Per-semester history cards */}
        {history.map((entry) => (
          <Card key={entry.academicTerm.id} className="shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    {entry.academicTerm.name}
                    {entry.academicTerm.isActive && (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border border-primary/20 text-[10px]">
                        Aktif
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {fmtDate(entry.academicTerm.startDate)} — {fmtDate(entry.academicTerm.endDate)}
                  </CardDescription>
                </div>
                <PaymentStatusBadge status={entry.paymentStatus} />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* KRS summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border bg-gray-50/60 p-4">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" /> Status KRS
                  </div>
                  <KrsStatusBadge status={entry.krs.status} />
                </div>
                <div className="rounded-lg border bg-gray-50/60 p-4">
                  <div className="text-xs text-muted-foreground mb-1">Total SKS</div>
                  <div className="text-2xl font-bold text-primary">{entry.krs.totalCredits}</div>
                </div>
                <div className="rounded-lg border bg-gray-50/60 p-4">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5" /> Status UKT
                  </div>
                  <PaymentStatusBadge status={entry.paymentStatus} />
                </div>
              </div>

              {/* Bills for this term */}
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-2">Tagihan &amp; Pembayaran</div>
                {entry.bills.length > 0 ? (
                  <div className="space-y-2">
                    {entry.bills.map((bill) => (
                      <BillRow key={bill.id} bill={bill} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic border border-dashed rounded-md px-3 py-3">
                    Tidak ada tagihan UKT tercatat untuk semester ini.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Bills not linked to any term */}
        {unmatchedBills.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Tagihan Lainnya
              </CardTitle>
              <CardDescription className="mt-1">
                Tagihan yang tidak terkait dengan semester tertentu (mis. pendaftaran).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-2">
              {unmatchedBills.map((bill) => (
                <BillRow key={bill.id} bill={bill} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

// ── Single bill row ───────────────────────────────────────────────────────────
function BillRow({ bill }: { bill: Bill }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3">
      <div className="min-w-0">
        <div className="font-medium text-gray-900 truncate">{bill.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {bill.payment?.paymentDate
            ? `Dibayar: ${fmtDate(bill.payment.paymentDate)}`
            : `Dibuat: ${fmtDate(bill.createdAt)}`}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {bill.payment?.fileUrl && (
          <a
            href={`${API_BASE}${bill.payment.fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline inline-flex items-center gap-1 text-sm"
          >
            <FileText className="h-4 w-4" /> Bukti Bayar
          </a>
        )}
        <PaymentStatusBadge status={bill.status} />
      </div>
    </div>
  );
}
