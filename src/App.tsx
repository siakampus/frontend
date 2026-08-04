import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ui/protected-route";
import DashboardPage from "./app/mahasiswa/dashboard";
import LoginPage from "./app/guest/login/login-akun-lama";
import ForgotPasswordPage from "./app/guest/login/forgot-password";
import ResetPasswordPage from "./app/guest/login/reset-password";
import SignUpPage from "./app/guest/sign-up/page";
import ProsesPendaftaran from "./app/guest/pendaftaran/admission";
import DataDiriPage from "./app/guest/data-diri";
import { AdmissionsPage } from "./app/guest/pendaftaran/admission-list";
import DataDiriPendaftaranPage from "./app/guest/pendaftaran/pengisian/data-diri";
import PemilihanProgramStudiPage from "./app/guest/pendaftaran/pengisian/program-studi";
import LoginAkunBaru from "./app/guest/login/akun-baru";
import DetailPendaftaranPage from "./app/guest/pendaftaran/detail-pendaftaran";
import LecturerDashboardPage from "./app/lecturer/dashboard/page";
import AdminDashboardPage from "./app/admin/dashboard/page";
import ProfilePage from "./app/mahasiswa/profile";
import CoursesPage from "./app/mahasiswa/courses";
import KrsPage from "./app/mahasiswa/krs";
import GuestDashboardPage from "./app/guest/dashboard";

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
import UploadDokumenPendaftaranPage from "./app/guest/pendaftaran/pengisian/upload";
import LockDataPendaftaranPage from "./app/guest/pendaftaran/pengisian/penguncian-data";
import BillingPendaftaranPage from "./app/guest/pendaftaran/pengisian/buat-tagihan";
import PaymentInstructionsPage from "./app/guest/pendaftaran/pengisian/pembayaran";
import CBTSesiPage from "./app/guest/pendaftaran/pengisian/CBT";
import CetakBuktiPesertaPage from "./app/guest/pendaftaran/pengisian/cetak-bukti";
import CetakKartuUjianPage from "./app/guest/pendaftaran/pengisian/kartu-ujian";
import PengumumanHasilPage from "./app/guest/pendaftaran/pengisian/pengumuman-hasil";
import ProgramAnnouncementPage from "./app/admin/program/detail-kelola-pengumuman";

// ── NEW PAGES ──
import AdminUsersPage from "./app/admin/admin-users";
import AdminLecturersPage from "./app/admin/admin-lecturers";
import AdminLecturesPage from "./app/admin/admin-lectures";
import AdminPaymentsPage from "./app/admin/admin-payments";
import AdminRegistrationConfigPage from "./app/admin/admin-registration-config";
import LecturerAssignmentsPage from "./app/lecturer/assignments";
import LecturerCoursesPage from "./app/lecturer/courses";
import AssignmentDetailPage from "./app/mahasiswa/assignment-detail";
import ChatPage from "./app/mahasiswa/chat";
import HeregistrasiPage from "./app/mahasiswa/heregistrasi";

