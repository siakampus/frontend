import {
  Save,
  FileText,
  User, 
  BookOpen, 
  Info, 
  AlertCircle,
  Home as HomeIcon, // Ganti nama import agar tidak konflik dengan Home di komponen lain jika perlu
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
import React from "react"
// --- PATH IMPORT APP LAYOUT YANG BENAR ---
import { AppLayout } from "@/components/ui/app-layout" 
// Link dari 'react-router-dom' tidak lagi diperlukan di sini karena sudah dihandle oleh AppHeader

export default function DataDiriPendaftaranPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Data Diri berhasil disimpan! Kembali ke proses pendaftaran.")
    // Di lingkungan nyata, navigasi akan dilakukan di sini setelah POST/PUT API sukses.
    // navigate("/pendaftaran/sarjana-2025") 
  }

  return (
    // Menggunakan AppLayout untuk menyediakan Sidebar dan Header
    <AppLayout
        menuTemplate="admisi" // Menggunakan menu untuk admisi
        title="Sarjana Reguler 2025" // Judul utama di Header
        subtitle="Pengisian Data Diri" // Subtitle di Header
        backTo="/pendaftaran/sarjana-2025" // Rute kembali ke detail pendaftaran
    >
      {/* Konten Halaman (children) */}
      <form onSubmit={handleSubmit}>
        {/* Card dibatasi lebarnya dan diposisikan di tengah */}
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

                {/* Identitas */}
                <div className="space-y-4 border-b pb-4">
                    <h2 className="text-lg font-semibold border-l-4 border-primary pl-3 flex items-center gap-2">
                        <User className="h-5 w-5"/> Identitas
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="no-id">Nomor Kartu Identitas Berfoto</Label>
                            <Input id="no-id" placeholder="Cth: 340410XXXXXXXXXXXX" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tgl-berlaku">Tanggal Mulai Berlaku Kartu Identitas Berfoto</Label>
                            <Input id="tgl-berlaku" type="date" required />
                        </div>
                    </div>
                </div>

                {/* Personal */}
                <div className="space-y-4 border-b pb-4">
                    <h2 className="text-lg font-semibold border-l-4 border-primary pl-3 flex items-center gap-2">
                        <HomeIcon className="h-5 w-5"/> Personal (Alamat Asal)
                    </h2>
                    <div className="space-y-2">
                        <Label htmlFor="alamat-asal">Alamat Tempat Tinggal Asal (bukan alamat kos/kontrakan)</Label>
                        <Textarea id="alamat-asal" placeholder="Masukkan alamat lengkap" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="provinsi-asal">Provinsi Tempat Tinggal Asal</Label>
                            <Select required>
                                <SelectTrigger id="provinsi-asal"><SelectValue placeholder="Pilih Provinsi" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="diy">DI Yogyakarta</SelectItem>
                                    <SelectItem value="jateng">Jawa Tengah</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kabupaten-asal">Kabupaten Tempat Tinggal Asal</Label>
                            <Select required>
                                <SelectTrigger id="kabupaten-asal"><SelectValue placeholder="Pilih Kabupaten" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sle">Sleman</SelectItem>
                                    <SelectItem value="jog">Kota Yogyakarta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kode-pos">Kode Pos</Label>
                            <Input id="kode-pos" placeholder="Cth: 55281" required />
                        </div>
                    </div>
                </div>
                
                {/* Pendidikan SMA/SMK/MA */}
                <div className="space-y-4 border-b pb-4">
                    <h2 className="text-lg font-semibold border-l-4 border-primary pl-3 flex items-center gap-2">
                        <BookOpen className="h-5 w-5"/> Pendidikan SMA/SMK/MA
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="provinsi-sma">Provinsi SMA/SMK/MA</Label>
                            <Select required>
                                <SelectTrigger id="provinsi-sma"><SelectValue placeholder="Pilih Provinsi" /></SelectTrigger>
                                <SelectContent><SelectItem value="diy">DI Yogyakarta</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kabupaten-sma">Kabupaten SMA/SMK/MA</Label>
                            <Select required>
                                <SelectTrigger id="kabupaten-sma"><SelectValue placeholder="Pilih Kabupaten" /></SelectTrigger>
                                <SelectContent><SelectItem value="sle">Sleman</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nama-sma">Nama SMA/SMK/MA</Label>
                            <Select required>
                                <SelectTrigger id="nama-sma"><SelectValue placeholder="Cari Nama Sekolah" /></SelectTrigger>
                                <SelectContent><SelectItem value="sma1">SMA N 1 YK</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="nama-sma-lain">Nama SMA/SMK/MA Lain (jika ada)</Label>
                            <Input id="nama-sma-lain" placeholder="Kosongkan jika tidak ada" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="jurusan-sma">Jurusan SMA/SMK/MA</Label>
                            <Select required>
                                <SelectTrigger id="jurusan-sma"><SelectValue placeholder="Pilih Jurusan" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ipa">IPA</SelectItem>
                                    <SelectItem value="ips">IPS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                            <Label htmlFor="masa-belajar">Masa Belajar Sekolah Menengah</Label>
                            <Select required>
                                <SelectTrigger id="masa-belajar"><SelectValue placeholder="Pilih Masa" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="3">3 Tahun</SelectItem>
                                    <SelectItem value="4">4 Tahun</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="jenis-kelas">Jenis Kelas</Label>
                            <Select required>
                                <SelectTrigger id="jenis-kelas"><SelectValue placeholder="Pilih Jenis" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="regular">Regular</SelectItem>
                                    <SelectItem value="akselerasi">Akselerasi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tahun-masuk">Tahun Masuk SMA/SMK/MA</Label>
                            <Input id="tahun-masuk" placeholder="Cth: 2022" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tahun-lulus">Tahun Lulus SMA/SMK/MA</Label>
                            <Input id="tahun-lulus" placeholder="Cth: 2025" required />
                        </div>
                    </div>
                </div>

                {/* Informasi Tambahan */}
                <div className="space-y-4 border-b pb-4">
                    <h2 className="text-lg font-semibold border-l-4 border-primary pl-3 flex items-center gap-2">
                        <Info className="h-5 w-5"/> Informasi Tambahan
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="no-utbk">Nomor Peserta UTBK-SBMPTN 2022</Label>
                            <Input id="no-utbk" placeholder="Isi dengan 0 jika tidak ada" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nisn">Nomor Induk Siswa Nasional (NISN) sesuai Kartu Peserta UTBK-SBMPTN 2022</Label>
                            <Input id="nisn" placeholder="Isi dengan 0 jika tidak ada" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="npsn">Nomor Pokok Sekolah Nasional (NPSN) sesuai Kartu Peserta UTBK-SBMPTN 2022</Label>
                            <Input id="npsn" placeholder="Isi dengan 0 jika tidak ada" required />
                        </div>
                    </div>
                </div>
                
                {/* Identifikasi Kebutuhan Khusus */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-l-4 border-primary pl-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5"/> Identifikasi Kebutuhan Khusus (Difabel)
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-base">Apakah Saudara Berkebutuhan Khusus (Difabel)?</Label>
                            <RadioGroup defaultValue="no" className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id="difabel-yes" />
                                    <Label htmlFor="difabel-yes">Ya</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="difabel-no" />
                                    <Label htmlFor="difabel-no">Tidak</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="disabilitas">Sebutkan Disabilitasnya (Jika bukan penyandang disabilitas → pilih “Tidak Ada”)</Label>
                            <Select required>
                                <SelectTrigger id="disabilitas"><SelectValue placeholder="Pilih Jenis Disabilitas" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Tidak Ada</SelectItem>
                                    <SelectItem value="tuna-rungu">Tuna Rungu</SelectItem>
                                    <SelectItem value="tuna-daksa">Tuna Daksa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                
                <div className="pt-4 border-t">
                    <Button type="submit" className="w-full md:w-auto">
                        <Save className="h-4 w-4 mr-2" /> Simpan & Lanjut ke Langkah Berikutnya
                    </Button>
                </div>
            </CardContent>
        </Card>
      </form>
      {/* Akhir Konten Halaman */}
    </AppLayout>
  )
}
