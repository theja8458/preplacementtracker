"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ChevronDown, Lightbulb, CheckSquare, Square,
  Grid3X3, Hash, RefreshCw, LayoutList, Type, GitBranch,
  BookOpen, ChevronUp, Trophy, ArrowRight, X, Terminal
} from "lucide-react";
import Link from "next/link";

/* ── Types ─────────────────────────────────────────────── */
interface Problem {
  _id: string;
  title: string;
  difficulty: "warmup" | "easy" | "core";
  statement: string;
  approachHint: string;
  sampleInput: string;
  sampleOutput: string;
  order: number;
  completed: boolean;
}

interface Category {
  _id: string;
  name: string;
  order: number;
  description: string;
  icon: string;
  problems: Problem[];
  completedCount: number;
}

interface FoundationsData {
  categories: Category[];
  totalProblems: number;
  totalCompleted: number;
}

/* ── Constants ─────────────────────────────────────────── */
const GRAD_UNLOCK_THRESHOLD = 30;

const ICON_MAP: Record<string, React.ElementType> = {
  Grid3x3: Grid3X3,
  Hash,
  RefreshCw,
  LayoutList,
  Type,
  GitBranch,
};

const DIFF_STYLES: Record<string, string> = {
  warmup: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  easy: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  core: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

const FRAMEWORK_STEPS = [
  { num: "01", title: "Understand", desc: "Read it twice. Restate the problem in your own words before touching code." },
  { num: "02", title: "Example", desc: "Work through a tiny example by hand (n = 2 or 3). If you can't do it on paper, you can't code it yet." },
  { num: "03", title: "Brute Force First", desc: "Don't chase the optimal solution immediately. Get ANY working solution first, even a slow one." },
  { num: "04", title: "Plan", desc: "Write pseudocode or dry-run steps in plain English before typing real code." },
  { num: "05", title: "Code", desc: "Now translate your plan into code, one small piece at a time." },
  { num: "06", title: "Test Edge Cases", desc: "Empty input, one element, negative numbers, duplicates. Break your own solution before someone else does." },
];

/* ── Skeleton ──────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card p-5 space-y-3">
          <div className="skeleton h-5 w-48 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-2 w-40 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/* ── Problem Card ──────────────────────────────────────── */
function ProblemCard({
  problem,
  onToggle,
}: {
  problem: Problem;
  onToggle: (id: string, completed: boolean) => void;
}) {
  const [hintOpen, setHintOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 transition-all duration-300 ${
        problem.completed
          ? "border-white/5 bg-white/3 opacity-60"
          : "border-white/10 bg-white/5"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(problem._id, !problem.completed)}
            className="mt-0.5 shrink-0 text-violet-400 hover:text-violet-300 transition-colors"
            aria-label={problem.completed ? "Mark as unsolved" : "Mark as solved"}
          >
            {problem.completed ? (
              <CheckSquare className="w-5 h-5 text-teal-400" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-white leading-snug">
                {problem.title}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  DIFF_STYLES[problem.difficulty]
                }`}
              >
                {problem.difficulty}
              </span>
              {problem.completed && (
                <span className="text-[10px] text-teal-400 font-medium">✓ solved</span>
              )}
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {problem.statement}
            </p>
          </div>
        </div>
      </div>

      {/* Sample I/O */}
      <div className="ml-8 mb-3">
        <div className="rounded-lg bg-black/30 border border-white/8 px-3 py-2 font-mono text-[11px] text-[#94A3B8]">
          <div className="mb-1"><span className="text-violet-400">Input:</span> {problem.sampleInput}</div>
          <div>
            <span className="text-teal-400">Output:</span>
            {problem.sampleOutput.includes("\n") ? (
              <div className="mt-1 ml-1 space-y-0.5">
                {problem.sampleOutput.split("\n").map((line, i) => (
                  <div key={i} className="leading-snug">{line}</div>
                ))}
              </div>
            ) : (
              <span className="ml-1">{problem.sampleOutput}</span>
            )}
          </div>
        </div>
      </div>


      {/* Hint toggle */}
      <div className="ml-8">
        <button
          onClick={() => setHintOpen((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] text-amber-400/80 hover:text-amber-400 transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          {hintOpen ? "Hide nudge" : "Need a nudge?"}
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${hintOpen ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence>
          {hintOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="mt-2 text-xs text-amber-300/80 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2 leading-relaxed italic">
                💡 {problem.approachHint}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Category Accordion ────────────────────────────────── */
function CategoryAccordion({
  category,
  onToggleProblem,
  defaultOpen,
}: {
  category: Category;
  onToggleProblem: (id: string, completed: boolean) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = ICON_MAP[category.icon] ?? BookOpen;
  const total = category.problems.length;
  const done = category.completedCount;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = done === total && total > 0;

  return (
    <div className="glass-card overflow-hidden">
      {/* Accordion header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors"
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            allDone
              ? "bg-teal-500/20 border border-teal-500/30"
              : "bg-violet-500/10 border border-violet-500/20"
          }`}
        >
          <Icon
            className={`w-5 h-5 ${allDone ? "text-teal-400" : "text-violet-400"}`}
          />
        </div>

        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-semibold text-white text-sm"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {category.name}
            </span>
            {allDone && (
              <span className="text-[10px] bg-teal-500/20 text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded-full font-semibold">
                ✓ Mastered
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#64748B] truncate">{category.description}</p>
          {/* Mini progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
            <span className="text-[11px] text-[#94A3B8] shrink-0 font-medium">
              {done} / {total}
            </span>
          </div>
        </div>

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-[#64748B]"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      {/* Problems list */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-4">
              {category.problems.map((p) => (
                <ProblemCard key={p._id} problem={p} onToggle={onToggleProblem} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Framework Card ────────────────────────────────────── */
function FrameworkCard() {
  const [open, setOpen] = useState(true);

  return (
    <div className="glass-card overflow-hidden mb-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/20 flex items-center justify-center">
            <BookOpen className="w-4.5 h-4.5 text-violet-400 w-[18px] h-[18px]" />
          </div>
          <div className="text-left">
            <p
              className="font-bold text-white text-sm"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              How to Approach Any Problem
            </p>
            <p className="text-[11px] text-[#64748B]">
              The 6-step framework — same for warmup and hard LeetCode
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 0 : 180 }} transition={{ duration: 0.2 }}>
          <ChevronUp className="w-4 h-4 text-[#64748B]" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="framework"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-white/5 pt-5">
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute left-[22px] top-8 bottom-8 w-px bg-gradient-to-b from-violet-500/40 via-cyan-500/30 to-teal-500/20 hidden sm:block" />

                <div className="space-y-4">
                  {FRAMEWORK_STEPS.map((step, i) => (
                    <motion.div
                      key={step.num}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      className="flex items-start gap-4"
                    >
                      <div
                        className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/25 flex items-center justify-center shrink-0 relative z-10"
                      >
                        <span
                          className="text-[13px] font-bold gradient-text"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {step.num}
                        </span>
                      </div>
                      <div className="pt-1">
                        <p className="text-sm font-semibold text-white mb-0.5">{step.title}</p>
                        <p className="text-[12px] text-[#94A3B8] leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <p className="mt-5 text-[11px] text-[#64748B] italic border-t border-white/5 pt-4">
                This is the same process for a warm-up question and a hard LeetCode problem. The problems get harder — the process doesn't change.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function FoundationsPage() {
  const [data, setData] = useState<FoundationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [shownCategoryToasts, setShownCategoryToasts] = useState<Set<string>>(new Set());
  const [consoleCardDismissed, setConsoleCardDismissed] = useState(true);

  useEffect(() => {
    setConsoleCardDismissed(localStorage.getItem("dismissed_console_card") === "true");
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/foundations");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleProblem = async (problemId: string, completed: boolean) => {
    if (!data) return;

    // Optimistic update
    const newCategories = data.categories.map((cat) => {
      const newProblems = cat.problems.map((p) =>
        p._id === problemId ? { ...p, completed } : p
      );
      const completedCount = newProblems.filter((p) => p.completed).length;
      return { ...cat, problems: newProblems, completedCount };
    });
    const totalCompleted = newCategories.reduce((s, c) => s + c.completedCount, 0);
    setData({ ...data, categories: newCategories, totalCompleted });

    if (completed) {
      toast.success("Nice, one step closer 💪", { duration: 2500 });
    }

    // Check if a category was just completed
    newCategories.forEach((cat) => {
      if (
        cat.completedCount === cat.problems.length &&
        cat.problems.length > 0 &&
        !shownCategoryToasts.has(cat._id)
      ) {
        const prob = cat.problems.find((p) => p._id === problemId);
        if (prob) {
          setTimeout(() => {
            toast.success(`${cat.name} mastered! Ready for the real thing 🚀`, {
              duration: 4000,
            });
          }, 800);
          setShownCategoryToasts((prev) => new Set(prev).add(cat._id));
        }
      }
    });

    // Persist
    try {
      await fetch(`/api/foundations/${problemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
    } catch {
      toast.error("Failed to save. Try again.");
    }
  };

  const totalCompleted = data?.totalCompleted ?? 0;
  const totalProblems = data?.totalProblems ?? 0;
  const overallPct = totalProblems > 0 ? Math.round((totalCompleted / totalProblems) * 100) : 0;
  const showReadyBanner = totalCompleted >= GRAD_UNLOCK_THRESHOLD;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🧭</span>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Start Here
          </h1>
        </div>
        <p className="text-[#94A3B8] text-sm max-w-xl">
          Build your problem-solving muscle before jumping into LeetCode. Work through these
          guided problems, self-track your progress, and learn{" "}
          <span className="text-violet-300 font-medium">how</span> to think through any challenge.
        </p>
      </motion.div>

      {/* Framework Card */}
      <FrameworkCard />

      {/* Overall progress */}
      {!loading && data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white">
              Overall Progress
            </span>
            <span className="text-sm text-[#94A3B8]">
              <span className="gradient-text font-bold text-base">{totalCompleted}</span>
              {" "}/ {totalProblems} foundations completed
            </span>
          </div>
          <div className="w-full h-3 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 via-cyan-500 to-teal-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            />
          </div>
          <p className="text-xs text-[#64748B] mt-1">{overallPct}% complete</p>
        </motion.div>
      )}

      {/* Ready to level up banner */}
      <AnimatePresence>
        {showReadyBanner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="mb-6 rounded-2xl border border-teal-500/30 bg-teal-500/10 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <Trophy className="w-7 h-7 text-teal-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-teal-300">
                You've built solid fundamentals! 🎉
              </p>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Time to try LeetCode/GeeksforGeeks — check the Tracker for curated problems by topic.
              </p>
            </div>
            <Link
              href="/tracker"
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold transition-colors"
            >
              Go to Tracker <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code Console Teaser Banner */}
      <AnimatePresence>
        {totalCompleted >= 5 && !consoleCardDismissed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="relative rounded-2xl border border-violet-500/30 bg-violet-500/10 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={() => {
                  setConsoleCardDismissed(true);
                  localStorage.setItem("dismissed_console_card", "true");
                }}
                className="absolute top-2 right-2 text-[#64748B] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <Terminal className="w-7 h-7 text-violet-400 shrink-0" />
              <div className="flex-1 min-w-0 pr-6">
                <p className="text-sm font-semibold text-violet-300">
                  Want to test your code without leaving the app?
                </p>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Code Console is coming soon.
                </p>
              </div>
              <Link
                href="/console"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-sm font-semibold transition-colors mt-2 sm:mt-0"
              >
                See Preview <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      {loading ? (
        <Skeleton />
      ) : data && data.categories.length > 0 ? (
        <div className="space-y-4">
          {data.categories.map((cat, i) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
            >
              <CategoryAccordion
                category={cat}
                onToggleProblem={handleToggleProblem}
                defaultOpen={i === 0}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-[#94A3B8]">
          <p className="text-lg mb-2">No problems loaded yet.</p>
          <p className="text-sm">
            Run <code className="text-violet-300">npx ts-node scripts/seed-foundations.ts</code> to seed the data.
          </p>
        </div>
      )}
    </div>
  );
}
