import { BrowserRouter, Routes, Route, } from "react-router-dom";
import LoginPage from "./app/mahasiswa/login/login-akun-lama";
import SignUpPage from "./app/mahasiswa/sign-up/page";
import ProsesPendaftaran from "./app/mahasiswa/dashboard/pendaftaran/admission";
import DataDiriPage from "./app/mahasiswa/dashboard/data-diri";
import { AdmissionsPage } from "./app/mahasiswa/dashboard/pendaftaran/admission-list";
import DataDiriPendaftaranPage from "./app/mahasiswa/dashboard/pendaftaran/pengisian/data-diri";
import PemilihanProgramStudiPage from "./app/mahasiswa/dashboard/pendaftaran/pengisian/program-studi";
import EnrollmentPage from "./app/mahasiswa/dashboard/pendaftaran/pengisian/enrollment";
import LoginAkunBaru from "./app/mahasiswa/login/akun-baru";
import DetailPendaftaranPage from "./app/mahasiswa/dashboard/pendaftaran/detail-pendaftaran";
import AdminRegistrationsPage from "./app/admin/admin-data-pendaftaran";
import AdminUploadPage from "./app/admin/admin-upload";
import AdminFeedbackPage from "./app/admin/admin-feedback";
import AdminResultsPage from "./app/admin/admin-hasil";
import AdminSettingsPage from "./app/admin/admin-pengaturan-platform";



export default function App() {
  return (
    <BrowserRouter>
      <div className="w-screen">
        <main>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/data-diri" element={<DataDiriPage />} />
            <Route path="/pendaftaran" element={<AdmissionsPage />} />
            <Route path="/pendaftaran/berhasil/login" element={<LoginAkunBaru />} />
            <Route path="/pendaftaran/sarjana-2025" element={<ProsesPendaftaran />} />
            <Route path="/pendaftaran/enrollment" element={<EnrollmentPage />} />
            <Route path="/pendaftaran/data-diri" element={<DataDiriPendaftaranPage />} />
            <Route path="/pendaftaran/program-studi" element={<PemilihanProgramStudiPage />} />
            <Route path="/pendaftaran/detail-pendaftaran" element={<DetailPendaftaranPage />} />
            <Route path="/admin/pendaftaran" element={<AdminRegistrationsPage />} />
            <Route path="/admin/upload" element={<AdminUploadPage />} />
            <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
            <Route path="/admin/hasil" element={<AdminResultsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />


          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}