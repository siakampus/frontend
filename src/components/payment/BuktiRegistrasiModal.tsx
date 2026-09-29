import React, { useRef, useEffect, useState } from "react";
import { Printer, X, CheckCircle2, ShieldCheck, QrCode, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paymentGatewayApi, type BuktiRegistrasiResponse } from "@/lib/api";
import logo from "@/assets/images/logo.png";

interface BuktiRegistrasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: BuktiRegistrasiResponse | null;
  billId?: number | string | null;
}

export default function BuktiRegistrasiModal({
  isOpen,
  onClose,
  data: initialData,
  billId,
}: BuktiRegistrasiModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<BuktiRegistrasiResponse | null>(initialData || null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Synchronize initial data or fetch from billId
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setData(initialData);
      setFetchError(null);
      return;
    }

    if (billId) {
      setLoading(true);
      setFetchError(null);
      paymentGatewayApi
        .getReceipt(billId)
        .then((res) => {
          if (res.ok && res.data?.data) {
            setData(res.data.data);
          } else {
            setFetchError("Bukti registrasi belum dapat diterbitkan atau tagihan belum berstatus lunas.");
          }
        })
        .catch((err: any) => {
          setFetchError(err.message || "Gagal memuat dokumen bukti registrasi.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, initialData, billId]);

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

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bukti-registrasi-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-gray-200 overflow-hidden flex flex-col my-8 print:my-0 print:border-none print:shadow-none print:max-w-none">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-gray-900 text-white border-b print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span id="bukti-registrasi-title" className="font-semibold text-sm">
              Bukti Registrasi dan Pembayaran Resmi (UGN Simaster)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              disabled={loading || !data}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 text-xs font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
            >
              <Printer className="h-3.5 w-3.5" /> Cetak Slip (A4)
            </Button>
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="text-gray-400 hover:text-white h-8 w-8 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Tutup dokumen"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Menyiapkan slip Bukti Registrasi resmi...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && fetchError && (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h4 className="font-semibold text-gray-900 text-base">Dokumen Belum Tersedia</h4>
            <p className="text-sm text-muted-foreground max-w-md">{fetchError}</p>
            <Button onClick={onClose} variant="outline" size="sm" className="mt-2">
              Tutup
            </Button>
          </div>
        )}

        {/* Printable Document Body */}
        {!loading && data && (
          <>
            <div
              ref={printRef}
              className="p-8 sm:p-10 text-gray-900 bg-white print:p-6"
              id="printable-bukti-registrasi"
            >
              {/* KOP UNIVERSITAS (Simaster Style) */}
              <div className="border-b-2 border-gray-900 pb-3 mb-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={logo}
                      alt="Logo Universitas Gadjah Nusantara"
                      className="w-16 h-16 object-contain shrink-0"
                    />
                    <div>
                      <h1 className="text-lg sm:text-xl font-black uppercase tracking-wide text-blue-950 font-serif leading-tight">
                        Universitas Gadjah Nusantara
                      </h1>
                      <p className="text-xs text-gray-600 font-medium">
                        Direktorat Keuangan dan Direktorat Pendidikan dan Pengajaran
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Jl. Nusantara Kampus Terpadu, Gedung Pusat UGN Lt. 2 • Telp: (0274) 551234 • Email: akademik@ugn.ac.id
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 text-[11px] font-bold tracking-wider uppercase">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Lunas Terverifikasi
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">{data.nomorBukti}</p>
                  </div>
                </div>
              </div>

              {/* DOCUMENT TITLE */}
              <div className="text-center my-4">
                <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-gray-900 underline underline-offset-4 decoration-gray-400">
                  Bukti Registrasi dan Pembayaran Biaya Pendidikan
                </h2>
                <p className="text-xs text-gray-600 mt-1">
                  Nomor: <span className="font-mono font-semibold text-gray-900">{data.nomorBukti}</span> • Tanggal Cetak: {data.tanggalCetak}
                </p>
              </div>

              {/* MAHASISWA & PEMBAYARAN DATA GRID */}
              <div className="space-y-4 my-6">
                {/* Section 1: Data Mahasiswa */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-blue-950 text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                    I. Identitas Mahasiswa
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <div className="flex">
                      <span className="w-32 text-gray-500 shrink-0">Nama Lengkap</span>
                      <span className="font-bold text-gray-900">: {data.identitasMahasiswa.nama}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-500 shrink-0">Nomor Induk (NIM)</span>
                      <span className="font-mono font-bold text-blue-900 text-sm">
                        : {data.identitasMahasiswa.nim}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-500 shrink-0">Fakultas</span>
                      <span className="font-medium text-gray-900">: {data.identitasMahasiswa.fakultas}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-500 shrink-0">Program Studi</span>
                      <span className="font-medium text-gray-900">: {data.identitasMahasiswa.programStudi}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-500 shrink-0">Jenjang Pendidikan</span>
                      <span className="font-medium text-gray-900">: {data.identitasMahasiswa.jenjang}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-500 shrink-0">Status Heregistrasi</span>
                      <span className="font-bold text-emerald-700">
                        : {data.identitasMahasiswa.statusAkademik} (TERDAFTAR)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Rincian Pembayaran */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-blue-950 text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                    II. Rincian Pembayaran Biaya Pendidikan
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      <div className="flex">
                        <span className="w-32 text-gray-500 shrink-0">Semester / Periode</span>
                        <span className="font-semibold text-gray-900">: {data.rincianPembayaran.semester}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 shrink-0">Tahun Akademik</span>
                        <span className="font-semibold text-gray-900">: {data.rincianPembayaran.tahunAkademik}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 shrink-0">Pos Pembayaran</span>
                        <span className="font-semibold text-gray-900">: {data.rincianPembayaran.posTagihan}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 shrink-0">Metode Bayar</span>
                        <span className="font-semibold text-gray-900">: {data.rincianPembayaran.bank}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 shrink-0">Virtual Account</span>
                        <span className="font-mono font-bold text-blue-900">
                          : {data.rincianPembayaran.nomorVirtualAccount}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 shrink-0">No. Transaksi (Ref)</span>
                        <span className="font-mono font-semibold text-gray-800">
                          : {data.rincianPembayaran.nomorTransaksi}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 shrink-0">Waktu Pembayaran</span>
                        <span className="font-medium text-gray-900">: {data.rincianPembayaran.tanggalBayar}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-gray-500 shrink-0">Status Tagihan</span>
                        <span className="font-bold text-emerald-700">: {data.rincianPembayaran.status}</span>
                      </div>
                    </div>

                    {/* Amount Highlight */}
                    <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-3 rounded">
                      <div>
                        <span className="text-xs text-gray-500 block">Terbilang:</span>
                        <span className="text-xs italic font-semibold text-gray-800">
                          "{data.rincianPembayaran.terbilang}"
                        </span>
                      </div>
                      <div className="mt-2 sm:mt-0 text-right">
                        <span className="text-[11px] text-gray-500 block uppercase font-bold">
                          Total Pembayaran:
                        </span>
                        <span className="text-base font-extrabold text-blue-950 font-mono">
                          {data.rincianPembayaran.jumlahBayarFormatted}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Hak Akademik */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded text-[11px] text-amber-900 leading-relaxed">
                  <span className="font-bold">Keterangan &amp; Hak Akademik:</span>
                  <p className="mt-0.5">{data.hakAkademik}</p>
                </div>
              </div>

              {/* FOOTER & VALIDATION (UGM Stempel & QR Code) */}
              <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 text-xs text-gray-600">
                {/* Left: Security Verification */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded flex flex-col items-center justify-center text-center p-1 shrink-0">
                    <QrCode className="h-10 w-10 text-gray-800" />
                    <span className="text-[8px] font-mono text-gray-500">VERIFIKASI</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-800">Validasi Digital Sistem</p>
                    <p className="text-[10px] text-gray-500 font-mono">Kode: {data.verifikasi.kodeKeamanan}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">
                      Dokumen ini diterbitkan sah oleh Sistem Informasi Akademik UGN dan tidak memerlukan tanda tangan basah.
                    </p>
                  </div>
                </div>

                {/* Right: Signature stamp */}
                <div className="text-center sm:text-right shrink-0">
                  <p className="text-[11px] text-gray-700">Yogyakarta, {data.tanggalCetak}</p>
                  <p className="text-[11px] font-bold text-gray-900 mt-1">Direktorat Keuangan &amp; Akademik UGN</p>
                  <div className="my-2 flex justify-center sm:justify-end">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-blue-800 bg-blue-50 text-blue-900 rounded font-serif text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-700" /> Terverifikasi Sistem
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500">{data.verifikasi.tandaTangan}</p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions (Hidden on print) */}
            <div className="flex items-center justify-end gap-3 px-6 py-3.5 bg-gray-50 border-t print:hidden">
              <Button onClick={onClose} variant="outline" size="sm" className="cursor-pointer">
                Tutup
              </Button>
              <Button
                onClick={handlePrint}
                size="sm"
                className="bg-blue-900 hover:bg-blue-950 text-white gap-1.5 cursor-pointer font-medium"
              >
                <Printer className="h-4 w-4" /> Cetak Dokumen (A4)
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
