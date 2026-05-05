"use client";
import { useState } from "react";
import { BookOpen, Trophy, Briefcase } from "lucide-react";
import { COURSES } from "@/lib/constants";
import clsx from "clsx";

const TAB_ICONS: Record<string, React.ReactNode> = {
  stream: <BookOpen size={15} />,
  exam: <Trophy size={15} />,
  skill: <Briefcase size={15} />,
};

const COURSE_ICON: Record<string, React.ReactNode> = {
  stream: <BookOpen size={16} />,
  exam: <Trophy size={16} />,
  skill: <Briefcase size={16} />,
};

export default function CoursesSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="courses" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-12">
          <span className="section-tag">Programs Offered</span>
          <h2 className="section-heading mt-4">
            Our <span className="text-[#800000]">Courses</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="section-subheading mx-auto mt-4">
            Comprehensive learning programs designed specifically for girls, focusing on
            academic excellence and holistic development.
          </p>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {COURSES.map((cat, idx) => (
            <button
              key={cat.category}
              onClick={() => setActiveTab(idx)}
              className={clsx(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
                activeTab === idx
                  ? "bg-[#800000] text-white shadow-md"
                  : "bg-[#FDF8F0] text-gray-600 border border-[#e8d9b8] hover:border-[#C9A84C] hover:text-[#800000]"
              )}
            >
              <span>{TAB_ICONS[cat.icon] ?? <BookOpen size={15} />}</span>
              {cat.category}
            </button>
          ))}
        </div>

        {/* COURSE CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {COURSES[activeTab].courses.map((course, i) => (
            <div
              key={course.name}
              className="card group cursor-default"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#800000]/8 flex items-center justify-center flex-shrink-0 group-hover:bg-[#800000]/15 transition-colors text-[#800000]">
                  {COURSE_ICON[COURSES[activeTab].icon] ?? <BookOpen size={16} />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1.5 group-hover:text-[#800000] transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{course.desc}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-[#C9A84C] text-xs font-semibold hover:text-[#800000] transition-colors"
                >
                  Enquire Now →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mt-14 pt-8 border-t border-gray-100">
          <div>
            <h4 className="font-bold text-gray-900 text-base mb-1" style={{ fontFamily: "var(--font-serif)" }}>Not sure which course to choose?</h4>
            <p className="text-gray-500 text-sm">Talk to our counselors for guidance.</p>
          </div>
          <button 
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-primary text-sm whitespace-nowrap"
          >
            Request Counseling
          </button>
        </div>
      </div>
    </section>
  );
}
