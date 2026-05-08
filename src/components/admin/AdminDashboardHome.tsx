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
    recentAdmissions: [] as any[],
    classBreakdown: {} as Record<string, number>,
    streamBreakdown: {} as Record<string, number>,
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
          const enrolledStudents = stu.students?.filter((s: any) => s.admission_status === "enrolled" || s.admission_status === "approved") || [];
          
          const classCounts: Record<string, number> = {};
          const streamCounts: Record<string, number> = {};
          
          enrolledStudents.forEach((s: any) => {
            if (s.present_class) classCounts[s.present_class] = (classCounts[s.present_class] || 0) + 1;
            if (s.course) streamCounts[s.course] = (streamCounts[s.course] || 0) + 1;
          });

          setStats({
            enquiries: enq.enquiries?.length || 0,
            students: enrolledStudents.length,
            courses: crs.courses?.length || 0,
            faculty: fac.faculty?.length || 0,
            recentEnquiries: (enq.enquiries || []).slice(0, 6),
            recentAdmissions: enrolledStudents.slice(0, 5),
            classBreakdown: classCounts,
            streamBreakdown: streamCounts,
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── RECENT ENQUIRIES ───────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-4 rounded-full bg-[#C9A84C]" />
              <h3 className="font-semibold text-gray-800 text-[13.5px]">Recent Enquiries</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto min-h-[300px]">
            {loading ? (
              <div className="flex justify-center items-center h-full text-gray-300"><Loader2 className="animate-spin" /></div>
            ) : stats.recentEnquiries.length > 0 ? (
              <div className="divide-y divide-gray-50/80">
                {stats.recentEnquiries.slice(0,5).map((e, idx) => {
                  const sc = STATUS_CONFIG[e.status] ?? { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" };
                  const initials = (e.name || "?").slice(0, 2).toUpperCase();
                  const colors = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626", "#0891b2"];
                  const avatarColor = colors[idx % colors.length];
                  return (
                    <div key={e.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/60 transition-colors group">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: avatarColor }}>{initials}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-[13px] truncate">{e.name}</p>
                        <p className="text-gray-400 text-[11px] truncate">{e.class} · {e.stream}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text} capitalize`}>{e.status}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-300"><MessageSquare size={24} className="mb-2"/>No enquiries yet</div>
            )}
          </div>
          <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/40">
            <button onClick={() => onNavigate("enquiries")} className="text-[#800000] text-[12px] font-semibold flex items-center gap-1 hover:gap-2 transition-all">View all <ArrowUpRight size={12} /></button>
          </div>
        </div>

        {/* ── STUDENT ANALYTICS & BREAKDOWNS ──────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-4 rounded-full bg-[#800000]" />
              <h3 className="font-semibold text-gray-800 text-[13.5px]">Enrolled Students Breakdown</h3>
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto min-h-[300px]">
            {loading ? (
              <div className="flex justify-center items-center h-full text-gray-300"><Loader2 className="animate-spin" /></div>
            ) : (
              <>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">By Class</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.classBreakdown).map(([cls, count]) => (
                      <div key={cls} className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-gray-700">{cls}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#800000]" style={{ width: `${(count/stats.students)*100}%` }} /></div>
                          <span className="text-[12px] font-bold text-gray-900 w-6 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                    {Object.keys(stats.classBreakdown).length === 0 && <span className="text-xs text-gray-400">No data</span>}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">By Stream</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.streamBreakdown).map(([stream, count]) => (
                      <div key={stream} className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-gray-700 truncate max-w-[120px]">{stream}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#C9A84C]" style={{ width: `${(count/stats.students)*100}%` }} /></div>
                          <span className="text-[12px] font-bold text-gray-900 w-6 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                    {Object.keys(stats.streamBreakdown).length === 0 && <span className="text-xs text-gray-400">No data</span>}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/40">
            <button onClick={() => onNavigate("students")} className="text-[#800000] text-[12px] font-semibold flex items-center gap-1 hover:gap-2 transition-all">Manage Student Records <ArrowUpRight size={12} /></button>
          </div>
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
