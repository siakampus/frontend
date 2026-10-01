import { AppLayout } from "@/components/ui/app-layout";
import PengajuanTAContent from "./content-pengajuan";

export default function PengajuanTAPage() {
  return (
    <AppLayout
      menuTemplate="student"
      title="Pengajuan Tugas Akhir"
      subtitle="Ajukan judul, topik, dan pilih dosen pembimbing tugas akhir Anda"
    >
      <PengajuanTAContent />
    </AppLayout>
  );
}
