import { useNavigate, useParams } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CheckCircle, Clock } from "lucide-react"

export default function ProgramApplicants() {
  const navigate = useNavigate()
  const { id: programId } = useParams()
  const [isAnnouncementPublished, setIsAnnouncementPublished] = useState(false)

  const applicants = [
    { id: 1, name: "Budi Santoso", email: "budi@mail.com", date: "2025-07-03", status: "Tahap 2", finalStatus: "Diterima" },
    { id: 2, name: "Ani Lestari", email: "ani@mail.com", date: "2025-07-04", status: "Tahap 1", finalStatus: "Menunggu Keputusan" },
    { id: 3, name: "Joko Susilo", email: "joko@mail.com", date: "2025-07-05", status: "Selesai", finalStatus: "Ditolak" },
  ]

  return (
    <Card className="p-5">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg">Daftar Pendaftar</h3>
        <Button 
          variant="outline" 
          onClick={() => navigate(`/admin/programs/${programId}/announcement`)}
        >
          Kelola Pengumuman
        </Button>
      </div>
      
      <div className={`p-3 rounded-md border ${isAnnouncementPublished ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`}>
        <div className="flex items-center font-medium">
          {isAnnouncementPublished ? (
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <Clock className="h-4 w-4 mr-2 text-yellow-600" />
          )}
          <span>
            Status Pengumuman: 
            <span className={`font-bold ml-1 ${isAnnouncementPublished ? 'text-green-600' : 'text-yellow-600'}`}>
              {isAnnouncementPublished ? "SUDAH TERBIT" : "BELUM TERBIT"}
            </span>
          </span>
        </div>
      </div>
      {/* AKHIR BAGIAN BARU */}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Tanggal Daftar</TableHead>
            <TableHead>Status Tahapan</TableHead>
            <TableHead>Status Final</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {applicants.map((a, i) => (
            <TableRow
              key={a.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() =>
                navigate(`/admin/programs/${programId}/applicant/${a.id}`)
              }
            >
              <TableCell>{i + 1}</TableCell>
              <TableCell>{a.name}</TableCell>
              <TableCell>{a.email}</TableCell>
              <TableCell>{a.date}</TableCell>
              <TableCell>{a.status}</TableCell>
              <TableCell>
                <span className={`font-medium ${
                  a.finalStatus === "Diterima" ? "text-green-600" :
                  a.finalStatus === "Ditolak" ? "text-red-600" : "text-orange-600"
                }`}>
                  {a.finalStatus}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
