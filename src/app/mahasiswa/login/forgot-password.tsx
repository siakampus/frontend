import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccessMsg("Jika email terdaftar, tautan reset kata sandi telah dikirim ke email Anda.");
      } else {
        setErrorMsg(data.message || "Terjadi kesalahan saat memproses permintaan Anda.");
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
              <h1 className="text-xl font-bold font-serif mb-2">Lupa Kata Sandi</h1>
              <p className="text-muted-foreground text-sm">
                Masukkan email Anda untuk menerima tautan reset kata sandi.
              </p>
            </div>

            {errorMsg && <AlertBox type="error" message={errorMsg} />}
            {successMsg && <AlertBox type="success" message={successMsg} />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@ugn.ac.id"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Mengirim..." : "Kirim Tautan Reset"}
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
