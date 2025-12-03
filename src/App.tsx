import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./app/mahasiswa/login/login-akun-lama";
import SignUpPage from "./app/mahasiswa/sign-up/page";
import ProsesPendaftaran from "./app/mahasiswa/dashboard/pendaftaran/admission";
import DataDiriPage from "./app/mahasiswa/dashboard/data-diri";
import { AdmissionsPage } from "./app/mahasiswa/dashboard/pendaftaran/admission-list";
import DataDiriPendaftaranPage from "./app/mahasiswa/dashboard/pendaftaran/pengisian/data-diri";
import PemilihanProgramStudiPage from "./app/mahasiswa/dashboard/pendaftaran/pengisian/program-studi";
import LoginAkunBaru from "./app/mahasiswa/login/akun-baru";
import DetailPendaftaranPage from "./app/mahasiswa/dashboard/pendaftaran/detail-pendaftaran";

import AdminRegistrationsPage from "./app/admin/admin-data-pendaftaran";
import AdminUploadPage from "./app/admin/admin-upload";
import AdminFeedbackPage from "./app/admin/admin-feedback";
import AdminResultsPage from "./app/admin/admin-hasil";
import AdminSettingsPage from "./app/admin/admin-pengaturan";

import AdminProgramsPage from "./app/admin/program/pengaturan-program";
import AdminProgramAddPage from "./app/admin/program/add";
import AdminProgramDetailPage from "./app/admin/program/details";

import AdminLayout from "./app/admin/admin-layout";
import ApplicantDetailPage from "./app/admin/program/detail-pendaftar-data";
import StepDetailPage from "./app/admin/program/detail-pendaftar-step";
import UploadDokumenPendaftaranPage from "./app/mahasiswa/dashboard/pendaftaran/pengisian/upload";
import LockDataPendaftaranPage from "./app/mahasiswa/dashboard/pendaftaran/pengisian/penguncian-data";
import BillingPendaftaranPage from "./app/mahasiswa/dashboard/pendaftaran/pengisian/buat-tagihan";
import PaymentInstructionsPage from "./app/mahasiswa/dashboard/pendaftaran/pengisian/pembayaran";
import CBTSesiPage from "./app/mahasiswa/dashboard/pendaftaran/pengisian/CBT";
import CetakBuktiPesertaPage from "./app/mahasiswa/dashboard/pendaftaran/pengisian/cetak-bukti";
import CetakKartuUjianPage from "./app/mahasiswa/dashboard/pendaftaran/pengisian/kartu-ujian";
import PengumumanHasilPage from "./app/mahasiswa/dashboard/pendaftaran/pengisian/pengumuman-hasil";
import ProgramAnnouncementPage from "./app/admin/program/detail-kelola-pengumuman";

export default function App() {
  return (
    <BrowserRouter>
      <div className="w-screen">
        <main>
          <Routes>

            {/* ===================== USER SIDE ===================== */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/data-diri" element={<DataDiriPage />} />
            <Route path="/pendaftaran" element={<AdmissionsPage />} />
            <Route path="/pendaftaran/berhasil/login" element={<LoginAkunBaru />} />
            <Route path="/pendaftaran/sarjana-2025" element={<ProsesPendaftaran />} />
            <Route path="/pendaftaran/data-diri" element={<DataDiriPendaftaranPage />} />
            <Route path="/pendaftaran/program-studi" element={<PemilihanProgramStudiPage />} />
            <Route path="/pendaftaran/detail-pendaftaran/:id" element={<DetailPendaftaranPage />} />
            <Route path="/pendaftaran/upload" element={<UploadDokumenPendaftaranPage />} />
            <Route path="/pendaftaran/lock" element={<LockDataPendaftaranPage />} />
            <Route path="/pendaftaran/billing" element={<BillingPendaftaranPage />} />
            <Route path="/pendaftaran/payment" element={<PaymentInstructionsPage />} />
            <Route path="/pendaftaran/cbt" element={<CBTSesiPage />} />
            <Route path="/pendaftaran/print-form" element={<CetakBuktiPesertaPage />} />
            <Route path="/pendaftaran/print-card" element={<CetakKartuUjianPage />} />
            <Route path="/pendaftaran/announcement" element={<PengumumanHasilPage />} />


            {/* ===================== ADMIN SIDE ===================== */}

            {/* Standalone routes (di luar layout) */}
            <Route path="admin/pendaftaran" element={<AdminRegistrationsPage />} />
            <Route path="admin/upload" element={<AdminUploadPage />} />
            <Route path="admin/feedback" element={<AdminFeedbackPage />} />
            <Route path="admin/hasil" element={<AdminResultsPage />} />
            <Route path="admin/settings" element={<AdminSettingsPage />} />

            {/* Layout parent */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="programs" element={<AdminProgramsPage />} />
              <Route path="programs/new" element={<AdminProgramAddPage />} />
              <Route path="programs/:id" element={<AdminProgramDetailPage />} />
              <Route
                path="programs/:programId/applicant/:applicantId"
                element={<ApplicantDetailPage />}
              />
              <Route
                path="programs/:programId/applicant/:applicantId/step/:stepId"
                element={<StepDetailPage />}
              />
              <Route
                path="programs/:programId/announcement"
                element={<ProgramAnnouncementPage />}
              />

            </Route>

          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}