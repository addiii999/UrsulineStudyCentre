import { Shield, BookOpen, Users, Languages, Lightbulb, MapPin } from "lucide-react";
import { WHY_CHOOSE_US } from "@/lib/constants";

const ICON_MAP: Record<string, React.ReactNode> = {
  shield: <Shield size={20} />,
  book: <BookOpen size={20} />,
  users: <Users size={20} />,
  languages: <Languages size={20} />,
  lightbulb: <Lightbulb size={20} />,
  map: <MapPin size={20} />,
};

export default function WhyUsSection() {
  return (
    <section
      id="why-us"
      className="py-20 md:py-28 bg-[#800000] relative overflow-hidden"
    >
      {/* BACKGROUND TEXTURE */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, #C9A84C 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/3" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/3" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider">
            Why Choose Us
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold text-white mt-4"
            style={{ letterSpacing: "-0.02em" }}
          >
            The USC <span className="text-[#C9A84C]">Advantage</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="text-white/60 text-sm mt-4 max-w-xl mx-auto leading-relaxed">
            Six compelling reasons why top-performing girls choose Ursuline Study Centre.
          </p>
          <p className="text-[#C9A84C]/70 text-sm mt-1 font-medium">
            आपकी बेटी का भविष्य सुरक्षित हाथों में
          </p>
        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_CHOOSE_US.map((item, i) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-xl bg-white/8 border border-white/12 p-6 hover:bg-white/14 hover:border-[#C9A84C]/30 transition-all duration-300"
            >
              {/* NUMBER */}
              <div
                className="absolute top-4 right-4 text-5xl font-bold text-white/5 leading-none select-none"
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              <div className="space-y-3">
                {/* ICON */}
                <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/15 border border-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] group-hover:bg-[#C9A84C]/25 transition-colors">
                  {ICON_MAP[item.icon] ?? <Shield size={20} />}
                </div>
                <h3
                  className="font-semibold text-white text-sm group-hover:text-[#C9A84C] transition-colors"
                >
                  {item.title}
                </h3>
                <p className="text-white/58 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
