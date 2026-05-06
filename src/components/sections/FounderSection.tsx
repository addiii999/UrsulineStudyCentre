"use client";
import Image from "next/image";
import { Award, Users, BookOpen, Target, ArrowRight } from "lucide-react";

const ACHIEVEMENTS = [
  { icon: <Users size={20} className="text-[#C9A84C]" />, value: "5000+", label: "Students Guided" },
  { icon: <Target size={20} className="text-[#C9A84C]" />, value: "JEE/NEET", label: "Expert Mentorship" },
  { icon: <Award size={20} className="text-[#C9A84C]" />, value: "10+", label: "Years of Teaching" },
  { icon: <BookOpen size={20} className="text-[#C9A84C]" />, value: "Girls", label: "Education Mission" },
];

export default function FounderSection() {
  return (
    <section id="founder" className="py-20 md:py-28 bg-[#FDF8F0]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="section-tag">Meet the Founder</span>
          <h2 className="section-heading mt-4">
            Visionary Leadership
          </h2>
          <div className="gold-divider mx-auto mt-4" />
        </div>

        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* LEFT: PROFILE */}
          <div className="flex flex-col items-center lg:items-start">
            {/* Founder Photo — next/image for automatic WebP + correct sizing */}
            <div className="relative mb-8 group">
              {/* Decorative background blur */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#800000]/20 to-[#C9A84C]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative w-64 md:w-[22rem] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-white transition-transform duration-500 group-hover:-translate-y-1">
                <Image
                  src="/images/founder.png"
                  alt="Abhishek Pathak - Founder, Ursuline Study Centre"
                  fill
                  sizes="(max-width: 768px) 256px, 352px"
                  className="object-cover object-[center_top_10%] transition-transform duration-700 group-hover:scale-105"
                  quality={75}
                  priority
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-[#C9A84C] to-[#b39542] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg border-2 border-white transform transition-transform duration-500 group-hover:scale-105">
                M.Sc Mathematics
              </div>
            </div>

            <div className="text-center lg:text-left space-y-1">
              <h3
                className="text-2xl font-bold text-[#800000]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Abhishek Pathak
              </h3>
              <p className="text-[#C9A84C] font-semibold text-sm uppercase tracking-wider">
                Founder &amp; Director
              </p>
              <p className="text-gray-500 text-sm">JEE Expert · Mathematics Specialist</p>
            </div>

            {/* ACHIEVEMENTS GRID */}
            <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-sm">
              {ACHIEVEMENTS.map((a) => (
                <div
                  key={a.label}
                  className="card text-center py-4 px-3"
                >
                  <div className="flex justify-center mb-2">{a.icon}</div>
                  <div
                    className="text-lg font-bold text-[#800000]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {a.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: BIO */}
          <div className="space-y-6">
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                <strong className="text-gray-900">Abhishek Pathak</strong> is a highly accomplished
                educator with over <strong>10 years of experience</strong> teaching Mathematics and
                guiding students for JEE Main &amp; Advanced. Holding an M.Sc in Mathematics, he brings
                unparalleled depth, clarity, and passion to every classroom.
              </p>
              <p>
                Having personally mentored <strong>5000+ students</strong> across Jharkhand and
                beyond, Abhishek sir&apos;s teaching philosophy centers on building strong
                fundamentals while developing problem-solving instincts - the exact skills that
                make the difference in competitive exams.
              </p>
              <p>
                Driven by a deep commitment to <strong>girls&apos; education</strong>, he founded
                Ursuline Study Centre to create a world-class academic environment exclusively for
                young women - ensuring they receive the same quality of education that was
                historically inaccessible in many parts of Jharkhand.
              </p>
            </div>

            {/* QUOTE BOX */}
            <div className="bg-white rounded-xl border border-[#e8d9b8] p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#C9A84C]" />
              <div className="pl-4">
                <p className="text-gray-700 italic text-base leading-relaxed mb-2">
                  &ldquo;Every girl deserves access to world-class education. At USC, we don&apos;t
                  just teach subjects - we build futures.&rdquo;
                </p>
                <p className="text-[#800000] font-medium text-sm italic">
                  &ldquo;हर बेटी को बेहतरीन शिक्षा का हक है। USC में हम विषय नहीं, भविष्य बनाते हैं।&rdquo;
                </p>
                <p className="text-[#C9A84C] font-semibold text-xs mt-3">- Abhishek Pathak</p>
              </div>
            </div>

            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-primary"
            >
              Book a Counselling Session
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
