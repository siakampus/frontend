import React, { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/ui/app-layout";
import { chatApi, type ChatTopic } from "@/lib/api";
import { Send, Plus, Trash2, RefreshCw, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatSession {
  id: string;
  topic: ChatTopic;
  createdAt?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

const TOPIC_LABELS: Record<ChatTopic, string> = {
  CUSTOMER_SERVICE: "Layanan Pelanggan",
  SCHEDULING: "Penjadwalan",
  COURSE_SUMMARY: "Ringkasan Mata Kuliah",
};

const SUGGESTIONS = [
  "Apa syarat pendaftaran ulang semester ini?",
  "Bagaimana cara melihat jadwal kuliah saya?",
  "Kapan batas pembayaran UKT semester ini?",
  "Bagaimana cara mengajukan cuti akademik?",
];

// Gemini-style sparkle SVG
function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z"
        fill="url(#sparkle-grad)"
      />
      <defs>
        <linearGradient id="sparkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8ab4f8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Animated typing dots
function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-blue-400/60 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </div>
  );
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<ChatTopic>("CUSTOMER_SERVICE");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const fetchSessions = async () => {
    setLoadingSessions(true);
    const res = await chatApi.listSessions();
    if (res.status === 401) { navigate("/login"); return; }
    if (res.ok && res.data) {
      const body = res.data as { data?: ChatSession[] };
      setSessions(body.data || (res.data as unknown as ChatSession[]) || []);
    }
    setLoadingSessions(false);
  };

  useEffect(() => { fetchSessions(); }, []);
  useEffect(() => { scrollToBottom(); }, [messages]);

  const openSession = async (session: ChatSession) => {
    setActiveSession(session);
    setMessages([]);
    setLoadingMessages(true);
    const res = await chatApi.getMessages(session.id);
    if (res.ok && res.data) {
      const body = res.data as { data?: ChatMessage[] };
      setMessages(body.data || (res.data as unknown as ChatMessage[]) || []);
    }
    setLoadingMessages(false);
  };

  const createSession = async () => {
    const res = await chatApi.createSession(selectedTopic);
    if (res.ok && res.data) {
      const newSession = (res.data as { data?: ChatSession }).data || res.data as unknown as ChatSession;
      setSessions((prev) => [newSession, ...prev]);
      openSession(newSession);
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Hapus sesi chat ini?")) return;
    const res = await chatApi.deleteSession(sessionId);
    if (res.ok) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
        setMessages([]);
      }
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;

    // If no active session, auto-create one
    let session = activeSession;
    if (!session) {
      const res = await chatApi.createSession(selectedTopic);
      if (!res.ok || !res.data) return;
      session = (res.data as { data?: ChatSession }).data || res.data as unknown as ChatSession;
      setSessions((prev) => [session!, ...prev]);
      setActiveSession(session);
    }

    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    const res = await chatApi.sendMessage(session.id, userMsg.content);
    if (res.ok && res.data) {
      const body = res.data as { data?: ChatMessage; reply?: string; message?: string };
      if (body.data) {
        setMessages((prev) => [...prev, body.data as ChatMessage]);
      } else if (body.reply || body.message) {
        setMessages((prev) => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            role: "assistant",
            content: (body.reply || body.message) as string,
          },
        ]);
      }
    }
    setSending(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isWelcomeScreen = messages.length === 0 && !loadingMessages;

  return (
    <AppLayout menuTemplate="student" sidebarTitle="SIA Dashboard" title="Chatbot" subtitle="">
      {/* Full-screen dark chat container */}
      <div
        className="flex rounded-xl overflow-hidden shadow-2xl"
        style={{
          height: "calc(100vh - 9rem)",
          background: "#1e2124",
        }}
      >
        {/* ── Session Sidebar ── */}
        <aside
          style={{
            width: sidebarOpen ? "240px" : "0px",
            minWidth: sidebarOpen ? "240px" : "0px",
            background: "#2a2d31",
            borderRight: "1px solid #3a3d41",
            transition: "all 0.25s ease",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Sidebar header */}
          <div style={{ padding: "16px", borderBottom: "1px solid #3a3d41" }}>
            <p style={{ color: "#8ab4f8", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              Topik
            </p>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value as ChatTopic)}
              style={{
                width: "100%",
                background: "#3a3d41",
                border: "1px solid #4a4d51",
                borderRadius: "8px",
                padding: "7px 10px",
                fontSize: "12px",
                color: "#e8eaed",
                marginBottom: "10px",
                cursor: "pointer",
              }}
            >
              {Object.entries(TOPIC_LABELS).map(([key, label]) => (
                <option key={key} value={key} style={{ background: "#3a3d41" }}>{label}</option>
              ))}
            </select>
            <button
              onClick={createSession}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "8px",
                borderRadius: "8px",
                background: "transparent",
                border: "1px solid #4a4d51",
                color: "#8ab4f8",
                fontSize: "13px",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#3a3d41")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Plus className="h-3.5 w-3.5" /> Sesi Baru
            </button>
          </div>

          {/* Session list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingSessions ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                <RefreshCw className="animate-spin h-4 w-4" style={{ color: "#5f6368" }} />
              </div>
            ) : sessions.length === 0 ? (
              <p style={{ textAlign: "center", color: "#5f6368", fontSize: "12px", padding: "20px 12px" }}>
                Belum ada sesi. Buat sesi baru.
              </p>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => openSession(s)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #3a3d41",
                    background: activeSession?.id === s.id ? "rgba(138,180,248,0.1)" : "transparent",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (activeSession?.id !== s.id) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { if (activeSession?.id !== s.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: activeSession?.id === s.id ? "#8ab4f8" : "#bdc1c6",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {TOPIC_LABELS[s.topic] || s.topic}
                    </div>
                    {s.createdAt && (
                      <div style={{ fontSize: "10px", color: "#5f6368", marginTop: "2px" }}>
                        {new Date(s.createdAt).toLocaleDateString("id-ID")}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => deleteSession(s.id, e)}
                    style={{
                      padding: "4px",
                      borderRadius: "4px",
                      background: "transparent",
                      color: "#5f6368",
                      cursor: "pointer",
                      flexShrink: 0,
                      marginLeft: "6px",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(234,67,53,0.15)"; e.currentTarget.style.color = "#f28b82"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#5f6368"; }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ── Main chat area ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Top bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 20px",
            borderBottom: "1px solid #3a3d41",
            background: "#1e2124",
          }}>
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              style={{ padding: "6px", borderRadius: "6px", background: "transparent", color: "#9aa0a6", cursor: "pointer", border: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <SparkleIcon className="h-5 w-5" />
            <span style={{ color: "#e8eaed", fontWeight: 600, fontSize: "15px" }}>SIA Assist</span>
            <span style={{
              fontSize: "10px",
              padding: "2px 8px",
              borderRadius: "20px",
              background: "rgba(138,180,248,0.15)",
              color: "#8ab4f8",
              border: "1px solid rgba(138,180,248,0.3)",
              fontWeight: 500,
            }}>Preview</span>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
            {isWelcomeScreen ? (
              /* ── Welcome Screen ── */
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                height: "100%",
                maxWidth: "520px",
                margin: "0 auto",
                padding: "40px 0",
              }}>
                <SparkleIcon className="h-10 w-10 mb-6" />
                <h1 style={{ fontSize: "28px", fontWeight: 400, lineHeight: 1.3, marginBottom: "24px" }}>
                  <span style={{ color: "#8ab4f8" }}>Selamat datang di</span>
                  <br />
                  <span style={{ color: "#e8eaed", fontWeight: 500 }}>SIA Academic Assist</span>
                </h1>

                <div style={{ marginBottom: "32px" }}>
                  <p style={{ color: "#bdc1c6", fontSize: "14px", fontWeight: 500, marginBottom: "10px" }}>
                    Apa yang bisa saya bantu?
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                    {[
                      "Informasi pendaftaran dan persyaratan akademik",
                      "Jadwal kuliah dan kalender akademik",
                      "Informasi pembayaran dan keuangan",
                      "Prosedur administrasi dan pengajuan",
                    ].map((item, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "#9aa0a6", fontSize: "13px" }}>
                        <span style={{ color: "#8ab4f8", marginTop: "2px", flexShrink: 0 }}>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Input field on welcome screen */}
                <form onSubmit={handleSubmit} style={{ width: "100%", marginBottom: "16px" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#2a2d31",
                    border: "1px solid #4a4d51",
                    borderRadius: "24px",
                    padding: "10px 16px",
                    transition: "border-color 0.2s",
                  }}
                    onFocus={() => {}}
                  >
                    <textarea
                      ref={inputRef}
                      id="chat-input-welcome"
                      rows={1}
                      placeholder="Masukkan pertanyaan Anda..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "#e8eaed",
                        fontSize: "14px",
                        resize: "none",
                        lineHeight: "1.5",
                        fontFamily: "inherit",
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || sending}
                      style={{
                        padding: "6px",
                        borderRadius: "50%",
                        background: input.trim() ? "#8ab4f8" : "transparent",
                        border: "none",
                        color: input.trim() ? "#1e2124" : "#5f6368",
                        cursor: input.trim() ? "pointer" : "default",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>

                {/* Suggestion chips */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      style={{
                        textAlign: "left",
                        padding: "9px 16px",
                        borderRadius: "20px",
                        background: "transparent",
                        border: "1px solid #4a4d51",
                        color: "#8ab4f8",
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(138,180,248,0.08)"; e.currentTarget.style.borderColor = "#8ab4f8"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#4a4d51"; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ── Message thread ── */
              <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: "20px", maxWidth: "720px", margin: "0 auto" }}>
                {loadingMessages ? (
                  <div style={{ textAlign: "center", color: "#5f6368", padding: "40px 0" }}>
                    <RefreshCw className="animate-spin h-5 w-5 mx-auto" />
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        flexDirection: msg.role === "user" ? "row-reverse" : "row",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: msg.role === "user" ? "#8ab4f8" : "#3a3d41",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: msg.role === "user" ? "#1e2124" : "#8ab4f8",
                      }}>
                        {msg.role === "user" ? "U" : <SparkleIcon className="h-4 w-4" />}
                      </div>

                      {/* Bubble */}
                      <div
                        style={{
                          maxWidth: "75%",
                          padding: "10px 16px",
                          borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                          background: msg.role === "user" ? "#8ab4f8" : "#2a2d31",
                          color: msg.role === "user" ? "#1e2124" : "#e8eaed",
                          fontSize: "14px",
                          lineHeight: "1.6",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}

                {/* Typing indicator */}
                {sending && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "#3a3d41",
                    }}>
                      <SparkleIcon className="h-4 w-4" />
                    </div>
                    <div style={{ padding: "10px 16px", borderRadius: "4px 18px 18px 18px", background: "#2a2d31" }}>
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ── Input bar (when in conversation) ── */}
          {!isWelcomeScreen && (
            <div style={{ padding: "12px 20px 16px", borderTop: "1px solid #3a3d41" }}>
              <form onSubmit={handleSubmit} style={{ maxWidth: "720px", margin: "0 auto" }}>
                <div style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "10px",
                  background: "#2a2d31",
                  border: "1px solid #4a4d51",
                  borderRadius: "24px",
                  padding: "10px 16px",
                }}>
                  <textarea
                    id="chat-input"
                    rows={1}
                    placeholder="Tulis pesan... (Enter untuk kirim, Shift+Enter untuk baris baru)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#e8eaed",
                      fontSize: "14px",
                      resize: "none",
                      lineHeight: "1.5",
                      fontFamily: "inherit",
                      maxHeight: "120px",
                      overflowY: "auto",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    style={{
                      padding: "7px",
                      borderRadius: "50%",
                      background: input.trim() && !sending ? "#8ab4f8" : "transparent",
                      border: "none",
                      color: input.trim() && !sending ? "#1e2124" : "#5f6368",
                      cursor: input.trim() && !sending ? "pointer" : "default",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginBottom: "1px",
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>

              {/* Disclaimer */}
              <p style={{ textAlign: "center", color: "#5f6368", fontSize: "11px", marginTop: "10px" }}>
                SIA Assist dapat membuat kesalahan. Verifikasi informasi penting kepada staf akademik.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
