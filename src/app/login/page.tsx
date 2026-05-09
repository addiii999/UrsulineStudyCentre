"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, ShieldCheck, ClipboardList, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

type Tab = "student-login" | "student-signup" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("student-login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ phone: "", password: "" });
  const [signupForm, setSignupForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [adminForm, setAdminForm] = useState({ username: "", password: "" });

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.phone.length !== 10) { toast.error("Enter a valid 10-digit phone number"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginForm.phone, password: loginForm.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Login failed");
        return;
      }
      toast.success(`Welcome back, ${data.student?.name?.split(" ")[0] ?? "Student"}!`);
      router.push("/student/dashboard");
    } catch {
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Account created! Welcome to USC.");
    router.push("/student/dashboard");
    setLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminForm.username, password: adminForm.password }),
      });
      if (res.ok) {
        toast.success("Welcome, Admin!");
        router.push("/admin/dashboard");
      } else {
        const data = await res.json();
        toast.error(data.error || "Invalid credentials");
      }
    } catch {
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "student-login", label: "Student Login", icon: <GraduationCap size={14} /> },
    { id: "student-signup", label: "Sign Up", icon: <User size={14} /> },
    { id: "admin", label: "Admin", icon: <ShieldCheck size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* BACK LINK */}
        <Link href="/" className="flex items-center gap-2 text-gray-500 text-sm hover:text-[#800000] transition-colors mb-6">
          ← Back to Website
        </Link>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#f0ebe0] overflow-hidden">
          {/* HEADER */}
          <div className="bg-[#800000] px-8 pt-8 pb-6 text-center">
            <img
              src="/logo.png"
              alt="Ursuline Study Centre"
              className="h-14 md:h-16 w-auto object-contain mx-auto mb-3 bg-white/95 rounded-md px-2 py-1 shadow-sm"
            />
            <h1 className="text-white text-xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
              Ursuline Study Centre
            </h1>
            <p className="text-white/60 text-xs mt-0.5">Access Portal</p>
          </div>

          {/* TABS */}
          <div className="flex border-b border-[#f0ebe0]">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all duration-200 border-b-2",
                  tab === t.id
                    ? "border-[#C9A84C] text-[#800000] bg-[#FDF8F0]"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* FORM AREA */}
          <div className="p-8">
            {/* STUDENT LOGIN */}
            {tab === "student-login" && (
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
                  Login using the phone number you registered during admission.
                </div>
                <div>
                  <label className="label">Registered Phone Number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={loginForm.phone}
                      onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      placeholder="10-digit mobile number"
                      className="input-field pl-9"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="label">Password (DOB for first login: YYYY-MM-DD)</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="e.g. 2005-08-15"
                      className="input-field pl-9 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-1">
                  {loading ? "Verifying..." : <>Access Portal <ArrowRight size={15} /></>}
                </button>
                <p className="text-center text-xs text-gray-500">
                  New student?{" "}
                  <button type="button" onClick={() => setTab("student-signup")} className="text-[#800000] font-semibold hover:underline">
                    Apply for admission
                  </button>
                </p>
              </form>
            )}

            {/* STUDENT SIGNUP — full admission form redirect */}
            {tab === "student-signup" && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#800000]/8 flex items-center justify-center mx-auto mb-4">
                    <ClipboardList size={30} className="text-[#800000]" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Admission Application</h3>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                    New student? Fill our complete admission form to apply for the 2026-27 session.
                  </p>
                </div>

                <div className="bg-[#FDF8F0] border border-[#e8d9b8] rounded-xl p-4 space-y-2">
                  {[
                    "Basic & Parent Details",
                    "Education Qualification",
                    "Course & Stream Selection",
                    "Vocational Course Choice",
                    "Address Information",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle size={14} className="text-[#800000] flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>

                <Link
                  href="/apply"
                  className="btn-primary w-full justify-center text-base py-3.5"
                >
                  <ClipboardList size={18} />
                  Fill Admission Form
                  <ArrowRight size={16} />
                </Link>

                <p className="text-center text-xs text-gray-500">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setTab("student-login")} className="text-[#800000] font-semibold hover:underline">
                    Login here
                  </button>
                </p>
              </div>
            )}

            {/* ADMIN */}
            {tab === "admin" && (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="bg-[#800000]/5 border border-[#800000]/10 rounded-xl p-3 mb-4 flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[#800000]" />
                  <p className="text-xs text-[#800000] font-medium">Admin access is restricted. Unauthorised access is prohibited.</p>
                </div>
                <div>
                  <label className="label">Admin Username</label>
                  <div className="relative">
                    <ShieldCheck size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={adminForm.username}
                      onChange={(e) => setAdminForm((p) => ({ ...p, username: e.target.value }))}
                      placeholder="admin@example.com"
                      className="input-field pl-9"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={adminForm.password}
                      onChange={(e) => setAdminForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                      className="input-field pl-9 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-1">
                  {loading ? "Authenticating..." : <>Access Admin Panel <ArrowRight size={15} /></>}
                </button>

              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
