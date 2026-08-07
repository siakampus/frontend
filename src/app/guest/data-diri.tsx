"use client";

import {
  Lock,
  Camera,
  Save,
  Edit,
  User, // <-- ICON USER DIGUNAKAN DI AVATAR FALLBACK
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// Import AppLayout yang sudah kita buat
import { AppLayout } from "@/components/ui/app-layout";

import { logger } from "@/lib/logger"
const API_BASE = import.meta.env.VITE_PUBLIC_API_URL ?? "";
export default function DataDiriPage() {
  const [isEditPribadi, setIsEditPribadi] = useState(false);
  const [isEditKontak, setIsEditKontak] = useState(false);
  const [isEditDokumen, setIsEditDokumen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agree, setAgree] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const defaultPribadi = {
    "Nama Lengkap": "",
    "NIK": "",
    "Tempat Lahir": "",
    "Tanggal Lahir": "",
    "Jenis Kelamin": "",
    "Agama": "",
  };

  const defaultKontak = {
    "Email": "",
    "No. Telepon": "",
    "Alamat Lengkap": "",
    "Provinsi": "",
    "Kota/Kabupaten": "",
  };

  const [pribadi, setPribadi] = useState<Record<string, any>>(defaultPribadi);
  const [kontak, setKontak] = useState<Record<string, any>>(defaultKontak);
  const [dokumen, setDokumen] = useState<Record<string, any>>({}); // includes File objects + URL strings from API

  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = "";
  const token = localStorage.getItem("token");

  const getAuthHeaders = (): HeadersInit => {
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  // Map backend camelCase  UI display keys
  const mapApiToPribadi = (d: Record<string, any>, user: any) => ({
    "Nama Lengkap": d.fullName || user?.name || "",
    "NIK": d.nik || "",
    "Tempat Lahir": d.birthPlace || "",
    "Tanggal Lahir": d.dateOfBirth ? d.dateOfBirth.split("T")[0] : "",
    "Jenis Kelamin": d.gender || "",
    "Agama": d.religion || "",
  });

  const mapApiToKontak = (d: Record<string, any>, user: any) => ({
    "Email": d.email || user?.email || "",
    "No. Telepon": d.phoneNumber || "",
    "Alamat Lengkap": d.address || "",
    "Provinsi": d.province || "",
    "Kota/Kabupaten": d.city || "",
  });

  // Map UI display keys  backend field names for PUT
  const mapPribadiToApi = (p: Record<string, any>) => {
    let dob = p["Tanggal Lahir"];
    if (dob && !dob.includes("T")) {
      dob = `${dob}T00:00:00.000Z`;
    }
    return {
      fullName: p["Nama Lengkap"],
      nik: p["NIK"],
      birthPlace: p["Tempat Lahir"],
      dateOfBirth: dob,
      gender: p["Jenis Kelamin"],
      religion: p["Agama"],
    };
  };

  const mapKontakToApi = (k: Record<string, any>) => ({
    email: k["Email"],
    phoneNumber: k["No. Telepon"],
    address: k["Alamat Lengkap"],
    province: k["Provinsi"],
    city: k["Kota/Kabupaten"],
  });

  useEffect(() => {
    // Check BetterAuth session via cookie (no localStorage token needed)
    const checkSessionAndFetch = async () => {
      let userSession = null;
      try {
        const sessionRes = await fetch(`${API_BASE}/api/auth/get-session`, {
          credentials: "include",
          headers: getAuthHeaders(),
        });
        if (!sessionRes.ok || sessionRes.status === 401) {
          window.location.href = "/login";
          return;
        }
        const session = await sessionRes.json();
        if (!session?.user) {
          window.location.href = "/login";
          return;
        }
        userSession = session.user;
      } catch {
        window.location.href = "/login";
        return;
      }

      const fetchLockStatus = async () => {
        try {
          const res = await fetch(`${API_URL}/admissiondata/locked`, {
            credentials: "include",
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            const json = await res.json();
            logger.log("Lock Status Response:", json);
            // More aggressive check for locked status
            const isLocked = typeof json === "boolean" ? json : Boolean(
              json === true ||
              json.isLocked === true ||
              json.isPersonalDataLocked === true ||
              json.locked === true ||
              json.data?.isLocked === true ||
              json.data?.isPersonalDataLocked === true ||
              json.data?.locked === true ||
              json.status === "LOCKED" ||
              json.data === true
            );
            setLocked(isLocked);
            localStorage.setItem("data_locked", String(isLocked));
            if (isLocked) {
              setIsEditPribadi(false);
              setIsEditKontak(false);
              setIsEditDokumen(false);
            }
          } else {
            logger.error("Gagal mengambil status lock data.");
          }
        } catch (err) {
          logger.error("Kesalahan saat mengambil status lock:", err);
        }
      };

      const fetchAllData = async (user: any) => {
        try {
          setLoading(true);
          await fetchLockStatus();

          // Fetch type 1 (Pribadi)
          const res1 = await fetch(`${API_URL}/admissiondata/1`, {
            credentials: "include",
            headers: getAuthHeaders(),
          });
          if (res1.ok) {
            const json = await res1.json();
            logger.log("✅ Data Pribadi (API /admissiondata/1) diterima:", json);
            const d = json.data || {};
            setPribadi(mapApiToPribadi(d, user));
          } else {
            logger.warn("⚠️ Gagal mengambil Data Pribadi dari API (mungkin belum diisi)");
            setPribadi(mapApiToPribadi({}, user));
          }

          // Fetch type 2 (Kontak)
          const res2 = await fetch(`${API_URL}/admissiondata/2`, {
            credentials: "include",
            headers: getAuthHeaders(),
          });
          if (res2.ok) {
            const json = await res2.json();
            const d = json.data || {};
            setKontak(mapApiToKontak(d, user));
          } else {
            setKontak(mapApiToKontak({}, user));
          }

          // Fetch type 3 (Dokumen)
          const res3 = await fetch(`${API_URL}/admissiondata/3`, {
            credentials: "include",
            headers: getAuthHeaders(),
          });
          if (res3.ok) {
            const json = await res3.json();
            const raw = json.data || {};
            // Normalize common API field name variants  kk_file / ktp_file
            if (!raw.kk_file) {
              raw.kk_file =
                raw.kkFile || raw.kkFileUrl || raw.kk_url ||
                raw.kkUrl || raw.kartuKeluarga || "";
            }
            if (!raw.ktp_file) {
              raw.ktp_file =
                raw.ktpFile || raw.ktpFileUrl || raw.ktp_url ||
                raw.ktpUrl || raw.kartaTandaPenduduk || "";
            }
            setDokumen(raw);
          }
        } catch (err) {
          logger.error("Gagal mengambil data:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchAllData(userSession);
    };

    checkSessionAndFetch();
  }, [API_URL]);

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
    if (locked) return alert("Data sudah dikunci permanen dan tidak dapat diubah.");

    try {
      setSaving(true);

      // Map UI labels  backend field names
      let apiData: Record<string, any> = data;
      if (type === 1) apiData = mapPribadiToApi(data);
      if (type === 2) apiData = mapKontakToApi(data);

      let res: Response;

      if (type === 3) {
        // Type 3 has file uploads  use FormData
        const formData = new FormData();
        Object.entries(apiData).forEach(([k, v]) => {
          if (v instanceof File) {
            formData.append(k, v);
          } else if (v !== null && v !== undefined && v !== "") {
            formData.append(k, String(v));
          }
        });
        res = await fetch(`${API_URL}/admissiondata/${type}`, {
          method: "PUT",
          credentials: "include",
          headers: getAuthHeaders(),
          body: formData,
        });
      } else {
        // Types 1 & 2 are plain data  send JSON
        // Remove empty values
        const cleanData = Object.fromEntries(
          Object.entries(apiData).filter(([, v]) => v !== null && v !== undefined && v !== "")
        );
        res = await fetch(`${API_URL}/admissiondata/${type}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(cleanData),
        });
      }

      if (res.ok) {
        alert(" Data berhasil disimpan!");
        onSuccess();
        if (type === 3) {
          const resData = await fetch(`${API_URL}/admissiondata/${type}`, {
            credentials: "include",
            headers: getAuthHeaders(),
          });
          if (resData.ok) {
            const json = await resData.json();
            const raw = json.data || {};
            // Normalize common API field name variants  kk_file / ktp_file
            const normalized: Record<string, any> = { ...raw };
            if (!normalized.kk_file) {
              normalized.kk_file =
                raw.kkFile || raw.kkFileUrl || raw.kk_url ||
                raw.kkUrl || raw.kartuKeluarga || "";
            }
            if (!normalized.ktp_file) {
              normalized.ktp_file =
                raw.ktpFile || raw.ktpFileUrl || raw.ktp_url ||
                raw.ktpUrl || raw.kartaTandaPenduduk || "";
            }
            // Merge with current state: keep File objects if API didn't return a URL
            setDokumen((prev) => ({
              ...normalized,
              kk_file: normalized.kk_file || prev.kk_file,
              ktp_file: normalized.ktp_file || prev.ktp_file,
            }));
          } else {
            // Re-fetch failed — preserve current state so status stays correct
            setDokumen((prev) => ({ ...prev }));
          }
        }
      } else {
        const errorText = await res.text();
        logger.error("Backend Error:", errorText);

        // Handle case where backend locks the data but frontend missed it
        if (errorText.toLowerCase().includes("personal data is locked")) {
          alert("Data Anda telah dikunci secara permanen dan tidak dapat diubah lagi.");
          setLocked(true);
          setIsEditPribadi(false);
          setIsEditKontak(false);
          setIsEditDokumen(false);
        } else {
          alert(` Gagal menyimpan data.\nError: ${errorText.substring(0, 100)}`);
        }
      }
    } catch (err) {
      logger.error(err);
      alert(" Kesalahan server saat menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  const handleLockData = async () => {
    if (!agree) {
      alert("Harap centang pernyataan sebelum mengunci data.");
      return;
    }

    // Validate personal + contact data completeness
    const isPribadiLengkap = Object.values(pribadi).every((v) => v !== "" && v !== null && v !== undefined);
    const isKontakLengkap = Object.values(kontak).every((v) => v !== "" && v !== null && v !== undefined);

    // Dokumen: accept either a File object (newly selected) or a truthy string (URL from API meaning already uploaded)
    const kkOk = (dokumen.kk_file instanceof File) || (typeof dokumen.kk_file === "string" && dokumen.kk_file !== "")
      || (dokumen.kk_url && dokumen.kk_url !== "");
    const ktpOk = (dokumen.ktp_file instanceof File) || (typeof dokumen.ktp_file === "string" && dokumen.ktp_file !== "")
      || (dokumen.ktp_url && dokumen.ktp_url !== "");
    const isDokumenLengkap = kkOk && ktpOk;

    const missingParts: string[] = [];
    if (!isPribadiLengkap) {
      missingParts.push("Data Pribadi");
      logger.log("Debug - Data Pribadi belum lengkap:", pribadi);
    }
    if (!isKontakLengkap) {
      missingParts.push("Data Kontak");
      logger.log("Debug - Data Kontak belum lengkap:", kontak);
    }
    if (!isDokumenLengkap) {
      missingParts.push("Dokumen (KK & KTP)");
      logger.log("Debug - Data Dokumen belum lengkap:", dokumen);
    }

    if (missingParts.length > 0) {
      alert(`Data belum lengkap! Harap lengkapi: ${missingParts.join(", ")} sebelum mengunci data.`);
      return;
    }

    if (!confirm("Setelah dikunci, data tidak bisa diubah. Yakin?")) return;

    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/admissiondata/lock`, {
        method: "PUT",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        alert("Data berhasil dikunci permanen!");
        setLocked(true);
        localStorage.setItem("data_locked", "true");
        setIsEditPribadi(false);
        setIsEditKontak(false);
        setIsEditDokumen(false);
      } else {
        let errMsg = "Gagal mengunci data.";
        try {
          const errBody = await res.json();
          errMsg = errBody.message || errBody.error || JSON.stringify(errBody);
        } catch { }
        alert(` ${errMsg}`);
      }
    } catch (err) {
      logger.error(err);
      alert(" Server error saat mengunci data.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      menuTemplate="admisi" // <-- Menggunakan template menu untuk admisi
      title="Data Diri" // <-- Judul untuk AppHeader
      subtitle="Kelola informasi pribadi, kontak, dan dokumen pendaftaran Anda" // <-- Subtitle untuk AppHeader
    >
      {/* FOTO PROFIL */}
      <Card className="shadow-sm border rounded-lg">
        <CardHeader>
          <h1 className="text-xl font-bold">Foto Profil</h1>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-28 w-28 border-2 border-primary shadow-lg">
              <AvatarImage src={profilePic || "/avatar.png"} />
              {/* FALLBACK DENGAN IKON USER */}
              <AvatarFallback>
                <User className="h-10 w-10 text-muted-foreground" />
              </AvatarFallback>
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
                    disabled={saving}
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
                {locked && <Badge className="bg-orange-600 text-white">Data Terkunci</Badge>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(pribadi).map(([k, v]) => (
                  <div key={k} className="space-y-2">
                    <Label>{k}</Label>
                    <Input
                      type={k === "Tanggal Lahir" ? "date" : "text"}
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
                    disabled={saving}
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
                {locked && <Badge className="bg-orange-600 text-white">Data Terkunci</Badge>}
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
                    disabled={saving}
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
                {locked && <Badge className="bg-orange-600 text-white">Data Terkunci</Badge>}
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
                    Status:{" "}
                    {(dokumen.kk_file instanceof File) ||
                      (typeof dokumen.kk_file === "string" && dokumen.kk_file !== "") ||
                      (dokumen.kk_url && dokumen.kk_url !== "")
                      ? <span className="text-green-600 font-medium">Sudah diunggah</span>
                      : <span className="text-red-500">Belum diunggah</span>}
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
                    Status:{" "}
                    {(dokumen.ktp_file instanceof File) ||
                      (typeof dokumen.ktp_file === "string" && dokumen.ktp_file !== "") ||
                      (dokumen.ktp_url && dokumen.ktp_url !== "")
                      ? <span className="text-green-600 font-medium">Sudah diunggah</span>
                      : <span className="text-red-500">Belum diunggah</span>}
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
                <Button className="mt-4 max-w-[200px]" disabled={locked}>Update Password</Button>
              </div>
              {locked && <p className="text-sm text-green-700 font-medium">Anda tidak dapat mengubah password setelah data dikunci.</p>}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* === LOCK DATA CARD (Conditional Content) === */}
      <Card
        className={`shadow-sm border rounded-lg ${locked ? 'border-orange-300 bg-orange-50/50' : 'border-red-300 bg-red-50/50'}`}
      >
        <CardHeader className={`pb-2 border-b ${locked ? 'border-orange-300' : 'border-red-300'}`}>
          <h1 className={`text-xl font-bold ${locked ? 'text-orange-700' : 'text-red-700'}`}>
            Penguncian Data Permanen
          </h1>
        </CardHeader>
        <CardContent className="mt-3">
          {locked ? (
            // STATE LOCKED
            <div className="flex items-center gap-3 text-orange-800 font-medium">
              <Lock className="h-5 w-5 flex-shrink-0" />
              <p>
                <strong>Data Anda sudah terkunci permanen.</strong> Anda tidak dapat lagi mengubah data diri, kontak, dan dokumen.
              </p>
            </div>
          ) : (
            // STATE UNLOCKED
            <>
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
                disabled={saving || !agree}
                className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />{" "}
                Kunci Data Permanen
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
