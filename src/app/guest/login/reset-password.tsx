import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
const API_BASE = import.meta.env.VITE_PUBLIC_API_URL ?? "";

function AlertBox({ type, message }: { type: "success" | "error"; message: string; }) {
  if (!message) return null;
  const isSuccess = type === "success";
  return (
    <div className={cn(
        "flex items-start gap-3 border rounded-lg px-4 py-3 text-sm mb-3",
        isSuccess ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700"
      )}
    >
      {isSuccess ? <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-500 mt-0.5" />}
      <span className="font-medium">{message}</span>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMsg("Tautan reset kata sandi tidak valid atau telah kadaluarsa.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      setErrorMsg("Kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccessMsg("Kata sandi berhasil diatur ulang. Anda sekarang dapat login.");
        setPassword("");
        setConfirmPassword("");
      } else {
        setErrorMsg(data.message || "Gagal mengatur ulang kata sandi. Tautan mungkin kadaluarsa.");
      }
    } catch (err) {
      setErrorMsg("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="overflow-hidden p-0 rounded-lg shadow-lg">
          <CardContent className="p-6 md:p-8 flex flex-col space-y-6">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-xl font-bold font-serif mb-2">Atur Ulang Kata Sandi</h1>
              <p className="text-muted-foreground text-sm">
                Silakan masukkan kata sandi baru Anda.
              </p>
            </div>

            {errorMsg && <AlertBox type="error" message={errorMsg} />}
            {successMsg && <AlertBox type="success" message={successMsg} />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="password">Kata Sandi Baru</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!token || successMsg !== ""}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!token || successMsg !== ""}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !token || successMsg !== ""}>
                {loading ? "Memproses..." : "Simpan Kata Sandi"}
              </Button>
            </form>

            <div className="text-center mt-4">
              <Link to="/login" className="text-sm flex items-center justify-center gap-1 text-primary hover:underline">
                <ArrowLeft className="w-4 h-4" /> Kembali ke Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
