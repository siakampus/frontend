"use client"

import { useState } from "react"
import { Upload, FileText, Trash2, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// 🧩 Sidebar Items (reuse dari semua halaman admin)
// removed unused adminSidebarItems

export default function AdminUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([
    "pendaftar-2025.xlsx",
    "data-calon-s2.csv",
  ])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Pilih file terlebih dahulu!")
      return
    }

    setUploadedFiles((prev) => [...prev, selectedFile.name])
    alert(`✅ File "${selectedFile.name}" berhasil diunggah (dummy mode)`)
    setSelectedFile(null)
  }

  const handleDelete = (name: string) => {
    if (confirm(`Hapus file ${name}?`)) {
      setUploadedFiles((prev) => prev.filter((f) => f !== name))
    }
  }

  return (
    <>
      <Card className="p-6 shadow-sm border rounded-lg space-y-6">
        {/* Upload area */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="border rounded-md px-3 py-2 text-sm w-full md:w-72"
            />
            <Button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" /> Upload
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => alert("🔄 Data di-refresh (dummy only).")}
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        {/* Uploaded files list */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3 text-sm text-gray-700">
            Daftar File Terunggah
          </h3>

          {uploadedFiles.length > 0 ? (
            <ul className="divide-y text-sm">
              {uploadedFiles.map((file) => (
                <li
                  key={file}
                  className="flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded-md transition"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>{file}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(file)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              Belum ada file yang diunggah.
            </p>
          )}
        </div>
      </Card>
    </>
  )
}
