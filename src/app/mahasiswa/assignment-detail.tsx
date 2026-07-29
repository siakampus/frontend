import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { assignmentsApi } from "@/lib/api";
import {
  FileText,
  RefreshCw,
  Upload,
  CheckCircle,
  ArrowLeft,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

interface Assignment {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
}

interface Submission {
  id: number;
  content?: string;
  grade?: number;
  feedback?: string;
  createdAt?: string;
  fileUrl?: string;
}

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const [assignRes, subRes] = await Promise.all([
        assignmentsApi.getById(id),
        assignmentsApi.getMySubmission(id),
      ]);
      if (assignRes.status === 401) { navigate("/login"); return; }
      if (assignRes.ok) setAssignment(assignRes.data as Assignment);
      if (subRes.ok && subRes.data) {
        const body = subRes.data as { data?: Submission };
        setSubmission(body.data || (subRes.data as unknown as Submission) || null);
      }
      setLoading(false);
    };
    load();
  }, [id, navigate]);

  const notify = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    const res = await assignmentsApi.submit(id, content || undefined, file || undefined);
    if (res.ok) {
      notify("✅ Tugas berhasil dikumpulkan!");
      const subRes = await assignmentsApi.getMySubmission(id);
      if (subRes.ok && subRes.data) {
        const body = subRes.data as { data?: Submission };
        setSubmission(body.data || (subRes.data as unknown as Submission) || null);
      }
    } else {
      notify("❌ Gagal mengumpulkan tugas.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground bg-gray-50">
        <RefreshCw className="animate-spin h-5 w-5 mr-2" /> Memuat tugas...
      </div>
    );
  }

  return (
    <AppLayout
      menuTemplate="student"
      sidebarTitle="SIA Dashboard"
      title={assignment?.title || "Detail Tugas"}
      subtitle="Lihat dan kumpulkan tugas Anda"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate("/mahasiswa/courses")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Mata Kuliah
        </Button>

        {msg && (
          <div className="text-sm font-medium px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
            {msg}
          </div>
        )}

        {/* Assignment Info */}
        {assignment && (
          <Card className="shadow-sm border rounded-lg">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 font-serif text-primary">
                <FileText className="h-5 w-5" /> {assignment.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {assignment.description && (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {assignment.description}
                </p>
              )}
              {assignment.dueDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Deadline: <strong>{new Date(assignment.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</strong></span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submission Status */}
        {submission ? (
          <Card className="shadow-sm border border-green-200 rounded-lg bg-green-50">
            <CardHeader className="border-b border-green-100 pb-4">
              <CardTitle className="text-base flex items-center gap-2 font-serif text-green-700">
                <CheckCircle className="h-5 w-5 text-green-500" /> Tugas Sudah Dikumpulkan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {submission.content && (
                <div>
                  <p className="text-xs text-green-600 uppercase font-semibold mb-1">Jawaban Anda</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.content}</p>
                </div>
              )}
              {submission.createdAt && (
                <p className="text-xs text-muted-foreground">
                  Dikumpulkan pada: {new Date(submission.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
              {submission.grade != null && (
                <div className="flex items-center gap-3 mt-3 p-3 bg-white rounded-lg border border-green-200">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Nilai</p>
                    <p className="text-2xl font-bold text-green-700">{submission.grade}</p>
                  </div>
                  {submission.feedback && (
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Feedback Dosen</p>
                      <p className="text-sm text-gray-700">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              )}
              {submission.grade == null && (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <span>Menunggu penilaian dari dosen.</span>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Submit Form */
          <Card className="shadow-sm border rounded-lg">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <CardTitle className="text-base flex items-center gap-2 font-serif text-primary">
                <Upload className="h-5 w-5" /> Kumpulkan Tugas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jawaban / Penjelasan <span className="text-muted-foreground text-xs">(opsional jika ada file)</span>
                  </label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                    placeholder="Tuliskan jawaban atau penjelasan tugas Anda..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Lampiran <span className="text-muted-foreground text-xs">(opsional)</span>
                  </label>
                  <input
                    type="file"
                    id="assignment-file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                  {file && (
                    <p className="text-xs text-muted-foreground mt-1">
                      File dipilih: {file.name}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={submitting || (!content && !file)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" /> Mengumpulkan...</>
                  ) : (
                    <><Upload className="h-4 w-4" /> Kumpulkan Tugas</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
