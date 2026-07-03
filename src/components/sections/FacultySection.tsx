import Image from "next/image";
import Link from "next/link";
import { BookOpen, GraduationCap, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
export const revalidate = 3600; // Revalidate every 1 hour (ISR)

export default async function FacultySection({ isPreview = false }: { isPreview?: boolean }) {
  console.log("=== FacultySection: START FETCH ===");
  const { data: facultyData, error } = await supabase
    .from("faculty")
    .select("*")
    .eq("is_deleted", false)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  console.log("=== FacultySection: END FETCH ===", { count: facultyData?.length, error });

  const faculty = facultyData ?? [];
  const displayedFaculty = isPreview ? faculty.slice(0, 3) : faculty;

  if (faculty.length === 0) {
    return (
      <section id="faculty" className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <span className="section-tag">Our Faculty</span>
            <h2 className="section-heading mt-4">
              Expert <span className="text-[#800000]">Educators</span>
            </h2>
            <div className="gold-divider mx-auto mt-4" />
          </div>
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500 font-medium">No faculty members available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="faculty" className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-8">
          <span className="section-tag">Our Faculty</span>
          <h2 className="section-heading mt-4">
            Expert <span className="text-[#800000]">Educators</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="section-subheading mx-auto mt-4">
            Highly qualified, experienced faculty dedicated to student academic
            excellence.
          </p>
        </div>

        {/* FACULTY CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedFaculty.map((member, i) => {
            const initials = member.name
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const colors = [
              "from-[#800000] to-[#5C0000]",
              "from-[#C9A84C] to-[#A07830]",
              "from-[#2D2D2D] to-[#1a1a1a]",
              "from-[#800000] to-[#5C0000]",
              "from-[#C9A84C] to-[#A07830]",
              "from-[#2D2D2D] to-[#1a1a1a]",
            ];

            return (
              <div key={member.id} className="card group">
                <div className="flex items-start gap-4">
                  {/* AVATAR — Next/Image with lazy loading + skeleton */}
                  {member.photo_url ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md border border-gray-100 bg-gray-100 relative">
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                        loading={i < 3 ? "eager" : "lazy"}
                        quality={75}
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center flex-shrink-0 shadow-md`}
                    >
                      <span className="text-white text-lg font-bold" style={{ fontFamily: "var(--font-serif)" }}>
                        {initials}
                      </span>
                    </div>
                  )}

                  {/* INFO */}
                  <div className="min-w-0">
                    <h3
                      className="font-bold text-gray-900 text-base leading-tight group-hover:text-[#800000] transition-colors"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {member.name}
                    </h3>
                    <p className="text-[#C9A84C] font-semibold text-xs uppercase tracking-wide mt-0.5">
                      {member.designation}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-[#C9A84C]" />
                    <span className="text-gray-700 text-sm font-medium">{member.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-gray-400" />
                    <span className="text-gray-500 text-sm">{member.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-[#C9A84C]" />
                    <span className="text-gray-500 text-sm">{member.experience}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isPreview && (
          <div className="text-center mt-10">
            <Link
              href="/faculty"
              className="btn-primary inline-flex items-center gap-2"
            >
              View All Faculty Members
            </Link>
          </div>
        )}

        <div className="text-center mt-8 space-y-1">
          <p className="text-gray-500 text-sm">
            All faculty members are subject matter experts with a passion for education and student success.
          </p>
          <p className="text-[#800000]/60 text-sm font-medium">शिक्षा ही सशक्त भविष्य की नींव है</p>
        </div>
      </div>
    </section>
  );
}
