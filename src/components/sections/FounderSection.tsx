"use client";
import Image from "next/image";
import Link from "next/link";
import { Award, Users, BookOpen, Target, ArrowRight, Quote } from "lucide-react";

const ACHIEVEMENTS = [
  { icon: <Users size={18} className="text-[#C9A84C]" />, value: "5000+", label: "Students Guided" },
  { icon: <Target size={18} className="text-[#C9A84C]" />, value: "Academic", label: "Expert Mentorship" },
  { icon: <Award size={18} className="text-[#C9A84C]" />, value: "10+", label: "Years Experience" },
  { icon: <BookOpen size={18} className="text-[#C9A84C]" />, value: "Mission", label: "Quality Education" },
];

export default function FounderSection({ isPreview = false }: { isPreview?: boolean }) {
  return (
    <section id="founder" className="py-20 md:py-28 bg-[#FDF8F0] relative overflow-hidden">


      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#C9A84C] uppercase mb-3 block">
            Meet the Founder
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#800000] mb-5" style={{ fontFamily: "var(--font-serif)" }}>
            Visionary Leadership
          </h2>
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto opacity-70" />
        </div>

        {/* 2-COLUMN STRUCTURE */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* LEFT: FOUNDER IMAGE & TITLE (Col-Span-5) */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start group">
            
            {/* Image Container */}
            <div className="relative mb-8 w-full max-w-[320px] mx-auto lg:mx-0">
              {/* Elegant hover glow */}
              <div className="absolute -inset-4 bg-gradient-to-b from-[#800000]/10 to-[#C9A84C]/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              {/* Image Frame */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-[0_20px_40px_rgb(0,0,0,0.08)] border-4 border-white transition-transform duration-700 hover:-translate-y-1">
                <Image
                  src="/images/founder.png"
                  alt="Abhishek Pathak - Founder, Ursuline Study Centre"
                  fill
                  sizes="(max-width: 768px) 320px, 400px"
                  className="object-cover object-[center_top_10%] transition-transform duration-1000 group-hover:scale-105"
                  quality={85}
                  priority
                />
              </div>

              {/* Qualification Badge */}
              <div className="absolute -bottom-5 -right-2 bg-white text-[#800000] text-[13px] font-bold px-6 py-3 rounded-full shadow-[0_8px_20px_rgb(0,0,0,0.12)] border border-gray-100 transform transition-transform duration-500 hover:scale-105 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />
                M.Sc Mathematics
              </div>
            </div>

            {/* Name & Designation */}
            <div className="text-center lg:text-left space-y-1.5 px-2">
              <h3 className="text-[28px] font-bold text-gray-900 leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
                Abhishek Pathak
              </h3>
              <p className="text-[#C9A84C] font-bold text-[11px] tracking-[0.15em] uppercase">
                Founder &amp; Director
              </p>
              <p className="text-gray-500 text-[13px] font-medium pt-1">
                Senior Faculty · Mathematics Specialist
              </p>
            </div>
          </div>


          {/* RIGHT: CONTENT & PROFILE (Col-Span-7) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-10 lg:pt-4">
            
            {/* Story & Mission Intro */}
            <div className="space-y-5 text-[15px] text-gray-600 leading-[1.8]">
              <p>
                <strong className="text-gray-900 font-semibold font-serif">Abhishek Pathak</strong> is a highly accomplished
                educator with over a decade of experience teaching Mathematics and
                guiding students toward academic excellence. Holding an M.Sc in Mathematics, he brings
                unparalleled depth, clarity, and passion to every classroom.
              </p>
              <p>
                Driven by a deep commitment to <strong className="text-[#800000] font-semibold">quality education</strong>, he founded
                Ursuline Study Centre to create a world-class academic environment for
                every aspiring student. His philosophy centers on building strong fundamentals while developing 
                problem-solving instincts—the exact skills that guarantee success in competitive exams.
              </p>
            </div>

            {/* NEW SUBSECTION: Academic Leadership Profile */}
            <div className="pt-8 pb-4 border-t border-black/[0.04]">
              <h4 className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-6 flex items-center gap-4">
                Academic Leadership Profile
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
              </h4>
              
              <div className="grid grid-cols-2 gap-6 sm:gap-8">
                {ACHIEVEMENTS.map((a, i) => (
                  <div key={i} className="flex flex-col space-y-1.5 group/stat">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-[#C9A84C]/20 flex items-center justify-center flex-shrink-0 group-hover/stat:bg-[#C9A84C]/10 transition-colors">
                        {a.icon}
                      </div>
                      <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-serif)" }}>
                        {a.value}
                      </span>
                    </div>
                    <span className="text-[13px] text-gray-500 font-medium pl-[42px]">
                      {a.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* QUOTE BOX - Premium Redesign */}
            <div className="relative bg-white rounded-2xl p-8 sm:p-10 shadow-[0_10px_30px_rgb(0,0,0,0.03)] border border-[#e8d9b8]/50 group transition-all duration-300 hover:shadow-[0_15px_40px_rgb(0,0,0,0.06)]">
              {/* Elegant Accent Bar */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#C9A84C] to-[#92720A] rounded-l-2xl" />
              
              {/* Quote Icon */}
              <div className="absolute -top-3 right-8 bg-[#FDF8F0] px-2 text-[#C9A84C]/30 transform rotate-180">
                <Quote size={32} fill="currentColor" />
              </div>

              <div className="relative z-10">
                <p className="text-gray-800 text-[15px] sm:text-[17px] italic leading-relaxed mb-4 font-medium">
                  &ldquo;Every girl deserves access to world-class education. At USC, we don&apos;t
                  just teach subjects — we build futures.&rdquo;
                </p>
                <p className="text-[#800000] text-[14px] sm:text-[15px] italic leading-relaxed">
                  &ldquo;हर बेटी को बेहतरीन शिक्षा का हक है। USC में हम विषय नहीं, भविष्य बनाते हैं।&rdquo;
                </p>
                
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-6 h-[1px] bg-[#C9A84C]" />
                  <span className="text-[#C9A84C] font-bold text-[12px] uppercase tracking-wider">
                    Abhishek Pathak
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="group relative inline-flex items-center gap-3 bg-[#800000] text-white px-8 py-4 rounded-xl font-semibold text-[14px] overflow-hidden transition-all hover:bg-[#600000] hover:shadow-[0_8px_20px_rgb(128,0,0,0.2)] active:scale-[0.98] text-center justify-center"
              >
                <span className="relative z-10">Book a Counselling Session</span>
                <ArrowRight size={18} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              {isPreview && (
                <Link
                  href="/founder"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-[#800000] font-bold text-sm rounded-xl border border-[#800000]/30 hover:border-[#800000] hover:bg-[#800000]/5 transition-all duration-300"
                >
                  Read Full Message
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
