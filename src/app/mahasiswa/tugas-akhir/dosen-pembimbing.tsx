import { AppLayout } from "@/components/ui/app-layout";
import DosenPembimbingContent from "./content-dosen-pembimbing";

export default function DosenPembimbingPage() {
  return (
    <AppLayout
      menuTemplate="student"
      title="Dosen Pembimbing"
      subtitle="Informasi dosen pembimbing tugas akhir Anda"
    >
      <DosenPembimbingContent />
    </AppLayout>
  );
}
