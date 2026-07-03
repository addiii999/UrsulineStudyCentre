import Image from "next/image";
import Link from "next/link";
import { BookOpen, GraduationCap, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

// ─── Category config ─────────────────────────────────────────────────────────
const CATEGORY_ORDER = [
  "Science",
  "Commerce",
  "Humanities",
  "Competitive Exams",
  "Vocational",
  "Other",
] as const;

type Category = (typeof CATEGORY_ORDER)[number];

const CATEGORY_META: Record<Category, { subtitle: string; color: string }> = {
  Science: {
    subtitle: "Experienced educators for Physics, Chemistry, Biology and Mathematics.",
    color: "from-[#800000] to-[#5C0000]",
  },
  Commerce: {
    subtitle: "Expert faculty for Accountancy, Business Studies, Economics and Tally.",
    color: "from-[#6B4000] to-[#4A2C00]",
  },
  Humanities: {
    subtitle: "Dedicated educators for History, Geography, Political Science and Literature.",
    color: "from-[#1a3a1a] to-[#0f220f]",
  },
  "Competitive Exams": {
    subtitle: "Specialist mentors for JEE, NEET, CLAT and other national entrance exams.",
    color: "from-[#1a1a4a] to-[#0f0f2e]",
  },
  Vocational: {
    subtitle: "Skilled instructors for AI, Coding, Digital Marketing and future-ready skills.",
    color: "from-[#2D2D2D] to-[#1a1a1a]",
  },
  Other: {
    subtitle: "Qualified educators supporting diverse academic needs.",
    color: "from-[#800000] to-[#5C0000]",
  },
};

const GRADIENTS = [
  "from-[#800000] to-[#5C0000]",
  "from-[#C9A84C] to-[#A07830]",
  "from-[#2D2D2D] to-[#1a1a1a]",
  "from-[#800000] to-[#5C0000]",
  "from-[#C9A84C] to-[#A07830]",
  "from-[#2D2D2D] to-[#1a1a1a]",
];

// ─── Faculty Card (shared) ────────────────────────────────────────────────────
function FacultyCard({ member, index }: { member: any; index: number }) {
  const initials = member.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_32px_rgba(128,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
      {/* PHOTO */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 flex-shrink-0">
        {member.photo_url ? (
          <Image
            src={member.photo_url}
            alt={`${member.name} — ${member.designation}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
            loading={index < 3 ? "eager" : "lazy"}
            quality={85}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} flex flex-col items-center justify-center gap-3`}>
            <span className="text-white text-6xl font-bold leading-none select-none" style={{ fontFamily: "var(--font-serif)" }}>
              {initials}
            </span>
            <span className="text-white/50 text-xs tracking-widest uppercase">No Photo</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* INFO */}
      <div className="flex flex-col flex-1 p-5">
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-[#800000] transition-colors duration-200" style={{ fontFamily: "var(--font-serif)" }}>
            {member.name}
          </h3>
          <p className="text-[#C9A84C] font-semibold text-xs uppercase tracking-widest mt-1">
            {member.designation}
          </p>
        </div>
        <div className="w-10 h-[2px] bg-[#C9A84C]/40 mb-4" />
        <div className="space-y-2.5 mt-auto">
          <div className="flex items-start gap-2.5">
            <BookOpen size={14} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
            <span className="text-gray-800 text-sm font-medium leading-snug">{member.subject}</span>
          </div>
          <div className="flex items-start gap-2.5">
            <GraduationCap size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-500 text-sm leading-snug">{member.qualification}</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock size={14} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
            <span className="text-gray-500 text-sm leading-snug">{member.experience}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function CategorySection({
  category,
  members,
}: {
  category: Category;
  members: any[];
}) {
  const meta = CATEGORY_META[category];
  return (
    <div className="mb-16 last:mb-0">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-3">
        <div className={`w-1 h-10 rounded-full bg-gradient-to-b ${meta.color} flex-shrink-0`} />
        <div>
          <h3
            className="text-xl md:text-2xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {category} <span className="text-[#800000]">Faculty</span>
          </h3>
          <p className="text-gray-500 text-sm mt-0.5">{meta.subtitle}</p>
        </div>
      </div>
      <div className="h-[1px] bg-gradient-to-r from-[#C9A84C]/40 via-[#C9A84C]/10 to-transparent mb-8" />

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {members.map((member, i) => (
          <FacultyCard key={member.id} member={member} index={i} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
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

  if (faculty.length === 0) {
    return (
      <section id="faculty" className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <span className="section-tag">Our Faculty</span>
            <h2 className="section-heading mt-4">Expert <span className="text-[#800000]">Educators</span></h2>
            <div className="gold-divider mx-auto mt-4" />
          </div>
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500 font-medium">No faculty members available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  // ── Preview mode: just show flat grid of 3 ──────────────────────────────
  if (isPreview) {
    const previewFaculty = faculty.slice(0, 3);
    return (
      <section id="faculty" className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="section-tag">Our Faculty</span>
            <h2 className="section-heading mt-4">Expert <span className="text-[#800000]">Educators</span></h2>
            <div className="gold-divider mx-auto mt-4" />
            <p className="section-subheading mx-auto mt-4">
              Highly qualified, experienced faculty dedicated to student academic excellence.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {previewFaculty.map((member, i) => (
              <FacultyCard key={member.id} member={member} index={i} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/faculty" className="btn-primary inline-flex items-center gap-2">
              View All Faculty Members
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ── Full page mode: group by category ────────────────────────────────────
  const grouped: Partial<Record<Category, any[]>> = {};
  for (const member of faculty) {
    const cat: Category = CATEGORY_ORDER.includes(member.faculty_category)
      ? member.faculty_category
      : "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat]!.push(member);
  }

  // Only include categories that have at least one member, in defined order
  const activeCategories = CATEGORY_ORDER.filter((cat) => (grouped[cat]?.length ?? 0) > 0);

  return (
    <section id="faculty" className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-14">
          <span className="section-tag">Our Faculty</span>
          <h2 className="section-heading mt-4">
            Expert <span className="text-[#800000]">Educators</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="section-subheading mx-auto mt-4">
            Highly qualified, experienced faculty dedicated to student academic excellence.
          </p>
        </div>

        {/* STREAM-WISE SECTIONS */}
        {activeCategories.map((cat) => (
          <CategorySection key={cat} category={cat} members={grouped[cat]!} />
        ))}

        <div className="text-center mt-10 space-y-1 border-t border-gray-100 pt-10">
          <p className="text-gray-500 text-sm">
            All faculty members are subject matter experts with a passion for education and student success.
          </p>
          <p className="text-[#800000]/60 text-sm font-medium">शिक्षा ही सशक्त भविष्य की नींव है</p>
        </div>
      </div>
    </section>
  );
}
