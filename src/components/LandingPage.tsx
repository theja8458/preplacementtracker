"use client";
import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Code2, Trophy, MessageSquare, Flame, ChevronRight } from "lucide-react";

const HeroCanvas = dynamic(
  () => import("@/components/three/HeroCanvas"),
  { ssr: false }
);

const features = [
  {
    icon: Code2,
    title: "DSA Tracker",
    desc: "Track problem counts across 12 DSA topics. Build streaks. See your growth over time.",
    gradient: "from-violet-500 to-purple-700",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    desc: "Compete with your batch. Weekly & all-time rankings to keep the energy alive.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: MessageSquare,
    title: "Discuss",
    desc: "Post doubts, share solutions — threaded discussions with code blocks and image uploads.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Flame,
    title: "Streak Tracking",
    desc: "Daily activity builds your streak. Don't break the chain — stay consistent.",
    gradient: "from-orange-500 to-red-600",
  },
];

const stats = [
  { value: 12, label: "DSA Topics", suffix: "" },
  { value: 100, label: "Problems to Track", suffix: "+" },
  { value: 1, label: "Shared Leaderboard", suffix: "" },
];

const steps = [
  { step: "01", title: "Sign in with Google", desc: "One click — no new account needed." },
  { step: "02", title: "Set your daily goal", desc: "Choose how many problems you want per day." },
  { step: "03", title: "Track & compete", desc: "Update progress, climb the leaderboard, discuss doubts." },
];

export default function LandingPage() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    let ScrollTriggerRef: any;

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      ScrollTriggerRef = ScrollTrigger;

      // Feature cards
      if (featuresRef.current) {
        const cards = featuresRef.current.querySelectorAll(".feature-card");
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1, stagger: 0.15, duration: 0.7, ease: "power3.out",
            scrollTrigger: { trigger: featuresRef.current, start: "top 80%" },
          }
        );
      }

      // Steps
      if (stepsRef.current) {
        const items = stepsRef.current.querySelectorAll(".step-item");
        gsap.fromTo(
          items,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, stagger: 0.2, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: stepsRef.current, start: "top 80%" },
          }
        );
      }

      // Stats counters
      stats.forEach((stat, i) => {
        const el = counterRefs.current[i];
        if (!el) return;
        const counter = { value: 0 };
        gsap.to(counter, {
          value: stat.value,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: statsRef.current, start: "top 80%" },
          onUpdate: () => { el.textContent = Math.round(counter.value).toString(); },
        });
      });
    };

    init();
    return () => { ScrollTriggerRef?.killAll(); };
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0F1A] text-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        {/* Three.js background */}
        <div className="absolute inset-0 z-0">
          <HeroCanvas />
        </div>
        {/* Gradient fade-out at bottom */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-[#0D0F1A]/40 to-[#0D0F1A]" />

        {/* Hero content */}
        <motion.div
          className="relative z-[2] text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm mb-8"
          >
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            Built for SVCE MCA Students
          </motion.div>

          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Crack Placements.{" "}
            <span className="gradient-text">Together.</span>
          </h1>

          <p className="text-lg md:text-xl text-[#94A3B8] mb-10 max-w-2xl mx-auto leading-relaxed">
            Track DSA progress, compete on leaderboards, discuss problems —
            built for SVCE MCA students.
          </p>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-gray-800 font-semibold text-lg shadow-2xl hover:shadow-white/10 transition-all duration-200"
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </motion.button>

          <p className="mt-4 text-[#94A3B8] text-sm">
            Free for all SVCE MCA students
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 z-[2] flex flex-col items-center gap-1 text-[#94A3B8] text-xs"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span>Scroll to explore</span>
          <ChevronRight className="rotate-90 w-4 h-4" />
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={featuresRef} className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Everything you need to{" "}
              <span className="gradient-text">get placed</span>
            </h2>
            <p className="text-[#94A3B8] max-w-xl mx-auto">
              One platform built around how MCA students actually prepare for placements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="feature-card glass-card p-8 opacity-0 group cursor-default hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5`}
                >
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3
                  className="text-xl font-semibold mb-3"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {f.title}
                </h3>
                <p className="text-[#94A3B8] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} className="py-16 px-4">
        <div className="max-w-4xl mx-auto glass-card p-12 glow-violet">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            {stats.map((stat, i) => (
              <div key={stat.label} className="py-6 md:py-0">
                <div
                  className="text-5xl font-bold gradient-text mb-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <span ref={(el) => { counterRefs.current[i] = el; }}>0</span>
                  {stat.suffix}
                </div>
                <div className="text-[#94A3B8] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              How it works
            </h2>
          </div>

          <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((item, i) => (
              <div key={i} className="step-item relative opacity-0">
                <div
                  className="text-7xl font-bold text-white/[0.04] mb-3 select-none"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {item.step}
                </div>
                <div className="w-10 h-[2px] bg-gradient-to-r from-violet-500 to-cyan-500 mb-4" />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-[#94A3B8] leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-14 -right-5 text-white/20">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center glass-card p-12">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Ready to start tracking?
          </h2>
          <p className="text-[#94A3B8] mb-8">
            Join your classmates and make placement prep a shared mission.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="btn-gradient inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg"
          >
            Get Started Free
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-4 border-t border-white/5 text-center text-[#94A3B8] text-sm">
        <p>
          PlacementPrep — Built for SVCE MCA Department 🎓
        </p>
        <p className="mt-2 text-xs text-[#475569]">
          <Link
            href="/terms/view"
            className="hover:text-violet-400 transition-colors underline underline-offset-2"
          >
            Terms &amp; Conditions
          </Link>
        </p>
      </footer>
    </div>
  );
}
