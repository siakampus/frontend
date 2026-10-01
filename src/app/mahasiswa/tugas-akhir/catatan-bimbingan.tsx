import { AppLayout } from "@/components/ui/app-layout";
import CatatanBimbinganContent from "./content-catatan-bimbingan";

export default function CatatanBimbinganPage() {
  return (
    <AppLayout
      menuTemplate="student"
      title="Catatan Bimbingan"
      subtitle="Riwayat bimbingan tugas akhir Anda"
    >
      <CatatanBimbinganContent />
    </AppLayout>
  );
}
