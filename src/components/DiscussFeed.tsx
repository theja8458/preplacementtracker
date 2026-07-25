"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  MessageSquare, ThumbsUp, Plus, Search,
  Clock, TrendingUp, HelpCircle,
  ExternalLink, Tag, ArrowRight, Flame, ChevronDown,
  Sparkles, Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getDailyQuote, discussQuotes } from "@/lib/quotes";
import Image from "next/image";

interface Post {
  _id: string;
  problemTitle: string;
  problemUrl?: string;
  title: string;
  body: string;
  topicId: string;
  topicName: string;
  upvotes: number;
  hasUpvoted: boolean;
  replyCount: number;
  images: { url: string }[];
  author: { name: string; photoUrl: string };
  createdAt: string;
}

interface Topic { _id: string; name: string; }
type Sort = "latest" | "upvotes" | "unanswered";

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-white/10" />
        <div className="h-3 w-28 rounded bg-white/10" />
        <div className="h-5 w-16 rounded-full bg-white/10 ml-auto" />
      </div>
      <div className="h-5 w-3/4 rounded bg-white/10" />
      <div className="h-3 w-full rounded bg-white/10" />
      <div className="h-3 w-2/3 rounded bg-white/10" />
      <div className="flex gap-3 pt-1">
        <div className="h-7 w-16 rounded-lg bg-white/10" />
        <div className="h-7 w-20 rounded-lg bg-white/10" />
      </div>
    </div>
  );
}

function AuthorAvatar({ author, size = 28 }: { author: Post["author"]; size?: number }) {
  if (author.photoUrl) {
    return (
      <Image src={author.photoUrl} alt={author.name} width={size} height={size}
        className="rounded-full object-cover ring-2 ring-violet-500/20" />
    );
  }
  return (
    <div
      className="rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold ring-2 ring-violet-500/20"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {author.name[0]?.toUpperCase()}
    </div>
  );
}

