import TestimonialsSection from "@/components/sections/TestimonialsSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimonials & Reviews | Ursuline Study Centre",
  description:
    "Read what parents and students say about our classroom environments, bilingual teachers, exam success, and secure environment at Ursuline Study Centre Ranchi.",
  alternates: {
    canonical: "https://ursulinstudycentre.in/testimonials",
  },
};

export default function TestimonialsPage() {
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
            Student & Parent Reviews
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-serif">What People Say</h1>
          <div className="w-16 h-[2px] bg-[#C9A84C] mx-auto" />
        </div>
      </div>

      <TestimonialsSection isPreview={false} />
    </>
  );
}
