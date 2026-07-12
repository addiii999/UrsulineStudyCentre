"use client";
import { useState, useEffect } from "react";
import { CheckCircle2, Send, MessageCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";

const ACADEMIC_LEVELS = [
  { value: "class9",      label: "Class 9" },
  { value: "class10",     label: "Class 10" },
  { value: "class11",     label: "Class 11" },
  { value: "class12",     label: "Class 12" },
  { value: "passed10",    label: "Passed Class 10" },
  { value: "passed12",    label: "Passed Class 12" },
  { value: "competitive", label: "Competitive Exam Prep (JEE / NEET / CLAT)" },
  { value: "vocational",  label: "Vocational Course Only" },
];

const STREAMS = ["Science (PCM)", "Science (PCB)", "Commerce", "Arts / Humanities"];
const VOCATIONAL = [
  "AI & Machine Learning",
  "Programming",
  "Social Media Marketing",
  "Spoken English",
  "DCA (Diploma in Computer Applications)",
  "Tally",
];

interface FormData {
  fullName: string;
  phone: string;
  academicLevel: string;
  stream: string;
  vocational: string;
  village: string;
  district: string;
  message: string;
}

const INIT: FormData = {
  fullName: "",
  phone: "",
  academicLevel: "",
  stream: "",
  vocational: "",
  village: "",
  district: "",
  message: "",
};

function Field({
  label,
  required,
  children,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-[#800000] ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

const inp =
  "w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#800000] focus:outline-none transition-colors min-h-[48px] bg-white";

export default function ApplyPage() {
  const [form, setForm] = useState<FormData>(INIT);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | "general", string>>>({});
  const [settings, setSettings] = useState(SITE_CONFIG);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings && Object.keys(data.settings).length > 0) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch(() => {});
  }, []);

  const set = (k: keyof FormData, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Partial<Record<keyof FormData | "general", string>> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit phone number";
    if (!form.academicLevel) e.academicLevel = "Please select your academic level";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setLoading(true);

    const levelLabels: Record<string, string> = {
      class9: "Class 9", class10: "Class 10", class11: "Class 11", class12: "Class 12",
      passed10: "Passed Class 10", passed12: "Passed Class 12",
      competitive: "Competitive Exam Prep", vocational: "Vocational",
    };

    const classLabel = levelLabels[form.academicLevel] || form.academicLevel;
    const streamLabel = form.stream || form.vocational || "";
    const note =
      `[Admission Enquiry] Level: ${classLabel}` +
      (streamLabel ? `. Interest: ${streamLabel}` : "") +
      (form.village ? `. Location: ${form.village}${form.district ? ", " + form.district : ""}` : "") +
      (form.message ? `. Note: ${form.message}` : "");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName.trim(),
          phone: form.phone,
          class: classLabel,
          stream: streamLabel,
          message: note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed. Please try again.");
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection error. Please try again.";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    const levelLabels: Record<string, string> = {
      class9: "Class 9", class10: "Class 10", class11: "Class 11", class12: "Class 12",
      passed10: "Passed Class 10", passed12: "Passed Class 12",
      competitive: "Competitive Exam Prep", vocational: "Vocational",
    };
    const msg = encodeURIComponent(
      `Hi! I just submitted an admission enquiry at Ursuline Study Centre.\n\n` +
        `Name: ${form.fullName}\nPhone: +91${form.phone}\n` +
        `Level: ${levelLabels[form.academicLevel] || form.academicLevel}\n` +
        (form.stream ? `Stream: ${form.stream}\n` : "") +
        (form.vocational ? `Vocational: ${form.vocational}\n` : "") +
        `\nPlease guide me on the next steps.`
    );
    window.open(`https://wa.me/${settings.whatsapp}?text=${msg}`, "_blank");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-[#f0ebe0] p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enquiry Submitted!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Thank you, <strong>{form.fullName}</strong>! Your admission enquiry has been received.
            Our team will contact you within 24 hours to guide you through the next steps.
          </p>
          <button
            onClick={openWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-4 rounded-xl mb-4 hover:bg-[#1ebe5a] transition-colors"
          >
            <MessageCircle size={20} />
            Confirm on WhatsApp
          </button>
          <Link href="/" className="block text-center text-[#800000] font-semibold text-sm hover:underline">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      {/* HEADER */}
      <div className="bg-[#800000] text-white">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Website
          </Link>
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="USC" className="h-14 w-auto object-contain" />
            <div>
              <h1 className="text-2xl font-bold">Admission Enquiry Form</h1>
              <p className="text-white/70 text-sm mt-0.5">
                Ursuline Study Centre · {settings.sessionYear} Session
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Error Banner */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          {/* SECTION 1 — Basic Details */}
          <div className="bg-white rounded-2xl border border-[#f0ebe0] shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#e8d9b8]">
              <div className="w-8 h-8 rounded-full bg-[#800000] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                1
              </div>
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                Your Details
              </h2>
            </div>
            <div className="space-y-5">
              <Field label="Full Name" required error={errors.fullName}>
                <input
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  className={inp + (errors.fullName ? " border-red-400" : "")}
                  placeholder="Enter your full name"
                />
              </Field>
              <Field label="Phone Number" required error={errors.phone}>
                <div className="flex">
                  <span className="flex items-center px-3 bg-gray-50 border-2 border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-medium min-h-[48px]">
                    +91
                  </span>
                  <input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className={
                      inp +
                      " rounded-l-none border-l-0" +
                      (errors.phone ? " border-red-400" : "")
                    }
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* SECTION 2 — Academic Level */}
          <div className="bg-white rounded-2xl border border-[#f0ebe0] shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#e8d9b8]">
              <div className="w-8 h-8 rounded-full bg-[#800000] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                2
              </div>
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                Academic Level
              </h2>
            </div>
            <Field label="I am currently at" required error={errors.academicLevel}>
              <div className="grid sm:grid-cols-2 gap-3">
                {ACADEMIC_LEVELS.map((lvl) => (
                  <button
                    type="button"
                    key={lvl.value}
                    onClick={() => {
                      set("academicLevel", lvl.value);
                      set("stream", "");
                      set("vocational", "");
                    }}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                      form.academicLevel === lvl.value
                        ? "bg-[#800000]/5 border-[#800000]"
                        : "border-gray-200 hover:border-[#800000]/40"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        form.academicLevel === lvl.value ? "border-[#800000]" : "border-gray-300"
                      }`}
                    >
                      {form.academicLevel === lvl.value && (
                        <div className="w-2 h-2 rounded-full bg-[#800000]" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        form.academicLevel === lvl.value ? "text-[#800000]" : "text-gray-700"
                      }`}
                    >
                      {lvl.label}
                    </span>
                  </button>
                ))}
              </div>
            </Field>

            {/* Stream selection for class 11/12 */}
            {["class11", "class12", "passed10", "passed12", "competitive"].includes(
              form.academicLevel
            ) && (
              <div className="mt-6 pt-5 border-t border-[#f0ebe0]">
                <Field label="Stream / Interest">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {STREAMS.map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => set("stream", form.stream === s ? "" : s)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                          form.stream === s
                            ? "bg-[#800000]/5 border-[#800000]"
                            : "border-gray-200 hover:border-[#800000]/40"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                            form.stream === s ? "border-[#800000] bg-[#800000]" : "border-gray-300"
                          }`}
                        />
                        <span
                          className={`text-sm font-semibold ${
                            form.stream === s ? "text-[#800000]" : "text-gray-700"
                          }`}
                        >
                          {s}
                        </span>
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            )}

            {/* Vocational for class9/10/vocational */}
            {["class9", "class10", "vocational"].includes(form.academicLevel) && (
              <div className="mt-6 pt-5 border-t border-[#f0ebe0]">
                <Field label="Vocational Course Interest">
                  <div className="grid sm:grid-cols-2 gap-2">
                    {VOCATIONAL.map((v) => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => set("vocational", form.vocational === v ? "" : v)}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left text-sm transition-all ${
                          form.vocational === v
                            ? "bg-[#C9A84C]/10 border-[#C9A84C]"
                            : "border-gray-200 hover:border-[#C9A84C]/50"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                            form.vocational === v
                              ? "border-[#C9A84C] bg-[#C9A84C]"
                              : "border-gray-300"
                          }`}
                        />
                        <span
                          className={
                            form.vocational === v ? "text-[#8a6b20] font-semibold" : "text-gray-700"
                          }
                        >
                          {v}
                        </span>
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            )}
          </div>

          {/* SECTION 3 — Location (optional) */}
          <div className="bg-white rounded-2xl border border-[#f0ebe0] shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#e8d9b8]">
              <div className="w-8 h-8 rounded-full bg-[#800000] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                3
              </div>
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                Location & Message{" "}
                <span className="text-gray-400 font-normal normal-case text-sm">(optional)</span>
              </h2>
            </div>
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Village / City">
                  <input
                    value={form.village}
                    onChange={(e) => set("village", e.target.value)}
                    className={inp}
                    placeholder="Your village or city"
                  />
                </Field>
                <Field label="District">
                  <input
                    value={form.district}
                    onChange={(e) => set("district", e.target.value)}
                    className={inp}
                    placeholder="Your district"
                  />
                </Field>
              </div>
              <Field label="Any specific question or message?">
                <textarea
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  className={inp + " min-h-[96px] resize-none"}
                  placeholder="e.g. I am interested in the Science stream alongside Class 11..."
                />
              </Field>
            </div>
          </div>

          {/* SUBMIT */}
          <div className="bg-white rounded-2xl border border-[#f0ebe0] shadow-sm p-6 md:p-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] text-[#800000] font-bold text-base py-4 rounded-xl hover:bg-[#a07830] hover:text-white transition-all duration-300 shadow-lg disabled:opacity-70 min-h-[56px]"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send size={18} /> Submit Enquiry
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Your information is safe and will only be used for admission purposes. Our team will
              reach out within 24 hours.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
