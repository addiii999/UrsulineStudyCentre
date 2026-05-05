"use client";
import { useState, useEffect } from "react";
import { Plus, Minus, Loader2 } from "lucide-react";
import clsx from "clsx";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
}

export default function FaqSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch("/api/faqs", { cache: "no-store" });
        const data = await res.json();
        const activeFaqs = data.faqs?.filter((f: FAQ) => f.is_active) ?? [];
        setFaqs(activeFaqs);
        if (activeFaqs.length > 0) {
          setOpen(activeFaqs[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  if (loading) {
    return (
      <section id="faq" className="py-20 md:py-28 bg-[#FDF8F0] flex justify-center">
        <Loader2 size={30} className="animate-spin text-[#800000]" />
      </section>
    );
  }

  if (faqs.length === 0) return null;

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
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className={clsx(
                "bg-white rounded-xl border transition-all duration-200 overflow-hidden",
                open === faq.id ? "border-[#C9A84C]/50 shadow-sm" : "border-[#f0ebe0]"
              )}
            >
              <button
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
                onClick={() => setOpen(open === faq.id ? null : faq.id)}
              >
                <span
                  className={clsx(
                    "font-semibold text-sm leading-snug transition-colors",
                    open === faq.id ? "text-[#800000]" : "text-gray-800"
                  )}
                >
                  {faq.question}
                </span>
                {open === faq.id ? (
                  <Minus size={18} className="text-[#C9A84C] flex-shrink-0 transition-all duration-200" />
                ) : (
                  <Plus size={18} className="text-[#C9A84C] flex-shrink-0 transition-all duration-200" />
                )}
              </button>
              {open === faq.id && (
                <div className="px-6 pb-5">
                  <div className="w-full h-px bg-[#f0ebe0] mb-4" />
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
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
