"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Reply,
  Flame,
  X,
  CheckCheck,
} from "lucide-react";

interface Notification {
  _id: string;
  type:
    | "reply_on_post"
    | "reply_on_reply"
    | "upvote_post"
    | "upvote_reply"
    | "accepted_answer"
    | "streak_warning";
  message: string;
  isRead: boolean;
  referenceId?: string;
  createdAt: string;
}

const TYPE_CONFIG = {
  reply_on_post: {
    icon: MessageSquare,
    color: "text-violet-400",
    bg: "bg-violet-500/15",
  },
  reply_on_reply: {
    icon: Reply,
    color: "text-cyan-400",
    bg: "bg-cyan-500/15",
  },
  upvote_post: {
    icon: ThumbsUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
  },
  upvote_reply: {
    icon: ThumbsUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
  },
  accepted_answer: {
    icon: CheckCircle2,
    color: "text-amber-400",
    bg: "bg-amber-500/15",
  },
  streak_warning: {
    icon: Flame,
    color: "text-orange-400",
    bg: "bg-orange-500/15",
  },
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // SWR handles polling, deduplication, and focus-revalidation automatically
  const { data: countData, mutate: mutateCount } = useSWR(
    "/api/notifications/count",
    fetcher,
    {
      refreshInterval: 60_000,        // poll every 60s
      revalidateOnFocus: true,        // refresh when user returns to tab
      dedupingInterval: 30_000,       // don't re-fetch if already fetched in last 30s
    }
  );
  const unread = countData?.unread ?? 0;



  // Fetch full list when dropdown opens
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBellClick = () => {
    setOpen((v) => !v);
    if (!open) fetchNotifications();
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    mutateCount({ unread: 0 }, false); // optimistic update — no revalidation needed
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      await fetch(`/api/notifications/${n._id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
      );
      mutateCount({ unread: Math.max(0, unread - 1) }, false);
    }
    setOpen(false);
    if (n.referenceId) {
      router.push(`/discuss/${n.referenceId}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={handleBellClick}
        className="relative p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-12 w-[360px] max-h-[480px] overflow-hidden rounded-2xl border border-white/10 bg-[#12141f]/95 backdrop-blur-xl shadow-2xl shadow-black/60 flex flex-col z-[100]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <span
                className="font-semibold text-sm text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Notifications
              </span>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-[#64748B] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="flex flex-col gap-2 p-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-14 rounded-xl bg-white/5 animate-pulse"
                    />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-[#64748B]">
                  <Bell className="w-10 h-10 opacity-30" />
                  <span className="text-sm">No notifications yet 🔔</span>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-white/5">
                  {notifications.map((n) => {
                    const cfg = TYPE_CONFIG[n.type];
                    const Icon = cfg.icon;
                    const isStreak = n.type === "streak_warning";

                    return (
                      <button
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all duration-150 hover:bg-white/5 ${
                          !n.isRead
                            ? isStreak
                              ? "bg-orange-500/5"
                              : "bg-violet-500/5"
                            : ""
                        }`}
                      >
                        {/* Icon */}
                        <div
                          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bg}`}
                        >
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-[13px] leading-snug ${
                              n.isRead ? "text-[#64748B]" : isStreak ? "text-orange-300" : "text-white"
                            }`}
                          >
                            {n.message}
                          </p>
                          <p className="text-[11px] text-[#475569] mt-0.5">
                            {formatDistanceToNow(new Date(n.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>

                        {/* Unread dot */}
                        {!n.isRead && (
                          <div
                            className={`shrink-0 mt-1.5 w-2 h-2 rounded-full ${
                              isStreak ? "bg-orange-400" : "bg-violet-400"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
