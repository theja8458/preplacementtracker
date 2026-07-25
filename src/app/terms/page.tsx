"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollText, CheckCircle2, ArrowRight, LogOut, AlertCircle } from "lucide-react";
import { TERMS_MARKDOWN } from "@/lib/terms-content";

export default function TermsPage() {
  const router = useRouter();
  const { update: updateSession } = useSession();

  const [hasScrolled, setHasScrolled] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Track scroll to bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 20) {
      setHasScrolled(true);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    // Also check on mount in case content is short
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const canAccept = hasScrolled && checked;

  const handleAccept = async () => {
    if (!canAccept || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/accept-terms", { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to save acceptance");
      const data = await res.json();

      // Refresh the JWT so middleware sees the new termsAcceptedVersion
      await updateSession({ termsAcceptedVersion: data.termsAcceptedVersion });

      // Small delay to let the session propagate
      await new Promise((r) => setTimeout(r, 300));
      router.push(data.redirectTo ?? "/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0D0F1A] flex flex-col items-center justify-center px-4 py-12"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] rounded-full bg-cyan-600/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-2xl flex flex-col gap-6"
      >
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/25 mb-5">
            <ScrollText className="w-7 h-7 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Before you get started
          </h1>
          <p className="text-[#94A3B8] text-base">
            Please read and accept our Terms &amp; Conditions to continue.
          </p>
        </div>

        {/* Scrollable terms card */}
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40">
          {/* Scroll fade indicator at top */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0D0F1A]/60 to-transparent z-10 pointer-events-none rounded-t-2xl" />

          <div
            ref={scrollRef}
            className="overflow-y-auto h-[340px] px-7 py-6 scroll-smooth"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#4c1d95 transparent" }}
          >
            <div className="prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:font-semibold
              prose-h1:text-2xl prose-h2:text-base prose-h2:mt-6 prose-h2:mb-2
              prose-p:text-[#94A3B8] prose-p:leading-relaxed
              prose-li:text-[#94A3B8]
              prose-strong:text-white
              prose-hr:border-white/10
              prose-a:text-violet-400
            ">
              <ReactMarkdown>{TERMS_MARKDOWN}</ReactMarkdown>
            </div>
          </div>

          {/* Scroll fade indicator at bottom — fades out when scrolled */}
          <AnimatePresence>
            {!hasScrolled && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0D0F1A]/80 to-transparent pointer-events-none rounded-b-2xl"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Scroll hint */}
        <AnimatePresence>
          {!hasScrolled && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs text-[#64748B] -mt-2"
            >
              ↕ Scroll to the bottom to continue
            </motion.p>
          )}
        </AnimatePresence>

        {/* Checkbox */}
        <label
          className={`flex items-start gap-3 cursor-pointer group select-none transition-opacity ${
            !hasScrolled ? "opacity-40 pointer-events-none" : "opacity-100"
          }`}
        >
          <div
            className={`mt-0.5 w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
              checked
                ? "bg-violet-500 border-violet-500"
                : "border-white/20 bg-white/5 group-hover:border-violet-500/50"
            }`}
            onClick={() => hasScrolled && setChecked((v) => !v)}
          >
            <AnimatePresence>
              {checked && (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span
            className="text-sm text-[#94A3B8] leading-snug"
            onClick={() => hasScrolled && setChecked((v) => !v)}
          >
            I have read and agree to the{" "}
            <span className="text-violet-400">Terms &amp; Conditions</span>
          </span>
        </label>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Accept button */}
        <motion.button
          id="accept-terms-btn"
          onClick={handleAccept}
          disabled={!canAccept || loading}
          whileHover={canAccept && !loading ? { scale: 1.02 } : {}}
          whileTap={canAccept && !loading ? { scale: 0.98 } : {}}
          className={`w-full h-13 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
            canAccept && !loading
              ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
              : "bg-white/5 text-[#475569] cursor-not-allowed border border-white/5"
          }`}
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Saving…
            </>
          ) : (
            <>
              Accept &amp; Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>

        {/* Decline */}
        <div className="text-center">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex items-center gap-1.5 text-xs text-[#475569] hover:text-[#94A3B8] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Decline and sign out
          </button>
        </div>

        {/* Read-only link */}
        <p className="text-center text-xs text-[#334155]">
          Want to read without accepting?{" "}
          <a href="/terms/view" target="_blank" className="text-violet-400/60 hover:text-violet-400 transition-colors underline underline-offset-2">
            View Terms only
          </a>
        </p>
      </motion.div>
    </div>
  );
}
