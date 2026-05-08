"use client";
import { useState, useEffect } from "react";
import {
  Users, BookOpen, MessageSquare, GraduationCap,
  Play, Loader2, TrendingUp, ArrowUpRight,
} from "lucide-react";

type AdminSection = "dashboard" | "courses" | "faculty" | "videos" | "testimonials"
  | "results" | "faq" | "students" | "fees" | "enquiries" | "announcements" | "settings";

interface Props {
  onNavigate: (section: AdminSection) => void;
}


const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  new:       { bg: "bg-sky-50",    text: "text-sky-700",    dot: "bg-sky-400" },
  contacted: { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400" },
  admitted:  { bg: "bg-emerald-50",text: "text-emerald-700",dot: "bg-emerald-400" },
  rejected:  { bg: "bg-rose-50",   text: "text-rose-600",   dot: "bg-rose-400" },
};

export default function AdminDashboardHome({ onNavigate }: Props) {
  const [stats, setStats] = useState({
    enquiries: 0,
    courses: 0,
    faculty: 0,
    students: 0,
    recentEnquiries: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [enqRes, stuRes, crsRes, facRes] = await Promise.all([
          fetch("/api/enquiry"),
          fetch("/api/students"),
          fetch("/api/courses"),
          fetch("/api/faculty"),
        ]);
        const [enq, stu, crs, fac] = await Promise.all([
          enqRes.json().catch(() => ({})),
          stuRes.json().catch(() => ({})),
          crsRes.json().catch(() => ({})),
          facRes.json().catch(() => ({})),
        ]);
        setStats({
          enquiries: enq.enquiries?.length || 0,
          students: stu.students?.filter((s: any) => s.admission_status === "enrolled").length || 0,
          courses: crs.courses?.length || 0,
          faculty: fac.faculty?.length || 0,
          recentEnquiries: (enq.enquiries || []).slice(0, 6),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const STAT_CARDS = [
    {
      label: "Total Enquiries",
      value: stats.enquiries,
      sub: "All time",
      icon: <MessageSquare size={17} />,
      accent: "#C9A84C",
      bg: "bg-[#FDF8F0]",
    },
    {
      label: "Active Courses",
      value: stats.courses,
      sub: "All streams",
      icon: <BookOpen size={17} />,
      accent: "#2563eb",
      bg: "bg-blue-50",
    },
    {
      label: "Faculty Members",
      value: stats.faculty,
      sub: "Currently active",
      icon: <Users size={17} />,
      accent: "#7c3aed",
      bg: "bg-violet-50",
    },
    {
      label: "Enrolled Students",
      value: stats.students,
      sub: "Current session",
      icon: <GraduationCap size={17} />,
      accent: "#059669",
      bg: "bg-emerald-50",
    },
  ];

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-5 max-w-6xl">

      {/* ── WELCOME BANNER ─────────────────────────────────── */}
      <div
        className="rounded-2xl px-7 py-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #6B0000 0%, #3D0000 60%, #1a0000 100%)",
        }}
      >
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #C9A84C 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        {/* Gold accent glow */}
        <div className="absolute top-0 right-16 w-48 h-48 rounded-full bg-[#C9A84C]/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[#C9A84C]/70 text-[11px] font-semibold uppercase tracking-[0.15em] mb-1">
              Admin Dashboard
            </p>
            <h2 className="text-white text-xl font-bold tracking-tight leading-snug">
              Welcome back 👋
            </h2>
            <p className="text-white/40 text-[12px] mt-1">{today}</p>
          </div>
          <div className="flex items-center gap-2 bg-white/[0.07] border border-white/10 rounded-xl px-4 py-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/70 text-[12px] font-medium">System Online</span>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-[11.5px] font-medium leading-tight">{card.label}</p>
              <div
                className={`${card.bg} w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0`}
                style={{ color: card.accent }}
              >
                {card.icon}
              </div>
            </div>
            <div>
              <p className="text-[28px] font-bold text-gray-900 leading-none tracking-tight">
                {loading ? (
                  <span className="inline-block w-8 h-7 bg-gray-100 rounded animate-pulse" />
                ) : card.value}
              </p>
              <p className="text-gray-400 text-[11px] mt-1.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── RECENT ENQUIRIES ───────────────────────────────── */}
      <div
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-4 rounded-full bg-[#C9A84C]" />
            <h3 className="font-semibold text-gray-800 text-[13.5px]">Recent Enquiries</h3>
          </div>
          <span className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
            Latest 6
          </span>
        </div>

        {/* Rows */}
        <div>
          {loading ? (
            <div className="flex flex-col gap-0 divide-y divide-gray-50">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="w-32 h-3 bg-gray-100 rounded animate-pulse" />
                    <div className="w-48 h-2.5 bg-gray-50 rounded animate-pulse" />
                  </div>
                  <div className="w-16 h-5 bg-gray-100 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : stats.recentEnquiries.length > 0 ? (
            <div className="divide-y divide-gray-50/80">
              {stats.recentEnquiries.map((e, idx) => {
                const sc = STATUS_CONFIG[e.status] ?? { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" };
                const initials = (e.name || "?").slice(0, 2).toUpperCase();
                const colors = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626", "#0891b2"];
                const avatarColor = colors[idx % colors.length];
                return (
                  <div
                    key={e.id || e.name}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/60 transition-colors duration-100 group"
                  >
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                      style={{ background: avatarColor }}
                    >
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-[13px] leading-tight">{e.name}</p>
                      <p className="text-gray-400 text-[11px] mt-0.5 truncate">
                        {e.class} · {e.stream} · {new Date(e.created_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text} capitalize`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                      {e.status || "new"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
              <MessageSquare size={28} className="text-gray-200" />
              <p className="text-gray-400 text-sm">No enquiries yet</p>
              <p className="text-gray-300 text-xs">They will appear here once students submit the form</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-50 bg-gray-50/40">
          <button
            onClick={() => onNavigate("enquiries")}
            className="flex items-center gap-1.5 text-[#800000] text-[12px] font-semibold hover:gap-2.5 transition-all duration-150 group"
          >
            <TrendingUp size={13} />
            View all enquiries
            <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* ── QUICK ACTIONS ──────────────────────────────────── */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          {
            label: "Add New Course",
            sub: "Publish to website",
            icon: <BookOpen size={18} />,
            from: "#800000", to: "#5c0000",
            section: "courses" as AdminSection,
          },
          {
            label: "Add Faculty Member",
            sub: "Upload photo & profile",
            icon: <Users size={18} />,
            from: "#92720A", to: "#C9A84C",
            section: "faculty" as AdminSection,
          },
          {
            label: "Add YouTube Video",
            sub: "Feature on homepage",
            icon: <Play size={18} />,
            from: "#1d4ed8", to: "#2563eb",
            section: "videos" as AdminSection,
          },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => onNavigate(action.section)}
            className="group flex items-center gap-4 rounded-2xl px-5 py-4 text-left hover:opacity-95 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${action.from} 0%, ${action.to} 100%)` }}
          >
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white flex-shrink-0 group-hover:bg-white/20 transition-colors">
              {action.icon}
            </div>
            <div className="min-w-0">
              <p className="text-white text-[13px] font-semibold leading-tight">{action.label}</p>
              <p className="text-white/55 text-[11px] mt-0.5">{action.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
