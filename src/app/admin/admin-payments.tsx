import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminPaymentsApi } from "@/lib/api";
import { CreditCard, Search, RefreshCw, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Payment {
  id: string;
  billName?: string;
  status?: string;
  amount?: number;
  createdAt?: string;
  user?: { email?: string; name?: string };
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [billNameFilter, setBillNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const navigate = useNavigate();

  const fetchPayments = async () => {
    setLoading(true);
    const res = await adminPaymentsApi.list({
      billName: billNameFilter || undefined,
      status: statusFilter || undefined,
    });
    if (res.status === 401) { navigate("/login"); return; }
    if (res.ok && res.data) {
      const body = res.data as { data?: Payment[] };
      setPayments(body.data || (res.data as unknown as Payment[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []);

  const notify = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const handleConfirm = async (id: string) => {
    if (!confirm("Konfirmasi pembayaran ini?")) return;
    const res = await adminPaymentsApi.confirm(id);
    notify(res.ok ? "✅ Pembayaran dikonfirmasi." : "❌ Gagal mengkonfirmasi pembayaran.");
    fetchPayments();
  };

  return (
    <div className="space-y-6">
        <Card className="shadow-sm border rounded-lg">
          <CardContent className="p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter nama tagihan..."
                className="pl-9"
                value={billNameFilter}
                onChange={(e) => setBillNameFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchPayments()}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="confirmed">Dikonfirmasi</option>
              <option value="rejected">Ditolak</option>
            </select>
            <Button onClick={fetchPayments} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Muat Ulang
            </Button>
          </CardContent>
        </Card>

        {actionMsg && (
          <div className="text-sm font-medium px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
            {actionMsg}
          </div>
        )}

        <Card className="shadow-sm border rounded-lg overflow-hidden">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 font-serif text-primary">
              <CreditCard className="h-5 w-5" /> Daftar Pembayaran ({payments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <RefreshCw className="animate-spin h-5 w-5 mr-2" /> Memuat data...
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm">
                Tidak ada data pembayaran.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Pengguna</th>
                      <th className="px-4 py-3 text-left">Nama Tagihan</th>
                      <th className="px-4 py-3 text-left">Jumlah</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Tanggal</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{p.user?.name || "—"}</div>
                          <div className="text-xs text-muted-foreground">{p.user?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">{p.billName || "—"}</td>
                        <td className="px-4 py-3 text-sm font-mono">
                          {p.amount != null
                            ? `Rp ${p.amount.toLocaleString("id-ID")}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[p.status || ""] || "bg-gray-100 text-gray-600"}`}>
                            {p.status || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString("id-ID") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            {p.status === "pending" && (
                              <button
                                title="Konfirmasi Pembayaran"
                                onClick={() => handleConfirm(p.id)}
                                className="p-1.5 rounded hover:bg-green-50 text-green-600 transition-colors"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
