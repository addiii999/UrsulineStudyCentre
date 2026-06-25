import ResultsSection from "@/components/sections/ResultsSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academic Results & Achievements | Ursuline Study Centre",
  description:
    "See our student results in JAC and CBSE boards, JEE Main/Advanced, and NEET exams. Verified accomplishments showing our commitment to academic excellence.",
  alternates: {
    canonical: "https://ursulinstudycentre.in/results",
  },
};

export default function ResultsPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="bg-[#800000] text-white py-16 md:py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #C9A84C 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-4">
          <span className="text-[#C9A84C] text-xs font-bold tracking-[0.2em] uppercase">
            Proven Outcomes
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-serif">Academic Achievements</h1>
          <div className="w-16 h-[2px] bg-[#C9A84C] mx-auto" />
        </div>
      </div>

      <ResultsSection isPreview={false} />
    </>
  );
}
