"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Bot, X, Send, Loader2, Sparkles, ChevronDown, Trash2,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────── */
interface Message {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

const SUGGESTED = [
  "What's my overall progress?",
  "Which topics am I weakest in?",
  "What should I focus on this week?",
  "How's my streak looking?",
  "How many problems have I solved in Dynamic Programming?",
];

/* ── Typing indicator ──────────────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-violet-400"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

/* ── Lightweight inline markdown renderer ────────────────── */
function parseMarkdown(text: string) {
  // Split on newlines first, then parse inline styles per segment
  return text.split("\n").map((line, lineIdx) => {
    // Parse **bold**, *italic*, `code` with a simple regex token pass
    const parts: React.ReactNode[] = [];
    const re = /\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`/g;
    let last = 0;
    let match;
    while ((match = re.exec(line)) !== null) {
      if (match.index > last) {
        parts.push(line.slice(last, match.index));
      }
      if (match[1] !== undefined) {
        parts.push(<strong key={match.index} className="font-semibold text-white">{match[1]}</strong>);
      } else if (match[2] !== undefined) {
        parts.push(<em key={match.index} className="italic">{match[2]}</em>);
      } else if (match[3] !== undefined) {
        parts.push(
          <code key={match.index}
            className="px-1 py-0.5 rounded text-[11px] font-mono"
            style={{ background: "rgba(139,92,246,0.15)", color: "#c4b5fd" }}
          >{match[3]}</code>
        );
      }
      last = match.index + match[0].length;
    }
    if (last < line.length) parts.push(line.slice(last));

    return (
      <span key={lineIdx}>
        {parts.length > 0 ? parts : "\u00A0" /* preserve blank lines */}
        {lineIdx < text.split("\n").length - 1 && <br />}
      </span>
    );
  });
}

/* ── Single message bubble ─────────────────────────────── */
function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mr-2 shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-tr-sm whitespace-pre-wrap"
            : "bg-white/8 border border-white/10 text-[#CBD5E1] rounded-tl-sm"
        }`}
      >
        {isUser ? msg.content : parseMarkdown(msg.content)}
      </div>
    </motion.div>
  );
}

/* ── Main Chat Widget ───────────────────────────────────── */
export default function StudyBuddyWidget() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [questionsRemaining, setQuestionsRemaining] = useState(15);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Load history on open ─────────────────────────────
  // NOTE: hooks must ALL be declared before any early return
  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/assistant/history");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
        setQuestionsRemaining(data.questionsRemaining ?? 15);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadHistory();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, loadHistory]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // ── Send message ──────────────────────────────────────
  // ── Clear chat ──────────────────────────────────────────
  const clearChat = async () => {
    if (!window.confirm("Clear all chat history? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/assistant/history", { method: "DELETE" });
      if (res.ok) {
        setMessages([]);
        toast.success("Chat cleared ✓");
      } else {
        toast.error("Could not clear chat — try again.");
      }
    } catch {
      toast.error("Could not clear chat — try again.");
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setInput("");
    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();

      if (data.limitReached) {
        toast.warning(data.reply, { duration: 5000 });
        // Remove the user message we optimistically added
        setMessages((prev) => prev.slice(0, -1));
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
        setQuestionsRemaining(data.questionsRemaining ?? 0);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble thinking right now — try again in a moment! 🤖",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isEmpty = messages.length === 0 && !loading;

  // Auth guard — AFTER all hooks (Rules of Hooks: never return early before hooks)
  if (status !== "authenticated") return null;

  return (
    <>
      {/* ── Floating bubble button ─────────────────────── */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/30 flex items-center justify-center"
        aria-label="Open Study Buddy chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <ChevronDown className="w-6 h-6 text-white" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <Sparkles className="w-6 h-6 text-white" />
            </motion.span>
          )}
        </AnimatePresence>
        {/* Pulse ring */}
        {!open && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-violet-400"
            animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* ── Chat drawer ───────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-drawer"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`
              fixed z-[59] flex flex-col
              /* Mobile: full screen */
              inset-0
              /* Desktop: bottom-right panel */
              md:inset-auto md:bottom-24 md:right-6 md:w-[380px] md:h-[580px] md:rounded-2xl
              border border-white/10 bg-[#0D0F1A]/95 backdrop-blur-xl shadow-2xl shadow-black/60
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Study Buddy 🤖
                  </p>
                  <p className="text-[10px] text-[#64748B]">
                    {questionsRemaining > 0
                      ? `${questionsRemaining} questions left today`
                      : "Daily limit reached — see you tomorrow!"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Clear chat button — only shown when there are messages */}
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    title="Clear chat history"
                    className="text-[#64748B] hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-[#64748B] hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 min-h-0">
              {loading ? (
                <div className="flex items-center justify-center flex-1">
                  <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                </div>
              ) : (
                <>
                  {/* Welcome message if empty */}
                  {isEmpty && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center flex-1 text-center gap-3 px-4"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/20 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-violet-400" />
                      </div>
                      <p className="text-sm text-[#94A3B8]">
                        Hi! I'm your Study Buddy. Ask me anything about your placement prep progress.
                      </p>
                    </motion.div>
                  )}

                  {messages.map((msg, i) => (
                    <Bubble key={msg._id ?? i} msg={msg} />
                  ))}

                  {sending && (
                    <div className="flex justify-start">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mr-2 shrink-0">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm">
                        <TypingDots />
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Suggested chips (only when empty) */}
            {isEmpty && !loading && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 pt-2 border-t border-white/8 shrink-0">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-violet-500/50 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    questionsRemaining > 0
                      ? "Ask about your prep…"
                      : "Daily limit reached"
                  }
                  disabled={sending || questionsRemaining <= 0}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-[#475569] outline-none disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || sending || questionsRemaining <= 0}
                  className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center disabled:opacity-40 transition-opacity shrink-0"
                >
                  {sending
                    ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    : <Send className="w-3.5 h-3.5 text-white" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
