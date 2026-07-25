"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  Code2, Flame, BookOpen, Building2,
  Target, CheckCircle2, TrendingUp, Clock,
} from "lucide-react";
import { getDailyQuote, dashboardQuotes } from "@/lib/quotes";

const DashboardCanvas = dynamic(
  () => import("@/components/three/DashboardCanvas"),
  { ssr: false }
);

interface DashData {
  user: { name: string; photoUrl: string; currentStreak: number; longestStreak: number; dailyGoal: number };
  totalSolved: number;
  topicsTouched: number;
  companiesPrepping: number;
  todaySolved: number;
  recentActivity: { date: string; problemsSolvedThatDay: number }[];
  topicProgress: { name: string; fullName: string; problemsSolved: number }[];
}

function SkeletonStat() {
  return <div className="glass-card p-6"><div className="skeleton h-4 w-24 rounded mb-3" /><div className="skeleton h-10 w-16 rounded" /></div>;
}

function AnimatedNumber({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <>{val}</>;
}

const CARD_VARIANTS: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const } }),
};

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const quote = getDailyQuote(dashboardQuotes);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  const goalPct = data
    ? Math.min(100, Math.round((data.todaySolved / (data.user.dailyGoal || 5)) * 100))
    : 0;
  const goalMet = data ? data.todaySolved >= data.user.dailyGoal : false;

  const statCards = data
    ? [
        {
          label: "Total Solved",
          value: data.totalSolved,
          icon: Code2,
          color: "text-violet-400",
          bg: "from-violet-500/20 to-violet-500/5",
          border: "border-violet-500/20",
        },
        {
          label: "Day Streak 🔥",
          value: data.user.currentStreak,
          icon: Flame,
          color: "text-amber-400",
          bg: "from-amber-500/20 to-amber-500/5",
          border: "border-amber-500/20",
        },
        {
          label: "Topics Touched",
          value: data.topicsTouched,
          icon: BookOpen,
          color: "text-cyan-400",
          bg: "from-cyan-500/20 to-cyan-500/5",
          border: "border-cyan-500/20",
          suffix: `/ 12`,
        },
        {
          label: "Companies Prepping",
          value: data.companiesPrepping,
          icon: Building2,
          color: "text-emerald-400",
          bg: "from-emerald-500/20 to-emerald-500/5",
          border: "border-emerald-500/20",
        },
      ]
    : [];

  return (
    <div className="relative min-h-screen bg-[#0D0F1A]">
      {/* Subtle wave background */}
      <div className="absolute inset-0 z-0 h-64 top-0 opacity-60 pointer-events-none">
        <DashboardCanvas />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">

        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {loading ? (
              <span className="skeleton inline-block w-48 h-8 rounded" />
            ) : (
              <>Good {getGreeting()}, {data?.user.name?.split(" ")[0]} 👋</>
            )}
          </h1>
          <p className="text-[#94A3B8] mt-1 text-sm">Here&apos;s your placement prep overview.</p>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading
            ? Array(4).fill(0).map((_, i) => <SkeletonStat key={i} />)
            : statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  custom={i}
                  variants={CARD_VARIANTS}
                  initial="hidden"
                  animate="visible"
                  className={`glass-card p-5 border ${card.border} bg-gradient-to-br ${card.bg}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-[#94A3B8] font-medium">{card.label}</p>
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <p className={`text-4xl font-bold ${card.color}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    <AnimatedNumber target={card.value} />
                    {card.suffix && <span className="text-lg text-[#94A3B8] ml-1">{card.suffix}</span>}
                  </p>
                </motion.div>
              ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT COLUMN (2/3 width) ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Daily Goal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className={`w-5 h-5 ${goalMet ? "text-emerald-400" : "text-violet-400"}`} />
                  <h2 className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Today&apos;s Goal
                  </h2>
                </div>
                {goalMet && (
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Completed!
                  </span>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-3 w-full rounded-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {data?.todaySolved}
                    </span>
                    <span className="text-[#94A3B8]">/ {data?.user.dailyGoal} problems today</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${goalMet ? "bg-emerald-500" : "bg-gradient-to-r from-violet-500 to-cyan-500"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${goalPct}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                    />
                  </div>
                  {goalMet && (
                    <p className="text-emerald-400 text-sm mt-2">
                      Goal complete! Nice work today 🎉
                    </p>
                  )}
                </>
              )}
            </motion.div>

            {/* Topic Progress Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 text-violet-400" />
                <h2 className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Problems by Topic
                </h2>
              </div>
              {loading ? (
                <div className="skeleton h-52 w-full rounded" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data?.topicProgress} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C3AED" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#94A3B8", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#94A3B8", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1A1D2E",
                        border: "1px solid rgba(124,58,237,0.3)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                      formatter={(val: any, _: any, props: any) => [val, props.payload.fullName]}
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    />
                    <Bar dataKey="problemsSolved" radius={[4, 4, 0, 0]} fill="url(#barGradient)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN (1/3 width) ── */}
          <div className="flex flex-col gap-6">

            {/* Daily Quote Card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6 border border-violet-500/25 glow-violet"
            >
              <p className="text-xs text-violet-400 font-medium mb-3 uppercase tracking-wider">
                Today&apos;s Motivation
              </p>
              <p className="text-white font-medium leading-relaxed mb-2">
                &quot;{quote.quote}&quot;
              </p>
              <p className="text-[#94A3B8] text-sm italic">{quote.subtext}</p>
            </motion.div>

            {/* Streak card */}
            {!loading && data && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="glass-card p-6 border border-amber-500/20"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h2 className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Streak</h2>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">Current</p>
                    <p className="text-3xl font-bold text-amber-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      <AnimatedNumber target={data.user.currentStreak} />
                      <span className="text-sm ml-1">days</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#94A3B8] mb-1">Longest</p>
                    <p className="text-3xl font-bold text-[#94A3B8]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {data.user.longestStreak}
                      <span className="text-sm ml-1">days</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-cyan-400" />
                <h2 className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Recent Activity</h2>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="skeleton h-4 w-full rounded" />
                  ))}
                </div>
              ) : data?.recentActivity.length === 0 ? (
                <p className="text-[#94A3B8] text-sm">
                  No problems logged yet. Hit + on the tracker to start! 💪
                </p>
              ) : (
                <div className="space-y-3">
                  {data?.recentActivity.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" />
                        <span className="text-[#94A3B8]">
                          {format(new Date(a.date), "MMM d")}
                        </span>
                      </div>
                      <span className="text-white font-medium">
                        {a.problemsSolvedThatDay} problems
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
