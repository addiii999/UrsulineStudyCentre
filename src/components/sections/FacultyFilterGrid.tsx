"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import { BookOpen, GraduationCap, Clock } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FacultyMemberData {
  id: string;
  name: string;
  designation: string;
  subject: string;
  qualification: string;
  experience: string;
  photo_url?: string | null;
  faculty_category?: string | null;
}

// ─── Tab Config ───────────────────────────────────────────────────────────────
const TABS = ["All", "Science", "Commerce", "Humanities"] as const;
type Tab = (typeof TABS)[number];

// ─── Gradients for fallback avatars ──────────────────────────────────────────
const GRADIENTS = [
  "from-[#800000] to-[#5C0000]",
  "from-[#C9A84C] to-[#A07830]",
  "from-[#2D2D2D] to-[#1a1a1a]",
  "from-[#800000] to-[#5C0000]",
  "from-[#C9A84C] to-[#A07830]",
  "from-[#2D2D2D] to-[#1a1a1a]",
];

// ─── Single Faculty Card ──────────────────────────────────────────────────────
function FacultyCard({ member, index }: { member: FacultyMemberData; index: number }) {
  const initials = member.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_32px_rgba(128,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
      {/* PHOTO */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 flex-shrink-0">
        {member.photo_url ? (
          <Image
            src={member.photo_url}
            alt={`${member.name} — ${member.designation}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
            loading={index < 3 ? "eager" : "lazy"}
            quality={85}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} flex flex-col items-center justify-center gap-3`}>
            <span className="text-white text-6xl font-bold leading-none select-none" style={{ fontFamily: "var(--font-serif)" }}>
              {initials}
            </span>
            <span className="text-white/50 text-xs tracking-widest uppercase">No Photo</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* INFO */}
      <div className="flex flex-col flex-1 p-5">
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-[#800000] transition-colors duration-200" style={{ fontFamily: "var(--font-serif)" }}>
            {member.name}
          </h3>
          <p className="text-[#C9A84C] font-semibold text-xs uppercase tracking-widest mt-1">
            {member.designation}
          </p>
        </div>
        <div className="w-10 h-[2px] bg-[#C9A84C]/40 mb-4" />
        <div className="space-y-2.5 mt-auto">
          <div className="flex items-start gap-2.5">
            <BookOpen size={14} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
            <span className="text-gray-800 text-sm font-medium leading-snug">{member.subject}</span>
          </div>
          <div className="flex items-start gap-2.5">
            <GraduationCap size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-500 text-sm leading-snug">{member.qualification}</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock size={14} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
            <span className="text-gray-500 text-sm leading-snug">{member.experience}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────
export default function FacultyFilterGrid({ faculty }: { faculty: FacultyMemberData[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("All");

  // Client-side filter — no extra DB request on tab switch
  const filtered = useMemo(() => {
    if (activeTab === "All") return faculty;
    return faculty.filter((m) => m.faculty_category === activeTab);
  }, [activeTab, faculty]);

  // Only show tabs that have at least one member (+ always show "All")
  const visibleTabs = TABS.filter((tab) => {
    if (tab === "All") return true;
    return faculty.some((m) => m.faculty_category === tab);
  });

  return (
    <div>
      {/* ── FILTER TABS ─────────────────────────────────────────────────── */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl p-1.5 overflow-x-auto max-w-full scrollbar-none">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab;
            const count = tab === "All" ? faculty.length : faculty.filter((m) => m.faculty_category === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0
                  ${isActive
                    ? "bg-[#800000] text-white shadow-md"
                    : "text-gray-600 hover:text-[#800000] hover:bg-white"
                  }`}
              >
                {tab}
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold transition-colors duration-200
                    ${isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FACULTY GRID with fade transition ───────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-400 font-medium">No faculty members in this category yet.</p>
        </div>
      ) : (
        <div
          key={activeTab}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 animate-in fade-in duration-300"
        >
          {filtered.map((member, i) => (
            <FacultyCard key={member.id} member={member} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
