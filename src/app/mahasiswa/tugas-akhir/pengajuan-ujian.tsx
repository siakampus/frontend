import { AppLayout } from "@/components/ui/app-layout";
import PengajuanUjianContent from "./content-pengajuan-ujian";

export default function PengajuanUjianPage() {
  return (
    <AppLayout
      menuTemplate="student"
      title="Pengajuan Ujian"
      subtitle="Ajukan pendaftaran ujian sidang tugas akhir Anda"
    >
      <PengajuanUjianContent />
    </AppLayout>
  );
}
