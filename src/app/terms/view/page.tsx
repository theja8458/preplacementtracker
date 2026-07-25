import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { TERMS_MARKDOWN } from "@/lib/terms-content";
import { CURRENT_TERMS_VERSION } from "@/lib/constants";
import { ScrollText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | PlacementPrep",
  description: "Terms and Conditions for the Placement Prep Tracker for SVCE MCA students.",
};

export default function TermsViewPage() {
  return (
    <div
      className="min-h-screen bg-[#0D0F1A] px-4 py-12"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-violet-600/8 blur-[120px]" />
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
            <ScrollText className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Terms &amp; Conditions
            </h1>
            <p className="text-xs text-[#475569] mt-0.5">Version {CURRENT_TERMS_VERSION}</p>
          </div>
        </div>

        {/* Content card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-8 py-8 shadow-xl shadow-black/30">
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

        {/* Footer note */}
        <p className="text-center text-xs text-[#334155] mt-6">
          This is a read-only view. To accept these terms, please{" "}
          <Link href="/terms" className="text-violet-400/70 hover:text-violet-400 transition-colors underline underline-offset-2">
            sign in and accept
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
