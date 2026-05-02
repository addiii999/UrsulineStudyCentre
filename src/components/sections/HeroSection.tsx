"use client";
import { ArrowRight, Play, Shield, BookOpen, Languages, GraduationCap } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

const PILLS = [
  { icon: <Shield size={13} />, label: "Only Girls Institute" },
  { icon: <BookOpen size={13} />, label: "JAC & CBSE" },
  { icon: <Languages size={13} />, label: "English + Hindi" },
  { icon: <GraduationCap size={13} />, label: "Classes 9–12" },
];

export default function HeroSection() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-[#800000]"
    >
      {/* DECORATIVE BACKGROUND LAYERS */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Right cream panel */}
        <div className="absolute top-0 right-0 w-[45%] h-full bg-[#FDF8F0]" />
        {/* Diagonal separator */}
        <div
          className="absolute top-0 right-[45%] w-0 h-0 hidden lg:block"
          style={{
            borderTop: "100vh solid #800000",
            borderRight: "80px solid transparent",
          }}
        />
        {/* Dot pattern on maroon */}
        <div
          className="absolute top-0 left-0 w-[55%] h-full opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, #C9A84C 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
        {/* Gold horizontal stripe at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C9A84C]/60 via-[#C9A84C] to-[#C9A84C]/60" />
        {/* Decorative circles on cream panel */}
        <div className="absolute top-16 right-8 w-72 h-72 rounded-full border border-[#C9A84C]/15" />
        <div className="absolute bottom-16 right-12 w-40 h-40 rounded-full bg-[#C9A84C]/5 border border-[#C9A84C]/10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 w-full">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          {/* LEFT CONTENT — on maroon */}
          <div className="space-y-8">
            {/* BADGE */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-semibold px-4 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
              Limited Seats Available — {SITE_CONFIG.sessionYear} Session
            </div>

            {/* HEADING */}
            <div>
              <h1
                className="text-5xl md:text-6xl xl:text-7xl font-bold text-white leading-[1.05] mb-4"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Ursuline
                <br />
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
            <p className="text-white/70 text-base leading-relaxed max-w-md">
              Premium girls-only coaching in Ranchi for Classes 9–12 (JAC & CBSE), with dedicated
              preparation for JEE, NEET, and Board Examinations.
            </p>

            {/* CTA BUTTONS */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => scrollTo("contact")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A84C] text-white font-semibold text-sm rounded-lg border-2 border-[#C9A84C] hover:bg-[#A07830] hover:border-[#A07830] transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-[#C9A84C]/20"
              >
                Book Free Counselling
                <ArrowRight size={16} />
              </button>
              <a
                href={SITE_CONFIG.playstoreLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-transparent text-white font-semibold text-sm rounded-lg border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-200"
              >
                <Play size={15} fill="currentColor" />
                Academic Origin App
              </a>
            </div>

            {/* PILLS */}
            <div className="flex flex-wrap gap-2">
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
          </div>

          {/* RIGHT: STATS CARD — on cream panel */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* MAIN CARD */}
              <div className="bg-white rounded-2xl shadow-2xl border border-[#f0ebe0] p-8 relative">
                <div className="text-center mb-8">
                  <div
                    className="text-2xl font-bold text-[#800000] mb-1"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    Why Choose USC?
                  </div>
                  <div className="gold-divider mx-auto" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { val: "95%", lbl: "Board Success" },
                    { val: "2500+", lbl: "Students Mentored" },
                    { val: "50+", lbl: "JEE/NEET Selections" },
                    { val: "10+", lbl: "Years Legacy" },
                  ].map((s) => (
                    <div
                      key={s.lbl}
                      className="bg-[#FDF8F0] rounded-xl p-4 text-center border border-[#e8d9b8]/50"
                    >
                      <div
                        className="text-2xl font-bold text-[#800000]"
                        style={{ fontFamily: "var(--font-serif)" }}
                      >
                        {s.val}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 font-medium">{s.lbl}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5">
                  {[
                    "🛡️ 100% Girls-Only Safe Campus",
                    "📋 JAC & CBSE Curriculum",
                    "🗣️ Bilingual English + Hindi Teaching",
                    "💻 Vocational + Academic Combo",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => scrollTo("contact")}
                  className="inline-flex items-center justify-center gap-2 w-full mt-6 px-6 py-3 bg-[#800000] text-white font-semibold text-sm rounded-lg border-2 border-[#800000] hover:bg-[#5C0000] transition-all duration-200"
                >
                  Apply Now — Free Counselling
                </button>
              </div>

              {/* FLOATING BADGE */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#800000] rounded-full flex flex-col items-center justify-center shadow-lg border-4 border-white">
                <span className="text-[#C9A84C] text-lg font-bold leading-none">EST</span>
                <span className="text-white text-xs font-semibold">{SITE_CONFIG.founded}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