export default function DiscussFeed() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<Sort>("latest");
  const [topicFilter, setTopicFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);

  const quote = getDailyQuote(discussQuotes);

  const fetchPosts = useCallback(async (s: Sort, t: string, p: number, append = false) => {
    if (p === 0) setLoading(true); else setLoadingMore(true);
    try {
      const res = await fetch(`/api/discuss?sort=${s}&topic=${t}&page=${p}`);
      const data = await res.json();
      setPosts((prev) => append ? [...prev, ...(data.posts ?? [])] : (data.posts ?? []));
      setTopics(data.topics ?? []);
      setHasMore(data.hasMore ?? false);
      setPage(p);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Reset to page 0 on sort/filter change
  useEffect(() => { fetchPosts(sort, topicFilter, 0, false); }, [sort, topicFilter, fetchPosts]);

  const handleLoadMore = () => { fetchPosts(sort, topicFilter, page + 1, true); };


  const handleUpvote = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, upvotes: p.hasUpvoted ? p.upvotes - 1 : p.upvotes + 1, hasUpvoted: !p.hasUpvoted }
          : p
      )
    );
    try {
      await fetch(`/api/discuss/${postId}/upvote`, { method: "PATCH" });
    } catch {
      toast.error("Failed to upvote");
    }
  };

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.problemTitle.toLowerCase().includes(search.toLowerCase())
  );

  const sortButtons: { key: Sort; label: string; icon: React.ReactNode }[] = [
    { key: "latest", label: "Latest", icon: <Clock className="w-3.5 h-3.5" /> },
    { key: "upvotes", label: "Top", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { key: "unanswered", label: "Unanswered", icon: <HelpCircle className="w-3.5 h-3.5" /> },
  ];

  const selectedTopicName = topicFilter === "all"
    ? "All Topics"
    : topics.find((t) => t._id === topicFilter)?.name ?? "All Topics";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #0b0d1a 0%, #0f1120 50%, #0a0c18 100%)" }}>
      {/* Background glows */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-indigo-500/6 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Community</span>
            </div>
            <h1
              className="text-4xl sm:text-5xl font-black mb-2 leading-none"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                background: "linear-gradient(135deg, #a78bfa 0%, #67e8f9 60%, #fff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Discuss
            </h1>
            <p className="text-[#94A3B8] text-sm">
              Ask questions · Share solutions · Help each other crack placements.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/discuss/new")}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-semibold text-sm shadow-lg shadow-violet-500/30 shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
          >
            <Plus className="w-4 h-4" />
            Ask a Question
          </motion.button>
        </motion.div>

        {/* ── Telugu Quote card ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="relative rounded-2xl border border-violet-500/25 p-5 mb-7 overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.15) 0%, rgba(6,182,212,0.08) 100%)" }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-3 relative">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-relaxed">{quote.quote}</p>
              <p className="text-xs text-[#94A3B8] italic mt-1">{quote.subtext}</p>
            </div>
            <Sparkles className="w-4 h-4 text-violet-400/50 ml-auto shrink-0 mt-1" />
          </div>
        </motion.div>

        {/* ── Filters row ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 mb-7"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts or problems..."
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
            />
          </div>

          {/* Custom Topic filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTopicDropdown((v) => !v)}
              className="flex items-center gap-2 rounded-xl pl-3.5 pr-3 py-2.5 text-sm text-white transition hover:border-violet-500/30 cursor-pointer min-w-[155px]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              <Filter className="w-4 h-4 text-[#64748B] shrink-0" />
              <span className="flex-1 text-left truncate text-[#CBD5E1]">{selectedTopicName}</span>
              <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform shrink-0 ${showTopicDropdown ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showTopicDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowTopicDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-0 w-52 rounded-2xl border border-white/10 shadow-2xl z-20 py-1.5 overflow-hidden"
                    style={{ background: "#111420" }}
                  >
                    <button
                      onClick={() => { setTopicFilter("all"); setShowTopicDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                        topicFilter === "all"
                          ? "bg-violet-500/20 text-violet-300 font-semibold"
                          : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {topicFilter === "all" && <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                      All Topics
                    </button>
                    <div className="my-1 border-t border-white/5" />
                    {topics.map((t) => (
                      <button
                        key={t._id}
                        onClick={() => { setTopicFilter(t._id); setShowTopicDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                          topicFilter === t._id
                            ? "bg-violet-500/20 text-violet-300 font-semibold"
                            : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {topicFilter === t._id && <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                        {t.name}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Sort tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {sortButtons.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sort === key
                    ? "text-white shadow-lg"
                    : "text-[#64748B] hover:text-[#94A3B8]"
                }`}
                style={sort === key ? { background: "linear-gradient(135deg, #7c3aed, #0891b2)" } : {}}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Stats row ── */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-2 mb-5 text-xs text-[#64748B]"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{filtered.length} {filtered.length === 1 ? "post" : "posts"}</span>
            {topicFilter !== "all" && (
              <>
                <span>·</span>
                <span className="text-violet-400">{selectedTopicName}</span>
                <button onClick={() => setTopicFilter("all")} className="text-[#475569] hover:text-white transition ml-1">✕ clear</button>
              </>
            )}
          </motion.div>
        )}

        {/* ── Post list ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/8 p-16 text-center"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
                <MessageSquare className="w-7 h-7 text-[#64748B]" />
              </div>
              <p className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {search ? "No posts match your search" : "No posts yet"}
              </p>
              <p className="text-[#64748B] text-sm mb-7">
                {search ? "Try a different keyword or topic." : "Be the first to start a discussion!"}
              </p>
              {!search && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => router.push("/discuss/new")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold text-sm shadow-lg shadow-violet-500/25"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
                >
                  <Plus className="w-4 h-4" />
                  Create First Post
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div key={`${sort}-${topicFilter}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {filtered.map((post, i) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35, ease: "easeOut" }}
                  onClick={() => router.push(`/discuss/${post._id}`)}
                  className="group relative rounded-2xl border border-white/8 p-5 cursor-pointer transition-all duration-300 hover:border-violet-500/25 hover:shadow-xl hover:shadow-violet-500/8"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.04) 0%, rgba(6,182,212,0.02) 100%)" }} />

                  {/* Author row */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap relative">
                    <AuthorAvatar author={post.author} size={24} />
                    <span className="text-xs font-medium text-[#94A3B8]">{post.author.name}</span>
                    <span className="text-[#334155] text-xs">·</span>
                    <span className="text-xs text-[#475569]">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border text-violet-400"
                      style={{ background: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.25)" }}>
                      <Tag className="w-3 h-3" />
                      {post.topicName}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-base font-bold text-white mb-1.5 group-hover:text-violet-200 transition-colors leading-snug relative"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {post.title}
                  </h2>

                  {/* Problem badge */}
                  <p className="text-sm text-[#64748B] mb-2.5 flex items-center gap-2 relative">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.06)", color: "#64748B" }}>
                      PROBLEM
                    </span>
                    <span className="text-[#94A3B8]">{post.problemTitle}</span>
                    {post.problemUrl && <ExternalLink className="w-3 h-3 text-cyan-500/50" />}
                  </p>

                  {/* Excerpt */}
                  <p className="text-sm text-[#64748B] line-clamp-2 mb-4 leading-relaxed relative">
                    {post.body.replace(/```[\s\S]*?```/g, "[code]").slice(0, 200)}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center gap-3 text-xs relative">
                    <button
                      onClick={(e) => handleUpvote(post._id, e)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-medium border ${
                        post.hasUpvoted
                          ? "text-violet-400 border-violet-500/30"
                          : "text-[#64748B] border-white/8 hover:text-violet-400 hover:border-violet-500/20"
                      }`}
                      style={post.hasUpvoted ? { background: "rgba(139,92,246,0.15)" } : { background: "rgba(255,255,255,0.04)" }}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {post.upvotes}
                    </button>
                    <span className="flex items-center gap-1.5 text-[#64748B]">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {post.replyCount} {post.replyCount === 1 ? "reply" : "replies"}
                    </span>
                    {post.images.length > 0 && (
                      <span className="text-[#475569]">📎 {post.images.length}</span>
                    )}
                    <ArrowRight className="w-4 h-4 text-[#334155] ml-auto group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Load more / end of feed ── */}
        {!loading && (
          <div className="flex justify-center mt-6">
            {hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-[#94A3B8] hover:text-white transition-all disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="w-4 h-4 border-2 border-violet-500/40 border-t-violet-500 rounded-full animate-spin" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {loadingMore ? "Loading..." : "Load more posts"}
              </button>
            ) : posts.length > 0 ? (
              <p className="text-xs text-[#334155]">You&apos;ve seen all posts ✓</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
