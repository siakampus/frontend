import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Banknote,
  Copy,
  CheckCircle,
  Building2,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLayout } from "@/components/ui/app-layout";
import { paymentGatewayApi, type MyBillResponse, type VirtualAccountItem } from "@/lib/api";
import { Link } from "react-router-dom";

export default function PaymentInstructionsPage() {
  const [billData, setBillData] = useState<MyBillResponse | null>(null);
  const [selectedBankCode, setSelectedBankCode] = useState<string>("MANDIRI");
  const [selectedChannel, setSelectedChannel] = useState<"MBANKING" | "ATM" | "IBANKING" | "TELLER">("MBANKING");
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentGatewayApi
      .getMyBill()
      .then((res) => {
        if (res.ok && res.data?.data) {
          setBillData(res.data.data);
        }
      })
      .catch((err) => console.error("Error loading bill:", err))
      .finally(() => setLoading(false));
  }, []);

  const selectedVa: VirtualAccountItem | undefined =
    billData?.virtualAccounts.find((va) => va.bankCode === selectedBankCode) ||
    billData?.virtualAccounts[0];

  const handleCopy = () => {
    if (selectedVa?.vaNumber) {
      navigator.clipboard.writeText(selectedVa.vaNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const channelInstructions = selectedVa?.instructions.find(
    (inst) => inst.channel === selectedChannel
  );

  return (
    <AppLayout
      menuTemplate="admisi"
      title="Sarjana Reguler 2025"
      subtitle="Instruksi Pembayaran Virtual Account"
      backTo="/pendaftaran/billing"
    >
      <Card className="shadow-sm border rounded-lg max-w-4xl gap-2 mx-auto">
        <CardHeader className="pb-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <CreditCard className="h-5 w-5 text-primary" /> Petunjuk Pembayaran Virtual Account
            </h1>
            <Link to="/pendaftaran/billing">
              <Button variant="ghost" size="sm" className="text-xs gap-1 cursor-pointer">
                <ChevronLeft className="h-4 w-4" /> Kembali ke Tagihan
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Panduan lengkap pembayaran tagihan perkuliahan/pendaftaran menggunakan Virtual Account bank mitra resmi UGN (formula UGM: [Prefix Bank] + [NIM]).
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {loading ? (
            <div className="flex items-center justify-center p-8 gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Memuat instruksi pembayaran...</span>
            </div>
          ) : (
            <>
              {/* Detail Tagihan Box */}
              {selectedVa && (
                <div className="p-5 border rounded-xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">
                        Nomor Virtual Account ({selectedVa.bankName})
                      </span>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-amber-300">
                          {selectedVa.vaNumber}
                        </span>
                        <Button
                          onClick={handleCopy}
                          size="sm"
                          variant="secondary"
                          className="h-8 text-xs font-semibold gap-1 cursor-pointer"
                        >
                          {isCopied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          {isCopied ? "Tersalin!" : "Salin"}
                        </Button>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <span className="text-xs text-blue-200 block uppercase font-medium">Total Tagihan</span>
                      <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                        {billData?.bill.amountFormatted || "Rp 500.000"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/20 flex flex-wrap justify-between items-center text-xs text-blue-200">
                    <span>
                      Formula VA: <span className="font-mono text-white">{selectedVa.prefix} (Kode Bank) + {selectedVa.nim} (NIM/ID)</span>
                    </span>
                    <span>Batas Bayar: <span className="font-semibold text-white">{billData?.bill.deadline}</span></span>
                  </div>
                </div>
              )}

              {/* Bank & Saluran Selector */}
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="select-bank" className="text-xs font-bold text-gray-700">
                      Pilih Bank Mitra
                    </Label>
                    <Select value={selectedBankCode} onValueChange={setSelectedBankCode}>
                      <SelectTrigger id="select-bank" className="mt-1 w-full">
                        <SelectValue placeholder="Pilih Bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {billData?.virtualAccounts.map((va) => (
                          <SelectItem key={va.bankCode} value={va.bankCode}>
                            {va.bankName} (Prefix: {va.prefix})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-gray-700">Pilih Saluran Pembayaran</Label>
                    <div className="grid grid-cols-4 gap-1 mt-1">
                      {[
                        { key: "MBANKING", label: "M-Banking" },
                        { key: "ATM", label: "ATM" },
                        { key: "IBANKING", label: "i-Banking" },
                        { key: "TELLER", label: "Teller" },
                      ].map((ch) => (
                        <button
                          key={ch.key}
                          onClick={() => setSelectedChannel(ch.key as any)}
                          className={`py-2 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                            selectedChannel === ch.key
                              ? "bg-blue-900 text-white border-blue-900 shadow-xs"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {ch.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Instructions Card */}
                {channelInstructions && (
                  <Card className="border-blue-200 bg-blue-50/30">
                    <CardHeader className="text-blue-950 font-bold text-sm border-b border-blue-100 py-3">
                      Langkah Pembayaran via {channelInstructions.title}
                    </CardHeader>
                    <CardContent className="p-4">
                      <ol className="list-decimal list-inside space-y-2.5 text-xs text-gray-700 leading-relaxed">
                        {channelInstructions.steps.map((step, idx) => (
                          <li key={idx} className="pl-1">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )}

                <div className="p-4 bg-gray-50 rounded-lg border text-xs text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-800">Catatan Penting:</p>
                  <p>1. Pastikan nama mahasiswa/pendaftar yang muncul pada layar konfirmasi sesuai dengan akun Anda.</p>
                  <p>2. Nomor Virtual Account bersifat unik dan langsung terhubung dengan NIM / data diri mahasiswa.</p>
                  <p>3. Setelah pembayaran selesai, sistem akan memverifikasi secara otomatis tanpa perlu konfirmasi manual.</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
