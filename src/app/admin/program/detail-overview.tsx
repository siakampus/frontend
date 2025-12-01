import { Card } from "@/components/ui/card"

export default function ProgramDetailOverview() {
  const program = {
    name: "Sarjana (S1) 2025",
    active: true,
    faculties: ["Fakultas Teknik"],
    levels: ["Sarjana (S1)"],
    startDate: "2025-07-01",
    endDate: "2025-08-15",
    steps: [
      { title: "Pemilihan Program Studi", start: "2025-07-02", end: "2025-07-06" },
      { title: "Upload Dokumen", start: "2025-07-03", end: "2025-07-07" },
    ],
  }

  return (
    <div className="space-y-6">

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold text-lg">Informasi Program</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Nama Program</p>
            <p className="font-medium">{program.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">{program.active ? "Aktif" : "Nonaktif"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Tanggal Mulai</p>
            <p className="font-medium">{program.startDate}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Tanggal Berakhir</p>
            <p className="font-medium">{program.endDate}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Fakultas</p>
          <div className="flex gap-2 flex-wrap">
            {program.faculties.map(f => (
              <span key={f} className="px-3 py-1 bg-muted rounded-md text-sm">
                {f}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Jenjang</p>
          <div className="flex gap-2 flex-wrap">
            {program.levels.map(l => (
              <span key={l} className="px-3 py-1 bg-muted rounded-md text-sm">
                {l}
              </span>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold text-lg">Tahapan Pendaftaran</h3>

        {program.steps.length === 0 && (
          <p className="text-sm text-muted-foreground">Belum ada tahapan.</p>
        )}

        {program.steps.map((s, i) => (
          <div key={i} className="border p-3 rounded-md bg-muted/30">
            <p className="font-medium">{s.title}</p>
            <p className="text-xs text-muted-foreground">
              {s.start} – {s.end}
            </p>
          </div>
        ))}
      </Card>
    </div>
  )
}