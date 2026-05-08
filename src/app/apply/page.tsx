"use client";
import { useState, useEffect } from "react";
import { CheckCircle2, Send, MessageCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";

const BOARDS = ["JAC", "CBSE", "ICSE", "Other"];
const PRESENT_CLASSES = ["Class XI", "Class XII"];
const MAIN_COURSES = ["Science (PCM)", "Science (PCB)", "Commerce", "Arts / Humanities"];
const VOCATIONAL = ["AI & Machine Learning", "Programming", "Social Media Marketing", "Spoken English", "DCA (Diploma in Computer Applications)", "Tally"];

interface FormData {
  fullName: string; dob: string; aadhaar: string;
  motherName: string; fatherName: string;
  prevBoard: string; prevSchool: string; prevYear: string; prevMarks: string;
  presentClass: string; presentBoard: string; presentSchool: string; presentYear: string;
  course: string; vocational: string;
  presentVillage: string; presentDistrict: string; presentPS: string; presentPhone: string;
  permanentVillage: string; permanentDistrict: string; permanentPS: string; permanentPhone: string;
  confirmed: boolean;
}

const INIT: FormData = {
  fullName: "", dob: "", aadhaar: "",
  motherName: "", fatherName: "",
  prevBoard: "", prevSchool: "", prevYear: "", prevMarks: "",
  presentClass: "", presentBoard: "", presentSchool: "", presentYear: "",
  course: "", vocational: "",
  presentVillage: "", presentDistrict: "", presentPS: "", presentPhone: "",
  permanentVillage: "", permanentDistrict: "", permanentPS: "", permanentPhone: "",
  confirmed: false,
};

function SectionHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#e8d9b8]">
      <div className="w-8 h-8 rounded-full bg-[#800000] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{num}</div>
      <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">{title}</h2>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}{required && <span className="text-[#800000] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inp = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#800000] focus:outline-none transition-colors min-h-[48px] bg-white";
const sel = inp + " cursor-pointer";

export default function ApplyPage() {
  const [form, setForm] = useState<FormData>(INIT);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [settings, setSettings] = useState(SITE_CONFIG);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.settings && Object.keys(data.settings).length > 0) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      })
      .catch(console.error);
  }, []);

  const [sameAddress, setSameAddress] = useState(false);

  const handleSameAddressChange = (checked: boolean) => {
    setSameAddress(checked);
    if (checked) {
      setForm((p) => ({
        ...p,
        permanentVillage: p.presentVillage,
        permanentDistrict: p.presentDistrict,
        permanentPS: p.presentPS,
        permanentPhone: p.presentPhone,
      }));
    } else {
      setForm((p) => ({
        ...p,
        permanentVillage: "",
        permanentDistrict: "",
        permanentPS: "",
        permanentPhone: "",
      }));
    }
  };

  useEffect(() => {
    if (sameAddress) {
      setForm((p) => ({
        ...p,
        permanentVillage: p.presentVillage,
        permanentDistrict: p.presentDistrict,
        permanentPS: p.presentPS,
        permanentPhone: p.presentPhone,
      }));
    }
  }, [sameAddress, form.presentVillage, form.presentDistrict, form.presentPS, form.presentPhone]);

  const set = (k: keyof FormData, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.dob) e.dob = "Required";
    if (!/^\d{12}$/.test(form.aadhaar)) e.aadhaar = "Must be 12 digits";
    if (!form.motherName.trim()) e.motherName = "Required";
    if (!form.fatherName.trim()) e.fatherName = "Required";
    if (!form.prevBoard) e.prevBoard = "Required";
    if (!form.prevSchool.trim()) e.prevSchool = "Required";
    if (!form.course) e.course = "Required";
    if (!/^\d{10}$/.test(form.presentPhone)) e.presentPhone = "Must be 10 digits";
    if (!form.confirmed) e.confirmed = "Please confirm";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // 1. Save to Supabase Database
      const dbPayload = {
        full_name: form.fullName.trim(),
        dob: form.dob,
        aadhaar_last4: form.aadhaar.slice(-4),
        mother_name: form.motherName.trim(),
        father_name: form.fatherName.trim(),
        prev_board: form.prevBoard,
        prev_school: form.prevSchool.trim(),
        prev_year: form.prevYear,
        prev_marks: form.prevMarks,
        present_class: form.presentClass,
        present_board: form.presentBoard,
        present_school: form.presentSchool.trim(),
        present_year: form.presentYear,
        course: form.course,
        vocational: form.vocational,
        present_village: form.presentVillage.trim(),
        present_district: form.presentDistrict.trim(),
        present_ps: form.presentPS.trim(),
        present_phone: form.presentPhone,
        permanent_village: form.permanentVillage.trim(),
        permanent_district: form.permanentDistrict.trim(),
        permanent_ps: form.permanentPS.trim(),
        permanent_phone: form.permanentPhone,
      };

      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbPayload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save application to database");
      }

      // 2. Send Email via FormSubmit
      const data = new FormData();
      data.append("_subject", `New Admission Application - ${form.fullName}`);
      data.append("_captcha", "false");
      data.append("_template", "table");
      Object.entries(form).forEach(([k, v]) => {
        if (k !== "confirmed") data.append(k.replace(/([A-Z])/g, " $1"), String(v));
      });
      await fetch("https://formsubmit.co/ursulinestudycentre@gmail.com", {
        method: "POST", body: data, headers: { Accept: "application/json" },
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi! I just submitted my admission form at Ursuline Study Centre.\n\n` +
      `Name: ${form.fullName}\nDate of Birth: ${form.dob}\nCourse: ${form.course}\nClass: ${form.presentClass}\nContact: +91${form.presentPhone}\n\nPlease confirm my application.`
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Thank you, <strong>{form.fullName}</strong>! Your admission application has been received. Our team will contact you within 24 hours.
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
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Website
          </Link>
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="USC" className="h-14 w-auto object-contain" />
            <div>
              <h1 className="text-2xl font-bold">Admission Application Form</h1>
              <p className="text-white/70 text-sm mt-0.5">Ursuline Study Centre - 2026-27 Session</p>
            </div>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} noValidate className="space-y-8">

          {/* SECTION 1 */}
          <div className="bg-white rounded-2xl border border-[#f0ebe0] shadow-sm p-6 md:p-8">
            <SectionHeader num={1} title="Basic Details" />
            <div className="space-y-5">
              <Field label="Full Name (in Block Letters)" required>
                <input value={form.fullName} onChange={(e) => set("fullName", e.target.value.toUpperCase())}
                  className={inp + (errors.fullName ? " border-red-400" : "")} placeholder="AS WRITTEN ON CERTIFICATE" />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </Field>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Date of Birth" required>
                  <input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)}
                    className={inp + (errors.dob ? " border-red-400" : "")} />
                  {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                </Field>
                <Field label="Aadhaar Number" required>
                  <input value={form.aadhaar} onChange={(e) => set("aadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))}
                    className={inp + (errors.aadhaar ? " border-red-400" : "")} placeholder="12-digit number" inputMode="numeric" />
                  {errors.aadhaar && <p className="text-red-500 text-xs mt-1">{errors.aadhaar}</p>}
                </Field>
              </div>
            </div>
          </div>

          {/* SECTION 2 */}
          <div className="bg-white rounded-2xl border border-[#f0ebe0] shadow-sm p-6 md:p-8">
            <SectionHeader num={2} title="Parent Details" />
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Mother's Name" required>
                <input value={form.motherName} onChange={(e) => set("motherName", e.target.value)}
                  className={inp + (errors.motherName ? " border-red-400" : "")} placeholder="Mother's full name" />
                {errors.motherName && <p className="text-red-500 text-xs mt-1">{errors.motherName}</p>}
              </Field>
              <Field label="Father's Name" required>
                <input value={form.fatherName} onChange={(e) => set("fatherName", e.target.value)}
                  className={inp + (errors.fatherName ? " border-red-400" : "")} placeholder="Father's full name" />
                {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
              </Field>
            </div>
          </div>

          {/* SECTION 3 */}
          <div className="bg-white rounded-2xl border border-[#f0ebe0] shadow-sm p-6 md:p-8">
            <SectionHeader num={3} title="Education Details" />

            <p className="text-xs font-bold text-[#800000] uppercase tracking-widest mb-4">Previous Qualification (Class X)</p>
            <div className="space-y-5 mb-8">
              <Field label="Board" required>
                <div className="flex flex-wrap gap-3">
                  {BOARDS.map((b) => (
                    <button type="button" key={b} onClick={() => set("prevBoard", b)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${form.prevBoard === b ? "bg-[#800000] text-white border-[#800000]" : "bg-white text-gray-700 border-gray-200 hover:border-[#800000]"}`}>
                      {b}
                    </button>
                  ))}
                </div>
                {errors.prevBoard && <p className="text-red-500 text-xs mt-1">{errors.prevBoard}</p>}
              </Field>
              <Field label="School Name" required>
                <input value={form.prevSchool} onChange={(e) => set("prevSchool", e.target.value)}
                  className={inp + (errors.prevSchool ? " border-red-400" : "")} placeholder="Name of school" />
                {errors.prevSchool && <p className="text-red-500 text-xs mt-1">{errors.prevSchool}</p>}
              </Field>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Year of Passing">
                  <input value={form.prevYear} onChange={(e) => set("prevYear", e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className={inp} placeholder="e.g. 2024" inputMode="numeric" />
                </Field>
                <Field label="Percentage / Marks Obtained">
                  <input value={form.prevMarks} onChange={(e) => set("prevMarks", e.target.value)}
                    className={inp} placeholder="e.g. 78% or 390/500" />
                </Field>
              </div>
            </div>

            <p className="text-xs font-bold text-[#800000] uppercase tracking-widest mb-4">Present Qualification</p>
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Class">
                  <select value={form.presentClass} onChange={(e) => set("presentClass", e.target.value)} className={sel}>
                    <option value="">Select Class</option>
                    {PRESENT_CLASSES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Board">
                  <select value={form.presentBoard} onChange={(e) => set("presentBoard", e.target.value)} className={sel}>
                    <option value="">Select Board</option>
                    {BOARDS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="School / College Name">
                <input value={form.presentSchool} onChange={(e) => set("presentSchool", e.target.value)}
                  className={inp} placeholder="Current school or college" />
              </Field>
              <Field label="Year">
                <input value={form.presentYear} onChange={(e) => set("presentYear", e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className={inp + " max-w-[180px]"} placeholder="e.g. 2025" inputMode="numeric" />
              </Field>
            </div>
          </div>

          {/* SECTION 4 */}
          <div className="bg-white rounded-2xl border border-[#f0ebe0] shadow-sm p-6 md:p-8">
            <SectionHeader num={4} title="Course Applied For" />
            <div className="grid sm:grid-cols-2 gap-4">
              {MAIN_COURSES.map((c) => (
                <button type="button" key={c} onClick={() => set("course", c)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${form.course === c ? "bg-[#800000]/5 border-[#800000]" : "border-gray-200 hover:border-[#800000]/40"}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${form.course === c ? "border-[#800000]" : "border-gray-300"}`}>
                    {form.course === c && <div className="w-2.5 h-2.5 rounded-full bg-[#800000]" />}
                  </div>
                  <span className={`text-sm font-semibold ${form.course === c ? "text-[#800000]" : "text-gray-700"}`}>{c}</span>
                </button>
              ))}
            </div>
            {errors.course && <p className="text-red-500 text-xs mt-3">{errors.course}</p>}
          </div>

          {/* SECTION 5 */}
          <div className="bg-white rounded-2xl border border-[#f0ebe0] shadow-sm p-6 md:p-8">
            <SectionHeader num={5} title="Vocational Course (Select One)" />
            <div className="grid sm:grid-cols-2 gap-3">
              {VOCATIONAL.map((v) => (
                <button type="button" key={v} onClick={() => set("vocational", form.vocational === v ? "" : v)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${form.vocational === v ? "bg-[#C9A84C]/10 border-[#C9A84C]" : "border-gray-200 hover:border-[#C9A84C]/50"}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${form.vocational === v ? "border-[#C9A84C]" : "border-gray-300"}`}>
                    {form.vocational === v && <div className="w-2.5 h-2.5 rounded-full bg-[#C9A84C]" />}
                  </div>
                  <span className={`text-sm font-semibold ${form.vocational === v ? "text-[#8a6b20]" : "text-gray-700"}`}>{v}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 6 */}
          <div className="bg-white rounded-2xl border border-[#f0ebe0] shadow-sm p-6 md:p-8">
            <SectionHeader num={6} title="Address Details" />

            <p className="text-xs font-bold text-[#800000] uppercase tracking-widest mb-4">Present Address</p>
            <div className="space-y-4 mb-8">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Village / City">
                  <input value={form.presentVillage} onChange={(e) => set("presentVillage", e.target.value)} className={inp} placeholder="Village or City name" />
                </Field>
                <Field label="District">
                  <input value={form.presentDistrict} onChange={(e) => set("presentDistrict", e.target.value)} className={inp} placeholder="District name" />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="P.S. (Police Station)">
                  <input value={form.presentPS} onChange={(e) => set("presentPS", e.target.value)} className={inp} placeholder="Nearest police station" />
                </Field>
                <Field label="Contact Number" required>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-gray-50 border-2 border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-medium min-h-[48px]">+91</span>
                    <input value={form.presentPhone} onChange={(e) => set("presentPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className={inp + " rounded-l-none border-l-0" + (errors.presentPhone ? " border-red-400" : "")} placeholder="10-digit number" inputMode="numeric" />
                  </div>
                  {errors.presentPhone && <p className="text-red-500 text-xs mt-1">{errors.presentPhone}</p>}
                </Field>
              </div>
            </div>

            <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-3 mb-4">
              <p className="text-xs font-bold text-[#800000] uppercase tracking-widest">Permanent Address</p>
              <label className="flex items-center gap-2 cursor-pointer group w-fit">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${sameAddress ? "bg-[#800000] border-[#800000]" : "border-gray-400 group-hover:border-[#800000]"}`}>
                  {sameAddress && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <input type="checkbox" checked={sameAddress} onChange={(e) => handleSameAddressChange(e.target.checked)} className="hidden" />
                <span className="text-sm font-medium text-gray-700 select-none">Same as Present Address</span>
              </label>
            </div>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Village / City">
                  <input disabled={sameAddress} value={form.permanentVillage} onChange={(e) => set("permanentVillage", e.target.value)} className={`${inp} ${sameAddress ? "bg-gray-50 opacity-70 cursor-not-allowed" : ""}`} placeholder="Village or City name" />
                </Field>
                <Field label="District">
                  <input disabled={sameAddress} value={form.permanentDistrict} onChange={(e) => set("permanentDistrict", e.target.value)} className={`${inp} ${sameAddress ? "bg-gray-50 opacity-70 cursor-not-allowed" : ""}`} placeholder="District name" />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="P.S. (Police Station)">
                  <input disabled={sameAddress} value={form.permanentPS} onChange={(e) => set("permanentPS", e.target.value)} className={`${inp} ${sameAddress ? "bg-gray-50 opacity-70 cursor-not-allowed" : ""}`} placeholder="Nearest police station" />
                </Field>
                <Field label="Contact Number">
                  <div className="flex">
                    <span className={`flex items-center px-3 border-2 border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-medium min-h-[48px] ${sameAddress ? "bg-gray-100" : "bg-gray-50"}`}>+91</span>
                    <input disabled={sameAddress} value={form.permanentPhone} onChange={(e) => set("permanentPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className={`${inp} rounded-l-none border-l-0 ${sameAddress ? "bg-gray-50 opacity-70 cursor-not-allowed" : ""}`} placeholder="10-digit number" inputMode="numeric" />
                  </div>
                </Field>
              </div>
            </div>
          </div>

          {/* SECTION 7 - SUBMIT */}
          <div className="bg-white rounded-2xl border border-[#f0ebe0] shadow-sm p-6 md:p-8">
            <SectionHeader num={7} title="Declaration & Submit" />
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all mb-6 ${form.confirmed ? "border-[#800000] bg-[#800000]/5" : "border-gray-200"} ${errors.confirmed ? "border-red-400" : ""}`}>
              <input type="checkbox" checked={form.confirmed} onChange={(e) => set("confirmed", e.target.checked)} className="mt-0.5 w-5 h-5 accent-[#800000] flex-shrink-0" />
              <span className="text-sm text-gray-700 leading-relaxed">
                I hereby confirm that all the information provided in this application is <strong>true and correct</strong> to the best of my knowledge. I understand that any false information may result in cancellation of admission.
              </span>
            </label>
            {errors.confirmed && <p className="text-red-500 text-xs mb-4">{errors.confirmed}</p>}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] text-[#800000] font-bold text-base py-4 rounded-xl hover:bg-[#a07830] hover:text-white transition-all duration-300 shadow-lg disabled:opacity-70 min-h-[56px]">
              {loading ? <><Loader2 size={20} className="animate-spin" /> Submitting...</> : <><Send size={18} /> Submit Application</>}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">Your information is safe and will only be used for admission purposes.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
