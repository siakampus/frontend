import { useState } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { ClipboardList, BookOpen, Users, GraduationCap, Info } from "lucide-react";
import PengajuanTAContent from "./content-pengajuan";
import CatatanBimbinganContent from "./content-catatan-bimbingan";
import DosenPembimbingContent from "./content-dosen-pembimbing";
import PengajuanUjianContent from "./content-pengajuan-ujian";
import InformasiUjianContent from "./content-informasi-ujian";

type SubTab =
  | "pengajuan"
  | "catatan-bimbingan"
  | "dosen-pembimbing"
  | "pengajuan-ujian"
  | "informasi-ujian";

const SUB_TABS: { key: SubTab; label: string; icon: React.ReactNode }[] = [
  { key: "pengajuan", label: "Pengajuan TA", icon: <ClipboardList className="h-4 w-4" /> },
  { key: "catatan-bimbingan", label: "Catatan Bimbingan", icon: <BookOpen className="h-4 w-4" /> },
  { key: "dosen-pembimbing", label: "Dosen Pembimbing", icon: <Users className="h-4 w-4" /> },
  { key: "pengajuan-ujian", label: "Pengajuan Ujian", icon: <GraduationCap className="h-4 w-4" /> },
  { key: "informasi-ujian", label: "Informasi Ujian", icon: <Info className="h-4 w-4" /> },
];

export default function TugasAkhirPage() {
  const [activeTab, setActiveTab] = useState<SubTab>("pengajuan");

  return (
    <AppLayout
      menuTemplate="student"
      title="Tugas Akhir"
      subtitle="Kelola pengajuan, bimbingan, dan ujian tugas akhir Anda"
    >
      <div className="flex gap-0 min-h-[600px] bg-white rounded-xl border overflow-hidden shadow-sm">
        {/* Vertical sub-tab sidebar */}
        <nav className="w-56 shrink-0 border-r bg-gray-50/80 flex flex-col">
          <div className="px-4 pt-5 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Menu Tugas Akhir
            </h3>
          </div>
          <div className="flex flex-col gap-0.5 px-2 pb-4">
            {SUB_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-150 text-left w-full cursor-pointer
                    ${isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "pengajuan" && <PengajuanTAContent />}
          {activeTab === "catatan-bimbingan" && <CatatanBimbinganContent />}
          {activeTab === "dosen-pembimbing" && <DosenPembimbingContent />}
          {activeTab === "pengajuan-ujian" && <PengajuanUjianContent />}
          {activeTab === "informasi-ujian" && <InformasiUjianContent />}
        </div>
      </div>
    </AppLayout>
  );
}
