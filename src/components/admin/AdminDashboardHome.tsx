"use client";
import { useState, useEffect } from "react";
import { Users, BookOpen, MessageSquare, TrendingUp, GraduationCap, Play, Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-yellow-50 text-yellow-700 border-yellow-200",
  admitted: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminDashboardHome() {
  const [stats, setStats] = useState({
    enquiries: 0,
    courses: 0,
    faculty: 0,
    students: 0,
    recentEnquiries: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [enqRes, stuRes, crsRes, facRes] = await Promise.all([
          fetch("/api/enquiry"),
          fetch("/api/students"),
          fetch("/api/courses"),
          fetch("/api/faculty")
        ]);
        
        const [enq, stu, crs, fac] = await Promise.all([
          enqRes.json().catch(() => ({})),
          stuRes.json().catch(() => ({})),
          crsRes.json().catch(() => ({})),
          facRes.json().catch(() => ({}))
        ]);

        setStats({
          enquiries: enq.enquiries?.length || 0,
          students: stu.students?.filter((s:any) => s.admission_status === 'enrolled').length || 0,
          courses: crs.courses?.length || 0,
          faculty: fac.faculty?.length || 0,
          recentEnquiries: (enq.enquiries || []).slice(0, 5)
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const STATS_CARDS = [
    { label: "Total Enquiries", value: loading ? "..." : stats.enquiries, icon: <MessageSquare size={18} className="text-[#C9A84C]" />, change: "All Time" },
    { label: "Active Courses", value: loading ? "..." : stats.courses, icon: <BookOpen size={18} className="text-[#C9A84C]" />, change: "All Streams" },
    { label: "Faculty Members", value: loading ? "..." : stats.faculty, icon: <Users size={18} className="text-[#C9A84C]" />, change: "Active" },
    { label: "Enrolled Students", value: loading ? "..." : stats.students, icon: <GraduationCap size={18} className="text-[#C9A84C]" />, change: "Current Session" },
  ];

  return (
    <div className="space-y-6">
      {/* WELCOME */}
      <div className="bg-[#800000] rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #C9A84C 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative z-10">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
            Welcome back, Admin 👋
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Ursuline Study Centre - {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS_CARDS.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs font-medium">{s.label}</span>
              <div className="w-8 h-8 rounded-lg bg-[#800000]/8 flex items-center justify-center">
                {s.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-serif)" }}>
              {s.value}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{s.change}</p>
          </div>
        ))}
      </div>

      {/* RECENT ENQUIRIES */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: "var(--font-serif)" }}>
            Recent Enquiries
          </h3>
          <span className="text-xs text-gray-400">Last 7 days</span>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="px-5 py-8 flex justify-center items-center text-gray-500 text-sm">
              <Loader2 size={16} className="animate-spin mr-2" /> Loading...
            </div>
          ) : stats.recentEnquiries.length > 0 ? (
            stats.recentEnquiries.map((e) => (
              <div key={e.id || e.name} className="px-5 py-3 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#800000] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#C9A84C] text-xs font-bold">{e.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{e.name}</p>
                  <p className="text-gray-400 text-xs">{e.class} · {e.stream} · {new Date(e.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[e.status] || "bg-gray-50 text-gray-700"}`}>
                  {e.status}
                </span>
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-center text-gray-500 text-sm">
              No recent enquiries found.
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-gray-100">
          <button className="text-[#800000] text-xs font-semibold hover:underline flex items-center gap-1">
            <TrendingUp size={12} /> View All Enquiries
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Add New Course", icon: <BookOpen size={16} />, color: "bg-[#800000]" },
          { label: "Add Faculty Member", icon: <Users size={16} />, color: "bg-[#C9A84C]" },
          { label: "Add YouTube Video", icon: <Play size={16} />, color: "bg-[#FF0000]" },
        ].map((action) => (
          <button
            key={action.label}
            className={`${action.color} text-white rounded-xl p-4 flex items-center gap-3 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm`}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
