"use client";
import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Send, MessageCircle, ArrowLeft, Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";

const BOARDS = ["JAC", "CBSE", "ICSE", "Other"];
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
const COMPETITIVE = ["JEE", "NEET", "CLAT"];
const MEDIUMS = ["Hindi", "English"];
const VOCATIONAL = ["AI & Machine Learning", "Programming", "Social Media Marketing", "Spoken English", "DCA (Diploma in Computer Applications)", "Tally"];

interface FormData {
  email: string; password: string; confirmPassword: string;
  fullName: string; dob: string; aadhaar: string;
  motherName: string; fatherName: string;
  academicLevel: string;
  stream: string; medium: string;
  competitiveInterest: string[];
  schoolName: string; board: string; currentClass: string;
  prevBoard: string; prevSchool: string; prevYear: string; prevMarks: string;
  presentClass: string; presentBoard: string; presentSchool: string; presentYear: string;
  course: string; vocational: string;
  presentVillage: string; presentDistrict: string; presentPS: string; presentPhone: string;
  permanentVillage: string; permanentDistrict: string; permanentPS: string; permanentPhone: string;
  confirmed: boolean;
}

const INIT: FormData = {
  email: "", password: "", confirmPassword: "",
  fullName: "", dob: "", aadhaar: "",
  motherName: "", fatherName: "",
  academicLevel: "",
  stream: "", medium: "",
  competitiveInterest: [],
  schoolName: "", board: "", currentClass: "",
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
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | "otp" | "general", string>>>({});
  const [settings, setSettings] = useState(SITE_CONFIG);

  // OTP flow state
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

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
    const e: Partial<Record<keyof FormData | "otp" | "general", string>> = {};
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.password || form.password.length < 8) e.password = "Minimum 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.dob) e.dob = "Required";
    if (form.aadhaar && !/^\d{12}$/.test(form.aadhaar)) e.aadhaar = "Must be 12 digits";
    if (!form.motherName.trim()) e.motherName = "Required";
    if (!form.fatherName.trim()) e.fatherName = "Required";
    if (!form.academicLevel) e.academicLevel = "Please select your academic level";
    const isVocOnly = form.academicLevel === "vocational";
    const isCompetitive = form.academicLevel === "competitive";
    if (!isVocOnly && !isCompetitive && !form.schoolName.trim()) e.schoolName = "Required";
    if (!isVocOnly && !isCompetitive && !form.board) e.board = "Required";
    if (["class11", "class12", "passed10", "passed12"].includes(form.academicLevel) && !form.stream) e.stream = "Required";
    if (isVocOnly && !form.vocational) e.vocational = "Please select a vocational course";
    if (isCompetitive && form.competitiveInterest.length === 0) e.stream = "Please select at least one exam";
    if (!/^\d{10}$/.test(form.presentPhone)) e.presentPhone = "Must be 10 digits";
    if (!form.confirmed) e.confirmed = "Please confirm";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Step 1 — validate form then send OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/student/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.toLowerCase().trim(), name: form.fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setStep("otp");
      setResendCooldown(60);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrors(prev => ({ ...prev, general: err.message }));
    } finally {
      setLoading(false);
    }
  };

  // OTP digit input handler
  const handleOtpInput = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[i] = v;
    setOtpDigits(next);
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
    if (!v && i > 0) otpRefs.current[i - 1]?.focus();
  };

  // Step 2 — verify OTP then submit full registration
  const handleVerifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length < 6) { setErrors({ otp: "Enter all 6 digits" }); return; }
    setOtpLoading(true);
    setErrors({});
    try {
      // Verify OTP
      const verifyRes = await fetch("/api/student/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.toLowerCase().trim(), otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || "Invalid OTP");

      // Build DB payload
      const lvl = form.academicLevel;
      const levelLabel: Record<string, string> = {
        class9: "Class IX", class10: "Class X", class11: "Class XI", class12: "Class XII",
        passed10: "Passed Class X", passed12: "Passed Class XII",
        competitive: "Competitive Exam", vocational: "Vocational",
      };
      const resolvedClass = levelLabel[lvl] || lvl;
      const resolvedCourse =
        form.stream ||
        (lvl === "vocational" ? (form.vocational || "Vocational") : "") ||
        (lvl === "competitive" && form.competitiveInterest.length > 0
          ? `Competitive: ${form.competitiveInterest.join(", ")}` : "") ||
        levelLabel[lvl] || lvl;
      const competitiveNote = form.stream && form.competitiveInterest.length > 0
        ? ` | Competitive: ${form.competitiveInterest.join(", ")}` : "";

      const payload = {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        full_name: form.fullName.trim(),
        dob: form.dob || null,
        aadhaar_last4: form.aadhaar ? form.aadhaar.slice(-4) : null,
        mother_name: form.motherName.trim(),
        father_name: form.fatherName.trim(),
        prev_board: form.prevBoard || form.board || "",
        prev_school: form.prevSchool.trim(),
        prev_year: form.prevYear,
        prev_marks: form.prevMarks,
        present_class: resolvedClass,
        present_board: form.board || form.presentBoard || "",
        present_school: form.schoolName.trim() || form.presentSchool.trim(),
        present_year: form.presentYear,
        course: resolvedCourse + competitiveNote,
        vocational: form.vocational || "",
        present_village: form.presentVillage.trim(),
        present_district: form.presentDistrict.trim(),
        present_ps: form.presentPS.trim(),
        present_phone: form.presentPhone,
        permanent_village: form.permanentVillage.trim(),
        permanent_district: form.permanentDistrict.trim(),
        permanent_ps: form.permanentPS.trim(),
        permanent_phone: form.permanentPhone || "",
      };

      const submitRes = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData.error || "Registration failed");

      setSubmitted(true);
    } catch (err: any) {
      setErrors({ otp: err.message });
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpLoading(true);
    try {
      const res = await fetch("/api/student/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.toLowerCase().trim(), name: form.fullName }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setOtpDigits(["", "", "", "", "", ""]);
      setResendCooldown(60);
      setErrors({});
    } catch (err: any) {
      setErrors({ otp: err.message });
    } finally {
      setOtpLoading(false);
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

  // ── OTP Verification Screen ─────────────────────────────
  if (step === "otp") {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-[#f0ebe0] p-8 max-w-sm w-full">
          <div className="w-16 h-16 rounded-2xl bg-[#800000]/10 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={32} className="text-[#800000]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Verify Your Email</h2>
          <p className="text-gray-500 text-sm text-center mb-6 leading-relaxed">
            A 6-digit code was sent to <strong className="text-gray-800">{form.email}</strong>. Enter it below.
          </p>
          <div className="flex gap-2 justify-center mb-5">
            {otpDigits.map((d, i) => (
              <input key={i} ref={el => { otpRefs.current[i] = el; }}
                value={d} maxLength={1} inputMode="numeric"
                onChange={e => handleOtpInput(i, e.target.value)}
                onKeyDown={e => { if (e.key === "Backspace" && !d && i > 0) otpRefs.current[i-1]?.focus(); }}
                className={`w-11 h-13 text-center text-xl font-bold border-2 rounded-xl outline-none transition-colors ${
                  errors.otp ? "border-red-400" : d ? "border-[#800000]" : "border-gray-200 focus:border-[#800000]"
                }`} />
            ))}
          </div>
          {errors.otp && <p className="text-red-500 text-sm text-center mb-4">{errors.otp}</p>}
          <button onClick={handleVerifyOtp} disabled={otpLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#800000] text-white font-bold py-3.5 rounded-xl hover:bg-[#600000] transition-colors disabled:opacity-60 mb-4">
            {otpLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            {otpLoading ? "Verifying..." : "Verify & Submit Application"}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => { setStep("form"); setOtpDigits(["","","","","",""]); setErrors({}); }}
              className="text-gray-500 hover:text-gray-700 font-medium">← Go Back</button>
            <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0 || otpLoading}
              className={`font-semibold transition-colors ${
                resendCooldown > 0 ? "text-gray-300 cursor-not-allowed" : "text-[#800000] hover:underline"
              }`}>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            </button>
          </div>

          {/* Spam folder hint */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <div className="relative group flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 cursor-help">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                </svg>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-800 text-white text-[11px] leading-relaxed rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                  Sometimes email providers may place automated verification emails inside Spam or Promotions folders.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                </div>
              </div>
              <p className="text-[11.5px] text-gray-400 leading-relaxed">
                If you don&apos;t see the email, please check your <span className="font-medium text-gray-500">Spam</span> or <span className="font-medium text-gray-500">Junk</span> folder as well.
              </p>
            </div>
          </div>
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
            <SectionHeader num={1} title="Account & Basic Details" />
            <div className="space-y-5">
              {/* Account credentials */}
              <div className="bg-[#800000]/5 border border-[#800000]/10 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck size={16} className="text-[#800000] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#800000] font-medium leading-relaxed">Your email and password will be used to log in to the Student Portal after approval.</p>
              </div>
              <Field label="Student Email Address" required>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                    className={inp + " pl-10" + (errors.email ? " border-red-400" : "")} placeholder="student@example.com" />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </Field>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Password" required>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showPass ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)}
                      className={inp + " pl-10 pr-10" + (errors.password ? " border-red-400" : "")} placeholder="Min. 8 characters" />
                    <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </Field>
                <Field label="Confirm Password" required>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)}
                      className={inp + " pl-10 pr-10" + (errors.confirmPassword ? " border-red-400" : "")} placeholder="Repeat password" />
                    <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </Field>
              </div>
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
                <Field label="Aadhaar Number">
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

          {/* SECTION 3 — SMART EDUCATION */}
          <div className="bg-white rounded-2xl border border-[#f0ebe0] shadow-sm p-6 md:p-8">
            <SectionHeader num={3} title="Education Details" />

            {/* Step 1 — Academic Level */}
            <Field label="Current Academic Level" required>
              <div className="grid sm:grid-cols-2 gap-3">
                {ACADEMIC_LEVELS.map((lvl) => (
                  <button type="button" key={lvl.value}
                    onClick={() => { set("academicLevel", lvl.value); setForm(p => ({...p, stream:"", board:"", schoolName:"", competitiveInterest:[], vocational:"", course:""})); }}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                      form.academicLevel === lvl.value ? "bg-[#800000]/5 border-[#800000]" : "border-gray-200 hover:border-[#800000]/40"
                    }`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      form.academicLevel === lvl.value ? "border-[#800000]" : "border-gray-300"
                    }`}>
                      {form.academicLevel === lvl.value && <div className="w-2 h-2 rounded-full bg-[#800000]" />}
                    </div>
                    <span className={`text-sm font-semibold ${form.academicLevel === lvl.value ? "text-[#800000]" : "text-gray-700"}`}>{lvl.label}</span>
                  </button>
                ))}
              </div>
              {errors.academicLevel && <p className="text-red-500 text-xs mt-2">{errors.academicLevel}</p>}
            </Field>

            {/* Class 9 / 10 fields */}
            {(form.academicLevel === "class9" || form.academicLevel === "class10") && (
              <div className="mt-6 space-y-5 pt-5 border-t border-[#f0ebe0]">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="School Name" required>
                    <input value={form.schoolName} onChange={e => set("schoolName", e.target.value)}
                      className={inp + (errors.schoolName ? " border-red-400" : "")} placeholder="Current school name" />
                    {errors.schoolName && <p className="text-red-500 text-xs mt-1">{errors.schoolName}</p>}
                  </Field>
                  <Field label="Board" required>
                    <div className="flex flex-wrap gap-2">
                      {BOARDS.map(b => (
                        <button type="button" key={b} onClick={() => set("board", b)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                            form.board === b ? "bg-[#800000] text-white border-[#800000]" : "bg-white text-gray-700 border-gray-200 hover:border-[#800000]"
                          }`}>{b}</button>
                      ))}
                    </div>
                    {errors.board && <p className="text-red-500 text-xs mt-1">{errors.board}</p>}
                  </Field>
                </div>
                <Field label="Medium">
                  <div className="flex gap-3">
                    {MEDIUMS.map(m => (
                      <button type="button" key={m} onClick={() => set("medium", m)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                          form.medium === m ? "bg-[#800000] text-white border-[#800000]" : "bg-white text-gray-700 border-gray-200 hover:border-[#800000]"
                        }`}>{m}</button>
                    ))}
                  </div>
                </Field>
                <Field label="Vocational / Add-on Course Interest">
                  <div className="grid sm:grid-cols-2 gap-2">
                    {VOCATIONAL.map(v => (
                      <button type="button" key={v} onClick={() => set("vocational", form.vocational === v ? "" : v)}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left text-sm transition-all ${
                          form.vocational === v ? "bg-[#C9A84C]/10 border-[#C9A84C]" : "border-gray-200 hover:border-[#C9A84C]/50"
                        }`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          form.vocational === v ? "border-[#C9A84C] bg-[#C9A84C]" : "border-gray-300"
                        }`} />
                        <span className={form.vocational === v ? "text-[#8a6b20] font-semibold" : "text-gray-700"}>{v}</span>
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            )}

            {/* Class 11 / 12 / Passed fields */}
            {(["class11","class12","passed10","passed12"].includes(form.academicLevel)) && (
              <div className="mt-6 space-y-5 pt-5 border-t border-[#f0ebe0]">
                <Field label="Stream" required>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {STREAMS.map(s => (
                      <button type="button" key={s} onClick={() => set("stream", s)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                          form.stream === s ? "bg-[#800000]/5 border-[#800000]" : "border-gray-200 hover:border-[#800000]/40"
                        }`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          form.stream === s ? "border-[#800000] bg-[#800000]" : "border-gray-300"
                        }`} />
                        <span className={`text-sm font-semibold ${form.stream === s ? "text-[#800000]" : "text-gray-700"}`}>{s}</span>
                      </button>
                    ))}
                  </div>
                  {errors.stream && <p className="text-red-500 text-xs mt-1">{errors.stream}</p>}
                </Field>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="School / College Name" required>
                    <input value={form.schoolName} onChange={e => set("schoolName", e.target.value)}
                      className={inp + (errors.schoolName ? " border-red-400" : "")} placeholder="School or college name" />
                    {errors.schoolName && <p className="text-red-500 text-xs mt-1">{errors.schoolName}</p>}
                  </Field>
                  <Field label="Board" required>
                    <div className="flex flex-wrap gap-2">
                      {BOARDS.map(b => (
                        <button type="button" key={b} onClick={() => set("board", b)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                            form.board === b ? "bg-[#800000] text-white border-[#800000]" : "bg-white text-gray-700 border-gray-200 hover:border-[#800000]"
                          }`}>{b}</button>
                      ))}
                    </div>
                    {errors.board && <p className="text-red-500 text-xs mt-1">{errors.board}</p>}
                  </Field>
                </div>
                <Field label="Also preparing for competitive exam?">
                  <div className="flex gap-3">
                    {COMPETITIVE.map(c => {
                      const sel2 = form.competitiveInterest.includes(c);
                      return (
                        <button type="button" key={c}
                          onClick={() => setForm(p => ({...p, competitiveInterest: sel2 ? p.competitiveInterest.filter(x=>x!==c) : [...p.competitiveInterest, c]}))}
                          className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                            sel2 ? "bg-[#800000] text-white border-[#800000]" : "bg-white text-gray-700 border-gray-200 hover:border-[#800000]"
                          }`}>{c}</button>
                      );
                    })}
                  </div>
                </Field>
                <Field label="Add-on Vocational Course">
                  <div className="grid sm:grid-cols-2 gap-2">
                    {VOCATIONAL.map(v => (
                      <button type="button" key={v} onClick={() => set("vocational", form.vocational === v ? "" : v)}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left text-sm transition-all ${
                          form.vocational === v ? "bg-[#C9A84C]/10 border-[#C9A84C]" : "border-gray-200 hover:border-[#C9A84C]/50"
                        }`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          form.vocational === v ? "border-[#C9A84C] bg-[#C9A84C]" : "border-gray-300"
                        }`} />
                        <span className={form.vocational === v ? "text-[#8a6b20] font-semibold" : "text-gray-700"}>{v}</span>
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            )}

            {/* Competitive Exam Only fields */}
            {form.academicLevel === "competitive" && (
              <div className="mt-6 space-y-5 pt-5 border-t border-[#f0ebe0]">
                <Field label="Exam(s) Preparing For" required>
                  <div className="flex gap-3">
                    {COMPETITIVE.map(c => {
                      const sel2 = form.competitiveInterest.includes(c);
                      return (
                        <button type="button" key={c}
                          onClick={() => setForm(p => ({...p, stream: "", competitiveInterest: sel2 ? p.competitiveInterest.filter(x=>x!==c) : [...p.competitiveInterest, c]}))}
                          className={`px-6 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                            sel2 ? "bg-[#800000] text-white border-[#800000]" : "bg-white text-gray-700 border-gray-200 hover:border-[#800000]"
                          }`}>{c}</button>
                      );
                    })}
                  </div>
                  {errors.stream && <p className="text-red-500 text-xs mt-1">{errors.stream}</p>}
                </Field>
                <Field label="Stream">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {STREAMS.map(s => (
                      <button type="button" key={s} onClick={() => set("stream", form.stream === s ? "" : s)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                          form.stream === s ? "bg-[#800000]/5 border-[#800000]" : "border-gray-200 hover:border-[#800000]/40"
                        }`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          form.stream === s ? "border-[#800000] bg-[#800000]" : "border-gray-300"
                        }`} />
                        <span className={`text-sm font-semibold ${form.stream === s ? "text-[#800000]" : "text-gray-700"}`}>{s}</span>
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            )}

            {/* Vocational Only */}
            {form.academicLevel === "vocational" && (
              <div className="mt-6 pt-5 border-t border-[#f0ebe0]">
                <Field label="Select Vocational Course" required>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {VOCATIONAL.map(v => (
                      <button type="button" key={v} onClick={() => set("vocational", v)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                          form.vocational === v ? "bg-[#C9A84C]/10 border-[#C9A84C]" : "border-gray-200 hover:border-[#C9A84C]/50"
                        }`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          form.vocational === v ? "border-[#C9A84C]" : "border-gray-300"
                        }`}>
                          {form.vocational === v && <div className="w-2.5 h-2.5 rounded-full bg-[#C9A84C]" />}
                        </div>
                        <span className={`text-sm font-semibold ${form.vocational === v ? "text-[#8a6b20]" : "text-gray-700"}`}>{v}</span>
                      </button>
                    ))}
                  </div>
                  {errors.vocational && <p className="text-red-500 text-xs mt-2">{errors.vocational}</p>}
                </Field>
              </div>
            )}
          </div>



          {/* SECTION 4 */}
          <div className="bg-white rounded-2xl border border-[#f0ebe0] shadow-sm p-6 md:p-8">
            <SectionHeader num={4} title="Address Details" />

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

          {/* SECTION 5 - SUBMIT */}
          <div className="bg-white rounded-2xl border border-[#f0ebe0] shadow-sm p-6 md:p-8">
            <SectionHeader num={5} title="Declaration & Submit" />
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
