"use client";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  const [admissionsOpen, setAdmissionsOpen] = useState(true);
  const [playStoreLink, setPlayStoreLink] = useState("https://play.google.com/store/apps/details?id=com.vefytech.academicorigin");

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          if (data.settings.admissionsOpen !== undefined) {
            setAdmissionsOpen(data.settings.admissionsOpen === "true");
          }
          if (data.settings.playStoreLink) {
            setPlayStoreLink(data.settings.playStoreLink);
          }
        }
      })
      .catch(console.error);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#800000]"
    >
      {/* BACKGROUND LAYERS */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #C9A84C 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] rounded-full bg-[#C9A84C]/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-20 text-center flex flex-col items-center">
        
        {/* ADMISSIONS BADGE */}
        {admissionsOpen && (
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/90 text-xs md:text-sm font-medium px-5 py-2 rounded-full mb-10 backdrop-blur-sm tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
            Admissions Open
          </div>
        )}

        <div className="space-y-5 mb-10 mt-4">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold text-white tracking-tight leading-[1.05]">
            Ursuline{" "}
            <span className="text-[#C9A84C]">Study Centre</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-[15px] font-medium text-[#C9A84C]/90 tracking-[0.2em] uppercase">
            Under the Visionary Guidance of Sr. Dr. Mary Grace
          </p>
        </div>

        <div className="space-y-6 max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-white/95 tracking-wide">
            Empowering Girls. Building Futures.
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/70 leading-relaxed font-light">
            Girls-only educational institution for Classes 9–12 (JAC & CBSE) with JEE/NEET preparation.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 mt-2 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <a
              href="#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C9A84C] text-[#800000] font-bold text-sm md:text-base rounded-lg border-2 border-[#C9A84C] hover:bg-white hover:border-white transition-all duration-300 shadow-[0_0_20px_rgba(201,168,76,0.2)] hover:-translate-y-1"
            >
              Book Free Counselling
              <ArrowRight size={18} />
            </a>
            <a
              href="#courses"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white font-medium text-sm md:text-base rounded-lg border border-white/30 hover:border-white hover:bg-white/5 transition-all duration-300 hover:-translate-y-1"
            >
              Explore Courses
            </a>
          </div>
          
          <a
            href={playStoreLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.523 15.3414L5.34142 22.4283C4.85764 22.7099 4.25002 22.3614 4.25002 21.8021V2.19796C4.25002 1.63855 4.85764 1.29013 5.34142 1.57169L17.523 8.65863C17.9734 8.92095 17.9734 9.57908 17.523 9.8414L15.3414 11.1111L12.5 12L15.3414 12.8889L17.523 15.3414Z" />
              <path d="M19.4673 10.7483L18.4908 10.1802L16.2737 11.4705L16.2738 12.5295L18.4908 13.8198L19.4673 13.2517C20.1776 12.8383 20.1776 11.1617 19.4673 10.7483Z" />
            </svg>
            <span className="underline underline-offset-4 decoration-white/30">Download Academic Origin App</span>
          </a>
        </div>
      </div>
    </section>
  );
}
