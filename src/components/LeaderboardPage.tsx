"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Flame,
  Eye,
  EyeOff,
  Crown,
  TrendingUp,
  Calendar,
  Users,
  Zap,
  Star,
  ArrowLeft,
  Code2,
} from "lucide-react";
import { getDailyQuote, leaderboardQuotes } from "@/lib/quotes";
import Image from "next/image";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  fullName: string;
  photoUrl: string;
  totalSolved: number;
  currentStreak: number;
  isMe: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  myEntry: LeaderboardEntry | null;
  totalUsers: number;
  mode: string;
}

type Mode = "alltime" | "weekly";

/* ─── helpers ────────────────────────────────────────────── */

function getDisplayName(entry: LeaderboardEntry, anonymous: boolean) {
  return anonymous ? `Student #${entry.rank}` : entry.displayName;
}

function Avatar({
  entry,
  size = 40,
  anonymous,
}: {
  entry: LeaderboardEntry;
  size?: number;
  anonymous: boolean;
}) {
  const name = getDisplayName(entry, anonymous);
  if (entry.photoUrl && !anonymous) {
    return (
      <Image
        src={entry.photoUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover ring-2 ring-white/20"
      />
    );
  }
  return (
    <div
      className="rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold ring-2 ring-white/20"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {name[0]?.toUpperCase()}
    </div>
  );
}

/* ─── skeleton ───────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
      <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-28 rounded bg-white/10" />
        <div className="h-2 w-full rounded-full bg-white/10" />
      </div>
      <div className="h-6 w-10 rounded bg-white/10" />
    </div>
  );
}

/* ─── podium card (top 3) ────────────────────────────────── */
const podiumConfig = {
  1: {
    gradient: "from-yellow-400/30 via-amber-400/20 to-yellow-600/10",
    border: "border-yellow-400/40",
    glow: "shadow-yellow-500/20",
    badgeBg: "from-yellow-400 to-amber-500",
    badgeShadow: "shadow-yellow-500/40",
    icon: <Crown className="w-5 h-5 text-yellow-900" />,
    label: "Champion",
    labelColor: "text-yellow-400",
    order: 2, // center
  },
  2: {
    gradient: "from-slate-300/20 via-slate-400/10 to-slate-500/5",
    border: "border-slate-400/30",
    glow: "shadow-slate-400/10",
    badgeBg: "from-slate-300 to-slate-400",
    badgeShadow: "shadow-slate-400/30",
    icon: <Star className="w-5 h-5 text-slate-700" />,
    label: "Runner Up",
    labelColor: "text-slate-300",
    order: 1, // left
  },
  3: {
    gradient: "from-amber-700/20 via-amber-600/10 to-amber-800/5",
    border: "border-amber-600/30",
    glow: "shadow-amber-600/10",
    badgeBg: "from-amber-600 to-amber-700",
    badgeShadow: "shadow-amber-600/30",
    icon: <Trophy className="w-5 h-5 text-amber-200" />,
    label: "3rd Place",
    labelColor: "text-amber-500",
    order: 3, // right
  },
} as const;

function PodiumCard({
  entry,
  anonymous,
  maxSolved,
}: {
  entry: LeaderboardEntry;
  anonymous: boolean;
  maxSolved: number;
}) {
  const rank = entry.rank as 1 | 2 | 3;
  const cfg = podiumConfig[rank];
  const isFirst = rank === 1;
  const name = getDisplayName(entry, anonymous);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: rank * 0.1, duration: 0.5, ease: "easeOut" }}
      style={{ order: cfg.order }}
      className={`relative flex flex-col items-center p-5 rounded-2xl border backdrop-blur-sm
        bg-gradient-to-b ${cfg.gradient} ${cfg.border}
        shadow-xl ${cfg.glow}
        ${isFirst ? "pt-7 pb-6 flex-1 min-w-[160px]" : "pt-5 pb-4 flex-1 min-w-[140px]"}
      `}
    >
      {/* Rank badge */}
      <div
        className={`w-10 h-10 rounded-full bg-gradient-to-br ${cfg.badgeBg}
          flex items-center justify-center shadow-lg ${cfg.badgeShadow} mb-3`}
      >
        {cfg.icon}
      </div>

      {/* Avatar */}
      <div className="relative mb-2">
        <Avatar
          entry={entry}
          size={isFirst ? 64 : 52}
          anonymous={anonymous}
        />
        {entry.currentStreak > 0 && (
          <span className="absolute -bottom-1 -right-1 bg-[#0D0F1A] rounded-full px-1.5 py-0.5 text-[10px] flex items-center gap-0.5 border border-white/10">
            🔥{entry.currentStreak}
          </span>
        )}
        {entry.isMe && (
          <span className="absolute -top-2 -right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow">
            YOU
          </span>
        )}
      </div>

      {/* Name */}
      <p
        className={`font-bold text-center text-sm leading-tight mb-0.5 ${
          entry.isMe ? "text-violet-300" : "text-white"
        }`}
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {name}
      </p>
      <p className={`text-[11px] font-medium mb-3 ${cfg.labelColor}`}>
        {cfg.label}
      </p>

      {/* Score */}
      <p
        className={`text-2xl font-black mb-0.5 ${
          isFirst ? "gradient-text" : "text-white"
        }`}
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {entry.totalSolved}
      </p>
      <p className="text-[10px] text-[#94A3B8]">problems solved</p>

      {/* Mini progress bar */}
      <div className="w-full mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${cfg.badgeBg}`}
          initial={{ width: 0 }}
          animate={{
            width: maxSolved > 0 ? `${(entry.totalSolved / maxSolved) * 100}%` : "0%",
          }}
          transition={{ duration: 0.8, delay: rank * 0.1 + 0.3, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

/* ─── rank row (4th+) ────────────────────────────────────── */
function RankRow({
  entry,
  index,
  anonymous,
  maxSolved,
}: {
  entry: LeaderboardEntry;
  index: number;
  anonymous: boolean;
  maxSolved: number;
}) {
  const name = getDisplayName(entry, anonymous);
  const pct = maxSolved > 0 ? (entry.totalSolved / maxSolved) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
      className={`relative flex items-center gap-4 px-5 py-3.5 rounded-2xl border transition-all
        ${
          entry.isMe
            ? "bg-gradient-to-r from-violet-500/15 to-cyan-500/10 border-violet-500/40 shadow-lg shadow-violet-500/10"
            : "bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.07] hover:border-white/10"
        }`}
    >
      {entry.isMe && (
        <span className="absolute -top-2 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow">
          YOU
        </span>
      )}

      {/* Rank number */}
      <div className="w-8 shrink-0 text-center">
        <span className="text-sm font-bold text-[#475569]">#{entry.rank}</span>
      </div>

      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar entry={entry} size={36} anonymous={anonymous} />
        {entry.currentStreak > 0 && (
          <span className="absolute -bottom-1 -right-1 bg-[#0D0F1A] rounded-full px-1 text-[9px] border border-white/10">
            🔥{entry.currentStreak}
          </span>
        )}
      </div>

      {/* Name + progress bar */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate ${
            entry.isMe ? "text-violet-300" : "text-white"
          }`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {name}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{
                duration: 0.7,
                delay: index * 0.06 + 0.2,
                ease: "easeOut",
              }}
            />
          </div>
          <span className="text-[10px] text-[#64748B] shrink-0 w-7 text-right font-medium">
            {Math.round(pct)}%
          </span>
        </div>
      </div>

      {/* Score — prominent pill so it never blends in */}
      <div className="shrink-0 ml-2 flex flex-col items-center gap-0.5">
        <div
          className={`px-2.5 py-1 rounded-lg text-sm font-black tabular-nums ${
            entry.isMe
              ? "text-white"
              : "text-white"
          }`}
          style={
            entry.isMe
              ? { background: "linear-gradient(135deg, rgba(124,58,237,0.5), rgba(6,182,212,0.35))", border: "1px solid rgba(139,92,246,0.4)" }
              : { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }
          }
        >
          {entry.totalSolved}
        </div>
        <span className="text-[9px] text-[#475569] font-medium tracking-wide">solved</span>
      </div>
    </motion.div>
  );
}

/* ─── stat card ──────────────────────────────────────────── */
function StatCard({
  icon,
  label,
  value,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="glass-card px-5 py-4 flex items-center gap-3 flex-1 min-w-0"
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/20 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-[#94A3B8] mb-0.5">{label}</p>
        <p
          className="text-lg font-bold text-white truncate"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── main component ─────────────────────────────────────── */
export default function LeaderboardPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("alltime");
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [anonymous, setAnonymous] = useState(false);

  const quote = getDailyQuote(leaderboardQuotes);

  const fetchLeaderboard = useCallback(async (m: Mode) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?mode=${m}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(mode);
  }, [mode, fetchLeaderboard]);

  const top3 = data?.leaderboard.slice(0, 3) ?? [];
  const rest = data?.leaderboard.slice(3) ?? [];
  const maxSolved = data?.leaderboard[0]?.totalSolved ?? 1;

  const topStreak = data?.leaderboard.reduce(
    (best, e) => (e.currentStreak > best ? e.currentStreak : best),
    0
  ) ?? 0;

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-10 overflow-hidden">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -top-16 right-0 w-72 h-72 bg-cyan-500/8 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 w-64 h-64 bg-violet-500/6 rounded-full blur-3xl -translate-x-1/2" />

      {/* ── Header ── */}
      <div className="mb-8 relative">
        {/* Back button */}
        <button
          onClick={() => router.push("/tracker")}
          className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white transition-colors mb-5 group"
        >
          <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
            <ArrowLeft className="w-3.5 h-3.5" />
          </span>
          <span>Back to Tracker</span>
          <Code2 className="w-3.5 h-3.5 opacity-50" />
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-4xl font-black mb-1 gradient-text"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Leaderboard
          </h1>
          <p className="text-[#94A3B8] text-sm flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {data?.totalUsers ?? "—"}{" "}
            {data?.totalUsers === 1 ? "student" : "students"} competing
          </p>
        </div>

        <button
          onClick={() => setAnonymous((a) => !a)}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-[#94A3B8] hover:text-white hover:border-violet-500/40 hover:bg-violet-500/10 transition-all"
        >
          {anonymous ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {anonymous ? "Show names" : "Go anonymous"}
        </button>
        </div>
      </div>

      {/* ── Stat summary cards ── */}
      <div className="flex gap-3 flex-wrap sm:flex-nowrap mb-8">
        <StatCard
          icon={<Users className="w-4 h-4 text-violet-400" />}
          label="Total students"
          value={data?.totalUsers ?? "—"}
          delay={0.05}
        />
        <StatCard
          icon={<Zap className="w-4 h-4 text-cyan-400" />}
          label="Most problems solved"
          value={maxSolved > 0 ? maxSolved : "—"}
          delay={0.1}
        />
        <StatCard
          icon={<Flame className="w-4 h-4 text-amber-400" />}
          label="Longest active streak"
          value={topStreak > 0 ? `${topStreak} ${topStreak === 1 ? "day" : "days"} 🔥` : "—"}
          delay={0.15}
        />
      </div>

      {/* ── Tab toggle ── */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 mb-8 w-fit">
        {(["alltime", "weekly"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m
                ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/25"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            {m === "alltime" ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            {m === "alltime" ? "All Time" : "This Week"}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Skeleton podium */}
            <div className="flex gap-3 mb-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-52 rounded-2xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <SkeletonRow key={i} />
              ))}
          </motion.div>
        ) : !data || data.leaderboard.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-16 text-center"
          >
            <Trophy className="w-14 h-14 text-[#94A3B8] mx-auto mb-5 opacity-30" />
            <p
              className="text-xl font-bold text-white mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {mode === "weekly" ? "No activity this week yet" : "No rankings yet"}
            </p>
            <p className="text-[#94A3B8] text-sm max-w-sm mx-auto">
              {mode === "weekly"
                ? "Solve at least one problem today to appear on the weekly board!"
                : "Start tracking DSA problems — be the first on the board!"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── Podium (top 3) ── */}
            {top3.length > 0 && (
              <div className="flex gap-3 items-end mb-8">
                {top3.map((entry) => (
                  <PodiumCard
                    key={entry.userId}
                    entry={entry}
                    anonymous={anonymous}
                    maxSolved={maxSolved}
                  />
                ))}
              </div>
            )}

            {/* Divider */}
            {rest.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-[#475569] font-medium px-2">
                  Ranks 4 – {data.leaderboard.length}
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            )}

            {/* ── Rows 4–10 ── */}
            <div className="space-y-2">
              {rest.map((entry, i) => (
                <RankRow
                  key={entry.userId}
                  entry={entry}
                  index={i}
                  anonymous={anonymous}
                  maxSolved={maxSolved}
                />
              ))}
            </div>

            {/* ── Current user outside top 10 ── */}
            {data.myEntry && (
              <>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-[#475569] font-medium px-2">
                    Your position
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <RankRow
                  entry={data.myEntry}
                  index={0}
                  anonymous={anonymous}
                  maxSolved={maxSolved}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quote card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="relative mt-12 rounded-2xl overflow-hidden border border-violet-500/25 p-7"
        style={{
          background:
            "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(6,182,212,0.08) 50%, rgba(139,92,246,0.06) 100%)",
        }}
      >
        {/* Glow blobs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p
              className="text-base font-semibold text-white leading-relaxed mb-1.5"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {quote.quote}
            </p>
            <p className="text-sm text-[#94A3B8] italic">{quote.subtext}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
