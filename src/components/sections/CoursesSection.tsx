"use client";
import { useState } from "react";
import { COURSES } from "@/lib/constants";
import clsx from "clsx";

export default function CoursesSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="courses" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-12">
          <span className="section-tag">Our Courses</span>
          <h2 className="section-heading mt-4">
            Comprehensive <span className="text-[#800000]">Academic Programs</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="section-subheading mx-auto mt-4">
            From board prep to competitive exams and vocational skills — a complete academic
            ecosystem for the modern girl student.
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
              <span>{cat.icon}</span>
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
                <div className="w-9 h-9 rounded-lg bg-[#800000]/8 flex items-center justify-center flex-shrink-0 group-hover:bg-[#800000]/15 transition-colors">
                  <span className="text-base">{COURSES[activeTab].icon}</span>
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
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm mb-4">
            Not sure which stream to choose? Our counsellors can help.
          </p>
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-primary"
          >
            Get Free Academic Counselling
          </button>
        </div>
      </div>
    </section>
  );
}
