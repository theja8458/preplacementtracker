"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ExternalLink, Plus, Flame, ChevronDown, BookOpen, X, Compass, Layers } from "lucide-react";
import { getTopicQuote } from "@/lib/quotes";
import { topicProblems, type Difficulty } from "@/lib/questions";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────
type TopicTier = "fundamentals" | "core" | "trees-graphs" | "advanced";

interface TopicData {
  _id: string;
  name: string;
  order: number;
  tier: TopicTier;
  resourceLinks: { title: string; url: string }[];
  problemsSolved: number;
}

interface TrackerData {
  topics: TopicData[];
  totalSolved: number;
  currentStreak: number;
  longestStreak: number;
}

// ── Tier configuration ─────────────────────────────────────────────────────
const TIERS: {
  key: TopicTier;
  label: string;
  emoji: string;
  accent: string;
  border: string;
  badge: string;
}[] = [
  {
    key: "fundamentals",
    label: "Fundamentals",
    emoji: "🧱",
    accent: "text-cyan-400",
    border: "border-cyan-500/20",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  {
    key: "core",
    label: "Core Structures",
    emoji: "⚙️",
    accent: "text-violet-400",
    border: "border-violet-500/20",
    badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  {
    key: "trees-graphs",
    label: "Trees & Graphs",
    emoji: "🌳",
    accent: "text-emerald-400",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    key: "advanced",
    label: "Advanced",
    emoji: "🚀",
    accent: "text-amber-400",
    border: "border-amber-500/20",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
];

const SOFT_TARGET = 30;

// ── Sub-components ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="skeleton h-5 w-2/3 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-10 w-1/3 rounded" />
      <div className="skeleton h-2 w-full rounded-full" />
      <div className="skeleton h-8 w-full rounded" />
    </div>
  );
}

function ProgressBar({ value, animated }: { value: number; animated: boolean }) {
  const pct = Math.min(100, (value / SOFT_TARGET) * 100);
  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
        initial={{ width: 0 }}
        animate={{ width: animated ? `${pct}%` : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

// ── Topic card ─────────────────────────────────────────────────────────────
function TopicCard({
  topic,
  cardIndex,
  expandedTopicId,
  inputVals,
  pending,
  animated,
  onToggleProblems,
  onUpdateProgress,
  onExactSubmit,
  onInputChange,
}: {
  topic: TopicData;
  cardIndex: number;
  expandedTopicId: string | null;
  inputVals: Record<string, string>;
  pending: Record<string, boolean>;
  animated: boolean;
  onToggleProblems: (id: string) => void;
  onUpdateProgress: (id: string, opts: { increment?: number; exactValue?: number }) => void;
  onExactSubmit: (id: string) => void;
  onInputChange: (id: string, val: string) => void;
}) {
  const quote = getTopicQuote(topic.name);
  const pct = Math.min(100, Math.round((topic.problemsSolved / SOFT_TARGET) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: cardIndex * 0.07, duration: 0.45, ease: "easeOut" }}
      className="glass-card p-6 flex flex-col gap-4"
    >
      {/* Topic name + quote */}
      <div>
        <h2
          className="text-lg font-bold mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {topic.name}
        </h2>
        <p className="text-xs text-[#94A3B8] italic leading-relaxed">
          {quote.quote}
        </p>
      </div>

      {/* Problems solved + progress */}
      <div>
        <div className="flex items-end gap-1 mb-2">
          <span
            className="text-4xl font-bold gradient-text"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {topic.problemsSolved}
          </span>
          <span className="text-[#94A3B8] text-sm mb-1">/ {SOFT_TARGET} goal</span>
        </div>
        <ProgressBar value={topic.problemsSolved} animated={animated} />
        <p className="text-xs text-[#94A3B8] mt-1">{pct}% of goal</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateProgress(topic._id, { increment: 1 })}
          disabled={pending[topic._id]}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-violet-500/20"
        >
          <Plus className="w-5 h-5" />
        </button>
        <input
          type="number"
          min={0}
          placeholder="Set exact..."
          value={inputVals[topic._id] ?? ""}
          onChange={(e) => onInputChange(topic._id, e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onExactSubmit(topic._id)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-violet-500/50 transition"
        />
        <button
          onClick={() => onExactSubmit(topic._id)}
          disabled={pending[topic._id] || !inputVals[topic._id]}
          className="text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[#94A3B8] hover:text-white hover:border-white/20 transition disabled:opacity-40"
        >
          Set
        </button>
      </div>

      {/* Resource links */}
      {topic.resourceLinks?.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
          {topic.resourceLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition"
            >
              <ExternalLink className="w-3 h-3" />
              {link.title}
            </a>
          ))}
        </div>
      )}

      {/* Problems toggle */}
      {topicProblems[topic.name] && (
        <div className="border-t border-white/5 pt-3">
          <button
            onClick={() => onToggleProblems(topic._id)}
            className="w-full flex items-center justify-between text-sm text-[#94A3B8] hover:text-white transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Practice Problems ({topicProblems[topic.name].length})
            </span>
            <motion.div
              animate={{ rotate: expandedTopicId === topic._id ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          <AnimatePresence>
            {expandedTopicId === topic._id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2">
                  {topicProblems[topic.name].map((problem, pi) => (
                    <a
                      key={pi}
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition group"
                    >
                      <span className="text-xs text-white group-hover:text-violet-300 transition leading-snug flex-1 mr-2">
                        {problem.title}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          problem.difficulty === "Easy"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : problem.difficulty === "Medium"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {problem.difficulty}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          problem.platform === "LeetCode"
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-green-500/20 text-green-400"
                        }`}>
                          {problem.platform === "LeetCode" ? "LC" : "GFG"}
                        </span>
                        <ExternalLink className="w-3 h-3 text-[#94A3B8] group-hover:text-white transition" />
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// ── Tier section header ────────────────────────────────────────────────────
function TierHeader({
  tier,
  topics,
}: {
  tier: typeof TIERS[number];
  topics: TopicData[];
}) {
  const started = topics.filter((t) => t.problemsSolved > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex items-center gap-3 mt-8 mb-4 first:mt-0"
    >
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xl leading-none">{tier.emoji}</span>
        <h2
          className={`text-base font-bold ${tier.accent}`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {tier.label}
        </h2>
        <span
          className={`ml-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${tier.badge}`}
        >
          {started} / {topics.length} started
        </span>
      </div>
      <div className="flex-1 h-px bg-white/8" />
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function TrackerPage() {
  const [data, setData] = useState<TrackerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animated, setAnimated] = useState(false);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [inputVals, setInputVals] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const didAnimate = useRef(false);
  const [showFoundationBanner, setShowFoundationBanner] = useState(false);
  const [showBeginnerHint, setShowBeginnerHint] = useState(false);

  const DISMISS_KEY = "foundations_banner_dismissed";

  const toggleProblems = (topicId: string) =>
    setExpandedTopicId((prev) => (prev === topicId ? null : topicId));

  useEffect(() => {
    fetch("/api/tracker")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
        setTimeout(() => { setAnimated(true); didAnimate.current = true; }, 300);
        // Show beginner hint if total solved < 10
        if ((d.totalSolved ?? 0) < 10) {
          setShowBeginnerHint(true);
        }
      });
  }, []);

  // Foundation banner (separate, dismissible)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    fetch("/api/foundations")
      .then((r) => r.json())
      .then((d) => {
        if ((d.totalCompleted ?? 0) < 15) {
          setShowFoundationBanner(true);
        }
      })
      .catch(() => {});
  }, []);

  const updateProgress = async (
    topicId: string,
    opts: { increment?: number; exactValue?: number }
  ) => {
    if (!data) return;

    setData((prev) => {
      if (!prev) return prev;
      const topics = prev.topics.map((t) => {
        if (t._id !== topicId) return t;
        const newVal =
          opts.exactValue !== undefined
            ? Math.max(0, opts.exactValue)
            : Math.max(0, t.problemsSolved + (opts.increment ?? 1));
        return { ...t, problemsSolved: newVal };
      });
      const totalSolved = topics.reduce((s, t) => s + t.problemsSolved, 0);
      return { ...prev, topics, totalSolved };
    });

    setPending((p) => ({ ...p, [topicId]: true }));

    try {
      const res = await fetch(`/api/tracker/${topicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opts),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Progress updated ✓");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setPending((p) => ({ ...p, [topicId]: false }));
    }
  };

  const handleExactSubmit = (topicId: string) => {
    const val = parseInt(inputVals[topicId] ?? "0", 10);
    if (isNaN(val)) return;
    updateProgress(topicId, { exactValue: val });
    setInputVals((prev) => ({ ...prev, [topicId]: "" }));
  };

  // Group topics by tier (topics already sorted by `order` from API)
  const topicsByTier = TIERS.reduce<Record<TopicTier, TopicData[]>>((acc, t) => {
    acc[t.key] = [];
    return acc;
  }, {} as Record<TopicTier, TopicData[]>);

  data?.topics.forEach((topic) => {
    const tier = (topic.tier ?? "fundamentals") as TopicTier;
    topicsByTier[tier]?.push(topic);
  });

  // ── Skeleton ──
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="skeleton h-8 w-48 rounded mb-2" />
        <div className="skeleton h-4 w-64 rounded mb-10" />
        {TIERS.map((tier) => (
          <div key={tier.key} className="mb-8">
            <div className="skeleton h-5 w-40 rounded mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array(tier.key === "fundamentals" ? 4 : tier.key === "core" ? 3 : tier.key === "trees-graphs" ? 2 : 3)
                .fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Foundation banner */}
      <AnimatePresence>
        {showFoundationBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border border-violet-500/25 bg-violet-500/8"
          >
            <Compass className="w-4 h-4 text-violet-400 shrink-0" />
            <p className="text-sm text-[#94A3B8] flex-1">
              New to DSA?{" "}
              <Link href="/foundations" className="text-violet-300 hover:underline font-medium">
                Build your basics first → Foundations
              </Link>
            </p>
            <button
              onClick={() => {
                setShowFoundationBanner(false);
                localStorage.setItem(DISMISS_KEY, "1");
              }}
              className="text-[#64748B] hover:text-white transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            DSA Tracker
          </h1>
          <p className="text-[#94A3B8] text-sm">
            Total problems solved:{" "}
            <span className="gradient-text font-bold text-lg">{data.totalSolved}</span>
          </p>
        </div>

        {/* Streak badge */}
        <div className="flex items-center gap-4">
          <div className="glass-card px-5 py-3 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm text-[#94A3B8] leading-none">Current streak</p>
              <p className="text-xl font-bold text-amber-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {data.currentStreak} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Beginner hint — shown only when totalSolved < 10 */}
      <AnimatePresence>
        {showBeginnerHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
              style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)" }}>
              <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
              <p className="text-sm text-[#94A3B8] flex-1">
                <span className="text-cyan-300 font-medium">New here?</span>{" "}
                Work through <span className="text-cyan-300">🧱 Fundamentals</span> first, then move down the tiers.
              </p>
              <button
                onClick={() => setShowBeginnerHint(false)}
                className="text-[#64748B] hover:text-white transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {data.topics.every((t) => t.problemsSolved === 0) ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center mb-8"
        >
          <div className="text-5xl mb-4">💪</div>
          <p className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            No problems logged yet
          </p>
          <p className="text-[#94A3B8] text-sm mb-6 max-w-sm mx-auto">
            Start with <span className="text-cyan-300 font-semibold">🧱 Fundamentals</span> below. New to DSA?{" "}
            <Link href="/foundations" className="text-violet-300 hover:underline">Start with Foundations first →</Link>
          </p>
        </motion.div>
      ) : null}

      {/* ── Tiered topic sections ── */}
      {TIERS.map((tier) => {
        const tierTopics = topicsByTier[tier.key];
        if (tierTopics.length === 0) return null;

        return (
          <div key={tier.key}>
            <TierHeader tier={tier} topics={tierTopics} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
              {tierTopics.map((topic, i) => (
                <TopicCard
                  key={topic._id}
                  topic={topic}
                  cardIndex={i}
                  expandedTopicId={expandedTopicId}
                  inputVals={inputVals}
                  pending={pending}
                  animated={animated}
                  onToggleProblems={toggleProblems}
                  onUpdateProgress={updateProgress}
                  onExactSubmit={handleExactSubmit}
                  onInputChange={(id, val) =>
                    setInputVals((prev) => ({ ...prev, [id]: val }))
                  }
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
