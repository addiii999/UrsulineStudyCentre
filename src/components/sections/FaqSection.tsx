"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "@/lib/constants";
import clsx from "clsx";

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-28 bg-[#FDF8F0]">
      <div className="max-w-4xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-12">
          <span className="section-tag">FAQ</span>
          <h2 className="section-heading mt-4">
            Frequently Asked <span className="text-[#800000]">Questions</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="section-subheading mx-auto mt-4">
            Everything you need to know about Ursuline Study Centre.
          </p>
        </div>

        {/* ACCORDION */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={clsx(
                "bg-white rounded-xl border transition-all duration-200 overflow-hidden",
                open === i ? "border-[#C9A84C]/50 shadow-sm" : "border-[#f0ebe0]"
              )}
            >
              <button
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span
                  className={clsx(
                    "font-semibold text-sm leading-snug transition-colors",
                    open === i ? "text-[#800000]" : "text-gray-800"
                  )}
                >
                  {faq.q}
                </span>
                <ChevronDown
                  size={18}
                  className={clsx(
                    "text-[#C9A84C] flex-shrink-0 transition-transform duration-200",
                    open === i && "rotate-180"
                  )}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <div className="w-full h-px bg-[#f0ebe0] mb-4" />
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm">
            Have more questions?{" "}
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="text-[#800000] font-semibold hover:underline"
            >
              Contact us directly
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
