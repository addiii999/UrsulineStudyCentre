import FounderSection from "@/components/sections/FounderSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Founder's Message | Ursuline Study Centre",
  description:
    "Read the message from our founder Abhishek Pathak (JEE Mathematics Expert) about his academic philosophy and our mission for girls' education in Ranchi.",
  alternates: {
    canonical: "https://ursulinstudycentre.in/founder",
  },
};

export default function FounderPage() {
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
            Leadership Message
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-serif">Message From the Founder</h1>
          <div className="w-16 h-[2px] bg-[#C9A84C] mx-auto" />
        </div>
      </div>

      <FounderSection isPreview={false} />
    </>
  );
}
