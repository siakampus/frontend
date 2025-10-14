import { BrowserRouter, Routes, Route, } from "react-router-dom";
import LoginPage from "./app/login/login-akun-lama";
import SignUpPage from "./app/sign-up/page";
import ProsesPendaftaran from "./app/dashboard/pendaftaran/admission";
import DataDiriPage from "./app/dashboard/data-diri";
import { AdmissionsPage } from "./app/dashboard/pendaftaran/admission-list";
import DataDiriPendaftaranPage from "./app/dashboard/pendaftaran/pengisian/data-diri";
import PemilihanProgramStudiPage from "./app/dashboard/pendaftaran/pengisian/program-studi";
import EnrollmentPage from "./app/dashboard/pendaftaran/pengisian/enrollment";
import LoginAkunBaru from "./app/login/akun-baru";
import DetailPendaftaranPage from "./app/dashboard/pendaftaran/detail-pendaftaran";



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

          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}