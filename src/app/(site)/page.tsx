import Link from "next/link";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import WhyUsSection from "@/components/sections/WhyUsSection";
import CoursesSection from "@/components/sections/CoursesSection";
import FounderSection from "@/components/sections/FounderSection";
import FacultySection from "@/components/sections/FacultySection";
import GallerySection from "@/components/sections/GallerySection";
import ResultsSection from "@/components/sections/ResultsSection";
import YoutubeSection from "@/components/sections/YoutubeSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import TrustBanner from "@/components/sections/TrustBanner";
import type { Metadata } from "next";

export const revalidate = 300; // Revalidate every 5 minutes (ISR)

export const metadata: Metadata = {
  title: "Ursuline Study Centre | Premium Girls Educational Institution in Ranchi",
  description:
    "Ursuline Study Centre - Premium girls-only educational institution in Ranchi for Classes 9-12, JEE, NEET & Board preparation (JAC & CBSE). Under the visionary guidance of Sr. Dr. Mary Grace.",
  alternates: {
    canonical: "https://ursulinstudycentre.in/",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection isPreview={true} />
      <WhyUsSection />
      <CoursesSection isPreview={true} />
      <FounderSection isPreview={true} />
      <FacultySection isPreview={true} />
      <GallerySection isPreview={true} />
      <ResultsSection isPreview={true} />
      <TrustBanner />
      <YoutubeSection isPreview={true} />
      <TestimonialsSection isPreview={true} />

      {/* ADMISSION CTA */}
      <section className="py-16 bg-[#800000] text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #C9A84C 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10 space-y-6">
          <span className="text-[#C9A84C] text-xs font-bold tracking-[0.2em] uppercase">
            Admissions Open 2026-27
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif">
            Empower Your Daughter&apos;s Academic Future
          </h2>
          <div className="w-16 h-[2px] bg-[#C9A84C] mx-auto opacity-70" />
          <p className="text-white/80 max-w-xl mx-auto text-sm leading-relaxed font-light">
            Join Ranchi&apos;s premium girls-only institution. Read about our step-by-step admission process, stream selections, and fee structure.
          </p>
          <div className="pt-2">
            <Link
              href="/admission"
              className="btn-primary inline-flex items-center gap-2 bg-[#C9A84C] text-[#800000] border-[#C9A84C] hover:bg-white hover:border-white hover:text-[#800000] transition-colors py-3 px-6"
            >
              View Admission Details
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="py-16 bg-[#FDF8F0] text-center border-t border-[#e8d9b8]">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <span className="section-tag">Have Questions?</span>
          <h2 className="text-3xl font-bold text-gray-900 font-serif">
            We Are Here To Guide You
          </h2>
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto opacity-70" />
          <p className="text-gray-600 max-w-md mx-auto text-sm leading-relaxed font-light">
            Speak with our admissions officer or book a free counselling session. Visit our campus in Ranchi.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/contact" className="btn-primary text-sm px-6 py-3">
              Contact Admissions Office
            </Link>
            <a
              href="https://wa.me/919507589503"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary text-sm px-6 py-3 flex items-center gap-2 border-gray-300 bg-white"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
