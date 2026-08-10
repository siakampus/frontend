import {
  Save,
  FileText,
  User, 
  BookOpen, 
  Info, 
  AlertCircle,
  Home as HomeIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/ui/app-layout"
import { logger } from "@/lib/logger"

const API_BASE = import.meta.env.VITE_PUBLIC_API_URL ?? ""

export default function DataDiriPendaftaranPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    // Identitas
    namaLengkap: "",
    nik: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    agama: "",
    
    // Alamat
    alamatLengkap: "",
    provinsi: "",
    kota: "",
    kodePos: "",
    
    // Kontak
    noTelepon: "",
    email: "",
    
    // Pendidikan
    asalSekolah: "",
    jurusan: "",
    tahunLulus: "",
    nilaiUN: "",
    
    // Orang Tua
    namaAyah: "",
    pekerjaanAyah: "",
    namaIbu: "",
    pekerjaanIbu: "",
    penghasilanOrtu: "",
    noTeleponOrtu: "",
    
    // Info Tambahan
    golonganDarah: "",
    tinggiBadan: "",
    beratBadan: "",
    disabilitas: "none",
  })

  const token = localStorage.getItem("token")
  const getAuthHeaders = (): HeadersInit => {
    return token ? { "Authorization": `Bearer ${token}` } : {}
  }

  // Load existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check session
        const sessionRes = await fetch(`${API_BASE}/api/auth/get-session`, {
          credentials: "include",
          headers: getAuthHeaders(),
        })
        if (!sessionRes.ok) {
          window.location.href = "/login"
          return
        }

        // Fetch admission data types 1 and 2
        const [res1, res2] = await Promise.all([
          fetch(`${API_BASE}/admissiondata/1`, {
            credentials: "include",
            headers: getAuthHeaders(),
          }),
          fetch(`${API_BASE}/admissiondata/2`, {
            credentials: "include",
            headers: getAuthHeaders(),
          }),
        ])

        if (res1.ok && res2.ok) {
          const data1 = await res1.json()
          const data2 = await res2.json()
          const d1 = data1.data || {}
          const d2 = data2.data || {}

          setFormData({
            namaLengkap: d1.fullName || "",
            nik: d1.nik || "",
            tempatLahir: d1.birthPlace || "",
            tanggalLahir: d1.dateOfBirth ? d1.dateOfBirth.split("T")[0] : "",
            jenisKelamin: d1.gender || "",
            agama: d1.religion || "",
            
            alamatLengkap: d2.address || "",
            provinsi: d2.province || "",
            kota: d2.city || "",
            kodePos: d2.postalCode || "",
            
            noTelepon: d2.phoneNumber || "",
            email: d2.email || "",
            
            asalSekolah: d1.schoolOrigin || "",
            jurusan: d1.major || "",
            tahunLulus: d1.graduationYear || "",
            nilaiUN: d1.nationalExamScore || "",
            
            namaAyah: d1.fatherName || "",
            pekerjaanAyah: d1.fatherOccupation || "",
            namaIbu: d1.motherName || "",
            pekerjaanIbu: d1.motherOccupation || "",
            penghasilanOrtu: d1.parentIncome || "",
            noTeleponOrtu: d1.parentPhoneNumber || "",
            
            golonganDarah: d1.bloodType || "",
            tinggiBadan: d1.height || "",
            beratBadan: d1.weight || "",
            disabilitas: d1.disability || "none",
          })
        }
      } catch (err) {
        logger.error("Failed to load data:", err)
      }
    }
    fetchData()
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Prepare data for type 1 (personal + education + family)
      let dob = formData.tanggalLahir
      if (dob && !dob.includes("T")) {
        dob = `${dob}T00:00:00.000Z`
      }

      const data1 = {
        fullName: formData.namaLengkap,
        nik: formData.nik,
        birthPlace: formData.tempatLahir,
        dateOfBirth: dob,
        gender: formData.jenisKelamin,
        religion: formData.agama,
        schoolOrigin: formData.asalSekolah,
        major: formData.jurusan,
        graduationYear: formData.tahunLulus,
        nationalExamScore: formData.nilaiUN,
        fatherName: formData.namaAyah,
        fatherOccupation: formData.pekerjaanAyah,
        motherName: formData.namaIbu,
        motherOccupation: formData.pekerjaanIbu,
        parentIncome: formData.penghasilanOrtu,
        parentPhoneNumber: formData.noTeleponOrtu,
        bloodType: formData.golonganDarah,
        height: formData.tinggiBadan,
        weight: formData.beratBadan,
        disability: formData.disabilitas,
      }

      // Prepare data for type 2 (contact + address)
      const data2 = {
        email: formData.email,
        phoneNumber: formData.noTelepon,
        address: formData.alamatLengkap,
        province: formData.provinsi,
        city: formData.kota,
        postalCode: formData.kodePos,
      }

      // Remove empty values
      const cleanData1 = Object.fromEntries(
        Object.entries(data1).filter(([, v]) => v !== null && v !== undefined && v !== "")
      )
      const cleanData2 = Object.fromEntries(
        Object.entries(data2).filter(([, v]) => v !== null && v !== undefined && v !== "")
      )

      // Send both requests
      const [res1, res2] = await Promise.all([
        fetch(`${API_BASE}/admissiondata/1`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(cleanData1),
        }),
        fetch(`${API_BASE}/admissiondata/2`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(cleanData2),
        }),
      ])

      if (res1.ok && res2.ok) {
        alert("✓ Data Diri berhasil disimpan!")
        navigate("/pendaftaran/sarjana-2025")
      } else {
        const err1 = res1.ok ? null : await res1.text()
        const err2 = res2.ok ? null : await res2.text()
        const errorMsg = err1 || err2 || "Gagal menyimpan data"
        setError(errorMsg)
        alert(`✗ Gagal menyimpan data.\n${errorMsg.substring(0, 100)}`)
      }
    } catch (err) {
      logger.error("Save error:", err)
      setError("Kesalahan server saat menyimpan data")
      alert("✗ Kesalahan server saat menyimpan data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout
        menuTemplate="admisi"
        title="Sarjana Reguler 2025"
        subtitle="Pengisian Data Diri"
        backTo="/pendaftaran/sarjana-2025"
    >
      <form onSubmit={handleSubmit}>
        <Card className="shadow-sm border rounded-lg max-w-4xl gap-2 mx-auto">
            <CardHeader className="pb-2 border-b border-gray-200">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary"/> Pengisian Data Diri
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Lengkapi identitas, alamat, riwayat pendidikan, dan informasi tambahan Anda untuk proses seleksi.
                </p>
            </CardHeader>
            <CardContent className="space-y-8 p-6">

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {/* Identitas */}
                <div className="space-y-4 border-b pb-4">
                    <h2 className="text-lg font-semibold border-l-4 border-primary pl-3 flex items-center gap-2">
                        <User className="h-5 w-5"/> Identitas Diri
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="namaLengkap">Nama Lengkap <span className="text-red-500">*</span></Label>
                            <Input 
                              id="namaLengkap" 
                              placeholder="Contoh: Budi Santoso" 
                              required
                              value={formData.namaLengkap}
                              onChange={(e) => handleChange("namaLengkap", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nik">NIK <span className="text-red-500">*</span></Label>
                            <Input 
                              id="nik" 
                              placeholder="Contoh: 1234567890123456" 
                              required
                              value={formData.nik}
                              onChange={(e) => handleChange("nik", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tempatLahir">Tempat Lahir <span className="text-red-500">*</span></Label>
                            <Input 
                              id="tempatLahir" 
                              placeholder="Contoh: Jakarta" 
                              required
                              value={formData.tempatLahir}
                              onChange={(e) => handleChange("tempatLahir", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tanggalLahir">Tanggal Lahir <span className="text-red-500">*</span></Label>
                            <Input 
                              id="tanggalLahir" 
                              type="date" 
                              required
                              value={formData.tanggalLahir}
                              onChange={(e) => handleChange("tanggalLahir", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="jenisKelamin">Jenis Kelamin <span className="text-red-500">*</span></Label>
                            <Select 
                              value={formData.jenisKelamin} 
                              onValueChange={(val) => handleChange("jenisKelamin", val)}
                              required
                            >
                                <SelectTrigger id="jenisKelamin">
                                    <SelectValue placeholder="Pilih jenis kelamin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="agama">Agama <span className="text-red-500">*</span></Label>
                            <Select 
                              value={formData.agama} 
                              onValueChange={(val) => handleChange("agama", val)}
                              required
                            >
                                <SelectTrigger id="agama">
                                    <SelectValue placeholder="Pilih agama" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Islam">Islam</SelectItem>
                                    <SelectItem value="Kristen">Kristen</SelectItem>
                                    <SelectItem value="Katolik">Katolik</SelectItem>
                                    <SelectItem value="Hindu">Hindu</SelectItem>
                                    <SelectItem value="Buddha">Buddha</SelectItem>
                                    <SelectItem value="Konghucu">Konghucu</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Alamat */}
                <div className="space-y-4 border-b pb-4">
                    <h2 className="text-lg font-semibold border-l-4 border-primary pl-3 flex items-center gap-2">
                        <HomeIcon className="h-5 w-5"/> Alamat
                    </h2>
                    <div className="space-y-2">
                        <Label htmlFor="alamatLengkap">Alamat Lengkap <span className="text-red-500">*</span></Label>
                        <Textarea 
                          id="alamatLengkap" 
                          placeholder="Jl. Sudirman No. 123, Kelurahan Cibitung, Kecamatan Bekasi Utara" 
                          rows={3} 
                          required
                          value={formData.alamatLengkap}
                          onChange={(e) => handleChange("alamatLengkap", e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="provinsi">Provinsi <span className="text-red-500">*</span></Label>
                            <Input 
                              id="provinsi" 
                              placeholder="Contoh: Jawa Barat" 
                              required
                              value={formData.provinsi}
                              onChange={(e) => handleChange("provinsi", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kota">Kota/Kabupaten <span className="text-red-500">*</span></Label>
                            <Input 
                              id="kota" 
                              placeholder="Contoh: Bekasi" 
                              required
                              value={formData.kota}
                              onChange={(e) => handleChange("kota", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kodePos">Kode Pos</Label>
                            <Input 
                              id="kodePos" 
                              placeholder="Contoh: 17510"
                              value={formData.kodePos}
                              onChange={(e) => handleChange("kodePos", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Kontak */}
                <div className="space-y-4 border-b pb-4">
                    <h2 className="text-lg font-semibold border-l-4 border-primary pl-3 flex items-center gap-2">
                        <Info className="h-5 w-5"/> Kontak
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="noTelepon">No. Telepon / HP <span className="text-red-500">*</span></Label>
                            <Input 
                              id="noTelepon" 
                              placeholder="Contoh: 081234567890" 
                              required
                              value={formData.noTelepon}
                              onChange={(e) => handleChange("noTelepon", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                            <Input 
                              id="email" 
                              type="email" 
                              placeholder="Contoh: budi@example.com" 
                              required
                              value={formData.email}
                              onChange={(e) => handleChange("email", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Pendidikan */}
                <div className="space-y-4 border-b pb-4">
                    <h2 className="text-lg font-semibold border-l-4 border-primary pl-3 flex items-center gap-2">
                        <BookOpen className="h-5 w-5"/> Riwayat Pendidikan
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="asalSekolah">Asal Sekolah / SMA <span className="text-red-500">*</span></Label>
                            <Input 
                              id="asalSekolah" 
                              placeholder="Contoh: SMA Negeri 1 Jakarta" 
                              required
                              value={formData.asalSekolah}
                              onChange={(e) => handleChange("asalSekolah", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="jurusan">Jurusan (SMA) <span className="text-red-500">*</span></Label>
                            <Select 
                              value={formData.jurusan} 
                              onValueChange={(val) => handleChange("jurusan", val)}
                              required
                            >
                                <SelectTrigger id="jurusan">
                                    <SelectValue placeholder="Pilih jurusan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="IPA">IPA</SelectItem>
                                    <SelectItem value="IPS">IPS</SelectItem>
                                    <SelectItem value="Bahasa">Bahasa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tahunLulus">Tahun Lulus <span className="text-red-500">*</span></Label>
                            <Input 
                              id="tahunLulus" 
                              placeholder="Contoh: 2024" 
                              required
                              value={formData.tahunLulus}
                              onChange={(e) => handleChange("tahunLulus", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nilaiUN">Nilai Ujian Nasional / Rata-rata</Label>
                            <Input 
                              id="nilaiUN" 
                              placeholder="Contoh: 85.5"
                              value={formData.nilaiUN}
                              onChange={(e) => handleChange("nilaiUN", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Orang Tua */}
                <div className="space-y-4 border-b pb-4">
                    <h2 className="text-lg font-semibold border-l-4 border-primary pl-3">
                        Data Orang Tua / Wali
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="namaAyah">Nama Ayah <span className="text-red-500">*</span></Label>
                            <Input 
                              id="namaAyah" 
                              placeholder="Nama lengkap ayah" 
                              required
                              value={formData.namaAyah}
                              onChange={(e) => handleChange("namaAyah", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pekerjaanAyah">Pekerjaan Ayah <span className="text-red-500">*</span></Label>
                            <Input 
                              id="pekerjaanAyah" 
                              placeholder="Contoh: PNS" 
                              required
                              value={formData.pekerjaanAyah}
                              onChange={(e) => handleChange("pekerjaanAyah", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="namaIbu">Nama Ibu <span className="text-red-500">*</span></Label>
                            <Input 
                              id="namaIbu" 
                              placeholder="Nama lengkap ibu" 
                              required
                              value={formData.namaIbu}
                              onChange={(e) => handleChange("namaIbu", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pekerjaanIbu">Pekerjaan Ibu <span className="text-red-500">*</span></Label>
                            <Input 
                              id="pekerjaanIbu" 
                              placeholder="Contoh: Ibu Rumah Tangga" 
                              required
                              value={formData.pekerjaanIbu}
                              onChange={(e) => handleChange("pekerjaanIbu", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="penghasilanOrtu">Penghasilan Orang Tua (per bulan)</Label>
                            <Select 
                              value={formData.penghasilanOrtu} 
                              onValueChange={(val) => handleChange("penghasilanOrtu", val)}
                            >
                                <SelectTrigger id="penghasilanOrtu">
                                    <SelectValue placeholder="Pilih rentang penghasilan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="< 2 juta">{"< 2 juta"}</SelectItem>
                                    <SelectItem value="2-5 juta">2 - 5 juta</SelectItem>
                                    <SelectItem value="5-10 juta">5 - 10 juta</SelectItem>
                                    <SelectItem value="> 10 juta">{"> 10 juta"}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="noTeleponOrtu">No. Telepon Orang Tua</Label>
                            <Input 
                              id="noTeleponOrtu" 
                              placeholder="Contoh: 081234567890"
                              value={formData.noTeleponOrtu}
                              onChange={(e) => handleChange("noTeleponOrtu", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Info Tambahan */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-l-4 border-primary pl-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5"/> Informasi Tambahan
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="golonganDarah">Golongan Darah</Label>
                            <Select 
                              value={formData.golonganDarah} 
                              onValueChange={(val) => handleChange("golonganDarah", val)}
                            >
                                <SelectTrigger id="golonganDarah">
                                    <SelectValue placeholder="Pilih golongan darah" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A">A</SelectItem>
                                    <SelectItem value="B">B</SelectItem>
                                    <SelectItem value="AB">AB</SelectItem>
                                    <SelectItem value="O">O</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tinggiBadan">Tinggi Badan (cm)</Label>
                            <Input 
                              id="tinggiBadan" 
                              placeholder="Contoh: 170"
                              value={formData.tinggiBadan}
                              onChange={(e) => handleChange("tinggiBadan", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="beratBadan">Berat Badan (kg)</Label>
                            <Input 
                              id="beratBadan" 
                              placeholder="Contoh: 60"
                              value={formData.beratBadan}
                              onChange={(e) => handleChange("beratBadan", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="disabilitas">Disabilitas (jika ada)</Label>
                        <Select 
                          value={formData.disabilitas} 
                          onValueChange={(val) => handleChange("disabilitas", val)}
                        >
                            <SelectTrigger id="disabilitas">
                                <SelectValue placeholder="Pilih disabilitas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Tidak Ada</SelectItem>
                                <SelectItem value="tuna-rungu">Tuna Rungu</SelectItem>
                                <SelectItem value="tuna-daksa">Tuna Daksa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="pt-4 border-t">
                    <Button type="submit" className="w-full md:w-auto" disabled={loading}>
                        <Save className="h-4 w-4 mr-2" /> 
                        {loading ? "Menyimpan..." : "Simpan & Lanjut ke Langkah Berikutnya"}
                    </Button>
                </div>
            </CardContent>
        </Card>
      </form>
    </AppLayout>
  )
}
