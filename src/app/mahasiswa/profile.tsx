"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Phone, 
  Mail, 
  Shield, 
  Camera, 
  Save, 
  Edit,
  ArrowLeft,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: number;
  email: string;
  role: string;
  fullName: string | null;
  phoneNumber: string | null;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const getAuthHeaders = () => {
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/user/profile", {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Gagal mengambil data profil");
      }
      
      const json = await res.json();
      if (json.success && json.data) {
        setProfile(json.data);
        setNewPhone(json.data.phoneNumber || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const handleUpdatePhone = async () => {
    if (!newPhone.trim()) {
      alert("Nomor telepon tidak boleh kosong");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch("/user/phone", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({ phoneNumber: newPhone }),
      });

      if (res.ok) {
        alert("Nomor telepon berhasil diperbarui!");
        setIsEditingPhone(false);
        fetchProfile();
      } else {
        const errorData = await res.json();
        alert(`Gagal memperbarui nomor telepon: ${errorData.message || 'Error backend'}`);
      }
    } catch (error) {
      console.error("Error updating phone:", error);
      alert("Terjadi kesalahan koneksi");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("profilePicture", file);

      try {
        setSaving(true);
        const res = await fetch("/user/profile-picture", {
          method: "POST",
          credentials: "include",
          headers: getAuthHeaders(),
          body: formData,
        });

        if (res.ok) {
          alert("Foto profil berhasil diunggah!");
          fetchProfile();
        } else {
          alert("Gagal mengunggah foto profil.");
        }
      } catch (error) {
        console.error("Error uploading picture:", error);
        alert("Kesalahan server.");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeletePicture = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus foto profil?")) return;

    try {
      setSaving(true);
      const res = await fetch("/user/profile-picture", {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        alert("Foto profil berhasil dihapus!");
        fetchProfile();
      } else {
        alert("Gagal menghapus foto profil.");
      }
    } catch (error) {
      console.error("Error deleting picture:", error);
      alert("Kesalahan server.");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-gray-50">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Memuat profil...</span>
        </div>
      </div>
    );
  }

  const profilePicUrl = profile?.profilePicture ? `/user/profile-picture` : null;

  return (
    <AppLayout
      menuTemplate="student"
      sidebarTitle="SIA Dashboard"
      title="Profil Saya"
      subtitle="Kelola data pribadi, nomor kontak, dan foto profil Anda"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/dashboard")} 
          className="flex items-center gap-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Kiri: Foto Profil */}
          <Card className="shadow-sm border rounded-lg md:col-span-1 bg-white">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg group-hover:opacity-90 transition">
                  {profilePicUrl ? (
                    <AvatarImage src={`${profilePicUrl}?t=${new Date().getTime()}`} alt="Profile" />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                    {profile ? getInitials(profile.email) : "ST"}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary-dark transition cursor-pointer"
                  disabled={saving}
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleUploadPicture}
                  className="hidden"
                />
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-gray-900">
                  {profile?.fullName || "Mahasiswa"}
                </h3>
                <p className="text-sm text-muted-foreground capitalize flex items-center justify-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-primary" /> {profile?.role}
                </p>
              </div>

              {profile?.profilePicture && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDeletePicture}
                  disabled={saving}
                  className="w-full text-xs"
                >
                  Hapus Foto Profil
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Card Kanan: Detail Data */}
          <Card className="shadow-sm border rounded-lg md:col-span-2 bg-white">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <CardTitle className="text-lg font-serif text-primary">Informasi Personal</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary/75" /> Email
                  </span>
                  <p className="text-sm font-medium text-gray-800">{profile?.email}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-primary/75" /> ID Mahasiswa
                  </span>
                  <p className="text-sm font-medium text-gray-800">{profile?.id}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary/75" /> Terdaftar Sejak
                  </span>
                  <p className="text-sm font-medium text-gray-800">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    }) : "-"}
                  </p>
                </div>
              </div>

              <hr className="border-dashed" />

              {/* Edit Phone Number Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-primary/75" /> Nomor Telepon
                  </span>
                  {!isEditingPhone && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditingPhone(true)}
                      className="h-7 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50/50"
                    >
                      <Edit className="h-3 w-3 mr-1" /> Ubah
                    </Button>
                  )}
                </div>

                {isEditingPhone ? (
                  <div className="flex gap-2 max-w-md">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Contoh: 081234567890"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        disabled={saving}
                        className="h-9"
                      />
                    </div>
                    <Button 
                      onClick={handleUpdatePhone}
                      disabled={saving}
                      size="sm"
                      className="h-9 flex items-center gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" /> Simpan
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditingPhone(false);
                        setNewPhone(profile?.phoneNumber || "");
                      }}
                      disabled={saving}
                      size="sm"
                      className="h-9"
                    >
                      Batal
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-gray-800">
                    {profile?.phoneNumber || <span className="text-muted-foreground italic text-xs">Belum diatur</span>}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
