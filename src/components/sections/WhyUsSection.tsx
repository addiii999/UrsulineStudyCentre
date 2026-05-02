import { WHY_CHOOSE_US } from "@/lib/constants";

export default function WhyUsSection() {
  return (
    <section id="why-us" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-12">
          <span className="section-tag">Why Choose Us</span>
          <h2 className="section-heading mt-4">
            The USC <span className="text-[#800000]">Advantage</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="section-subheading mx-auto mt-4">
            Six compelling reasons why top-performing girls choose Ursuline Study Centre.
          </p>
        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE_US.map((item, i) => (
            <div
              key={item.title}
              className="card group relative overflow-hidden"
            >
              {/* NUMBER */}
              <div className="absolute top-4 right-4 text-5xl font-bold text-[#C9A84C]/10 leading-none select-none"
                style={{ fontFamily: "var(--font-serif)" }}>
                {String(i + 1).padStart(2, "0")}
              </div>

              <div className="space-y-3">
                <div className="text-3xl">{item.icon}</div>
                <h3
                  className="font-bold text-gray-900 text-base group-hover:text-[#800000] transition-colors"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
