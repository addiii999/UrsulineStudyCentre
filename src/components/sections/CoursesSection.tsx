"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Trophy, Briefcase, Loader2 } from "lucide-react";
import clsx from "clsx";

interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  is_active: boolean;
}

const TAB_ICONS: Record<string, React.ReactNode> = {
  "Academic Streams": <BookOpen size={15} />,
  "Competitive Exams": <Trophy size={15} />,
  "Vocational Skills": <Briefcase size={15} />,
};

const COURSE_ICON: Record<string, React.ReactNode> = {
  "Academic Streams": <BookOpen size={16} />,
  "Competitive Exams": <Trophy size={16} />,
  "Vocational Skills": <Briefcase size={16} />,
};

// Default categories in specific order
const CATEGORY_ORDER = ["Academic Streams", "Competitive Exams", "Vocational Skills"];

export default function CoursesSection({ isPreview = false }: { isPreview?: boolean }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses", { cache: "no-store" });
        const data = await res.json();
        const activeCourses = data.courses?.filter((c: Course) => c.is_active) ?? [];
        setCourses(activeCourses);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Group active courses by category
  const groupedCourses = CATEGORY_ORDER.map(category => {
    const catCourses = courses.filter(c => c.category === category);
    return {
      category,
      courses: isPreview ? catCourses.slice(0, 4) : catCourses,
    };
  }).filter(group => group.courses.length > 0);

  if (loading) {
    return (
      <section id="courses" className="py-14 md:py-20 bg-white flex justify-center">
        <Loader2 size={30} className="animate-spin text-[#800000]" />
      </section>
    );
  }

  if (groupedCourses.length === 0) {
    return (
      <section id="courses" className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-tag">Programs Offered</span>
            <h2 className="section-heading mt-3">
              Our <span className="text-[#800000]">Courses</span>
            </h2>
            <div className="gold-divider mx-auto mt-3" />
          </div>
          <div className="text-center py-16 bg-[#FDF8F0] rounded-xl border border-[#e8d9b8]">
            <p className="text-gray-500 font-medium">No courses available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  // Make sure activeTab is within bounds
  const currentTabIdx = activeTab < groupedCourses.length ? activeTab : 0;
  const currentGroup = groupedCourses[currentTabIdx];

  return (
    <section id="courses" className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-12">
          <span className="section-tag">Programs Offered</span>
          <h2 className="section-heading mt-3">
            Our <span className="text-[#800000]">Courses</span>
          </h2>
          <div className="gold-divider mx-auto mt-3" />
          <p className="section-subheading mx-auto mt-3">
            Comprehensive learning programs designed specifically for girls, focusing on
            academic excellence and holistic development.
          </p>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {groupedCourses.map((group, idx) => (
            <button
              key={group.category}
              onClick={() => setActiveTab(idx)}
              className={clsx(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
                currentTabIdx === idx
                  ? "bg-[#800000] text-white shadow-md"
                  : "bg-[#FDF8F0] text-gray-600 border border-[#e8d9b8] hover:border-[#C9A84C] hover:text-[#800000]"
              )}
            >
              <span>{TAB_ICONS[group.category] ?? <BookOpen size={15} />}</span>
              {group.category}
            </button>
          ))}
        </div>

        {/* COURSE CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {currentGroup.courses.map((course, i) => (
            <div
              key={course.id}
              className="card group cursor-default"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#800000]/8 flex items-center justify-center flex-shrink-0 group-hover:bg-[#800000]/15 transition-colors text-[#800000]">
                  {COURSE_ICON[course.category] ?? <BookOpen size={16} />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1.5 group-hover:text-[#800000] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{course.description}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <Link
                  href="/contact"
                  className="text-[#C9A84C] text-xs font-semibold hover:text-[#800000] transition-colors"
                >
                  Enquire Now →
                </Link>
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
          <div className="flex flex-wrap gap-3">
            {isPreview && (
              <Link href="/courses" className="btn-secondary text-sm text-center">
                View All Courses
              </Link>
            )}
            <Link 
              href="/contact"
              className="btn-primary text-sm whitespace-nowrap text-center"
            >
              Request Counseling
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
