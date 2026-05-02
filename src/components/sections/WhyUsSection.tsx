import { WHY_CHOOSE_US } from "@/lib/constants";

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
            style={{ fontFamily: "var(--font-serif)" }}
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
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              <div className="space-y-3">
                <div className="text-3xl">{item.icon}</div>
                <h3
                  className="font-bold text-white text-base group-hover:text-[#C9A84C] transition-colors"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {item.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
