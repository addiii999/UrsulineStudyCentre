"use client";
import { ADMISSION_STEPS, FEE_TABLE } from "@/lib/constants";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AdmissionSection() {
  return (
    <section id="admission" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER */}
        <div className="text-center mb-14">
          <span className="section-tag">Admission</span>
          <h2 className="section-heading mt-4">
            Start Your <span className="text-[#800000]">Journey Today</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="section-subheading mx-auto mt-4">
            Simple 4-step admission process with transparent fee structure.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-14">
          {/* LEFT: STEPS */}
          <div>
            <h3
              className="text-xl font-bold text-gray-900 mb-6"
            >
              Admission Process
            </h3>
            <div className="space-y-4">
              {ADMISSION_STEPS.map((step, i) => (
                <div key={step.step} className="flex items-start gap-4 group">
                  {/* STEP INDICATOR */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#800000] text-white flex items-center justify-center font-bold text-sm shadow-md">
                      {step.step}
                    </div>
                    {i < ADMISSION_STEPS.length - 1 && (
                      <div className="w-px h-8 bg-[#e8d9b8] mt-2" />
                    )}
                  </div>
                  {/* TEXT */}
                  <div className="pt-2.5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider">
                        Step {step.step}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-base mt-0.5">{step.title}</h4>
                    <p className="text-gray-500 text-sm mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/apply"
              className="btn-primary mt-8 inline-flex"
            >
              Begin Admission
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* RIGHT: FEE CARDS (mobile-first) */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Fee Structure</h3>

            {/* FEATURED FEE */}
            <div className="bg-[#800000] rounded-2xl p-6 mb-5 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle, #C9A84C 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <div className="relative z-10">
                <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-wider mb-1">Annual Fee (All Streams)</p>
                <p className="text-5xl font-bold">₹15,000</p>
                <p className="text-white/60 text-sm mt-1">Per Academic Year</p>
              </div>
            </div>

            {/* FEE CARDS — no horizontal scroll */}
            <div className="space-y-3">
              {FEE_TABLE.map((row) => (
                <div
                  key={row.stream}
                  className="flex items-center justify-between bg-[#FDF8F0] border border-[#e8d9b8] rounded-xl px-5 py-4 gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{row.stream}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full mt-1.5">
                      <CheckCircle size={10} />
                      {row.includes}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-[#800000]">{row.annual}</p>
                    <p className="text-xs text-gray-400">per year</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-gray-400 text-xs mt-4">
              * Vocational courses have separate pricing. Contact us for details.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
