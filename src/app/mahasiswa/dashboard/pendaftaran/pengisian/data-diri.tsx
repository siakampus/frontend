import {
  LogOut,
  Home,
  GraduationCap,
  ChevronLeft,
  Save,
  FileText,
  User, 
  BookOpen, 
  Info, 
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Link } from "react-router-dom"

export default function DataDiriPendaftaranPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mengganti alert dengan notifikasi atau modal kustom di lingkungan produksi
    alert("Data Diri berhasil disimpan! Kembali ke proses pendaftaran.")
    // Logic to save data and redirect to /pendaftaran
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
<aside className="w-64 bg-gray-100 border-r flex flex-col sticky top-0 h-screen overflow-y-auto">        
        <div className="h-16 flex items-center justify-start p-6 gap-2 font-bold text-black">
          <img src="/favicon.png" alt="UGN" className="h-6 w-6 object-contain rounded-sm" />
          <span>Ujian Masuk UGN</span>
        </div>
        <hr />
        <nav className="flex-1 px-4 py-6 text-sm">
          <div className="space-y-1">
            <Link
              to="/data-diri"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10"
            >
              <Home className="h-4 w-4" /> Data Diri
            </Link>
            <Link
              to="/pendaftaran"
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary font-medium text-white"
            >
              <GraduationCap className="h-4 w-4" /> Pendaftaran
            </Link>

            <hr className="my-4"/>

            <button
                onClick={() => {
                const confirmLogout = window.confirm("Apakah Anda yakin ingin logout?")
                if (confirmLogout) {
                    localStorage.removeItem("auth_token") // contoh hapus token
                    window.location.href = "/login" // redirect manual
                }
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10 cursor-pointer "
            >
                <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Navbar */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-white">
          <div className="flex items-center gap-3">
             <Link 
                // Link kembali ke halaman detail pendaftaran (stepper)
                to="/pendaftaran/sarjana-2025" 
                className="text-muted-foreground hover:text-primary transition">
                <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Pengisian Data Diri</p>
              <h1 className="font-serif font-bold text-lg">Sarjana Reguler 2025</h1>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback>SU</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Sumbuludun</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6 space-y-6">
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
                            <Home className="h-5 w-5"/> Personal (Alamat Asal)
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
        </main>
      </div>
    </div>
  )
}