import { BookOpen } from "lucide-react";
import { FACULTY } from "@/lib/constants";

export default function FacultySection() {
  return (
    <section id="faculty" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-12">
          <span className="section-tag">Our Faculty</span>
          <h2 className="section-heading mt-4">
            Expert <span className="text-[#800000]">Educators</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="section-subheading mx-auto mt-4">
            Highly qualified, experienced faculty dedicated exclusively to girls&apos; academic
            excellence.
          </p>
        </div>

        {/* FACULTY CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FACULTY.map((member, i) => {
            const initials = member.name
              .split(" ")
              .map((w) => w[0])
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
              <div key={member.name} className="card group">
                <div className="flex items-start gap-4">
                  {/* AVATAR */}
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center flex-shrink-0 shadow-md`}
                  >
                    <span className="text-white text-lg font-bold" style={{ fontFamily: "var(--font-serif)" }}>
                      {initials}
                    </span>
                  </div>

                  {/* INFO */}
                  <div className="min-w-0">
                    <h3
                      className="font-bold text-gray-900 text-base leading-tight group-hover:text-[#800000] transition-colors"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {member.name}
                    </h3>
                    <p className="text-[#C9A84C] font-semibold text-xs uppercase tracking-wide mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#C9A84C]">📚</span>
                    <span className="text-gray-700 text-sm font-medium">{member.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-gray-400" />
                    <span className="text-gray-500 text-sm">{member.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#C9A84C]">⭐</span>
                    <span className="text-gray-500 text-sm">{member.experience} Experience</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10 space-y-1">
          <p className="text-gray-500 text-sm">
            All faculty members are subject matter experts with a passion for girls&apos; education.
          </p>
          <p className="text-[#800000]/60 text-sm font-medium">शिक्षा ही सशक्त भविष्य की नींव है</p>
        </div>
      </div>
    </section>
  );
}
