import FaqSection from "@/components/sections/FaqSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Ursuline Study Centre",
  description:
    "Find answers to common questions about admissions, academic streams, class schedules, bilingual teaching, safety, and faculty at Ursuline Study Centre Ranchi.",
  alternates: {
    canonical: "https://ursulinstudycentre.in/faq",
  },
};

export default function FaqPage() {
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
            FAQ Helpdesk
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-serif">Frequently Asked Questions</h1>
          <div className="w-16 h-[2px] bg-[#C9A84C] mx-auto" />
        </div>
      </div>

      <FaqSection isPreview={false} />
    </>
  );
}
