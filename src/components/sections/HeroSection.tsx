"use client";
import { ArrowRight, Play, Shield, BookOpen, Languages, GraduationCap, Users, Award, Trophy, Clock } from "lucide-react";
import { SITE_CONFIG, STATS } from "@/lib/constants";

const PILLS = [
  { icon: <Shield size={13} />, label: "Only Girls Institute" },
  { icon: <BookOpen size={13} />, label: "JAC & CBSE" },
  { icon: <Languages size={13} />, label: "English + Hindi" },
  { icon: <GraduationCap size={13} />, label: "Classes 9-12" },
];

const STAT_ICONS: Record<string, React.ReactNode> = {
  "Board Success Rate": <Award size={18} />,
  "Students Mentored": <Users size={18} />,
  "JEE/NEET Selections": <Trophy size={18} />,
  "Years of Legacy": <Clock size={18} />,
};

export default function HeroSection() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-[#800000]"
    >
      {/* BACKGROUND LAYERS — full maroon, no split */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, #C9A84C 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
        {/* Radial glow top-left */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#C9A84C]/5" />
        {/* Radial glow bottom-right */}
        <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full bg-white/3" />
        {/* Gold bottom stripe */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C9A84C]/60 via-[#C9A84C] to-[#C9A84C]/60" />
      </div>

      {/* FULL-WIDTH SINGLE COLUMN CONTENT */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-24 md:py-32">
        <div className="flex flex-col items-center text-center gap-8">

          {/* LIVE BADGE */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-semibold px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
            Limited Seats - {SITE_CONFIG.sessionYear} Session
          </div>

          {/* HEADING */}
          <div className="space-y-3">
            <h1
              className="text-5xl md:text-6xl xl:text-7xl font-bold text-white leading-[1.05]"
            >
              Ursuline{" "}
              <span className="text-[#C9A84C]">Study Centre</span>
            </h1>
            <p className="text-xs md:text-sm font-semibold text-white/50 tracking-[0.18em] uppercase">
              Under the Visionary Guidance of Sr. Dr. Mary Grace
            </p>
          </div>

          {/* TAGLINE */}
          <div className="space-y-1">
            <p className="text-xl md:text-2xl font-semibold text-white leading-snug">
              {SITE_CONFIG.tagline}
            </p>
            <p className="text-base text-[#C9A84C] font-medium">
              {SITE_CONFIG.taglineHindi}
            </p>
          </div>

          {/* DESCRIPTION */}
          <p className="text-white/70 text-base leading-relaxed max-w-2xl">
            Premium girls-only coaching in Ranchi for Classes 9-12 (JAC & CBSE), with dedicated
            preparation for JEE, NEET, and Board Examinations.
          </p>

          {/* CTA BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => scrollTo("contact")}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#C9A84C] text-white font-semibold text-sm rounded-lg border-2 border-[#C9A84C] hover:bg-[#A07830] hover:border-[#A07830] transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-[#C9A84C]/25"
            >
              Book Free Counselling
              <ArrowRight size={16} />
            </button>
            <a
              href={SITE_CONFIG.playstoreLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-transparent text-white font-semibold text-sm rounded-lg border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-200"
            >
              <Play size={15} fill="currentColor" />
              Academic Origin App
            </a>
          </div>

          {/* FEATURE PILLS */}
          <div className="flex flex-wrap justify-center gap-2">
            {PILLS.map((pill) => (
              <span
                key={pill.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 text-white/80 text-xs font-medium rounded-full"
              >
                {pill.icon}
                {pill.label}
              </span>
            ))}
          </div>

          {/* STATS STRIP */}
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1.5 bg-white/8 border border-white/12 rounded-xl py-5 px-4"
              >
                <div className="text-[#C9A84C]">
                  {STAT_ICONS[stat.label] ?? <Award size={18} />}
                </div>
                <div className="text-3xl font-bold text-white leading-none">
                  {stat.value}
                </div>
                <div className="text-white/55 text-xs font-medium text-center leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
