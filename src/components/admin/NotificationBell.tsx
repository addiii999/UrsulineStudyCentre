"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, BellOff, Check, CheckCheck, Trash2, Loader2 } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────
interface Notification {
  id:         string;
  title:      string;
  message:    string;
  type:       string;
  is_read:    boolean;
  created_at: string;
}

// ─── Type → Color/Icon mapping ───────────────────────────────
const TYPE_COLOR: Record<string, string> = {
  enquiry:      "bg-sky-100 text-sky-600",
  admission:    "bg-violet-100 text-violet-600",
  faculty:      "bg-emerald-100 text-emerald-600",
  course:       "bg-orange-100 text-orange-600",
  video:        "bg-rose-100 text-rose-600",
  gallery:      "bg-pink-100 text-pink-600",
  result:       "bg-amber-100 text-amber-600",
  announcement: "bg-indigo-100 text-indigo-600",
  system:       "bg-gray-100 text-gray-600",
};

const TYPE_EMOJI: Record<string, string> = {
  enquiry:      "📩",
  admission:    "📋",
  faculty:      "👩‍🏫",
  course:       "📚",
  video:        "▶️",
  gallery:      "🖼️",
  result:       "🏆",
  announcement: "📢",
  system:       "⚙️",
};

// ─── Relative timestamp ───────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)          return "Just now";
  if (diff < 3600)        return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400)       return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 172800)      return "Yesterday";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function NotificationBell() {
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [marking,       setMarking]       = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ─── Fetch ─────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const res  = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      setNotifications(json.notifications ?? []);
    } catch {/* silent */}
  }, []);

  // Initial load + polling every 30s
  useEffect(() => {
    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

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

  // ─── Mark single as read ───────────────────────────────────
  const markOneRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    await fetch("/api/notifications", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id }),
    });
  };

  // ─── Mark all as read ──────────────────────────────────────
  const markAllRead = async () => {
    if (unreadCount === 0) return;
    setMarking(true);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await fetch("/api/notifications", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ markAll: true }),
    });
    setMarking(false);
  };

  // ─── Clear all ─────────────────────────────────────────────
  const clearAll = async () => {
    if (!confirm("Clear all notifications?")) return;
    setNotifications([]);
    await fetch("/api/notifications", { method: "DELETE" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        className={`relative p-2 rounded-xl transition-all duration-200 ${
          open ? "bg-gray-100 text-[#800000]" : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
        }`}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {/* Unread dot */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-[#800000] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl shadow-[0_8px_40px_rgb(0,0,0,0.13)] border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-gray-50/80 to-white">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[13px] text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-[#800000] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={marking}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  {marking ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={13} />}
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Clear all"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-gray-400">
                <Loader2 size={18} className="animate-spin mr-2" />
                <span className="text-[12px]">Loading…</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                <BellOff size={24} className="opacity-30" />
                <p className="text-[12px] font-medium">No notifications yet</p>
                <p className="text-[11px] text-gray-300">Activity will appear here automatically.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markOneRead(n.id)}
                  className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    n.is_read ? "hover:bg-gray-50/80" : "bg-[#800000]/[0.03] hover:bg-[#800000]/[0.06]"
                  }`}
                >
                  {/* Type badge */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[15px] mt-0.5 ${TYPE_COLOR[n.type] ?? "bg-gray-100 text-gray-500"}`}>
                    {TYPE_EMOJI[n.type] ?? "🔔"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] leading-snug ${n.is_read ? "font-medium text-gray-700" : "font-bold text-gray-900"}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <p className={`text-[10px] font-semibold mt-1.5 ${n.is_read ? "text-gray-300" : "text-[#C9A84C]"}`}>
                      {relativeTime(n.created_at)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-[#800000] flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-50 bg-gray-50/40 flex items-center justify-between">
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
              >
                <Check size={12} />
                Mark all read
              </button>
              <span className="text-[10px] text-gray-300 font-medium">
                {notifications.length} total · polls every 30s
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
