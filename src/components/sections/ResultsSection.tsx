import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function ResultsSection() {
  const { data: statsData } = await supabase
    .from("results")
    .select("*")
    .eq("is_deleted", false)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const stats = statsData ?? [];

  if (stats.length === 0) {
    return (
      <section id="results" className="py-14 md:py-20 bg-[#800000] relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider">
              Our Results
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold text-white mt-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Numbers That Speak for{" "}
              <span className="text-[#C9A84C]">Themselves</span>
            </h2>
          </div>
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-white/70 font-medium">No results available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="results" className="py-14 md:py-20 bg-[#800000] relative overflow-hidden">
      {/* DECORATIVE */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/3" />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle, #C9A84C 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider">
            Our Results
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold text-white mt-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Numbers That Speak for{" "}
            <span className="text-[#C9A84C]">Themselves</span>
          </h2>
          <p className="text-white/60 text-sm mt-3">
            A trusted legacy of academic excellence and proven results.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="text-center p-6 rounded-2xl bg-white/8 border border-white/10 hover:bg-white/12 transition-colors relative"
            >
              <span className="absolute top-2 right-3 text-[9px] uppercase tracking-wider font-bold text-white/30 border border-white/10 px-2 py-0.5 rounded-full">
                {stat.source}
              </span>
              <div
                className="text-4xl md:text-5xl font-bold text-[#C9A84C] mb-2 mt-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {stat.value}
              </div>
              <div className="text-white/70 text-sm font-medium leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 text-center max-w-4xl mx-auto flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-[#C9A84C]/30 text-white/90 text-[11px] md:text-xs font-semibold px-4 py-1.5 rounded-full tracking-wider uppercase">
             Powered by Academic Origin
          </div>
          <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-2xl">
            Ursuline Study Centre is built on the proven academic legacy of Academic Origin, a trusted institution with years of excellence in Board and competitive exam preparation.
          </p>
        </div>

        <div className="text-center mt-8 pt-6 border-t border-white/10">
          <p className="text-white/50 text-sm italic">
            &ldquo;Our results are not just numbers - they are the dreams of thousands of girls
            fulfilled.&rdquo;
          </p>
          <p className="text-[#C9A84C] text-xs mt-2">- Abhishek Pathak, Founder</p>
        </div>
      </div>
    </section>
  );
}
