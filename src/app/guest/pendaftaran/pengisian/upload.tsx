import {
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import React from "react"
// --- PATH IMPORT APP LAYOUT YANG BENAR ---
import { AppLayout } from "@/components/ui/app-layout"

// Data dokumen yang wajib diunggah
const documents = [
    { 
        id: 'foto', 
        name: 'Pas Foto Terbaru (4x6 berwarna)', 
        status: 'Sudah Upload', 
        filename: 'foto_sumbuludun.jpg',
        requirement: 'Max 500KB, format JPG/PNG, latar belakang merah/biru.',
        icon: CheckCircle, 
        badgeClass: 'bg-green-100 text-green-700 border-green-200'
    },
    { 
        id: 'raport', 
        name: 'Scan Nilai Rapor (Semester 1 s/d 5)', 
        status: 'Belum Upload', 
        filename: null,
        requirement: 'Max 2MB, format PDF, semua halaman tergabung dalam 1 file.',
        icon: Clock, 
        badgeClass: 'bg-orange-100 text-orange-700 border-orange-200'
    },
    { 
        id: 'kk', 
        name: 'Scan Kartu Keluarga (KK)', 
        status: 'Revisi', 
        filename: 'kk_sumbuludun.pdf',
        requirement: 'Max 1MB, format PDF.',
        adminComment: 'Scan KK buram dan tidak terbaca. Mohon unggah ulang dengan kualitas yang jelas.',
        icon: AlertCircle, 
        badgeClass: 'bg-red-100 text-red-700 border-red-200'
    },
    { 
        id: 'ijazah', 
        name: 'Scan Ijazah/Surat Keterangan Lulus (SKL)', 
        status: 'Belum Upload', 
        filename: null,
        requirement: 'Max 1MB, format PDF.',
        icon: Clock, 
        badgeClass: 'bg-orange-100 text-orange-700 border-orange-200'
    },
]

// Komponen untuk baris dokumen
const DocumentRow: React.FC<{ doc: typeof documents[0] }> = ({ doc }) => {
    const Icon = doc.icon;
    const isRevision = doc.status === 'Revisi';

    return (
        <div className={`p-4 border rounded-lg transition ${isRevision ? 'border-red-400 bg-red-50/50' : 'bg-white'}`}>
            <div className="flex justify-between items-start">
                <div className="flex-1 space-y-1">
                    <h3 className={`font-semibold text-lg flex items-center gap-2 ${isRevision ? 'text-red-800' : 'text-gray-800'}`}>
                        {doc.name}
                    </h3>
                    <p className="text-xs text-muted-foreground italic">{doc.requirement}</p>
                    <Badge className={`flex items-center gap-1 mt-1 ${doc.badgeClass}`}>
                        <Icon className="h-3 w-3" />
                        {doc.status}
                    </Badge>
                </div>
                
                <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                    <Button variant={isRevision ? "destructive" : "default"} size="sm">
                        <Upload className="h-4 w-4 mr-2" /> {doc.status === 'Sudah Upload' ? 'Ganti File' : 'Unggah File'}
                    </Button>
                    
                    {doc.filename && (
                        <p className="text-xs text-muted-foreground">
                            File: <span className="font-medium text-primary">{doc.filename}</span>
                        </p>
                    )}
                </div>
            </div>
            
            {isRevision && doc.adminComment && (
                <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-sm">
                    <p className="font-semibold text-red-800">Catatan Revisi:</p>
                    <p className="text-red-700">{doc.adminComment}</p>
                </div>
            )}
        </div>
    )
}


export default function UploadDokumenPendaftaranPage() {
  
    const documentsUploaded = documents.filter(d => d.status === 'Sudah Upload' || d.status === 'Revisi').length;
    const totalDocuments = documents.length;
    const canContinue = documents.every(d => d.status === 'Sudah Upload');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (canContinue) {
            // Mengganti alert dengan console.log/custom modal
            console.log("Semua dokumen telah diunggah! Melanjutkan ke Penguncian Data.");
        } else {
            console.log("Harap unggah semua dokumen yang diperlukan sebelum melanjutkan.");
        }
    }

    return (
        // Menggunakan AppLayout untuk menyediakan Sidebar dan Header
        <AppLayout
            menuTemplate="admisi" // Menggunakan menu untuk admisi
            title="Sarjana Reguler 2025" // Judul utama di Header
            subtitle="Upload Dokumen" // Subtitle di Header
            backTo="/pendaftaran/sarjana-2025" // Rute kembali ke detail pendaftaran
        >
            {/* Content Halaman (children) */}
            <main className="flex-1 overflow-y-auto p-6 space-y-6">
              <form onSubmit={handleSubmit}>
                <Card className="shadow-sm border rounded-lg max-w-4xl gap-2 mx-auto">
                    <CardHeader className="pb-2 border-b border-gray-200">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Upload className="h-5 w-5 text-primary"/> Unggah Dokumen
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Unggah semua dokumen pendukung yang wajib sesuai dengan jalur seleksi yang Anda pilih.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-primary">Status Unggahan</h2>
                            <p className="font-bold text-xl text-primary">{documentsUploaded} / {totalDocuments} Dokumen</p>
                        </div>
                        
                        {/* Daftar Dokumen */}
                        <div className="space-y-4">
                            {documents.map(doc => (
                                <DocumentRow key={doc.id} doc={doc} />
                            ))}
                        </div>
                        
                        <div className="pt-4 border-t">
                            <Button 
                                type="submit" 
                                className="w-full md:w-auto"
                                disabled={!canContinue} // Nonaktifkan jika belum semua 'Sudah Upload'
                            >
                                <Save className="h-4 w-4 mr-2" /> {canContinue ? 'Lanjut ke Penguncian Data' : 'Unggah Semua Dokumen Dulu'}
                            </Button>
                            {!canContinue && (
                                <p className="text-xs text-red-600 mt-2">
                                    Mohon selesaikan unggah dan pastikan status semua dokumen bukan 'Belum Upload' atau 'Revisi' sebelum melanjutkan.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
              </form>
            </main>
            {/* Akhir Konten Halaman */}
        </AppLayout>
      )
    }