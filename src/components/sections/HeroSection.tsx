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
      className="relative min-h-screen flex items-center overflow-hidden bg-white"
    >
      {/* DECORATIVE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[55%] h-full bg-[#FDF8F0]" />
        <div
          className="absolute bottom-0 left-0 w-full h-1 bg-[#C9A84C]"
          style={{ opacity: 0.3 }}
        />
        {/* Vertical Gold Line */}
        <div className="absolute top-0 right-[55%] w-px h-full bg-gradient-to-b from-transparent via-[#C9A84C]/30 to-transparent hidden lg:block" />
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full border border-[#C9A84C]/10" />
        <div className="absolute top-32 right-20 w-40 h-40 rounded-full border border-[#800000]/8" />
        <div className="absolute bottom-20 right-5 w-32 h-32 rounded-full bg-[#C9A84C]/5" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT CONTENT */}
          <div className="space-y-7">
            {/* BADGE */}
            <div className="inline-flex items-center gap-2 bg-[#800000] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
              Limited Seats Available — {SITE_CONFIG.sessionYear} Session
            </div>

            {/* HEADING */}
            <div>
              <h1
                className="text-4xl md:text-5xl xl:text-6xl font-bold text-[#800000] leading-[1.1] mb-3"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Ursuline
                <br />
                Study Centre
              </h1>
              <p className="text-xs md:text-sm font-semibold text-[#C9A84C] tracking-[0.15em] uppercase">
                Under the Visionary Guidance of Sr. Dr. Mary Grace
              </p>
            </div>

            {/* TAGLINE */}
            <div>
              <p className="text-xl md:text-2xl font-semibold text-gray-800 leading-snug">
                {SITE_CONFIG.tagline}
              </p>
              <p className="text-base text-[#800000]/70 font-medium mt-1">
                {SITE_CONFIG.taglineHindi}
              </p>
            </div>

            {/* DESCRIPTION */}
            <p className="text-gray-600 text-base leading-relaxed max-w-lg">
              Premium girls-only coaching in Ranchi for Classes 9–12 (JAC & CBSE), with dedicated
              preparation for JEE, NEET, and Board Examinations.
            </p>

            {/* CTA BUTTONS */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => scrollTo("contact")}
                className="btn-primary gap-2"
              >
                Book Free Counselling
                <ArrowRight size={16} />
              </button>
              <a
                href={SITE_CONFIG.playstoreLink}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary gap-2"
              >
                <Play size={15} fill="currentColor" />
                Academic Origin App
              </a>
            </div>

            {/* PILLS */}
            <div className="flex flex-wrap gap-2">
              {PILLS.map((pill) => (
                <span key={pill.label} className="chip">
                  {pill.icon}
                  {pill.label}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: STATS CARD */}
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
                  className="btn-primary w-full justify-center mt-6"
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
