"use client"

import {
  LogOut,
  Home,
  GraduationCap,
  Lock,
  Camera,
  Save,
  Edit,
  Upload,
} from "lucide-react"
import { useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Link } from "react-router-dom"
import React from "react"

export default function DataDiriPage() {
  const [isEditPribadi, setIsEditPribadi] = useState(false)
  const [isEditKontak, setIsEditKontak] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(URL.createObjectURL(e.target.files[0]))
    }
  }
  
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }
  
  const handleSavePribadi = () => {
      console.log("Saving Data Pribadi...")
      setIsEditPribadi(false)
  }
  
  const handleSaveKontak = () => {
      console.log("Saving Data Kontak...")
      setIsEditKontak(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (DIPERTAHANKAN SESUAI ASLI) */}
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
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary font-medium text-white"

            >
              <Home className="h-4 w-4" /> Data Diri
            </Link>
            <Link
              to="/pendaftaran"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10"
            >
              <GraduationCap className="h-4 w-4" /> Pendaftaran
            </Link>  
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
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-white">
          <h1 className="font-serif font-bold text-lg">Data Diri</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profilePic || "/avatar.png"} alt="User" />
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
          
          {/* FOTO PROFIL */}
          <Card className="shadow-sm border rounded-lg">
            <CardHeader className="border-b border-gray-200"> 
              <h1 className="text-xl font-bold">Foto Profil</h1>
            </CardHeader>
            <CardContent className="flex items-center gap-6 "> 
              <div className="relative">
                <Avatar className="h-28 w-28 border-2 border-primary shadow-lg">
                  <AvatarImage src={profilePic || "/avatar.png"} alt="Profile" />
                  <AvatarFallback className="text-xl font-bold">SU</AvatarFallback>
                </Avatar>
                <Button
                    variant="default"
                    size="icon"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary/90 hover:bg-primary"
                    onClick={triggerFileInput}
                    aria-label="Ubah foto profil"
                >
                    <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileChange}
                className="hidden"
              />
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Sumbuludun</p>
                <p className="text-xs text-muted-foreground">JPG atau PNG, Maks. 2MB</p>
                <Button variant="outline" size="sm" onClick={triggerFileInput} className="mt-2">
                    <Upload className="h-4 w-4 mr-2" /> Unggah Foto Baru
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* TABS DATA */}
          <Card className="shadow-sm border rounded-lg">
            <CardHeader className="border-b border-gray-200">
              <h1 className="text-xl font-bold">Periksa & Edit Data Anda</h1>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pribadi" className="w-full">
                <TabsList className="mb-6 flex flex-wrap h-auto p-1 bg-muted/50 border border-dashed rounded-lg">
                  <TabsTrigger value="pribadi" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">Data Pribadi</TabsTrigger>
                  <TabsTrigger value="kontak" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">Data Kontak</TabsTrigger>
                  <TabsTrigger value="dokumen" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">Data Dokumen</TabsTrigger>
                  <TabsTrigger value="password" className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">Ganti Password</TabsTrigger>
                </TabsList>

                {/* Data Pribadi */}
                <TabsContent value="pribadi" className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-dashed">
                    <h3 className="font-semibold text-lg">Detail Pribadi</h3>
                    <Button
                      variant={isEditPribadi ? "default" : "secondary"}
                      onClick={isEditPribadi ? handleSavePribadi : () => setIsEditPribadi(true)}
                    >
                      {isEditPribadi ? <><Save className="h-4 w-4 mr-2" /> Simpan Perubahan</> : <><Edit className="h-4 w-4 mr-2" /> Ubah Data</>}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="nik">NIK</Label>
                        <Input id="nik" value="3404100701990002" disabled={!isEditPribadi} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nama">Nama Lengkap</Label>
                        <Input id="nama" value="Sumbuludun" disabled={!isEditPribadi} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="jk">Jenis Kelamin</Label>
                        <Input id="jk" value="Laki-laki" disabled={!isEditPribadi} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ttl">Tempat, Tanggal Lahir</Label>
                        <Input id="ttl" value="Yogyakarta, 1 Juli 2002" disabled={!isEditPribadi} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ibu">Nama Ibu Kandung</Label>
                        <Input id="ibu" value="Siti Aminah" disabled={!isEditPribadi} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="warga">Kewarganegaraan</Label>
                        <Input id="warga" value="Indonesia" disabled={!isEditPribadi} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="negara">Asal Negara</Label>
                        <Input id="negara" value="Indonesia" disabled={!isEditPribadi} />
                    </div>
                  </div>
                </TabsContent>

                {/* Data Kontak */}
                <TabsContent value="kontak" className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-dashed">
                    <h3 className="font-semibold text-lg">Detail Kontak</h3>
                    <Button
                      variant={isEditKontak ? "default" : "secondary"}
                      onClick={isEditKontak ? handleSaveKontak : () => setIsEditKontak(true)}
                    >
                      {isEditKontak ? <><Save className="h-4 w-4 mr-2" /> Simpan Perubahan</> : <><Edit className="h-4 w-4 mr-2" /> Ubah Data</>}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value="arslan3000@gmail.com" disabled={!isEditKontak} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hp">No. HP</Label>
                        <Input id="hp" value="6288216166693" disabled={!isEditKontak} />
                    </div>
                  </div>
                </TabsContent>

                {/* Data Dokumen */}
                <TabsContent value="dokumen" className="space-y-6">
                  <h3 className="font-semibold text-lg pb-2 border-b border-dashed">Unggah Dokumen</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="kk">Kartu Keluarga (KK)</Label>
                        <Input id="kk" type="file" className="cursor-pointer" />
                        <p className="text-xs text-muted-foreground">Status: Belum Diunggah</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ktp">Kartu Tanda Penduduk (KTP)</Label>
                        <Input id="ktp" type="file" className="cursor-pointer" />
                        <p className="text-xs text-muted-foreground">Status: Sudah Diunggah</p>
                    </div>
                  </div>
                </TabsContent>

                {/* Ganti Password */}
                <TabsContent value="password" className="space-y-6">
                  <h3 className="font-semibold text-lg pb-2 border-b border-dashed">Keamanan Akun</h3>

                  <div className="grid gap-3 max-w-lg">
                    <div className="space-y-2">
                        <Label htmlFor="old-pass">Password Lama</Label>
                        <Input id="old-pass" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-pass">Password Baru</Label>
                        <Input id="new-pass" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-pass">Ulangi Password Baru</Label>
                        <Input id="confirm-pass" type="password" />
                    </div>
                    <Button className="mt-4 max-w-[200px]">Update Password</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* PERMANENT DATA */}
          <Card className="shadow-sm border border-red-300 bg-red-50/50 rounded-lg">
            <CardHeader className="pb-2 border-b border-red-300"> 
              <h1 className="text-xl font-bold text-red-700">Penguncian Data Permanen</h1>
            </CardHeader>
            <CardContent className="mt-3">
              <div className="flex items-start gap-3 mb-4">
                <Checkbox id="agree" className="mt-1 border-red-500 data-[state=checked]:bg-red-500" />
                <label htmlFor="agree" className="text-sm leading-relaxed text-red-800">
                  Saya menyatakan bahwa seluruh data yang saya isikan adalah benar, sah, dan legal.{" "}
                  <strong>Saya tidak akan mengubah data setelah akun ini dikunci permanen.</strong>
                </label>
              </div>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
                <Lock className="h-4 w-4" /> Kunci Data Permanen
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}