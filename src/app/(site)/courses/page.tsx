import CoursesSection from "@/components/sections/CoursesSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Courses | Ursuline Study Centre",
  description:
    "Explore our comprehensive academic streams including Science, Commerce, and Humanities alongside future-ready vocational skills courses in Ranchi.",
  alternates: {
    canonical: "https://ursulinstudycentre.in/courses",
  },
};

export default function CoursesPage() {
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
            Programs Offered
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-serif">Academic & Vocational Courses</h1>
          <div className="w-16 h-[2px] bg-[#C9A84C] mx-auto" />
        </div>
      </div>

      <CoursesSection isPreview={false} />
    </>
  );
}
