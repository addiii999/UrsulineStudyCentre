import AdmissionSection from "@/components/sections/AdmissionSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admissions | Ursuline Study Centre",
  description:
    "Admission details, eligibility criteria, fee structure, and step-by-step application guide for Class 9-12 and JEE/NEET preparation at Ursuline Study Centre Ranchi.",
  alternates: {
    canonical: "https://ursulinstudycentre.in/admission",
  },
};

const ADMISSION_FAQS = [
  {
    q: "Who is eligible to apply for courses at Ursuline Study Centre?",
    a: "Girls studying in Class 9, 10, 11, or 12 under JAC (Jharkhand Academic Council) or CBSE boards are eligible to join. We also welcome students who have completed Class 10 or 12 looking for dedicated JEE/NEET entrance preparation.",
  },
  {
    q: "Is there an entrance test for admission?",
    a: "Direct admissions are open based on academic records. However, we offer free counselling sessions to assess the student's current level and recommend the best academic stream and plan.",
  },
  {
    q: "Can I pay the fees in monthly installments?",
    a: "Yes. In addition to our affordable annual package, we offer monthly fee payment options (e.g., ₹1,500 per month) for all streams to make high-quality preparation accessible to everyone.",
  },
  {
    q: "What documents are required during admission?",
    a: "You will need to submit: 1) Copy of previous class report card/mark sheet, 2) Identity proof of the student (Aadhaar Card), and 3) Two passport-sized photographs.",
  },
];

export default function AdmissionPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="bg-[#800000] text-white py-16 md:py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #C9A84C 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-4">
          <span className="text-[#C9A84C] text-xs font-bold tracking-[0.2em] uppercase">
            Enroll Today
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-serif">Admission & fees</h1>
          <div className="w-16 h-[2px] bg-[#C9A84C] mx-auto" />
        </div>
      </div>

      <AdmissionSection />

      {/* ADMISSION FAQS */}
      <section className="py-14 md:py-20 bg-[#FDF8F0] border-t border-[#e8d9b8]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="section-tag">Help Desk</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#800000] font-serif mt-2">
              Admission FAQs
            </h2>
            <div className="gold-divider mx-auto mt-3" />
          </div>

          <div className="space-y-4">
            {ADMISSION_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-[#f0ebe0] p-6 shadow-sm"
              >
                <h3 className="font-bold text-gray-900 text-sm md:text-base leading-snug mb-3">
                  {faq.q}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
