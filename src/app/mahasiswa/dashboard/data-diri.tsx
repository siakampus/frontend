"use client";

import {
  LogOut,
  Home,
  GraduationCap,
  Lock,
  Camera,
  Save,
  Edit,
  Upload,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

export default function DataDiriPage() {
  const [isEditPribadi, setIsEditPribadi] = useState(false);
  const [isEditKontak, setIsEditKontak] = useState(false);
  const [isEditDokumen, setIsEditDokumen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agree, setAgree] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const [pribadi, setPribadi] = useState<Record<string, any>>({});
  const [kontak, setKontak] = useState<Record<string, any>>({});
  const [dokumen, setDokumen] = useState<{ kk_file?: File | null; ktp_file?: File | null }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchAll = async () => {
      try {
        setLoading(true);

        const endpoints = [
          { type: 1, setter: setPribadi },
          { type: 2, setter: setKontak },
          { type: 3, setter: setDokumen },
        ];

        for (const { type, setter } of endpoints) {
          const res = await fetch(`${API_URL}/personaldata/${type}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            setter(json.data || {});
            if (type === 1) {
              const isLocked = json.data?.locked || json.data?.is_locked || false;
              setLocked(isLocked);
              localStorage.setItem("data_locked", String(isLocked));
            }
          }
        }
      } catch (err) {
        console.error("❌ Gagal mengambil data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [API_URL, token]);

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(URL.createObjectURL(e.target.files[0]));
    }
  };

  const safeVal = (v: any) => (v === undefined || v === null ? "" : String(v));

  const handleSave = async (
    type: number,
    data: Record<string, any>,
    onSuccess: () => void
  ) => {
    try {
      setSaving(true);
      const formData = new FormData();

      // Append semua data
      Object.entries(data).forEach(([k, v]) => {
        if (v instanceof File) {
          formData.append(k, v);
        } else {
          formData.append(k, v || "");
        }
      });

      const res = await fetch(`${API_URL}/personaldata/${type}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        alert("✅ Data berhasil disimpan!");
        onSuccess();
      } else {
        alert("❌ Gagal menyimpan data.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Kesalahan server.");
    } finally {
      setSaving(false);
    }
  };

  const handleLockData = async () => {
    if (!agree) {
      alert("Harap centang pernyataan sebelum mengunci data.");
      return;
    }

    if (!confirm("Setelah dikunci, data tidak bisa diubah. Yakin?")) return;

    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/personaldata/lock`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("🔒 Data berhasil dikunci permanen!");
        setLocked(true);
        localStorage.setItem("data_locked", "true"); // ✅ cache sinkron
        setIsEditPribadi(false);
        setIsEditKontak(false);
        setIsEditDokumen(false);
      } else {
        alert("❌ Gagal mengunci data.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server error saat mengunci data.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        🔄 Memuat data...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
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
            <hr className="my-4" />
            <button
              onClick={() => {
                if (confirm("Yakin mau logout?")) {
                  localStorage.removeItem("token");
                  localStorage.removeItem("data_locked");
                  window.location.href = "/login";
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/10 rounded-md"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center justify-between px-6 bg-white">
          <h1 className="font-serif font-bold text-lg">Data Diri</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profilePic || "/avatar.png"} />
                  <AvatarFallback>SU</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Sumbuludun</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto bg-muted/30 p-6 space-y-6">
          {/* FOTO PROFIL */}
          <Card className="shadow-sm border rounded-lg">
            <CardHeader>
              <h1 className="text-xl font-bold">Foto Profil</h1>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-28 w-28 border-2 border-primary shadow-lg">
                  <AvatarImage src={profilePic || "/avatar.png"} />
                  <AvatarFallback>SU</AvatarFallback>
                </Avatar>
                {!locked && (
                  <Button
                    variant="default"
                    size="icon"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary/90 hover:bg-primary"
                    onClick={triggerFileInput}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileChange}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* === FORM DATA === */}
          <Card className="shadow-sm border rounded-lg">
            <CardHeader>
              <h1 className="text-xl font-bold">Periksa & Edit Data Anda</h1>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pribadi" className="w-full">
                <TabsList className="mb-6 flex flex-wrap gap-2 bg-muted/30 p-1 rounded-md">
                  <TabsTrigger value="pribadi">Pribadi</TabsTrigger>
                  <TabsTrigger value="kontak">Kontak</TabsTrigger>
                  <TabsTrigger value="dokumen">Dokumen</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>

                {/* === PRIBADI === */}
                <TabsContent value="pribadi" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Data Pribadi</h3>
                    {!locked && (
                      <Button
                        variant={isEditPribadi ? "default" : "secondary"}
                        onClick={() =>
                          isEditPribadi
                            ? handleSave(1, pribadi, () => setIsEditPribadi(false))
                            : setIsEditPribadi(true)
                        }
                      >
                        {isEditPribadi ? (
                          <>
                            <Save className="h-4 w-4 mr-2" /> Simpan
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-2" /> Ubah
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(pribadi).map(([k, v]) => (
                      <div key={k} className="space-y-2">
                        <Label>{k}</Label>
                        <Input
                          value={safeVal(v)}
                          disabled={!isEditPribadi || locked}
                          onChange={(e) =>
                            setPribadi({ ...pribadi, [k]: e.target.value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* === KONTAK === */}
                <TabsContent value="kontak" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Data Kontak</h3>
                    {!locked && (
                      <Button
                        variant={isEditKontak ? "default" : "secondary"}
                        onClick={() =>
                          isEditKontak
                            ? handleSave(2, kontak, () => setIsEditKontak(false))
                            : setIsEditKontak(true)
                        }
                      >
                        {isEditKontak ? (
                          <>
                            <Save className="h-4 w-4 mr-2" /> Simpan
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-2" /> Ubah
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(kontak).map(([k, v]) => (
                      <div key={k} className="space-y-2">
                        <Label>{k}</Label>
                        <Input
                          value={safeVal(v)}
                          disabled={!isEditKontak || locked}
                          onChange={(e) =>
                            setKontak({ ...kontak, [k]: e.target.value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* === DOKUMEN === */}
                <TabsContent value="dokumen" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Unggah Dokumen</h3>
                    {!locked && (
                      <Button
                        variant={isEditDokumen ? "default" : "secondary"}
                        onClick={() =>
                          isEditDokumen
                            ? handleSave(3, dokumen, () => setIsEditDokumen(false))
                            : setIsEditDokumen(true)
                        }
                      >
                        {isEditDokumen ? (
                          <>
                            <Save className="h-4 w-4 mr-2" /> Simpan
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-2" /> Ubah
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="kk">Kartu Keluarga (KK)</Label>
                      <Input
                        id="kk"
                        type="file"
                        disabled={!isEditDokumen || locked}
                        className="cursor-pointer"
                        onChange={(e) =>
                          setDokumen({
                            ...dokumen,
                            kk_file: e.target.files?.[0] || null,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Status: {dokumen.kk_file ? "Sudah diunggah" : "Belum diunggah"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ktp">Kartu Tanda Penduduk (KTP)</Label>
                      <Input
                        id="ktp"
                        type="file"
                        disabled={!isEditDokumen || locked}
                        className="cursor-pointer"
                        onChange={(e) =>
                          setDokumen({
                            ...dokumen,
                            ktp_file: e.target.files?.[0] || null,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Status: {dokumen.ktp_file ? "Sudah diunggah" : "Belum diunggah"}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* === PASSWORD === */}
                <TabsContent value="password" className="space-y-6">
                  <h3 className="font-semibold text-lg pb-2 border-b border-dashed">
                    Ganti Password
                  </h3>
                  <div className="grid gap-3 max-w-lg">
                    <div className="space-y-2">
                      <Label htmlFor="old">Password Lama</Label>
                      <Input id="old" type="password" disabled={locked} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new">Password Baru</Label>
                      <Input id="new" type="password" disabled={locked} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm">Konfirmasi Password Baru</Label>
                      <Input id="confirm" type="password" disabled={locked} />
                    </div>
                    <Button className="mt-4 max-w-[200px]">Update Password</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* === LOCK DATA === */}
          <Card className="shadow-sm border border-red-300 bg-red-50/50 rounded-lg">
            <CardHeader className="pb-2 border-b border-red-300">
              <h1 className="text-xl font-bold text-red-700">
                Penguncian Data Permanen
              </h1>
            </CardHeader>
            <CardContent className="mt-3">
              <div className="flex items-start gap-3 mb-4">
                <Checkbox
                  id="agree"
                  checked={agree}
                  onCheckedChange={(val) => setAgree(!!val)}
                  disabled={locked}
                  className="mt-1 border-red-500 data-[state=checked]:bg-red-500"
                />
                <label
                  htmlFor="agree"
                  className="text-sm leading-relaxed text-red-800"
                >
                  Saya menyatakan bahwa seluruh data yang saya isikan adalah
                  benar, sah, dan legal.{" "}
                  <strong>
                    Saya tidak akan mengubah data setelah akun ini dikunci
                    permanen.
                  </strong>
                </label>
              </div>
              <Button
                onClick={handleLockData}
                disabled={locked || saving}
                className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />{" "}
                {locked ? "Data Sudah Terkunci" : "Kunci Data Permanen"}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}