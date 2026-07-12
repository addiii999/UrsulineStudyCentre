import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mission, Vision & Values | Ursuline Study Centre",
  description:
    "Explore our core institutional mission, vision, and values (ज्ञान, अनुशासन, सफलता) guiding academic excellence at Ursuline Study Centre Ranchi.",
  alternates: {
    canonical: "https://ursulinstudycentre.in/mission",
  },
};

export default function MissionPage() {
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
            Institutional Values
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-serif">Mission & Vision</h1>
          <div className="w-16 h-[2px] bg-[#C9A84C] mx-auto" />
        </div>
      </div>

      {/* DETAILED MISSION & VISION CONTENT */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="grid md:grid-cols-2 gap-10 items-stretch">
            {/* MISSION */}
            <div className="bg-[#FDF8F0] p-8 rounded-2xl border border-[#e8d9b8] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#800000] text-[#C9A84C] font-bold text-lg font-serif">
                  M
                </div>
                <h2 className="text-2xl font-bold text-[#800000] font-serif">Our Mission</h2>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  To empower every student with deep conceptual knowledge, academic discipline, and self-confidence. We strive to nurture leaders who will shape the socio-economic and technological future of Jharkhand and the nation by making elite educational resources accessible.
                </p>
              </div>
            </div>

            {/* VISION */}
            <div className="bg-[#FDF8F0] p-8 rounded-2xl border border-[#e8d9b8] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#800000] text-[#C9A84C] font-bold text-lg font-serif">
                  V
                </div>
                <h2 className="text-2xl font-bold text-[#800000] font-serif">Our Vision</h2>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  To be recognized as Ranchi&apos;s most trusted and premier educational institution. We aim to establish a gold standard in academic performance across Science, Commerce, and Humanities, while emphasizing character building, moral values, and active career guidance.
                </p>
              </div>
            </div>
          </div>

          {/* CORE VALUES */}
          <div className="space-y-8 pt-8 border-t border-gray-100">
            <div className="text-center">
              <span className="section-tag">USC Pillars</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif mt-2">
                Our Core Values
              </h2>
              <div className="gold-divider mx-auto mt-3" />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  value: "ज्ञान (Knowledge)",
                  desc: "We promote deep conceptual clarity and academic understanding, building a foundation that stays with the students for life.",
                },
                {
                  value: "अनुशासन (Discipline)",
                  desc: "Discipline is the key to consistency. We maintain a secure, organized environment that cultivates study habits and focus.",
                },
                {
                  value: "सफलता (Success)",
                  desc: "Success is a byproduct of preparation and effort. We guide our students to achieve their dreams in board and competitive exams.",
                },
              ].map((val, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center space-y-3">
                  <h3 className="text-xl font-bold text-[#800000] font-serif">{val.value}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
