import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { krsApi } from "@/lib/api";
import { Calendar, CheckCircle, Plus, Trash2, Edit2, Loader2, Play } from "lucide-react";

export default function AdminAcademicTerms() {
  const [terms, setTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const fetchTerms = async () => {
    setLoading(true);
    try {
      const res = await krsApi.getAllTerms();
      if (res.ok && res.data) {
        setTerms((res.data as any).data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const notify = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      alert("Semua field wajib diisi");
      return;
    }

    try {
      let res;
      if (isEditMode && currentId) {
        res = await krsApi.updateTerm(currentId, formData);
      } else {
        res = await krsApi.createTerm({ ...formData, isActive: false });
      }

      if (res.ok) {
        notify(isEditMode ? "Periode berhasil diubah." : "Periode baru berhasil ditambahkan.");
        setIsDialogOpen(false);
        fetchTerms();
      } else {
        alert("Gagal menyimpan data periode.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus periode "${name}"?`)) return;
    try {
      const res = await krsApi.deleteTerm(id);
      if (res.ok) {
        notify("Periode berhasil dihapus.");
        fetchTerms();
      } else {
        alert("Gagal menghapus periode.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivate = async (id: string, name: string) => {
    if (!confirm(`Aktifkan periode "${name}"? Ini akan menonaktifkan periode lainnya.`)) return;
    try {
      const res = await krsApi.activateTerm(id);
      if (res.ok) {
        notify(`Periode "${name}" sekarang aktif.`);
        fetchTerms();
      } else {
        alert("Gagal mengaktifkan periode.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setCurrentId(null);
    setFormData({ name: "", startDate: "", endDate: "" });
    setIsDialogOpen(true);
  };

  const openEditModal = (term: any) => {
    setIsEditMode(true);
    setCurrentId(term.id);
    setFormData({
      name: term.name,
      startDate: term.startDate ? term.startDate.split("T")[0] : "",
      endDate: term.endDate ? term.endDate.split("T")[0] : "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {actionMsg && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4" />
          {actionMsg}
        </div>
      )}

      <Card className="shadow-sm border rounded-lg overflow-hidden">
        <CardHeader className="border-b bg-muted/10 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 font-serif text-primary">
              <Calendar className="h-5 w-5" /> Periode Akademik / KRS
            </CardTitle>
            <CardDescription className="mt-1">
              Atur periode akademik untuk mengatur jadwal pengisian KRS mahasiswa. Hanya boleh ada 1 periode aktif.
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateModal} className="gap-2">
                <Plus className="h-4 w-4" /> Tambah Periode
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit Periode" : "Tambah Periode Baru"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Periode</label>
                  <Input 
                    placeholder="Contoh: Ganjil 2026/2027" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tanggal Mulai</label>
                    <Input 
                      type="date" 
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tanggal Selesai</label>
                    <Input 
                      type="date" 
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                <Button onClick={handleSave}>Simpan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Memuat...
            </div>
          ) : terms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Belum ada data periode akademik.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/10 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Nama Periode</th>
                    <th className="px-4 py-3 text-left">Mulai</th>
                    <th className="px-4 py-3 text-left">Selesai</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {terms.map(t => (
                    <tr key={t.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {t.startDate ? new Date(t.startDate).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {t.endDate ? new Date(t.endDate).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {t.isActive ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Aktif</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">Tidak Aktif</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!t.isActive && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-xs gap-1 border-primary/20 text-primary hover:bg-primary hover:text-white"
                              onClick={() => handleActivate(t.id, t.name)}
                            >
                              <Play className="h-3 w-3" /> Set Aktif
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => openEditModal(t)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(t.id, t.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
