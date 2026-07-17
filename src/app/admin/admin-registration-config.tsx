import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminRegistrationConfigApi } from "@/lib/api";
import { Settings, RefreshCw, Save, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RegistrationConfig {
  sections?: Section[];
}

interface Section {
  id: string;
  name: string;
  isVisible?: boolean;
  fields?: Field[];
}

interface Field {
  id: string;
  name: string;
  isRequired?: boolean;
}

export default function AdminRegistrationConfigPage() {
  const [config, setConfig] = useState<RegistrationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const navigate = useNavigate();

  const fetchConfig = async () => {
    setLoading(true);
    const res = await adminRegistrationConfigApi.get();
    if (res.status === 401) { navigate("/login"); return; }
    if (res.ok && res.data) {
      setConfig(res.data as RegistrationConfig);
    }
    setLoading(false);
  };

  useEffect(() => { fetchConfig(); }, []);

  const notify = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const toggleVisibility = (sectionId: string) => {
    if (!config?.sections) return;
    setConfig({
      ...config,
      sections: config.sections.map((s) =>
        s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s
      ),
    });
  };

  const toggleRequired = (sectionId: string, fieldId: string) => {
    if (!config?.sections) return;
    setConfig({
      ...config,
      sections: config.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: s.fields?.map((f) =>
                f.id === fieldId ? { ...f, isRequired: !f.isRequired } : f
              ),
            }
          : s
      ),
    });
  };

  const handleSave = async () => {
    if (!config?.sections) return;
    setSaving(true);

    const visibilityPayload: Record<string, boolean> = {};
    const requiredPayload: Record<string, boolean> = {};

    config.sections.forEach((s) => {
      visibilityPayload[s.id] = s.isVisible ?? true;
      s.fields?.forEach((f) => {
        requiredPayload[f.id] = f.isRequired ?? false;
      });
    });

    const [visRes, reqRes] = await Promise.all([
      adminRegistrationConfigApi.updateVisibility(visibilityPayload),
      adminRegistrationConfigApi.updateRequiredFields(requiredPayload),
    ]);

    notify(
      visRes.ok && reqRes.ok
        ? "✅ Konfigurasi berhasil disimpan."
        : "❌ Gagal menyimpan sebagian konfigurasi."
    );
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <Button onClick={fetchConfig} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Muat Ulang
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>

        {actionMsg && (
          <div className="text-sm font-medium px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
            {actionMsg}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <RefreshCw className="animate-spin h-5 w-5 mr-2" /> Memuat konfigurasi...
          </div>
        ) : !config?.sections || config.sections.length === 0 ? (
          <Card className="shadow-sm border rounded-lg">
            <CardContent className="py-16 text-center text-muted-foreground text-sm">
              Tidak ada data konfigurasi. Pastikan backend mengembalikan data sections.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {config.sections.map((section) => (
              <Card key={section.id} className="shadow-sm border rounded-lg overflow-hidden">
                <CardHeader className="border-b bg-muted/10 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2 font-serif text-primary">
                      <Settings className="h-4 w-4" /> {section.name}
                    </CardTitle>
                    <button
                      onClick={() => toggleVisibility(section.id)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                        section.isVisible
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {section.isVisible ? (
                        <><Eye className="h-3 w-3" /> Terlihat</>
                      ) : (
                        <><EyeOff className="h-3 w-3" /> Tersembunyi</>
                      )}
                    </button>
                  </div>
                </CardHeader>
                {section.fields && section.fields.length > 0 && (
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide font-semibold">
                      Field — klik untuk toggle wajib
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {section.fields.map((field) => (
                        <button
                          key={field.id}
                          onClick={() => toggleRequired(section.id, field.id)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                            field.isRequired
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {field.name}
                          {field.isRequired && <span className="ml-1 text-red-500">*</span>}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}
