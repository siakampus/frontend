import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  Banknote,
  Copy,
  Zap,
  CreditCard,
  Building2,
  Printer,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/ui/app-layout";
import { paymentGatewayApi, type MyBillResponse, type VirtualAccountItem, type BuktiRegistrasiResponse } from "@/lib/api";
import BuktiRegistrasiModal from "@/components/payment/BuktiRegistrasiModal";

export default function BillingPendaftaranPage() {
  const [billData, setBillData] = useState<MyBillResponse | null>(null);
  const [selectedBankCode, setSelectedBankCode] = useState<string>("MANDIRI");
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [receiptData, setReceiptData] = useState<BuktiRegistrasiResponse | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const res = await paymentGatewayApi.getMyBill();
      if (res.ok && res.data?.data) {
        setBillData(res.data.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data tagihan:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedVa: VirtualAccountItem | undefined =
    billData?.virtualAccounts.find((va) => va.bankCode === selectedBankCode) ||
    billData?.virtualAccounts[0];

  const isLunas = billData?.bill.isVerified ?? false;

  const handleCopy = () => {
    if (selectedVa?.vaNumber) {
      navigator.clipboard.writeText(selectedVa.vaNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handlePayViaVa = async () => {
    if (!selectedVa || !billData) return;
    if (!confirm(`Bayar tagihan pendaftaran sebesar ${billData.bill.amountFormatted} via ${selectedVa.bankName} Virtual Account (${selectedVa.vaNumber})?`)) return;

    setPaying(true);
    try {
      const res = await paymentGatewayApi.payVa({
        vaNumber: selectedVa.vaNumber,
        bankCode: selectedVa.bankCode,
        billId: billData.bill.id,
        amount: billData.bill.amount,
      });

      if (res.ok) {
        alert("✓ Pembayaran berhasil diselesaikan via Virtual Account! Anda dapat melanjutkan ke langkah berikutnya.");
        await fetchBilling();
      } else {
        const error = res.data as any;
        alert(`Gagal memproses pembayaran: ${error?.message || "Terjadi kesalahan"}`);
      }
    } catch (err: any) {
      alert(`Error pembayaran: ${err.message}`);
    } finally {
      setPaying(false);
    }
  };

  const handleOpenReceipt = async () => {
    if (!billData?.bill.id) return;
    try {
      const res = await paymentGatewayApi.getReceipt(billData.bill.id);
      if (res.ok && res.data?.data) {
        setReceiptData(res.data.data);
        setIsReceiptOpen(true);
      }
    } catch (err: any) {
      alert("Gagal memuat bukti pembayaran: " + err.message);
    }
  };

  return (
    <AppLayout
      menuTemplate="admisi"
      title="Sarjana Reguler 2025"
      subtitle="Buat Tagihan &amp; Virtual Account"
      backTo="/pendaftaran/sarjana-2025"
    >
      <Card className="shadow-sm border rounded-lg max-w-4xl gap-2 mx-auto">
        <CardHeader className="pb-2 border-b border-gray-200">
          <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Banknote className="h-5 w-5 text-primary" /> Tagihan &amp; Virtual Account Pendaftaran
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pembayaran biaya pendaftaran menggunakan Nomor Virtual Account (VA) berbasis Nomor Induk / Registrasi Mahasiswa (seperti sistem UGM Simaster).
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {loading ? (
            <div className="flex items-center justify-center p-8 gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Memuat data tagihan dan Virtual Account...</span>
            </div>
          ) : (
            <>
              {/* Ringkasan Biaya */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-3 flex justify-between font-semibold text-sm text-gray-800">
                  <span>Item Tagihan</span>
                  <span>Biaya</span>
                </div>
                <div className="p-3 flex justify-between text-sm">
                  <span>{billData?.bill.name || "Biaya Pendaftaran Mahasiswa Baru"}</span>
                  <span className="font-mono">{billData?.bill.amountFormatted || "Rp 500.000"}</span>
                </div>
                <div className="bg-primary/10 p-3 flex justify-between font-bold text-primary border-t">
                  <span>TOTAL TAGIHAN</span>
                  <span className="text-lg font-mono">{billData?.bill.amountFormatted || "Rp 500.000"}</span>
                </div>
              </div>

              {/* Status Tagihan */}
              <div
                className={`p-5 rounded-lg text-white font-bold flex flex-col justify-between gap-4 ${
                  isLunas ? "bg-emerald-600" : "bg-blue-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isLunas ? <CheckCircle className="h-6 w-6 text-white" /> : <Clock className="h-6 w-6 text-amber-300" />}
                    <span className="text-lg">{isLunas ? "LUNAS (TERVERIFIKASI)" : "Menunggu Pembayaran via Virtual Account"}</span>
                  </div>
                  <Badge className="bg-white/20 text-white font-mono text-xs border-none">
                    Identitas: {billData?.studentIdentity.nim}
                  </Badge>
                </div>

                {isLunas ? (
                  <div className="space-y-3 pt-2 border-t border-white/20 font-normal text-sm">
                    <p>Tagihan biaya pendaftaran telah lunas terverifikasi. Anda dapat mencetak bukti registrasi dan melanjutkan ke langkah berikutnya.</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleOpenReceipt}
                        className="bg-white text-emerald-800 hover:bg-gray-100 font-semibold gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Printer className="h-4 w-4" /> Cetak Bukti Registrasi
                      </Button>
                      <Button
                        onClick={() => navigate("/pendaftaran/sarjana-2025")}
                        variant="secondary"
                        className="cursor-pointer"
                      >
                        Lanjut ke Tahap CBT &rarr;
                      </Button>
                    </div>
                  </div>
                ) : (
                  selectedVa && (
                    <div className="space-y-4 pt-2 border-t border-white/20">
                      {/* Bank Selector Buttons */}
                      <div>
                        <span className="text-xs text-blue-200 block mb-2 font-normal">Pilih Bank Pembayaran:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {billData?.virtualAccounts.map((va) => {
                            const isSelected = va.bankCode === selectedBankCode;
                            return (
                              <button
                                key={va.bankCode}
                                onClick={() => setSelectedBankCode(va.bankCode)}
                                className={`p-2 rounded text-left transition-all cursor-pointer text-xs font-semibold ${
                                  isSelected
                                    ? "bg-amber-400 text-blue-950 ring-2 ring-white"
                                    : "bg-white/10 hover:bg-white/20 text-white"
                                }`}
                              >
                                {va.bankName}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* VA Details Box */}
                      <div className="bg-white/15 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-blue-200 font-normal">Nomor Virtual Account ({selectedVa.bankName}):</p>
                          <p className="font-mono text-2xl font-black text-white tracking-widest mt-0.5">
                            {selectedVa.vaNumber}
                          </p>
                          <p className="text-[11px] text-blue-200 font-normal mt-1">
                            Formula: {selectedVa.prefix} (Kode Bank) + {selectedVa.nim} (NIM/No. Pendaftaran) • Batas: {billData?.bill.deadline}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button onClick={handleCopy} variant="secondary" className="cursor-pointer">
                            {isCopied ? <CheckCircle className="h-4 w-4 text-emerald-600 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
                            {isCopied ? "Tersalin!" : "Salin VA"}
                          </Button>
                          <Button
                            onClick={() => navigate("/pendaftaran/payment")}
                            variant="secondary"
                            className="cursor-pointer"
                          >
                            <CreditCard className="h-4 w-4 mr-1.5" /> Petunjuk
                          </Button>
                        </div>
                      </div>

                      {/* Execute Payment via VA Simulation */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button
                          onClick={handlePayViaVa}
                          disabled={paying}
                          className="flex-1 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold h-10 cursor-pointer shadow-sm"
                        >
                          {paying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                          {paying ? "Memproses Pembayaran..." : `Bayar Sekarang via VA (${selectedVa.bankName})`}
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <BuktiRegistrasiModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        data={receiptData}
      />
    </AppLayout>
  );
}
