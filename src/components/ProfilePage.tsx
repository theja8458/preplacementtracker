"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import {
  Flame, Trophy, Code2, MessageSquare, Building2,
  Copy, Edit2, Swords, CheckCircle2, Clock, Circle,
  ExternalLink, ArrowLeft, Star, Camera, Loader2,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────── */
interface ProfileData {
  user: {
    _id: string;
    name: string;
    photoUrl: string;
    branch: string | null;
    year: string | null;
    currentStreak: number;
    longestStreak: number;
    createdAt: string;
  };
  stats: {
    totalSolved: number;
    topicsCovered: number;
    companiesPrepping: number;
    discussActivity: number;
  };
  topicsWithProgress: {
    _id: string;
    name: string;
    order: number;
    problemsSolved: number;
  }[];
  recentPosts: {
    _id: string;
    title: string;
    problemTitle: string;
    topicName: string;
    replyCount: number;
    createdAt: string;
  }[];
  companies: {
    companyId: string;
    name: string;
    status: "not_started" | "in_progress" | "done";
    notes: string;
  }[];
}

const STATUS_CONFIG = {
  not_started: { label: "Not Started", color: "text-[#64748B]", dot: "bg-slate-500" },
  in_progress:  { label: "In Progress", color: "text-amber-400",  dot: "bg-amber-400" },
  done:         { label: "Done",         color: "text-emerald-400", dot: "bg-emerald-400" },
};

