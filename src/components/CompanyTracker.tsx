"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Building2, Plus, X, ExternalLink, ChevronDown, ChevronUp,
  Link2, Trash2, Search, Sparkles, BookOpen,
  FileText, Globe,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { SaveStatus, type SaveState } from "@/components/SaveStatus";

interface Company {
  _id: string; name: string; isCustom: boolean;
  status: "not_started" | "in_progress" | "done"; notes: string;
}
interface Resource {
  _id: string; title: string; url: string;
  createdAt: string; isOwner: boolean;
  addedBy: { name: string; photoUrl: string };
}
type StatusFilter = "all" | "not_started" | "in_progress" | "done";

const STATUS_CONFIG = {
  not_started: { label: "Not Started", color: "text-[#64748B]", bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.12)" },
  in_progress: { label: "In Progress", color: "text-amber-400", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.30)" },
  done: { label: "Done", color: "text-emerald-400", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.30)" },
};

// StatusBadge removed — using inline segmented control instead

function ResourcesPanel({ companyId, companyName }: { companyId: string; companyName: string }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", url: "" });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/companies/${companyId}/resources`);
      const data = await res.json();
      setResources(data.resources ?? []);
    } finally { setLoading(false); }
  }, [companyId]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const handleAdd = async () => {
    if (!form.title.trim() || !form.url.trim()) { toast.error("Title and URL are required"); return; }
    setAdding(true);
    try {
      const res = await fetch(`/api/companies/${companyId}/resources`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const newResource = await res.json();
      setResources((p) => [newResource, ...p]);
      setForm({ title: "", url: "" }); setShowForm(false);
      toast.success("Resource added ✓");
    } catch { toast.error("Failed to add resource"); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/companies/${companyId}/resources/${id}`, { method: "DELETE" });
      setResources((p) => p.filter((r) => r._id !== id));
      toast.success("Resource removed");
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="mt-5 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)" }}>
            <Globe className="w-3 h-3 text-violet-400" />
          </div>
          <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">Community Links</span>
          {resources.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] text-violet-300 font-bold"
              style={{ background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.25)" }}>
              {resources.length}
            </span>
          )}
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={showForm
            ? { background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }
            : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748B" }
          }>
          <Plus className="w-3 h-3" /> Add Link
        </button>
      </div>

      {/* Add link form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
            <div className="rounded-xl p-3.5 space-y-2.5" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#475569]" />
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Title — e.g. Interview Experience 2025"
                  className="w-full rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#3d4a60] focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
              </div>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#475569]" />
                <input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#3d4a60] focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
              </div>
              <div className="flex gap-2 pt-0.5">
                <button onClick={handleAdd} disabled={adding}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition disabled:opacity-50 shadow-md shadow-violet-900/30"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #0891b2)" }}>
                  {adding ? "Saving..." : <><Plus className="w-3 h-3" /> Save Link</>}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#64748B] hover:text-white transition"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-xl px-4 py-5 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}>
          <Globe className="w-5 h-5 text-[#334155] mx-auto mb-2" />
          <p className="text-xs text-[#475569]">No links yet — be the first to share a resource for {companyName}!</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {resources.map((r) => (
            <motion.div key={r._id} layout
              className="flex items-center gap-3 group rounded-xl px-3 py-2.5 transition-all"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              whileHover={{ background: "rgba(139,92,246,0.07)", borderColor: "rgba(139,92,246,0.18)" }}>
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <Link2 className="w-3 h-3 text-violet-400" />
              </div>
              <a href={r.url} target="_blank" rel="noopener noreferrer"
                className="flex-1 text-xs text-[#CBD5E1] hover:text-violet-300 transition font-medium truncate min-w-0">
                {r.title}
              </a>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-[#3d4a60] hidden sm:block">
                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                </span>
                <a href={r.url} target="_blank" rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 transition w-6 h-6 rounded-md flex items-center justify-center hover:bg-white/10"
                  style={{ color: "#64748B" }}>
                  <ExternalLink className="w-3 h-3" />
                </a>
                {r.isOwner && (
                  <button onClick={() => handleDelete(r._id)}
                    className="opacity-0 group-hover:opacity-100 transition w-6 h-6 rounded-md flex items-center justify-center hover:bg-rose-500/15 text-[#475569] hover:text-rose-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompanyCard({ company, onUpdate }: {
  company: Company;
  onUpdate: (id: string, patch: Partial<Company>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(company.notes);
  const [saveStatus, setSaveStatus] = useState<SaveState>("idle");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  // Track whether this is the first autosave since page load — first save shows a toast.
  const firstSaveRef = useRef(true);
  // Track the "Saved ✓" clear timer so we don't have stale closures.
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStatusChange = async (newStatus: Company["status"]) => {
    setUpdatingStatus(true);
    onUpdate(company._id, { status: newStatus });
    try {
      await fetch(`/api/companies/${company._id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Status updated ✓`);
    } catch { toast.error("Failed to update status"); onUpdate(company._id, { status: company.status }); }
    finally { setUpdatingStatus(false); }
  };

  // Actual save function — called by the debounced wrapper.
  const saveNotes = useCallback(async (value: string) => {
    setSaveStatus("saving");
    try {
      await fetch(`/api/companies/${company._id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: value }),
      });
      onUpdate(company._id, { notes: value });
      // First save on page load shows a toast; subsequent ones are silent.
      if (firstSaveRef.current) {
        toast.success("Notes saved ✓");
        firstSaveRef.current = false;
      }
      setSaveStatus("saved");
      // Clear the "Saved ✓" indicator after 2 s.
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      toast.error("Failed to save notes");
    }
  }, [company._id, onUpdate]);

  // Debounced wrapper — fires saveNotes 800 ms after the user stops typing.
  const debouncedSave = useDebouncedCallback(saveNotes, 800);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setSaveStatus("saving"); // show "Saving..." immediately for instant feedback
    debouncedSave(value);
  };

  const statuses: { key: Company["status"]; label: string; short: string }[] = [
    { key: "not_started", label: "Not Started", short: "Not Started" },
    { key: "in_progress", label: "In Progress", short: "In Progress" },
    { key: "done", label: "Done", short: "Done" },
  ];

  return (
    <motion.div layout className="rounded-2xl border overflow-hidden transition-all"
      style={{
        background: "rgba(255,255,255,0.03)",
        borderColor: company.status === "done"
          ? "rgba(16,185,129,0.25)"
          : company.status === "in_progress"
          ? "rgba(245,158,11,0.25)"
          : "rgba(255,255,255,0.08)",
      }}>
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-base text-white"
          style={{
            background: company.status === "done"
              ? "rgba(16,185,129,0.2)"
              : company.status === "in_progress"
              ? "rgba(245,158,11,0.18)"
              : "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(6,182,212,0.15))",
            border: company.status === "done"
              ? "1px solid rgba(16,185,129,0.3)"
              : company.status === "in_progress"
              ? "1px solid rgba(245,158,11,0.3)"
              : "1px solid rgba(139,92,246,0.2)",
          }}>
          {company.name[0]}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <span className="font-bold text-sm text-white">{company.name}</span>
          {company.isCustom && (
            <span className="ml-2 text-[10px] text-[#64748B] px-1.5 py-0.5 rounded-md font-medium"
              style={{ background: "rgba(255,255,255,0.05)" }}>custom</span>
          )}
        </div>

        {/* Segmented status selector */}
        <div className="flex rounded-xl overflow-hidden border border-white/8 shrink-0"
          style={{ background: "rgba(0,0,0,0.3)" }}>
          {statuses.map(({ key, short }) => {
            const cfg = STATUS_CONFIG[key];
            const isActive = company.status === key;
            return (
              <button
                key={key}
                onClick={() => !isActive && handleStatusChange(key)}
                disabled={updatingStatus}
                className={`px-2.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive ? cfg.color : "text-[#475569] hover:text-[#94A3B8]"
                }`}
                style={isActive ? { background: cfg.bg } : {}}
              >
                {short}
              </button>
            );
          })}
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpanded((v) => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#475569] hover:text-white transition hover:bg-white/5">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-5 pt-3 space-y-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>

              {/* ── Notes ── */}
              <div>
                {/* Notes header */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center"
                      style={{ background: "rgba(6,182,212,0.12)" }}>
                      <FileText className="w-3 h-3 text-cyan-400" />
                    </div>
                    <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">My Notes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Inline autosave status — replaces per-keystroke toast */}
                    <SaveStatus state={saveStatus} />
                    <span className="text-[10px] text-[#334155] font-mono">{notes.length} chars</span>
                  </div>
                </div>

                {/* Notepad */}
                <div className="relative rounded-xl overflow-hidden"
                  style={{ background: "rgba(6,182,212,0.04)", border: notes !== company.notes ? "1px solid rgba(6,182,212,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>
                  {/* Top bar decoration */}
                  <div className="flex items-center gap-1.5 px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)" }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
                    <div className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
                    <div className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
                    <span className="ml-1 text-[10px] text-[#334155] font-mono">{company.name.toLowerCase().replace(/\s+/g, "-")}-notes.md</span>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    rows={4}
                    placeholder={`Jot down rounds, topics, tips for ${company.name}...\n\nExample:\n• Round 1: Aptitude (30 min)\n• Round 2: Technical - DSA\n• Key topics: Arrays, DP, OOP`}
                    className="w-full px-4 py-3 text-sm text-[#CBD5E1] placeholder:text-[#2d3a4d] focus:outline-none transition resize-none font-mono leading-relaxed"
                    style={{ background: "transparent" }}
                  />
                </div>

                {/* Discard option — only shown when there are unsaved in-flight changes */}
                <AnimatePresence>
                  {notes !== company.notes && saveStatus !== "saved" && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center justify-end mt-2 px-1"
                    >
                      <button
                        onClick={() => { setNotes(company.notes); setSaveStatus("idle"); }}
                        className="text-[11px] text-[#475569] hover:text-[#94A3B8] transition font-medium"
                      >
                        Discard
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Resources ── */}
              <ResourcesPanel companyId={company._id} companyName={company.name} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CompanyTracker() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      setCompanies(data.companies ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const handleUpdate = (id: string, patch: Partial<Company>) => {
    setCompanies((prev) => prev.map((c) => c._id === id ? { ...c, ...patch } : c));
  };

  const handleAddCompany = async () => {
    if (!newCompanyName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/companies", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCompanyName.trim() }),
      });
      if (res.status === 409) { toast.error("Company already exists"); return; }
      if (!res.ok) throw new Error();
      const company = await res.json();
      setCompanies((prev) => [...prev, company]);
      setNewCompanyName(""); setShowAddForm(false);
      toast.success(`${company.name} added ✓`);
    } catch { toast.error("Failed to add company"); }
    finally { setAdding(false); }
  };

  const filtered = companies.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: companies.length,
    not_started: companies.filter((c) => c.status === "not_started").length,
    in_progress: companies.filter((c) => c.status === "in_progress").length,
    done: companies.filter((c) => c.status === "done").length,
  };

  const filterTabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "in_progress", label: "In Progress" },
    { key: "done", label: "Done" },
    { key: "not_started", label: "Not Started" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #0b0d1a 0%, #0f1120 50%, #0a0c18 100%)" }}>
      {/* Background glows */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/7 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.25)" }}>
                <Building2 className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Companies</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-1.5 leading-none" style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: "linear-gradient(135deg, #67e8f9 0%, #a78bfa 60%, #fff 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Company Prep</h1>
            <p className="text-[#64748B] text-sm">Track companies · Share resources · Crack the interview.</p>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            {[
              { label: "Prepping", value: counts.in_progress, color: "text-amber-400", bg: "rgba(245,158,11,0.10)" },
              { label: "Done", value: counts.done, color: "text-emerald-400", bg: "rgba(16,185,129,0.10)" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl px-4 py-2.5 text-center border border-white/8"
                style={{ background: s.bg }}>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Search + Filter + Add ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies..."
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }} />
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setShowAddForm((v) => !v)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg shadow-violet-500/20 shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
            <Plus className="w-4 h-4" /> Add Company
          </motion.button>
        </motion.div>

        {/* ── Add Company form ── */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
              <div className="rounded-2xl border border-violet-500/25 p-4 flex gap-3 items-center"
                style={{ background: "rgba(139,92,246,0.07)" }}>
                <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                <input value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCompany()}
                  placeholder="Company name (e.g. Zoho, Freshworks...)"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-[#475569] focus:outline-none" />
                <button onClick={handleAddCompany} disabled={adding || !newCompanyName.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #0891b2)" }}>
                  {adding ? "Adding..." : "Add"}
                </button>
                <button onClick={() => { setShowAddForm(false); setNewCompanyName(""); }}
                  className="text-[#475569] hover:text-white transition"><X className="w-4 h-4" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Status filter tabs ── */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {filterTabs.map(({ key, label }) => (
            <button key={key} onClick={() => setStatusFilter(key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                statusFilter === key ? "text-white border-violet-500/40" : "text-[#64748B] border-white/8 hover:text-white hover:border-white/15"
              }`}
              style={statusFilter === key ? { background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(8,145,178,0.2))" } : { background: "rgba(255,255,255,0.03)" }}>
              {label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${statusFilter === key ? "bg-white/20 text-white" : "bg-white/5 text-[#475569]"}`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Company list ── */}
        {loading ? (
          <div className="space-y-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl border border-white/6 animate-pulse"
                style={{ background: "rgba(255,255,255,0.03)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-3xl border border-white/8 p-16 text-center"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            <Building2 className="w-12 h-12 text-[#334155] mx-auto mb-4" />
            <p className="text-lg font-bold text-white mb-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {search ? "No companies found" : "No companies in this filter"}
            </p>
            <p className="text-[#475569] text-sm">
              {search ? `No match for "${search}"` : "Try a different status filter."}
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="space-y-3">
            <AnimatePresence>
              {filtered.map((company, i) => (
                <motion.div key={company._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.04 }}>
                  <CompanyCard company={company} onUpdate={handleUpdate} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
