"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Code2, Trophy, MessageSquare,
  Building2, LogOut, Menu, X, Zap, Compass,
  Terminal
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

const NAV_LINKS = [
  { href: "/foundations", label: "Start Here 🧭", icon: Compass },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracker", label: "Tracker", icon: Code2 },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/discuss", label: "Discuss", icon: MessageSquare },
  { href: "/console", label: "Console", icon: Terminal, badge: "Soon" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = session?.user as any;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0D0F1A]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span
            className="font-bold text-lg gradient-text hidden sm:block"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            PlacementPrep
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  active
                    ? "bg-violet-500/15 text-violet-300"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {badge && (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded-full absolute -top-1.5 -right-1">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <NotificationBell />

          {user?.image && (
            <Link href={`/profile/${(user as any).id || ""}`}>
              <Image
                src={user.image}
                alt={user.name || ""}
                width={34}
                height={34}
                className="rounded-full border border-white/20 hover:border-violet-500/60 transition-colors cursor-pointer"
              />
            </Link>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="hidden md:flex items-center gap-1.5 text-[#94A3B8] hover:text-white text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-[#94A3B8] hover:text-white"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu — animated slide-out drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-white/5 bg-[#0D0F1A]/98 backdrop-blur-md"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon, badge }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                        : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      {label}
                    </div>
                    {badge && (
                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              <div className="my-2 border-t border-white/5" />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-3 px-4 py-3 text-sm text-[#94A3B8] hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
