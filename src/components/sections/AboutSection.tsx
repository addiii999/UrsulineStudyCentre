import { MapPin, Building, Users, BookOpen, Languages } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import Link from "next/link";

const INFO_CHIPS = [
  { icon: <MapPin size={14} className="text-[#C9A84C]" />, label: "Ursuline Convent Campus, Ranchi" },
  { icon: <Building size={14} className="text-[#C9A84C]" />, label: `Estd. ${SITE_CONFIG.founded}` },
  { icon: <Users size={14} className="text-[#C9A84C]" />, label: "All Students Welcome" },
  { icon: <BookOpen size={14} className="text-[#C9A84C]" />, label: "Science, Commerce & Humanities" },
  { icon: <Languages size={14} className="text-[#C9A84C]" />, label: "English + Hindi" },
];

export default function AboutSection({ isPreview = false }: { isPreview?: boolean }) {
  return (
    <section id="about" className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* LEFT: TEXT */}
          <div className="space-y-6">
            <div>
              <span className="section-tag">About Us</span>
            </div>
            <h2 className="section-heading">
              A New Standard for
              <br />
              <span className="text-[#800000]">Academic Excellence</span> in Ranchi
            </h2>
            <div className="gold-divider" />
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                <strong className="text-gray-900">Ursuline Study Centre</strong> is a premium
                academic educational institution located in the heart of Ranchi, Jharkhand.
                Established in {SITE_CONFIG.founded} under the visionary guidance of{" "}
                <strong className="text-[#800000]">Sr. Dr. Mary Grace</strong>, we are committed
                to providing world-class education to every student of Jharkhand.
              </p>
              <p>
                Situated at the Ursuline Convent Campus on Dr. Camil Bulcke Path, our institute offers a
                safe, disciplined, and nurturing academic environment. We specialize in preparation for
                Classes 9–12, providing robust and thorough academic instruction across Science, Commerce, and Humanities.
              </p>
              <p>
                Our bilingual (English + Hindi) teaching methodology ensures that every student -
                regardless of their language background - grasps every concept with clarity and
                confidence. We combine strong academic foundations with future-ready vocational
                skills.
              </p>
            </div>

            {/* INFO CHIPS */}
            <div className="flex flex-wrap gap-2 pt-2">
              {INFO_CHIPS.map((chip) => (
                <div key={chip.label} className="chip">
                  {chip.icon}
                  {chip.label}
                </div>
              ))}
            </div>

            {isPreview && (
              <div className="pt-4 text-left">
                <Link
                  href="/about"
                  className="btn-primary text-sm inline-flex items-center gap-2"
                >
                  Read Full About Us
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT: VISUAL */}
          <div className="relative">
            <div className="bg-[#FDF8F0] rounded-2xl p-8 border border-[#e8d9b8]">
              {/* Mission */}
              <div className="mb-6">
                <div
                  className="text-xl font-bold text-[#800000] mb-2"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Our Mission
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To empower every student with knowledge, discipline, and confidence - creating leaders
                  who will shape the future of Jharkhand and India.
                </p>
              </div>

              <div className="border-t border-[#e8d9b8] pt-6 mb-6">
                <div
                  className="text-xl font-bold text-[#800000] mb-2"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Our Vision
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To be Ranchi&apos;s most trusted and premium educational institution, known
                  for academic excellence, character building, and career guidance.
                </p>
              </div>

              {/* Core values */}
              <div className="border-t border-[#e8d9b8] pt-6 grid grid-cols-3 gap-4">
                {["ज्ञान", "अनुशासन", "सफलता"].map((v, i) => {
                  const descs = ["Knowledge", "Discipline", "Success"];
                  return (
                    <div key={v} className="text-center">
                      <div
                        className="text-[#800000] font-bold text-lg"
                        style={{ fontFamily: "var(--font-serif)" }}
                      >
                        {v}
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5">{descs[i]}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DECORATIVE CORNER */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#C9A84C]/10 rounded-full border border-[#C9A84C]/20 -z-10" />
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-[#800000]/5 rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
