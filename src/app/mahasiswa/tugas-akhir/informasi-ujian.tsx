import { AppLayout } from "@/components/ui/app-layout";
import InformasiUjianContent from "./content-informasi-ujian";

export default function InformasiUjianPage() {
  return (
    <AppLayout
      menuTemplate="student"
      title="Informasi Ujian"
      subtitle="Jadwal dan hasil ujian sidang tugas akhir Anda"
    >
      <InformasiUjianContent />
    </AppLayout>
  );
}
