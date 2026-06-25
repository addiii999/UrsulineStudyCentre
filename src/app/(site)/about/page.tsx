import AboutSection from "@/components/sections/AboutSection";
import WhyUsSection from "@/components/sections/WhyUsSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Ursuline Study Centre",
  description:
    "Learn about Ursuline Study Centre, a premium girls-only educational institution in Ranchi. Under the visionary guidance of Sr. Dr. Mary Grace.",
  alternates: {
    canonical: "https://ursulinstudycentre.in/about",
  },
};

export default function AboutPage() {
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
            About Our Institution
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-serif">Who We Are</h1>
          <div className="w-16 h-[2px] bg-[#C9A84C] mx-auto" />
        </div>
      </div>

      <AboutSection isPreview={false} />

      {/* INSTITUTIONAL HISTORY & CAMPUS INFO */}
      <section className="py-14 md:py-20 bg-[#FDF8F0] border-t border-[#e8d9b8] border-b border-[#e8d9b8]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="grid md:grid-cols-2 gap-10">
            {/* HISTORY */}
            <div className="space-y-4 bg-white p-8 rounded-2xl border border-[#f0ebe0] shadow-sm">
              <h2 className="text-2xl font-bold text-[#800000] font-serif">Our Legacy</h2>
              <div className="w-10 h-[2px] bg-[#C9A84C]" />
              <p className="text-gray-600 text-sm leading-relaxed pt-2">
                Ursuline Study Centre was established with the vision of offering high-quality, comprehensive educational mentorship specifically tailored for girls. Situated in the historic Ursuline Convent Campus in Ranchi, Jharkhand, our roots are deeply intertwined with the region&apos;s educational advancement.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                By bridging board curricula (JAC & CBSE) with competitive entrance prep (JEE & NEET), we provide a smooth transition for girls targeting elite engineering and medical seats nationwide.
              </p>
            </div>

            {/* CAMPUS DETAILS */}
            <div className="space-y-4 bg-white p-8 rounded-2xl border border-[#f0ebe0] shadow-sm">
              <h2 className="text-2xl font-bold text-[#800000] font-serif">Campus Infrastructure</h2>
              <div className="w-10 h-[2px] bg-[#C9A84C]" />
              <p className="text-gray-600 text-sm leading-relaxed pt-2">
                Our campus features modern classroom environments designed to be secure and nurturing. We ensure a disciplined study setting, enabling young women to focus entirely on academic learning.
              </p>
              <ul className="space-y-2 text-gray-600 text-sm pt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
                  Secure, girls-only convent environment
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
                  Dedicated study halls & query counters
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
                  Bilingual teaching (English + Hindi) methodology
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <WhyUsSection />
    </>
  );
}