/* ── Edit Profile Modal ─────────────────────────────── */
function EditProfileModal({
  user,
  onClose,
  onSaved,
}: {
  user: ProfileData["user"];
  onClose: () => void;
  onSaved: (branch: string, year: string, photoUrl?: string) => void;
}) {
  const [branch, setBranch] = useState(user.branch ?? "");
  const [year, setYear] = useState(user.year ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(user.photoUrl ?? "");
  const [newPhotoUrl, setNewPhotoUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate — images + GIFs only, max 8 MB
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP or GIF allowed");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("File must be under 8 MB");
      return;
    }

    // Show local preview immediately (supports animated GIFs)
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setUploading(true);
    try {
      // 1. Get signed upload params — use the existing working sign endpoint
      const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
      const { signature, timestamp, folder, cloudName, apiKey } = await signRes.json();

      // 2. Upload to Cloudinary — exact same pattern as the working discuss upload
      const form = new FormData();
      form.append("file", file);
      form.append("signature", signature);
      form.append("timestamp", timestamp);
      form.append("folder", folder);
      form.append("api_key", apiKey);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: form }
      );
      const uploadData = await uploadRes.json();

      if (uploadData.secure_url) {
        setNewPhotoUrl(uploadData.secure_url);
        setPreview(uploadData.secure_url);
        toast.success("Photo uploaded ✓ — click Save to apply");
      } else {
        toast.error("Upload failed — please try again");
        setPreview(user.photoUrl ?? "");
      }
    } catch {
      toast.error("Upload error — check your connection");
      setPreview(user.photoUrl ?? "");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save branch + year
      const infoRes = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch, year }),
      });

      // Save photo if changed
      if (newPhotoUrl) {
        await fetch("/api/profile/update-avatar", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoUrl: newPhotoUrl }),
        });
      }

      if (infoRes.ok) {
        onSaved(branch, year, newPhotoUrl ?? undefined);
        toast.success("Profile updated ✓");
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12141f] p-6 shadow-2xl"
      >
        <h2
          className="text-xl font-bold text-white mb-6"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Edit Profile
        </h2>

        {/* ── Photo Upload ── */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
            {/* Avatar preview */}
            <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-violet-500 via-cyan-500 to-violet-500">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#1A1D2E] flex items-center justify-center text-2xl font-bold text-violet-400">
                  {user.name[0]}
                </div>
              )}
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading
                ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                : <Camera className="w-5 h-5 text-white" />}
            </div>
          </div>
          <p className="text-xs text-[#64748B] mt-2">
            Click to upload photo or <span className="text-violet-400">animated GIF</span>
          </p>
          <p className="text-[10px] text-[#475569] mt-0.5">JPG · PNG · WEBP · GIF · Max 8 MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* ── Fields ── */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[#64748B] mb-1.5 block">Branch</label>
            <input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g. MCA, B.Tech CSE"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-[#64748B] mb-1.5 block">Year</label>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2nd Year, Final Year"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-[#94A3B8] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-sm font-semibold text-white disabled:opacity-60 transition-opacity flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────── */
export default function ProfilePage({ userId }: { userId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const sessionUserId = (session?.user as any)?.id ?? "";
  const isOwn = sessionUserId === userId;

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/${userId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied ✓");
  };

  const handleEditSaved = (branch: string, year: string, photoUrl?: string) => {
    if (!data) return;
    setData({
      ...data,
      user: { ...data.user, branch, year, ...(photoUrl ? { photoUrl } : {}) },
    });
  };

  /* ── Loading skeleton ─────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0F1A]">
        <div className="relative max-w-4xl mx-auto px-4 py-10">
          {/* Back button skeleton */}
          <div className="skeleton h-5 w-16 rounded mb-8" />

          {/* Header card skeleton */}
          <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="skeleton w-24 h-24 rounded-full shrink-0" />
              <div className="flex-1 w-full space-y-3">
                <div className="skeleton h-7 w-48 rounded" />
                <div className="skeleton h-4 w-32 rounded" />
                <div className="skeleton h-3 w-56 rounded" />
                <div className="flex gap-3 mt-2">
                  <div className="skeleton h-8 w-32 rounded-xl" />
                  <div className="skeleton h-8 w-28 rounded-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Stat cards skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-2">
                <div className="skeleton w-5 h-5 rounded" />
                <div className="skeleton h-7 w-12 rounded" />
                <div className="skeleton h-3 w-24 rounded" />
              </div>
            ))}
          </div>

          {/* DSA progress skeleton */}
          <div className="rounded-2xl border border-white/8 bg-white/3 p-6 mb-6">
            <div className="skeleton h-6 w-32 rounded mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="skeleton h-3 w-24 rounded" />
                    <div className="skeleton h-3 w-6 rounded" />
                  </div>
                  <div className="skeleton h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Discussions skeleton */}
          <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
            <div className="skeleton h-6 w-40 rounded mb-5" />
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex justify-between gap-4 py-3.5 border-b border-white/5">
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                  <div className="skeleton w-4 h-4 rounded shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (!data) {
    return (
      <div className="min-h-screen bg-[#0D0F1A] flex flex-col items-center justify-center gap-4 text-[#64748B]">
        <Star className="w-12 h-12 opacity-30" />
        <p className="text-lg">User not found</p>
        <Link href="/leaderboard" className="text-violet-400 hover:text-violet-300 text-sm transition-colors">
          View Leaderboard
        </Link>
      </div>
    );
  }

  const { user, stats, topicsWithProgress, recentPosts, companies } = data;
  const maxSolved = Math.max(...topicsWithProgress.map((t) => t.problemsSolved), 1);

  return (
    <div className="min-h-screen bg-[#0D0F1A]">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-cyan-600/8 blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-10">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#64748B] hover:text-white text-sm mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* ── HEADER ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar with gradient ring */}
            <div className="shrink-0 relative">
              <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-violet-500 via-cyan-500 to-violet-500">
                {user.photoUrl ? (
                  /* Use <img> instead of <Image> so animated GIFs play correctly */
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#1A1D2E] flex items-center justify-center text-3xl font-bold text-violet-400">
                    {user.name[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1
                className="text-3xl font-bold text-white mb-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {user.name}
              </h1>

              {(user.branch || user.year) && (
                <p className="text-[#94A3B8] text-sm mb-2">
                  {[user.branch, user.year].filter(Boolean).join(" · ")}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#64748B] mb-4">
                <span>Member since {format(new Date(user.createdAt), "MMMM yyyy")}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>Tracking since {format(new Date(user.createdAt), "dd MMM yyyy")}</span>
              </div>

              {/* Streaks */}
              <div className="flex items-center justify-center sm:justify-start gap-4 mb-5">
                <div className="flex items-center gap-1.5 text-sm">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-white font-semibold">{user.currentStreak}</span>
                  <span className="text-[#64748B]">day streak</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Trophy className="w-4 h-4 text-violet-400" />
                  <span className="text-white font-semibold">{user.longestStreak}</span>
                  <span className="text-[#64748B]">best streak</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-[#94A3B8] hover:text-white hover:border-white/20 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Profile Link
                </button>

                {isOwn ? (
                  <button
                    onClick={() => setEditOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-sm text-violet-300 hover:bg-violet-500/25 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                ) : (
                  <Link
                    href={`/leaderboard?challenge=${userId}&me=${sessionUserId}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-sm text-cyan-300 hover:bg-cyan-500/25 transition-all"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    Challenge
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── STAT CARDS ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: "Problems Solved", value: stats.totalSolved, icon: Code2, color: "text-violet-400" },
            { label: "Topics Covered", value: `${stats.topicsCovered} / 12`, icon: Trophy, color: "text-cyan-400" },
            { label: "Companies Prepping", value: stats.companiesPrepping, icon: Building2, color: "text-amber-400" },
            { label: "Discuss Activity", value: stats.discussActivity, icon: MessageSquare, color: "text-emerald-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/8 bg-white/3 p-5 flex flex-col gap-2"
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {value}
              </p>
              <p className="text-xs text-[#64748B]">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── DSA PROGRESS ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/8 bg-white/3 p-6 mb-6"
        >
          <h2
            className="text-lg font-bold text-white mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            DSA Progress
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topicsWithProgress.map((topic, i) => {
              const pct = Math.min((topic.problemsSolved / Math.max(maxSolved, 30)) * 100, 100);
              return (
                <div key={topic._id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8]">{topic.name}</span>
                    <span className="text-white font-medium">{topic.problemsSolved}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.04, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── RECENT DISCUSSIONS ───────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/8 bg-white/3 p-6 mb-6"
        >
          <h2
            className="text-lg font-bold text-white mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Recent Discussions
          </h2>

          {recentPosts.length === 0 ? (
            <p className="text-[#64748B] text-sm text-center py-6">No discussions yet</p>
          ) : (
            <div className="flex flex-col divide-y divide-white/5">
              {recentPosts.map((post) => (
                <Link
                  key={post._id}
                  href={`/discuss/${post._id}`}
                  className="flex items-start justify-between gap-4 py-3.5 hover:bg-white/3 rounded-xl px-2 -mx-2 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white group-hover:text-violet-300 transition-colors truncate font-medium">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                        {post.topicName}
                      </span>
                      <span className="text-[11px] text-[#475569]">
                        {post.replyCount} {post.replyCount === 1 ? "reply" : "replies"}
                      </span>
                      <span className="text-[11px] text-[#475569]">·</span>
                      <span className="text-[11px] text-[#475569]">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#475569] group-hover:text-violet-400 transition-colors shrink-0 mt-0.5" />
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── COMPANIES ───────────────────────────── */}
        {companies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-white/8 bg-white/3 p-6"
          >
            <h2
              className="text-lg font-bold text-white mb-5"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Companies Prepping
            </h2>

            <div className="flex flex-wrap gap-3">
              {companies.map((c) => {
                const cfg = STATUS_CONFIG[c.status];
                const StatusIcon =
                  c.status === "done"
                    ? CheckCircle2
                    : c.status === "in_progress"
                    ? Clock
                    : Circle;
                return (
                  <div
                    key={c.companyId}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-sm"
                  >
                    <StatusIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    <span className="text-[#94A3B8]">{c.name}</span>
                    <span className={`text-[11px] ${cfg.color}`}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Edit modal */}
      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}
