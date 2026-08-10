import {
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Save,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/ui/app-layout"
import { logger } from "@/lib/logger"

const API_BASE = import.meta.env.VITE_PUBLIC_API_URL ?? ""

interface DocumentType {
  id: string
  name: string
  requirement: string
  status: 'Sudah Upload' | 'Belum Upload' | 'Revisi'
  filename: string | null
  adminComment?: string
  file?: File | null
  url?: string
}

export default function UploadPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [documents, setDocuments] = useState<DocumentType[]>([
    { 
      id: 'foto', 
      name: 'Pas Foto Terbaru (4x6 berwarna)', 
      status: 'Belum Upload', 
      filename: null,
      requirement: 'Max 500KB, format JPG/PNG, latar belakang merah/biru.',
    },
    { 
      id: 'raport', 
      name: 'Scan Nilai Rapor (Semester 1 s/d 5)', 
      status: 'Belum Upload', 
      filename: null,
      requirement: 'Max 2MB, format PDF, semua halaman tergabung dalam 1 file.',
    },
    { 
      id: 'kk', 
      name: 'Scan Kartu Keluarga (KK)', 
      status: 'Belum Upload', 
      filename: null,
      requirement: 'Max 1MB, format PDF.',
    },
    { 
      id: 'ijazah', 
      name: 'Scan Ijazah/Surat Keterangan Lulus (SKL)', 
      status: 'Belum Upload', 
      filename: null,
      requirement: 'Max 1MB, format PDF.',
    },
  ])

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const token = localStorage.getItem("token")

  const getAuthHeaders = (): HeadersInit => {
    return token ? { "Authorization": `Bearer ${token}` } : {}
  }

  // Load existing documents from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionRes = await fetch(`${API_BASE}/api/auth/get-session`, {
          credentials: "include",
          headers: getAuthHeaders(),
        })
        if (!sessionRes.ok) {
          window.location.href = "/login"
          return
        }

        // Fetch admission data type 3 (documents)
        const res = await fetch(`${API_BASE}/admissiondata/3`, {
          credentials: "include",
          headers: getAuthHeaders(),
        })

        if (res.ok) {
          const json = await res.json()
          const data = json.data || {}
          
          // Update document statuses based on backend data
          setDocuments(prev => prev.map(doc => {
            let status: 'Sudah Upload' | 'Belum Upload' | 'Revisi' = 'Belum Upload'
            let filename: string | null = null
            let url: string | undefined = undefined
            
            // Map document IDs to backend field names
            const fieldMap: { [key: string]: string } = {
              'foto': 'photo',
              'raport': 'raport', 
              'kk': 'kk',
              'ijazah': 'ijazah',
            }
            
            const fieldName = fieldMap[doc.id]
            if (fieldName) {
              const fileField = `${fieldName}_file`
              const urlField = `${fieldName}_url`
              
              if (data[fileField] || data[urlField]) {
                status = 'Sudah Upload'
                filename = data[fileField] || data[urlField]?.split('/').pop() || null
                url = data[urlField]
              }
            }
            
            return { ...doc, status, filename, url }
          }))
        }
      } catch (err) {
        logger.error("Failed to load documents:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleFileSelect = (docId: string) => {
    fileInputRefs.current[docId]?.click()
  }

  const handleFileChange = async (docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const doc = documents.find(d => d.id === docId)
    if (!doc) return

    const maxSizes: { [key: string]: number } = {
      'foto': 500 * 1024, // 500KB
      'raport': 2 * 1024 * 1024, // 2MB
      'kk': 1 * 1024 * 1024, // 1MB
      'ijazah': 1 * 1024 * 1024, // 1MB
    }

    const allowedTypes: { [key: string]: string[] } = {
      'foto': ['image/jpeg', 'image/png', 'image/jpg'],
      'raport': ['application/pdf'],
      'kk': ['application/pdf'],
      'ijazah': ['application/pdf'],
    }

    if (maxSizes[docId] && file.size > maxSizes[docId]) {
      alert(`File terlalu besar! Maksimal ${maxSizes[docId] / 1024}KB`)
      return
    }

    if (allowedTypes[docId] && !allowedTypes[docId].includes(file.type)) {
      alert(`Format file tidak sesuai! Harus: ${allowedTypes[docId].join(', ')}`)
      return
    }

    // Upload file
    setUploading(docId)
    try {
      const formData = new FormData()
      
      // Map document IDs to backend field names
      const fieldMap: { [key: string]: string } = {
        'foto': 'photo_file',
        'raport': 'raport_file',
        'kk': 'kk_file',
        'ijazah': 'ijazah_file',
      }
      
      formData.append(fieldMap[docId], file)

      const res = await fetch(`${API_BASE}/admissiondata/3`, {
        method: "PUT",
        credentials: "include",
        headers: getAuthHeaders(),
        body: formData,
      })

      if (res.ok) {
        // Update local state
        setDocuments(prev => prev.map(d => 
          d.id === docId 
            ? { ...d, status: 'Sudah Upload', filename: file.name, file }
            : d
        ))
        alert(`✓ ${doc.name} berhasil diunggah!`)
      } else {
        const errorText = await res.text()
        alert(`✗ Gagal mengunggah file.\n${errorText.substring(0, 100)}`)
      }
    } catch (err) {
      logger.error("Upload error:", err)
      alert("✗ Kesalahan server saat mengunggah file")
    } finally {
      setUploading(null)
      // Clear the input so the same file can be selected again
      if (fileInputRefs.current[docId]) {
        fileInputRefs.current[docId]!.value = ''
      }
    }
  }

  const handleContinue = () => {
    const allUploaded = documents.every(doc => doc.status === 'Sudah Upload')
    if (!allUploaded) {
      alert("Mohon unggah semua dokumen terlebih dahulu!")
      return
    }
    navigate("/data-diri")
  }

  const canContinue = documents.every(doc => doc.status === 'Sudah Upload')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Sudah Upload':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'Revisi':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-orange-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const classes: { [key: string]: string } = {
      'Sudah Upload': 'bg-green-100 text-green-700 border-green-200',
      'Belum Upload': 'bg-orange-100 text-orange-700 border-orange-200',
      'Revisi': 'bg-red-100 text-red-700 border-red-200',
    }
    return classes[status] || classes['Belum Upload']
  }

  if (loading) {
    return (
      <AppLayout
        menuTemplate="admisi"
        title="Sarjana Reguler 2025"
        subtitle="Upload Dokumen Pendaftaran"
        backTo="/pendaftaran/sarjana-2025"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      menuTemplate="admisi"
      title="Sarjana Reguler 2025"
      subtitle="Upload Dokumen Pendaftaran"
      backTo="/pendaftaran/sarjana-2025"
    >
      <main className="space-y-4">
        <Card className="shadow-sm border rounded-lg">
          <CardHeader className="pb-2 border-b border-gray-200">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary"/> Upload Dokumen Pendaftaran
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Unggah semua dokumen yang diperlukan untuk proses seleksi.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {documents.map((doc) => {
              const isRevision = doc.status === 'Revisi'
              const isUploading = uploading === doc.id

              return (
                <div 
                  key={doc.id}
                  className={`p-4 border rounded-lg transition ${isRevision ? 'border-red-400 bg-red-50/50' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.status)}
                        <h3 className={`font-semibold text-lg ${isRevision ? 'text-red-800' : 'text-gray-800'}`}>
                          {doc.name}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground italic">{doc.requirement}</p>
                      
                      {doc.filename && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">File:</span> {doc.filename}
                        </p>
                      )}
                      
                      {isRevision && doc.adminComment && (
                        <div className="mt-2 bg-red-100 border-l-4 border-red-500 p-3 rounded">
                          <p className="text-sm text-red-800 font-medium">Catatan Admin:</p>
                          <p className="text-sm text-red-700 mt-1">{doc.adminComment}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${getStatusBadge(doc.status)} border`}>
                        {doc.status}
                      </Badge>
                      
                      <input
                        ref={(el) => fileInputRefs.current[doc.id] = el}
                        type="file"
                        accept={doc.id === 'foto' ? 'image/jpeg,image/png,image/jpg' : 'application/pdf'}
                        onChange={(e) => handleFileChange(doc.id, e)}
                        className="hidden"
                      />
                      
                      <Button 
                        variant={isRevision ? "destructive" : "default"} 
                        size="sm"
                        onClick={() => handleFileSelect(doc.id)}
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4 mr-2" /> 
                        {isUploading 
                          ? 'Mengunggah...' 
                          : doc.status === 'Sudah Upload' ? 'Ganti File' : 'Unggah File'}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="shadow-sm border rounded-lg">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleContinue}
                className="w-full md:w-auto"
                disabled={!canContinue}
              >
                <Save className="h-4 w-4 mr-2" /> 
                {canContinue ? 'Lanjut ke Penguncian Data' : 'Unggah Semua Dokumen Dulu'}
              </Button>
              {!canContinue && (
                <p className="text-xs text-red-600 mt-2">
                  Mohon selesaikan unggah dan pastikan status semua dokumen bukan 'Belum Upload' atau 'Revisi' sebelum melanjutkan.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  )
}
