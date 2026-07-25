"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, ThumbsUp, MessageSquare, CheckCircle2,
  ExternalLink, Send, Eye, Tag, Code2, Image as ImageIcon, X, Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import MarkdownRenderer from "./MarkdownRenderer";
import Image from "next/image";

/* ─── types ───────────────────────────────────────────── */
interface Author { name: string; photoUrl: string; }
interface ReplyData {
  _id: string; body: string; images: { url: string }[];
  upvotes: number; hasUpvoted: boolean; isAccepted: boolean;
  isAuthor: boolean; createdAt: string; author: Author; children: ReplyData[];
}
interface PostData {
  _id: string; problemTitle: string; problemUrl?: string; topicName: string;
  title: string; body: string; images: { url: string }[];
  upvotes: number; hasUpvoted: boolean; isAuthor: boolean; createdAt: string; author: Author;
}

/* ─── helpers ─────────────────────────────────────────── */
function AuthorAvatar({ author, size = 32 }: { author: Author; size?: number }) {
  if (author.photoUrl) {
    return <Image src={author.photoUrl} alt={author.name} width={size} height={size}
      className="rounded-full object-cover ring-2 ring-violet-500/20" />;
  }
  return (
    <div className="rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold ring-2 ring-violet-500/20"
      style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {author.name[0]?.toUpperCase()}
    </div>
  );
}

async function uploadImage(file: File) {
  const sigRes = await fetch("/api/cloudinary/sign", { method: "POST" });
  const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json();
  const fd = new FormData();
  fd.append("file", file); fd.append("signature", signature);
  fd.append("timestamp", timestamp); fd.append("folder", folder); fd.append("api_key", apiKey);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd });
  const d = await res.json();
  return { url: d.secure_url, cloudinaryPublicId: d.public_id };
}