export default function App() {
  return (
    <BrowserRouter>
      <div className="w-screen">
        <main>
          <Routes>

            {/* ===================== PUBLIC ROUTES ===================== */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/pendaftaran/berhasil/login" element={<LoginAkunBaru />} />

            {/* ===================== STUDENT ROUTES ===================== */}
            <Route path="/mahasiswa" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/mahasiswa/profile" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/mahasiswa/courses" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <CoursesPage />
              </ProtectedRoute>
            } />
            <Route path="/mahasiswa/krs" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <KrsPage />
              </ProtectedRoute>
            } />
            <Route path="/mahasiswa/heregistrasi" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <HeregistrasiPage />
              </ProtectedRoute>
            } />
            <Route path="/mahasiswa/chat" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ChatPage />
              </ProtectedRoute>
            } />
            <Route path="/mahasiswa/assignments/:id" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <AssignmentDetailPage />
              </ProtectedRoute>
            } />

            {/* ===================== GUEST / APPLICANT ROUTES ===================== */}
            <Route path="/guest/dashboard" element={
              <ProtectedRoute allowedRoles={["guest", "student"]}>
                <GuestDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/data-diri" element={
              <ProtectedRoute allowedRoles={["guest", "student"]}>
                <DataDiriPage />
              </ProtectedRoute>
            } />
            <Route path="/pendaftaran" element={
              <ProtectedRoute allowedRoles={["guest", "student"]}>
                <AdmissionsPage />
              </ProtectedRoute>
            } />
            <Route path="/pendaftaran/sarjana-2025" element={
              <ProtectedRoute allowedRoles={["guest", "student"]}>
                <ProsesPendaftaran />
              </ProtectedRoute>
            } />
            <Route path="/pendaftaran/data-diri" element={
              <ProtectedRoute allowedRoles={["guest", "student"]}>
                <DataDiriPendaftaranPage />
              </ProtectedRoute>
            } />
            <Route path="/pendaftaran/program-studi" element={
              <ProtectedRoute allowedRoles={["guest", "student"]}>
                <PemilihanProgramStudiPage />
              </ProtectedRoute>
            } />
            <Route path="/pendaftaran/detail-pendaftaran/:id" element={
              <ProtectedRoute allowedRoles={["guest", "student"]}>
                <DetailPendaftaranPage />
              </ProtectedRoute>
            } />
            <Route path="/pendaftaran/upload" element={
              <ProtectedRoute allowedRoles={["guest", "student"]}>
                <UploadDokumenPendaftaranPage />
              </ProtectedRoute>
            } />
            <Route path="/pendaftaran/lock" element={
              <ProtectedRoute allowedRoles={["guest", "student"]}>
                <LockDataPendaftaranPage />
              </ProtectedRoute>
            } />
            <Route path="/pendaftaran/billing" element={
              <ProtectedRoute allowedRoles={["guest", "student"]}>
                <BillingPendaftaranPage />
              </ProtectedRoute>
            } />
            <Route path="/pendaftaran/payment" element={
              <ProtectedRoute allowedRoles={["guest", "student"]}>
                <PaymentInstructionsPage />
              </ProtectedRoute>
            } />
            <Route path="/pendaftaran/cbt" element={
              <ProtectedRoute allowedRoles={["guest", "student"]}>
                <CBTSesiPage />
              </ProtectedRoute>
            } />
            <Route path="/pendaftaran/print-form" element={
              <ProtectedRoute allowedRoles={["guest", "student"]}>
                <CetakBuktiPesertaPage />
              </ProtectedRoute>
            } />
            <Route path="/pendaftaran/print-card" element={
              <ProtectedRoute allowedRoles={["guest", "student"]}>
                <CetakKartuUjianPage />
              </ProtectedRoute>
            } />
            <Route path="/pendaftaran/announcement" element={
              <ProtectedRoute allowedRoles={["guest", "student"]}>
                <PengumumanHasilPage />
              </ProtectedRoute>
            } />

            {/* ===================== LECTURER ROUTES ===================== */}
            <Route path="/lecturer" element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/lecturer/assignments" element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerAssignmentsPage />
              </ProtectedRoute>
            } />
            <Route path="/lecturer/courses" element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerCoursesPage />
              </ProtectedRoute>
            } />

            {/* ===================== ADMIN ROUTES ===================== */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboardPage />} />
              <Route path="pendaftaran" element={<AdminRegistrationsPage />} />
              <Route path="upload" element={<AdminUploadPage />} />
              <Route path="feedback" element={<AdminFeedbackPage />} />
              <Route path="hasil" element={<AdminResultsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="programs" element={<AdminProgramsPage />} />
              <Route path="programs/new" element={<AdminProgramAddPage />} />
              <Route path="programs/:id" element={<AdminProgramDetailPage />} />
              <Route path="programs/:programId/applicant/:applicantId" element={<ApplicantDetailPage />} />
              <Route path="programs/:programId/applicant/:applicantId/step/:stepId" element={<StepDetailPage />} />
              <Route path="programs/:programId/announcement" element={<ProgramAnnouncementPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="lecturers" element={<AdminLecturersPage />} />
              <Route path="lectures" element={<AdminLecturesPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="registration/config" element={<AdminRegistrationConfigPage />} />
            </Route>

          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
