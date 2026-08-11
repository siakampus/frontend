"use client"

import {
  GraduationCap,
  Save,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/ui/app-layout"
import { admissionDataApi } from "@/lib/api"

const API_BASE = import.meta.env.VITE_PUBLIC_API_URL ?? ""

interface Faculty {
  id: number
  name: string
  departments: Department[]
}

interface Department {
  id: number
  name: string
  facultyId: number
  majors: Major[]
}

interface Major {
  id: number
  name: string
  departmentId: number
}

export default function PemilihanProgramStudiPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [isLocked, setIsLocked] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  
  // Pilihan 1
  const [faculty1, setFaculty1] = useState("")
  const [department1, setDepartment1] = useState("")
  const [major1, setMajor1] = useState("")
  
  // Pilihan 2
  const [faculty2, setFaculty2] = useState("")
  const [department2, setDepartment2] = useState("")
  const [major2, setMajor2] = useState("")

  // Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch faculties with nested departments and majors
        const token = localStorage.getItem("token")
        const res = await fetch(`${API_BASE}/jurusan/public/faculties`, {
          headers: token ? {
            Authorization: `Bearer ${token}`,
          } : {},
          credentials: "include",
        })
        
        if (res.ok) {
          const data = await res.json()
          setFaculties(data.data || data || [])
        }

        // Fetch existing choices from section 2
        const existingData = await admissionDataApi.getByType("2")
        if (existingData.success && existingData.data) {
          const d = existingData.data
          if (d.programChoice1Faculty) setFaculty1(d.programChoice1Faculty)
          if (d.programChoice1Major) setMajor1(d.programChoice1Major)
          if (d.programChoice2Faculty) setFaculty2(d.programChoice2Faculty)
          if (d.programChoice2Major) setMajor2(d.programChoice2Major)
        }

        // Check lock status
        const lockRes = await fetch(`${API_BASE}/admissiondata/locked`, {
          headers: token ? {
            Authorization: `Bearer ${token}`,
          } : {},
          credentials: "include",
        })
        if (lockRes.ok) {
          const lockData = await lockRes.json()
          setIsLocked(
            lockData?.data === true || 
            lockData?.isLocked === true ||
            lockData?.data?.isLocked === true
          )
        }
      } catch (err) {
        console.error("Failed to load program studi data:", err)
      }
    }
    fetchData()
  }, [])

  const handleUnlock = async () => {
    setUnlocking(true)
    try {
      await admissionDataApi.unlock()
      setIsLocked(false)
      alert("Data berhasil di-unlock. Anda sekarang bisa mengedit pilihan program studi.")
    } catch (err) {
      console.error("Failed to unlock:", err)
      alert("Gagal unlock data. Coba lagi.")
    } finally {
      setUnlocking(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLocked) {
      alert("Data masih ter-lock. Klik tombol 'Unlock untuk Edit' terlebih dahulu.")
      return
    }
    
    if (!faculty1 || !major1) {
      alert("Pilihan 1 (Fakultas dan Program Studi) wajib diisi!")
      return
    }

    setLoading(true)
    try {
      // Save to section 2
      const payload = {
        programChoice1Faculty: faculty1,
        programChoice1Major: major1,
        programChoice2Faculty: faculty2 || null,
        programChoice2Major: major2 || null,
      }

      await admissionDataApi.updateByType("2", payload)
      
      alert("Pemilihan Program Studi berhasil disimpan!")
      // Force refresh admission dashboard to re-check filled status
      window.location.href = "/pendaftaran/sarjana-2025"
    } catch (err) {
      console.error("Failed to save:", err)
      const errorMsg = (err as any)?.message || "Gagal menyimpan"
      if (errorMsg.includes("403") || errorMsg.includes("Forbidden") || errorMsg.includes("locked")) {
        alert("Data ter-lock. Klik 'Unlock untuk Edit' untuk melanjutkan.")
      } else {
        alert("Gagal menyimpan. Coba lagi.")
      }
    } finally {
      setLoading(false)
    }
  }

  const getDepartmentsByFaculty = (facultyName: string) => {
    const faculty = faculties.find((f) => f.name === facultyName)
    return faculty?.departments || []
  }

  const getMajorsByDepartment = (facultyName: string, departmentName: string) => {
    const faculty = faculties.find((f) => f.name === facultyName)
    const department = faculty?.departments.find((d) => d.name === departmentName)
    return department?.majors || []
  }

  const renderPilihanForm = (
    pilihan: number,
    facultyValue: string,
    setFacultyValue: (v: string) => void,
    departmentValue: string,
    setDepartmentValue: (v: string) => void,
    majorValue: string,
    setMajorValue: (v: string) => void,
  ) => {
    const departments = getDepartmentsByFaculty(facultyValue)
    const majors = getMajorsByDepartment(facultyValue, departmentValue)

    return (
      <div className="space-y-4 p-6 border border-primary/30 rounded-lg bg-primary/5">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          <GraduationCap className="h-5 w-5" /> Pilihan {pilihan}
        </h3>
        <p className="text-sm text-muted-foreground">
          Pilih Fakultas, Departemen, dan Program Studi yang Anda minati. Pastikan urutan pilihan sudah sesuai prioritas Anda.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Fakultas */}
          <div className="space-y-2">
            <Label htmlFor={`fakultas-${pilihan}`}>Fakultas</Label>
            <Select
              value={facultyValue}
              onValueChange={(v) => {
                setFacultyValue(v)
                setDepartmentValue("")
                setMajorValue("")
              }}
              required={pilihan === 1}
            >
              <SelectTrigger id={`fakultas-${pilihan}`}>
                <SelectValue placeholder={`Pilih Fakultas`} />
              </SelectTrigger>
              <SelectContent>
                {faculties.map((f) => (
                  <SelectItem key={f.id} value={f.name}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Departemen */}
          <div className="space-y-2">
            <Label htmlFor={`dept-${pilihan}`}>Departemen</Label>
            <Select
              value={departmentValue}
              onValueChange={(v) => {
                setDepartmentValue(v)
                setMajorValue("")
              }}
              disabled={!facultyValue || departments.length === 0}
              required={pilihan === 1}
            >
              <SelectTrigger id={`dept-${pilihan}`}>
                <SelectValue placeholder={`Pilih Departemen`} />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Program Studi */}
          <div className="space-y-2">
            <Label htmlFor={`prodi-${pilihan}`}>Program Studi</Label>
            <Select
              value={majorValue}
              onValueChange={setMajorValue}
              disabled={!departmentValue || majors.length === 0}
              required={pilihan === 1}
            >
              <SelectTrigger id={`prodi-${pilihan}`}>
                <SelectValue placeholder={`Pilih Program Studi`} />
              </SelectTrigger>
              <SelectContent>
                {majors.map((m) => (
                  <SelectItem key={m.id} value={m.name}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AppLayout
      menuTemplate="admisi"
      title="Sarjana Reguler 2025"
      subtitle="Pemilihan Program Studi"
      backTo="/pendaftaran/sarjana-2025"
    >
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <form onSubmit={handleSubmit}>
          <Card className="shadow-sm border rounded-lg max-w-4xl gap-2 mx-auto">
            <CardHeader className="pb-2 border-b border-gray-200">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Pemilihan Program Studi
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Pilih dua (2) Program Studi Sarjana yang Anda minati. Pilihan pertama adalah prioritas utama.
              </p>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              {/* Lock Warning */}
              {isLocked && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-900">Data Ter-lock</h4>
                      <p className="text-sm text-yellow-800 mt-1">
                        Data pendaftaran Anda saat ini ter-lock dan tidak dapat diedit. 
                        Klik tombol di bawah untuk membuka kembali (unlock) data agar bisa melakukan perubahan.
                      </p>
                      <Button
                        type="button"
                        onClick={handleUnlock}
                        disabled={unlocking}
                        className="mt-3 bg-yellow-600 hover:bg-yellow-700"
                        size="sm"
                      >
                        {unlocking ? "Membuka..." : "Unlock untuk Edit"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Render Pilihan 1 */}
              {renderPilihanForm(
                1,
                faculty1,
                setFaculty1,
                department1,
                setDepartment1,
                major1,
                setMajor1,
              )}

              {/* Render Pilihan 2 */}
              {renderPilihanForm(
                2,
                faculty2,
                setFaculty2,
                department2,
                setDepartment2,
                major2,
                setMajor2,
              )}

              <div className="pt-4 border-t">
                <Button type="submit" className="w-full md:w-auto" disabled={loading || isLocked}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Menyimpan..." : "Simpan & Lanjut ke Langkah Berikutnya"}
                </Button>
                {isLocked && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Unlock data terlebih dahulu untuk dapat menyimpan perubahan.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </AppLayout>
  )
}