/* ─── reply editor ────────────────────────────────────── */
function ReplyEditor({ postId, parentReplyId, onSuccess, placeholder, onCancel }: {
  postId: string; parentReplyId?: string; onSuccess: () => void; placeholder?: string; onCancel?: () => void;
}) {
  const [body, setBody] = useState("");
  const [images, setImages] = useState<{ url: string; cloudinaryPublicId: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (images.length + files.length > 3) { toast.error("Max 3 images"); return; }
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map(uploadImage));
      setImages((p) => [...p, ...uploaded]);
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/discuss/${postId}/reply`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, parentReplyId, images }),
      });
      if (!res.ok) throw new Error();
      toast.success("Reply posted ✓");
      setBody(""); setImages([]);
      onSuccess();
    } catch { toast.error("Failed to post reply"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#475569] flex items-center gap-1.5">
          <Code2 className="w-3 h-3" /> Markdown supported
        </span>
        <button onClick={() => setPreview((p) => !p)}
          className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition px-2.5 py-1.5 rounded-lg"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Eye className="w-3 h-3" />{preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        <div className="min-h-[100px] rounded-xl p-4"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <MarkdownRenderer content={body || "*Nothing yet...*"} />
        </div>
      ) : (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder ?? "Write your reply... Markdown + code blocks supported"}
          rows={5}
          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3d4a60] focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition resize-none font-mono leading-relaxed"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        />
      )}

      {images.length < 3 && (
        <label className="flex items-center gap-2 px-3 py-2 rounded-lg border-dashed text-xs text-[#64748B] hover:text-white hover:border-violet-500/30 transition cursor-pointer w-fit"
          style={{ border: "1px dashed rgba(255,255,255,0.12)" }}>
          <ImageIcon className="w-3.5 h-3.5" />
          {uploading ? "Uploading..." : "Attach image"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
        </label>
      )}
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-14 h-14 object-cover rounded-lg" style={{ border: "1px solid rgba(255,255,255,0.10)" }} />
              <button onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <motion.button
          whileHover={body.trim() && !submitting ? { scale: 1.03 } : {}}
          whileTap={body.trim() && !submitting ? { scale: 0.97 } : {}}
          onClick={handleSubmit}
          disabled={!body.trim() || submitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg shadow-violet-500/20 transition disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #7c3aed, #0891b2)" }}
        >
          <Send className="w-3.5 h-3.5" />
          {submitting ? "Posting..." : "Post Reply"}
        </motion.button>
        {onCancel && (
          <button onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm text-[#64748B] hover:text-white transition hover:bg-white/5"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── reply card ──────────────────────────────────────── */
function ReplyCard({ reply, postId, isPostAuthor, depth, onRefresh }: {
  reply: ReplyData; postId: string; isPostAuthor: boolean; depth: number; onRefresh: () => void;
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(reply.upvotes);
  const [localHasUpvoted, setLocalHasUpvoted] = useState(reply.hasUpvoted);
  const [localAccepted, setLocalAccepted] = useState(reply.isAccepted);

  const handleUpvote = async () => {
    setLocalUpvotes((p) => (localHasUpvoted ? p - 1 : p + 1));
    setLocalHasUpvoted((p) => !p);
    try { await fetch(`/api/discuss/${postId}/replies/${reply._id}/upvote`, { method: "PATCH" }); }
    catch { toast.error("Failed to upvote"); }
  };

  const handleAccept = async () => {
    try {
      const res = await fetch(`/api/discuss/${postId}/replies/${reply._id}/accept`, { method: "PATCH" });
      const data = await res.json();
      setLocalAccepted(data.isAccepted);
      toast.success(data.isAccepted ? "Marked as accepted answer ✓" : "Unmarked accepted answer");
      onRefresh();
    } catch { toast.error("Failed"); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${depth > 0 ? "ml-8 pl-4 border-l border-violet-500/15" : ""}`}
    >
      <div className={`p-5 rounded-2xl border transition-all ${
        localAccepted
          ? "border-emerald-500/30 shadow-lg shadow-emerald-500/8"
          : "border-white/8 hover:border-white/12"
      }`}
        style={{ background: localAccepted ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.03)" }}>

        {/* Accepted badge */}
        {localAccepted && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-3 pb-3 border-b border-emerald-500/20">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3" />
            </div>
            ✓ Accepted Answer
          </div>
        )}

        {/* Author row */}
        <div className="flex items-center gap-2.5 mb-3">
          <AuthorAvatar author={reply.author} size={28} />
          <div>
            <span className="text-sm font-semibold text-white">{reply.author.name}</span>
            <span className="text-[#475569] text-xs ml-2">
              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="mb-3">
          <MarkdownRenderer content={reply.body} />
        </div>

        {/* Images */}
        {reply.images.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {reply.images.map((img, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={i} src={img.url} alt="" className="max-h-40 rounded-xl object-cover" style={{ border: "1px solid rgba(255,255,255,0.10)" }} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 flex-wrap">
          <button onClick={handleUpvote}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              localHasUpvoted
                ? "text-violet-400 border-violet-500/30"
                : "text-[#64748B] border-white/8 hover:text-violet-400 hover:border-violet-500/20"
            }`}
            style={{ background: localHasUpvoted ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.04)" }}>
            <ThumbsUp className="w-3.5 h-3.5" />
            {localUpvotes}
          </button>

          {depth === 0 && (
            <button onClick={() => setShowReplyBox((p) => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#64748B] hover:text-white transition border border-white/8 hover:border-white/15"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <MessageSquare className="w-3.5 h-3.5" />
              Reply
            </button>
          )}

          {isPostAuthor && (
            <button onClick={handleAccept}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                localAccepted
                  ? "text-emerald-400 border-emerald-500/30"
                  : "text-[#64748B] border-white/8 hover:text-emerald-400 hover:border-emerald-500/20"
              }`}
              style={{ background: localAccepted ? "rgba(16,185,129,0.10)" : "rgba(255,255,255,0.04)" }}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {localAccepted ? "Unaccept" : "Accept Answer"}
            </button>
          )}
        </div>
      </div>

      {/* Inline reply editor */}
      <AnimatePresence>
        {showReplyBox && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-8 mt-3 pl-4 border-l border-violet-500/20 overflow-hidden">
            <ReplyEditor
              postId={postId} parentReplyId={reply._id}
              placeholder="Reply to this comment..."
              onSuccess={() => { setShowReplyBox(false); onRefresh(); }}
              onCancel={() => setShowReplyBox(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Children */}
      {reply.children.length > 0 && (
        <div className="mt-3 space-y-3">
          {reply.children.map((child) => (
            <ReplyCard key={child._id} reply={child} postId={postId} isPostAuthor={isPostAuthor} depth={depth + 1} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── main ────────────────────────────────────────────── */
export default function PostDetail({ postId }: { postId: string }) {
  const router = useRouter();
  const [post, setPost] = useState<PostData | null>(null);
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [postUpvotes, setPostUpvotes] = useState(0);
  const [postHasUpvoted, setPostHasUpvoted] = useState(false);

  const fetch_ = useCallback(async () => {
    const res = await fetch(`/api/discuss/${postId}`);
    if (!res.ok) return;
    const data = await res.json();
    setPost(data.post); setReplies(data.replies);
    setPostUpvotes(data.post.upvotes); setPostHasUpvoted(data.post.hasUpvoted);
    setLoading(false);
  }, [postId]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handlePostUpvote = async () => {
    setPostUpvotes((p) => (postHasUpvoted ? p - 1 : p + 1));
    setPostHasUpvoted((p) => !p);
    try { await fetch(`/api/discuss/${postId}/upvote`, { method: "PATCH" }); }
    catch { toast.error("Failed to upvote"); }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #0b0d1a 0%, #0f1120 100%)" }}>
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-5 animate-pulse">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="rounded-2xl border border-white/8 p-7 space-y-4" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="h-3 w-20 rounded bg-white/10" />
            <div className="h-7 w-3/4 rounded bg-white/10" />
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-2/3 rounded bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, #0b0d1a 0%, #0f1120 100%)" }}>
        <div className="text-center">
          <p className="text-[#64748B] mb-4">Post not found.</p>
          <button onClick={() => router.push("/discuss")} className="text-violet-400 text-sm hover:underline">← Back to Discuss</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #0b0d1a 0%, #0f1120 50%, #0a0c18 100%)" }}>
      {/* Background glows */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[350px] h-[350px] bg-cyan-500/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">

        {/* Back */}
        <button onClick={() => router.push("/discuss")}
          className="flex items-center gap-2 text-sm text-[#64748B] hover:text-white transition-colors mb-7 group">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ArrowLeft className="w-3.5 h-3.5" />
          </span>
          Back to Discuss
        </button>

        {/* ── Post card ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="rounded-3xl border border-white/8 p-7 mb-6"
          style={{ background: "rgba(255,255,255,0.03)" }}>

          {/* Meta badges */}
          <div className="flex items-center gap-2 flex-wrap mb-5">
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border text-violet-400 font-medium"
              style={{ background: "rgba(139,92,246,0.12)", borderColor: "rgba(139,92,246,0.25)" }}>
              <Tag className="w-3 h-3" />{post.topicName}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium text-[#94A3B8]"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {post.problemTitle}
            </span>
            {post.problemUrl && (
              <a href={post.problemUrl} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition ml-auto font-medium">
                <ExternalLink className="w-3 h-3" /> View Problem
              </a>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-5 leading-snug"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {post.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/6">
            <AuthorAvatar author={post.author} size={34} />
            <div>
              <p className="text-sm font-semibold text-white">{post.author.name}</p>
              <p className="text-xs text-[#64748B]">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="mb-5">
            <MarkdownRenderer content={post.body} />
          </div>

          {/* Images */}
          {post.images.length > 0 && (
            <div className="flex gap-3 mt-4 flex-wrap">
              {post.images.map((img, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={i} src={img.url} alt="" className="max-h-56 rounded-2xl object-cover cursor-pointer hover:opacity-90 transition"
                  style={{ border: "1px solid rgba(255,255,255,0.10)" }} />
              ))}
            </div>
          )}

          {/* Post actions */}
          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/6">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handlePostUpvote}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                postHasUpvoted
                  ? "text-violet-400 border-violet-500/30"
                  : "text-[#64748B] border-white/10 hover:text-violet-400 hover:border-violet-500/20"
              }`}
              style={{ background: postHasUpvoted ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.05)" }}
            >
              <ThumbsUp className="w-4 h-4" />
              {postUpvotes} {postUpvotes === 1 ? "upvote" : "upvotes"}
            </motion.button>
            <span className="flex items-center gap-2 text-sm text-[#64748B]">
              <MessageSquare className="w-4 h-4" />
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </span>
          </div>
        </motion.div>

        {/* ── Replies section ── */}
        {replies.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
              </h2>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>
            <div className="space-y-4">
              {replies.map((reply, i) => (
                <motion.div
                  key={reply._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <ReplyCard reply={reply} postId={postId} isPostAuthor={post.isAuthor} depth={0} onRefresh={fetch_} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Add Reply box ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-white/8 p-6"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.28)" }}>
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <h3 className="text-base font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Your Reply
            </h3>
          </div>
          <ReplyEditor postId={postId} onSuccess={fetch_} />
        </motion.div>

      </div>
    </div>
  );
}
