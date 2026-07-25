"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, Send, Image as ImageIcon, X, ExternalLink,
  Eye, Code2, ChevronDown, Tag, Sparkles,
} from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

interface Topic { _id: string; name: string; }

async function uploadToCloudinary(file: File): Promise<{ url: string; cloudinaryPublicId: string }> {
  const sigRes = await fetch("/api/cloudinary/sign", { method: "POST" });
  const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("signature", signature);
  formData.append("timestamp", timestamp);
  formData.append("folder", folder);
  formData.append("api_key", apiKey);
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await uploadRes.json();
  return { url: data.secure_url, cloudinaryPublicId: data.public_id };
}

function FormField({ label, required, optional, children }: {
  label: string; required?: boolean; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-[#CBD5E1]">
        {label}
        {required && <span className="text-rose-400">*</span>}
        {optional && <span className="text-[#475569] font-normal text-xs">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

export default function NewPostForm() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [form, setForm] = useState({ topicId: "", problemTitle: "", problemUrl: "", title: "", content: "" });
  const [images, setImages] = useState<{ url: string; cloudinaryPublicId: string }[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);

  useEffect(() => {
    fetch("/api/discuss").then((r) => r.json()).then((d) => {
      setTopics(d.topics ?? []);
      if (d.topics?.length > 0) setForm((f) => ({ ...f, topicId: d.topics[0]._id }));
    });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (images.length + files.length > 3) { toast.error("Max 3 images per post"); return; }
    setUploadingImage(true);
    try {
      const uploaded = await Promise.all(files.map(uploadToCloudinary));
      setImages((prev) => [...prev, ...uploaded]);
      toast.success("Image uploaded ✓");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.topicId || !form.problemTitle || !form.title || !form.content) {
      toast.error("Please fill in all required fields"); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/discuss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images }),
      });
      if (!res.ok) throw new Error();
      const { _id } = await res.json();
      toast.success("Post created ✓");
      router.push(`/discuss/${_id}`);
    } catch {
      toast.error("Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = form.topicId && form.problemTitle && form.title && form.content;
  const selectedTopicName = topics.find((t) => t._id === form.topicId)?.name ?? "Select a topic";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #0b0d1a 0%, #0f1120 50%, #0a0c18 100%)" }}>
      {/* Background glows */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/7 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <button
          onClick={() => router.push("/discuss")}
          className="flex items-center gap-2 text-sm text-[#64748B] hover:text-white transition-colors mb-8 group"
        >
          <span className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ArrowLeft className="w-3.5 h-3.5" />
          </span>
          Back to Discuss
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}>
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">New Discussion</span>
            </div>
            <h1 className="text-4xl font-black mb-1.5" style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: "linear-gradient(135deg, #a78bfa 0%, #67e8f9 70%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Ask a Question
            </h1>
            <p className="text-[#64748B] text-sm">Share a DSA problem you&apos;re stuck on. The community has your back. 🙌</p>
          </div>

          {/* Form card */}
          <div className="rounded-3xl border border-white/8 p-7 space-y-6"
            style={{ background: "rgba(255,255,255,0.03)" }}>

            {/* DSA Topic — custom dropdown */}
            <FormField label="DSA Topic" required>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTopicDropdown((v) => !v)}
                  className="w-full flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-white cursor-pointer transition focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
                >
                  <Tag className="w-4 h-4 text-violet-400 shrink-0" />
                  <span className="flex-1 text-left font-medium">{selectedTopicName}</span>
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
                        className="absolute top-full mt-2 left-0 right-0 rounded-2xl border border-white/10 shadow-2xl z-20 py-1.5 max-h-64 overflow-y-auto"
                        style={{ background: "#111420" }}
                      >
                        {topics.map((t) => (
                          <button
                            key={t._id}
                            type="button"
                            onClick={() => { setForm((f) => ({ ...f, topicId: t._id })); setShowTopicDropdown(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2.5 ${
                              form.topicId === t._id
                                ? "text-violet-300 font-semibold"
                                : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
                            }`}
                            style={form.topicId === t._id ? { background: "rgba(139,92,246,0.15)" } : {}}
                          >
                            {form.topicId === t._id && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />}
                            <span className={form.topicId === t._id ? "" : "ml-3.5"}>{t.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </FormField>

            {/* Problem Name */}
            <FormField label="Problem Name" required>
              <input
                value={form.problemTitle}
                onChange={(e) => setForm((f) => ({ ...f, problemTitle: e.target.value }))}
                placeholder="e.g. Two Sum, Longest Palindromic Substring"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
              />
            </FormField>

            {/* LeetCode URL */}
            <FormField label="LeetCode / GFG URL" optional>
              <div className="relative">
                <ExternalLink className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input
                  value={form.problemUrl}
                  onChange={(e) => setForm((f) => ({ ...f, problemUrl: e.target.value }))}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
                />
              </div>
            </FormField>

            {/* Question Title */}
            <FormField label="Your Question (title)" required>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Why does my Two Sum solution give TLE?"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
              />
            </FormField>

            {/* Body — markdown editor */}
            <FormField label="Explanation" required>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs text-[#475569]">
                    <Code2 className="w-3.5 h-3.5" />
                    Markdown + code blocks supported
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreview((p) => !p)}
                    className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {preview ? "Edit" : "Preview"}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {preview ? (
                    <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="min-h-[200px] rounded-xl p-5"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <MarkdownRenderer content={form.content || "*Nothing to preview yet...*"} />
                    </motion.div>
                  ) : (
                    <motion.textarea key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      value={form.content}
                      onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                      placeholder={`Describe your issue clearly. Use code blocks:\n\n\`\`\`python\nfor i in range(n):\n    print(i)\n\`\`\``}
                      rows={10}
                      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3d4a60] focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition resize-none font-mono leading-relaxed"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </FormField>

            {/* Image upload */}
            <FormField label="Attach Images" optional>
              <div className="space-y-3">
                {images.length < 3 && (
                  <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-dashed text-sm text-[#64748B] hover:text-white hover:border-violet-500/40 transition cursor-pointer w-fit"
                    style={{ border: "1.5px dashed rgba(255,255,255,0.15)" }}>
                    <ImageIcon className="w-4 h-4" />
                    {uploadingImage ? "Uploading..." : `Add image (${images.length}/3)`}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                )}
                {images.length > 0 && (
                  <div className="flex gap-3 flex-wrap">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="upload" className="w-20 h-20 object-cover rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.10)" }} />
                        <button onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormField>

            {/* Divider */}
            <div className="border-t border-white/5" />

            {/* Submit */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={isValid && !submitting ? { scale: 1.03 } : {}}
                whileTap={isValid && !submitting ? { scale: 0.97 } : {}}
                onClick={handleSubmit}
                disabled={!isValid || submitting}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: isValid ? "linear-gradient(135deg, #7c3aed, #06b6d4)" : "rgba(255,255,255,0.08)" }}
              >
                <Send className="w-4 h-4" />
                {submitting ? "Posting..." : "Post Question"}
              </motion.button>
              <button onClick={() => router.push("/discuss")}
                className="text-sm text-[#64748B] hover:text-white transition px-4 py-3 rounded-2xl hover:bg-white/5">
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
