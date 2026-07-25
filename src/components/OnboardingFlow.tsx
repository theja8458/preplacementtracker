"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  List, Type, Link2, Layers, GitBranch, Network,
  Cpu, RefreshCw, Zap, ArrowUpDown, Code2, Hash,
  ChevronRight, ChevronLeft, Check,
} from "lucide-react";

const TOPICS = [
  // Tier 1 — Fundamentals
  { name: "Arrays",              icon: List },
  { name: "Strings",             icon: Type },
  { name: "Hashing",             icon: Hash },
  { name: "Sorting & Searching", icon: ArrowUpDown },
  // Tier 2 — Core Structures
  { name: "LinkedList",               icon: Link2 },
  { name: "Stacks & Queues",          icon: Layers },
  { name: "Recursion & Backtracking", icon: RefreshCw },
  // Tier 3 — Trees & Graphs
  { name: "Trees",  icon: GitBranch },
  { name: "Graphs", icon: Network },
  // Tier 4 — Advanced
  { name: "Greedy",              icon: Zap },
  { name: "Bit Manipulation",    icon: Code2 },
  { name: "Dynamic Programming", icon: Cpu },
];

const SLIDE = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
};

export default function OnboardingFlow() {
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [goal, setGoal] = useState(5);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const user = session?.user as any;

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const toggleTopic = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const handleStep1Next = async () => {
    setLoading(true);
    await fetch("/api/onboarding/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicNames: selected }),
    });
    setLoading(false);
    goTo(1);
  };

  const handleStep2Next = async () => {
    setLoading(true);
    await fetch("/api/onboarding/goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dailyGoal: goal }),
    });
    setLoading(false);
    // Fetch rank before showing step 3
    const res = await fetch("/api/onboarding/complete");
    const data = await res.json();
    setRank(data.totalUsers);
    goTo(2);
  };

  const handleFinish = async () => {
    setLoading(true);
    await fetch("/api/onboarding/complete", { method: "POST" });
    router.push("/dashboard");
  };

  const steps = ["Pick Topics", "Daily Goal", "You're In!"];

  return (
    <div className="min-h-screen bg-[#0D0F1A] flex flex-col items-center justify-center px-4 py-10">

      {/* Progress bar */}
      <div className="w-full max-w-lg mb-10">
        <div className="flex items-center justify-between mb-3">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i < step
                    ? "bg-gradient-to-br from-violet-500 to-cyan-500 text-white"
                    : i === step
                    ? "bg-violet-600 text-white ring-2 ring-violet-400/40"
                    : "bg-[#1A1D2E] text-[#94A3B8]"
                }`}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span
                className={`text-sm hidden sm:block transition-colors ${
                  i === step ? "text-white font-medium" : "text-[#94A3B8]"
                }`}
              >
                {s}
              </span>
              {i < 2 && (
                <div className={`w-10 sm:w-20 h-[2px] mx-2 rounded transition-all duration-500 ${i < step ? "bg-gradient-to-r from-violet-500 to-cyan-500" : "bg-[#1A1D2E]"}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-[#94A3B8] text-xs text-center">Step {step + 1} of 3</p>
      </div>

      {/* Step content */}
      <div className="w-full max-w-2xl overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">

          {/* ── STEP 1: Topics ── */}
          {step === 0 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <div className="glass-card p-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  What topics are you focusing on?
                </h1>
                <p className="text-[#94A3B8] mb-6">Select the DSA topics you want to track. You can change these later.</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {TOPICS.map(({ name, icon: Icon }) => {
                    const isSelected = selected.includes(name);
                    return (
                      <button
                        key={name}
                        onClick={() => toggleTopic(name)}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 text-sm font-medium ${
                          isSelected
                            ? "border-violet-500 bg-violet-500/15 text-white shadow-lg shadow-violet-500/10"
                            : "border-white/10 bg-white/5 text-[#94A3B8] hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        <Icon className={`w-5 h-5 ${isSelected ? "text-violet-400" : ""}`} />
                        <span className="text-center leading-tight">{name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => goTo(1)}
                    className="text-[#94A3B8] text-sm hover:text-white transition-colors"
                  >
                    Skip for now
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStep1Next}
                    disabled={loading}
                    className="btn-gradient flex items-center gap-2 px-6 py-3 rounded-xl font-semibold disabled:opacity-60"
                  >
                    {loading ? "Saving..." : `Next → ${selected.length > 0 ? `(${selected.length} selected)` : ""}`}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Daily Goal ── */}
          {step === 1 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <div className="glass-card p-8 text-center">
                <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  How many problems will you solve per day?
                </h1>
                <p className="text-[#94A3B8] mb-10">Set a realistic daily target. You can change this anytime.</p>

                {/* Big number display */}
                <motion.div
                  key={goal}
                  initial={{ scale: 0.85, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-8xl font-bold gradient-text mb-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {goal}
                </motion.div>
                <p className="text-[#94A3B8] mb-10">problems / day</p>

                {/* Styled slider */}
                <div className="relative mx-auto max-w-sm mb-4">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={goal}
                    onChange={(e) => setGoal(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #7C3AED ${((goal - 1) / 19) * 100}%, #1A1D2E ${((goal - 1) / 19) * 100}%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-[#94A3B8] mt-2">
                    <span>1</span>
                    <span>Easy (5)</span>
                    <span>Moderate (10)</span>
                    <span>20</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-10">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    onClick={() => goTo(0)}
                    className="flex items-center gap-1 text-[#94A3B8] hover:text-white transition-colors px-4 py-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStep2Next}
                    disabled={loading}
                    className="btn-gradient flex items-center gap-2 px-6 py-3 rounded-xl font-semibold disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Next →"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: You're In! ── */}
          {step === 2 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <motion.div
                className="glass-card p-10 text-center glow-violet"
                initial={{ scale: 0.92 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                {/* Confetti dots */}
                <div className="flex justify-center gap-1 mb-6">
                  {["bg-violet-400","bg-cyan-400","bg-amber-400","bg-pink-400","bg-emerald-400"].map((c, i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full ${c}`}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.08 }}
                    />
                  ))}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  You&apos;re on the leaderboard! 🎉
                </h1>

                {/* User photo + name */}
                {user?.image && (
                  <motion.div
                    className="flex flex-col items-center gap-3 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 blur-md opacity-60" />
                      <Image
                        src={user.image}
                        alt={user.name || "Profile"}
                        width={80}
                        height={80}
                        className="relative rounded-full border-2 border-white/20"
                      />
                    </div>
                    <p className="text-xl font-semibold">{user.name}</p>
                    {rank && (
                      <p className="text-[#94A3B8] text-sm">
                        Starting rank:{" "}
                        <span className="gradient-text font-bold text-base">#{rank}</span>
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Motivational quote */}
                <motion.div
                  className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-5 mb-8 mx-auto max-w-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-white text-base font-medium mb-1">
                    &quot;The only difference between you and the placed student is they actually opened LeetCode today. 🚀&quot;
                  </p>
                  <p className="text-[#94A3B8] text-sm italic">
                    Be that person. Today.
                  </p>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleFinish}
                  disabled={loading}
                  className="btn-gradient inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg disabled:opacity-60"
                >
                  {loading ? "Loading..." : "Go to Dashboard →"}
                  {!loading && <ChevronRight className="w-5 h-5" />}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
