"use client";
import { ArrowRight, Phone } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

export default function TrustBanner() {
  return (
    <section className="py-14 bg-[#5C0000] relative overflow-hidden">
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #C9A84C 0px, #C9A84C 1px, transparent 1px, transparent 50%)`,
          backgroundSize: "20px 20px",
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-[#C9A84C]/30" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#C9A84C]/30" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3
              className="text-2xl md:text-3xl font-bold text-white leading-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Admissions Open for{" "}
              <span className="text-[#C9A84C]">2026–27 Session</span>
            </h3>
            <p className="text-white/60 text-sm mt-1">
              Limited seats. Apply early to secure your daughter&apos;s future.
            </p>
            <p className="text-[#C9A84C]/70 text-sm mt-0.5 font-medium">
              सीमित सीटें — अभी आवेदन करें
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center md:justify-end">
            <a
              href={`tel:${SITE_CONFIG.phone}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/25 text-white text-sm font-semibold rounded-lg hover:bg-white/20 transition-all"
            >
              <Phone size={15} />
              {SITE_CONFIG.phone}
            </a>
            <button
              onClick={() =>
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] text-white text-sm font-semibold rounded-lg hover:bg-[#A07830] transition-all shadow-lg shadow-[#C9A84C]/20"
            >
              Book Free Counselling
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
