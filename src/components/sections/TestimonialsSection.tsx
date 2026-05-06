import { Star, Quote } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function TestimonialsSection() {
  const { data: testimonialsData } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const testimonials = testimonialsData ?? [];

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-14 md:py-20 bg-[#FDF8F0]">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-12">
          <span className="section-tag">Testimonials</span>
          <h2 className="section-heading mt-4">
            What <span className="text-[#800000]">Parents & Students</span> Say
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="text-[#800000]/60 text-sm font-medium mt-3">आपकी बेटी का भविष्य सुरक्षित हाथों में</p>
        </div>

        {/* TESTIMONIAL GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => {
            const initials = t.name
              ? t.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
              : "";

            return (
              <div
                key={t.id}
                className="card flex flex-col gap-4 relative"
              >
                {/* QUOTE ICON */}
                <Quote size={32} className="text-[#C9A84C]/20 absolute top-4 right-4" />

                {/* STARS */}
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating || 5 }).map((_, si) => (
                    <Star
                      key={si}
                      size={14}
                      className="text-[#C9A84C] fill-[#C9A84C]"
                    />
                  ))}
                </div>

                {/* REVIEW */}
                <p className="text-gray-600 text-sm leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* AUTHOR */}
                <div className="flex items-center gap-3 border-t border-gray-100 pt-3">
                  <div className="w-10 h-10 rounded-full bg-[#800000] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#C9A84C] text-xs font-bold">{initials}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.student_class}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
