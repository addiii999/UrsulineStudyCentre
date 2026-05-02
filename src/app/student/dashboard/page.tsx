"use client";
import Link from "next/link";
import { GraduationCap, BookOpen, Calendar, Bell, LogOut, Home } from "lucide-react";

export default function StudentDashboardPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      {/* HEADER */}
      <header className="bg-white border-b border-[#f0ebe0] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#800000] flex items-center justify-center">
            <GraduationCap size={18} className="text-[#C9A84C]" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm" style={{ fontFamily: "var(--font-serif)" }}>
              Student Dashboard
            </h1>
            <p className="text-gray-400 text-xs">Ursuline Study Centre</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#800000] transition-colors">
            <Home size={14} />
            Website
          </Link>
          <Link href="/login" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors">
            <LogOut size={14} />
            Logout
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* WELCOME */}
        <div className="bg-[#800000] rounded-2xl p-6 text-white mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #C9A84C 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
              Welcome back, Student! 👋
            </h2>
            <p className="text-white/70 text-sm mt-1">
              Ursuline Study Centre — 2026-27 Session
            </p>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          {[
            { icon: <BookOpen size={20} className="text-[#C9A84C]" />, label: "My Courses", value: "Science PCM + JEE" },
            { icon: <Calendar size={20} className="text-[#C9A84C]" />, label: "Batch Timing", value: "Mon–Sat, 8–10 AM" },
            { icon: <Bell size={20} className="text-[#C9A84C]" />, label: "Notices", value: "2 New Updates" },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-[#f0ebe0] p-5 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#800000]/8 flex items-center justify-center mb-3">
                {c.icon}
              </div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{c.label}</p>
              <p className="font-bold text-gray-900 text-sm mt-1">{c.value}</p>
            </div>
          ))}
        </div>

        {/* NOTICE BOARD */}
        <div className="bg-white rounded-xl border border-[#f0ebe0] shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Bell size={15} className="text-[#C9A84C]" />
            <h3 className="font-bold text-gray-900 text-sm">Notice Board</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { title: "Welcome to USC 2026-27 Session!", date: "Today", type: "Important" },
              { title: "JEE Mock Test — 10th May 2026", date: "Yesterday", type: "Test" },
              { title: "Fee Payment Reminder", date: "3 days ago", type: "Admin" },
            ].map((n) => (
              <div key={n.title} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{n.date}</p>
                </div>
                <span className="chip text-[10px]">{n.type}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
