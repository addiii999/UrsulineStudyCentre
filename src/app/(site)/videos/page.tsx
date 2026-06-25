import YoutubeSection from "@/components/sections/YoutubeSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Videos & Lectures | Ursuline Study Centre",
  description:
    "Watch free academic lectures, subject tutorials, and board/entrance preparation tips from Academic Origin on our official YouTube channel page.",
  alternates: {
    canonical: "https://ursulinstudycentre.in/videos",
  },
};

export default function VideosPage() {
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
            Learning Resources
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-serif">Video Lectures</h1>
          <div className="w-16 h-[2px] bg-[#C9A84C] mx-auto" />
        </div>
      </div>

      <YoutubeSection isPreview={false} />
    </>
  );
}
