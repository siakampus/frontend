import React, { useEffect, useRef, useState } from "react";
import { chatApi, type ChatTopic } from "@/lib/api";
import { Send, X, Minus, Plus, Trash2, ChevronLeft, RefreshCw, Sparkles } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

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
  "Bagaimana cara melihat jadwal kuliah?",
  "Kapan batas pembayaran UKT?",
  "Cara mengajukan cuti akademik?",
];

// ── Theme tokens — light, matches main dashboard ──────────────────────────────
const T = {
  bg: "#ffffff",
  bgSub: "#f9fafb",       // gray-50
  border: "#e5e7eb",      // gray-200
  borderFocus: "#6366f1", // indigo accent – matches typical primary
  text: "#111827",        // gray-900
  textMuted: "#6b7280",   // gray-500
  textPlaceholder: "#9ca3af", // gray-400
  userBubble: "var(--primary, #4f46e5)",
  userText: "#ffffff",
  aiBubble: "#f3f4f6",    // gray-100
  aiText: "#111827",
  chipBorder: "#d1d5db",  // gray-300
  chipText: "var(--primary, #4f46e5)",
  header: "#ffffff",
  headerBorder: "#e5e7eb",
  btnPrimary: "var(--primary, #4f46e5)",
  btnPrimaryText: "#ffffff",
  shadow: "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
  triggerShadow: "0 4px 16px rgba(0,0,0,0.15)",
};

// ── Sparkle icon ──────────────────────────────────────────────────────────────
function SparkleIcon({ size = 18, color = "var(--primary, #4f46e5)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z" fill={color} />
    </svg>
  );
}

// ── Typing dots ───────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center", padding: "2px 0" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--primary, #4f46e5)",
            opacity: 0.5,
            display: "inline-block",
            animation: "fcBounce 0.9s infinite ease-in-out",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Floating chat widget ──────────────────────────────────────────────────────
export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [view, setView] = useState<"sessions" | "chat">("sessions");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<ChatTopic>("CUSTOMER_SERVICE");
  const [inputFocused, setInputFocused] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scroll = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { if (open) fetchSessions(); }, [open]);
  useEffect(() => { scroll(); }, [messages]);

  const fetchSessions = async () => {
    setLoading(true);
    const res = await chatApi.listSessions();
    if (res.ok && res.data) {
      const body = res.data as { data?: ChatSession[] };
      setSessions(body.data || (res.data as unknown as ChatSession[]) || []);
    }
    setLoading(false);
  };

  const openSession = async (session: ChatSession) => {
    setActiveSession(session);
    setMessages([]);
    setView("chat");
    setLoading(true);
    const res = await chatApi.getMessages(session.id);
    if (res.ok && res.data) {
      const body = res.data as { data?: ChatMessage[] };
      setMessages(body.data || (res.data as unknown as ChatMessage[]) || []);
    }
    setLoading(false);
  };

  const newSession = async () => {
    const res = await chatApi.createSession(selectedTopic);
    if (res.ok && res.data) {
      const s = (res.data as { data?: ChatSession }).data || res.data as unknown as ChatSession;
      setSessions((p) => [s, ...p]);
      openSession(s);
    }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Hapus sesi ini?")) return;
    const res = await chatApi.deleteSession(id);
    if (res.ok) {
      setSessions((p) => p.filter((s) => s.id !== id));
      if (activeSession?.id === id) { setActiveSession(null); setMessages([]); setView("sessions"); }
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;
    let session = activeSession;
    if (!session) {
      const res = await chatApi.createSession(selectedTopic);
      if (!res.ok || !res.data) return;
      session = (res.data as { data?: ChatSession }).data || res.data as unknown as ChatSession;
      setSessions((p) => [session!, ...p]);
      setActiveSession(session);
    }
    setView("chat");
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: text.trim() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setSending(true);
    const res = await chatApi.sendMessage(session.id, userMsg.content);
    if (res.ok && res.data) {
      const body = res.data as { data?: ChatMessage; reply?: string; message?: string };
      if (body.data) setMessages((p) => [...p, body.data as ChatMessage]);
      else if (body.reply || body.message)
        setMessages((p) => [...p, { id: `a-${Date.now()}`, role: "assistant", content: (body.reply || body.message) as string }]);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes fcBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @keyframes fcFadeIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes fcPop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        .fc-scroll::-webkit-scrollbar { width: 4px; }
        .fc-scroll::-webkit-scrollbar-track { background: transparent; }
        .fc-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        .fc-chip:hover { background: #ede9fe !important; border-color: var(--primary, #4f46e5) !important; }
        .fc-session-row:hover { background: #f9fafb !important; }
        .fc-icon-btn:hover { background: #f3f4f6 !important; }
      `}</style>

      {/* ── Trigger button ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Buka UGN Customer Service"
          style={{
            position: "fixed", bottom: "28px", right: "28px",
            width: "52px", height: "52px", borderRadius: "50%",
            background: "var(--primary, #4f46e5)",
            border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 9999,
            boxShadow: T.triggerShadow,
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = T.triggerShadow; }}
        >
          <Sparkles style={{ width: 22, height: 22, color: "#fff" }} />
        </button>
      )}

      {/* ── Chat panel ── */}
      {open && (
        <div style={{
          position: "fixed", bottom: "28px", right: "28px",
          width: "380px",
          height: minimized ? "52px" : "600px",
          borderRadius: "16px",
          background: T.bg,
          border: `1px solid ${T.border}`,
          boxShadow: T.shadow,
          display: "flex", flexDirection: "column",
          overflow: "hidden", zIndex: 9999,
          animation: "fcFadeIn 0.2s ease",
          transition: "height 0.25s ease",
        }}>

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "0 12px", height: "52px", flexShrink: 0,
            background: T.header,
            borderBottom: minimized ? "none" : `1px solid ${T.headerBorder}`,
          }}>
            {view === "chat" && !minimized && (
              <button
                className="fc-icon-btn"
                onClick={() => setView("sessions")}
                style={{ padding: "5px", background: "none", border: "none", color: T.textMuted, cursor: "pointer", borderRadius: "6px", display: "flex", transition: "background 0.15s" }}
              >
                <ChevronLeft style={{ width: 16, height: 16 }} />
              </button>
            )}

            <SparkleIcon size={18} />
            <span style={{ color: T.text, fontWeight: 600, fontSize: "14px", flex: 1 }}>
              UGN Customer Service
              {activeSession && view === "chat" && (
                <span style={{ color: T.textMuted, fontWeight: 400, fontSize: "11px", marginLeft: "6px" }}>
                  · {TOPIC_LABELS[activeSession.topic]}
                </span>
              )}
            </span>

            {/* Preview badge */}
            <span style={{
              fontSize: "9px", padding: "2px 7px", borderRadius: "20px",
              background: "#ede9fe", color: "var(--primary, #4f46e5)",
              border: "1px solid #ddd6fe", fontWeight: 500, marginRight: "2px",
            }}>Preview</span>

            <button
              className="fc-icon-btn"
              onClick={() => setMinimized((m) => !m)}
              style={{ padding: "5px", background: "none", border: "none", color: T.textMuted, cursor: "pointer", borderRadius: "6px", display: "flex", transition: "background 0.15s" }}
            >
              <Minus style={{ width: 14, height: 14 }} />
            </button>
            <button
              className="fc-icon-btn"
              onClick={() => { setOpen(false); setMinimized(false); }}
              style={{ padding: "5px", background: "none", border: "none", color: T.textMuted, cursor: "pointer", borderRadius: "6px", display: "flex", transition: "background 0.15s" }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Body */}
          {!minimized && (
            <>
              {/* ── Sessions / Welcome view ── */}
              {view === "sessions" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  {/* Welcome banner */}
                  <div style={{ padding: "20px 18px 14px", background: T.bg }}>
                    <SparkleIcon size={28} />
                    <h2 style={{ color: T.text, fontSize: "17px", fontWeight: 600, margin: "10px 0 3px", lineHeight: 1.3 }}>
                      Selamat datang di<br />
                      <span style={{ color: "var(--primary, #4f46e5)" }}>UGN Customer Service</span>
                    </h2>
                    <p style={{ color: T.textMuted, fontSize: "12px", margin: 0 }}>
                      Tanya apa saja seputar akademik, jadwal, atau pembayaran.
                    </p>
                  </div>

                  {/* Input area */}
                  <div style={{ padding: "0 14px 12px", borderBottom: `1px solid ${T.border}` }}>
                    {/* Text input box */}
                    <div style={{
                      display: "flex", alignItems: "flex-end", gap: "8px",
                      background: T.bgSub,
                      border: `1px solid ${inputFocused ? "var(--primary, #4f46e5)" : T.chipBorder}`,
                      borderRadius: "12px", padding: "9px 10px 9px 13px",
                      marginBottom: "10px",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      boxShadow: inputFocused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
                    }}>
                      <textarea
                        rows={2}
                        placeholder="Ketik pertanyaan Anda di sini..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => setInputFocused(false)}
                        style={{
                          flex: 1, background: "transparent", border: "none", outline: "none",
                          color: T.text, fontSize: "13px", resize: "none",
                          lineHeight: "1.5", fontFamily: "inherit",
                          maxHeight: "80px", overflowY: "auto",
                        }}
                      />
                      <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || sending}
                        style={{
                          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                          background: input.trim() && !sending ? "var(--primary, #4f46e5)" : T.border,
                          border: "none",
                          color: input.trim() && !sending ? "#fff" : T.textMuted,
                          cursor: input.trim() && !sending ? "pointer" : "default",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s",
                        }}
                      >
                        <Send style={{ width: 13, height: 13 }} />
                      </button>
                    </div>

                    {/* Topic + new session (secondary) */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value as ChatTopic)}
                        style={{
                          flex: 1, background: T.bg, border: `1px solid ${T.border}`,
                          borderRadius: "8px", padding: "6px 8px", fontSize: "11px",
                          color: T.textMuted, cursor: "pointer", outline: "none",
                        }}
                      >
                        {Object.entries(TOPIC_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                      <button
                        onClick={newSession}
                        title="Mulai sesi baru tanpa pesan"
                        style={{
                          display: "flex", alignItems: "center", gap: "5px",
                          padding: "6px 11px", borderRadius: "8px",
                          background: "transparent", border: `1px solid ${T.chipBorder}`,
                          color: "var(--primary, #4f46e5)", fontSize: "11px", cursor: "pointer",
                          whiteSpace: "nowrap", transition: "background 0.15s, border-color 0.15s",
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#ede9fe"; e.currentTarget.style.borderColor = "var(--primary, #4f46e5)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.chipBorder; }}
                      >
                        <Plus style={{ width: 11, height: 11 }} /> Sesi Baru
                      </button>
                    </div>
                  </div>

                  {/* Suggestion chips */}
                  <div style={{ padding: "12px 14px", borderBottom: `1px solid ${T.border}` }}>
                    <p style={{ color: T.textMuted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px", fontWeight: 600 }}>
                      Pertanyaan umum
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {SUGGESTIONS.map((s, i) => (
                        <button
                          key={i}
                          className="fc-chip"
                          onClick={() => sendMessage(s)}
                          style={{
                            textAlign: "left", padding: "7px 12px", borderRadius: "20px",
                            background: T.bg, border: `1px solid ${T.chipBorder}`,
                            color: "var(--primary, #4f46e5)", fontSize: "12px", cursor: "pointer",
                            transition: "all 0.15s", whiteSpace: "nowrap",
                            overflow: "hidden", textOverflow: "ellipsis",
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Past sessions */}
                  {sessions.length > 0 && (
                    <div className="fc-scroll" style={{ flex: 1, overflowY: "auto" }}>
                      <p style={{ color: T.textMuted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 14px 5px", fontWeight: 600 }}>
                        Sesi sebelumnya
                      </p>
                      {loading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "12px" }}>
                          <RefreshCw style={{ width: 16, height: 16, color: T.textMuted, animation: "spin 1s linear infinite" }} />
                        </div>
                      ) : sessions.map((s) => (
                        <button
                          key={s.id}
                          className="fc-session-row"
                          onClick={() => openSession(s)}
                          style={{
                            width: "100%", textAlign: "left", padding: "9px 14px",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            background: "transparent", borderBottom: `1px solid ${T.border}`,
                            cursor: "pointer", transition: "background 0.15s", border: "none",
                            borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: T.border,
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: T.text, fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {TOPIC_LABELS[s.topic]}
                            </div>
                            {s.createdAt && (
                              <div style={{ color: T.textMuted, fontSize: "10px", marginTop: "1px" }}>
                                {new Date(s.createdAt).toLocaleDateString("id-ID")}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => deleteSession(s.id, e)}
                            style={{ padding: "3px", background: "none", border: "none", color: T.textMuted, cursor: "pointer", borderRadius: "4px", flexShrink: 0, transition: "color 0.15s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
                          >
                            <Trash2 style={{ width: 12, height: 12 }} />
                          </button>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Chat view ── */}
              {view === "chat" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  {/* Messages */}
                  <div className="fc-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {loading ? (
                      <div style={{ textAlign: "center", color: T.textMuted, paddingTop: "40px" }}>
                        <TypingDots />
                      </div>
                    ) : messages.length === 0 ? (
                      <div style={{ textAlign: "center", color: T.textMuted, paddingTop: "50px" }}>
                        <SparkleIcon size={32} />
                        <p style={{ marginTop: "10px", fontSize: "13px" }}>Mulai percakapan baru</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} style={{
                          display: "flex",
                          flexDirection: msg.role === "user" ? "row-reverse" : "row",
                          alignItems: "flex-end", gap: "8px",
                        }}>
                          {msg.role === "assistant" && (
                            <div style={{
                              width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                              background: "#ede9fe",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <SparkleIcon size={14} />
                            </div>
                          )}
                          <div style={{
                            maxWidth: "80%", padding: "9px 13px",
                            borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                            background: msg.role === "user" ? "var(--primary, #4f46e5)" : T.aiBubble,
                            color: msg.role === "user" ? T.userText : T.aiText,
                            fontSize: "13px", lineHeight: "1.55",
                            whiteSpace: "pre-wrap", wordBreak: "break-word",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                          }}>
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                    {sending && (
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <SparkleIcon size={14} />
                        </div>
                        <div style={{ padding: "9px 14px", borderRadius: "4px 16px 16px 16px", background: T.aiBubble, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
                          <TypingDots />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat input */}
                  <div style={{ padding: "10px 12px 12px", borderTop: `1px solid ${T.border}`, background: T.bg }}>
                    <div style={{
                      display: "flex", alignItems: "flex-end", gap: "8px",
                      background: T.bgSub,
                      border: `1px solid ${inputFocused ? "var(--primary, #4f46e5)" : T.chipBorder}`,
                      borderRadius: "14px", padding: "9px 10px 9px 13px",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      boxShadow: inputFocused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
                    }}>
                      <textarea
                        id="chat-input"
                        rows={1}
                        placeholder="Tulis pesan... (Enter kirim)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => setInputFocused(false)}
                        disabled={sending}
                        style={{
                          flex: 1, background: "transparent", border: "none", outline: "none",
                          color: T.text, fontSize: "13px", resize: "none",
                          lineHeight: "1.5", fontFamily: "inherit",
                          maxHeight: "80px", overflowY: "auto",
                        }}
                      />
                      <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || sending}
                        style={{
                          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                          background: input.trim() && !sending ? "var(--primary, #4f46e5)" : T.border,
                          border: "none",
                          color: input.trim() && !sending ? "#fff" : T.textMuted,
                          cursor: input.trim() && !sending ? "pointer" : "default",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s",
                          marginBottom: "1px",
                        }}
                      >
                        <Send style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                    <p style={{ textAlign: "center", color: T.textMuted, fontSize: "10px", marginTop: "6px" }}>
                      UGN Customer Service dapat membuat kesalahan. Verifikasi kepada staf akademik.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
