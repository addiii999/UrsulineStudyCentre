"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

type Tab = "student-login" | "student-signup" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("student-login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [adminForm, setAdminForm] = useState({ username: "", password: "" });

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Logged in successfully!");
    router.push("/student/dashboard");
    setLoading(false);
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
    await new Promise((r) => setTimeout(r, 800));
    if (adminForm.username === "admin" && adminForm.password === "usc@admin2026") {
      toast.success("Welcome, Admin!");
      router.push("/admin/dashboard");
    } else {
      toast.error("Invalid credentials");
    }
    setLoading(false);
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
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
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
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                      className="input-field pl-9 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-1">
                  {loading ? "Logging in..." : <>Login <ArrowRight size={15} /></>}
                </button>
                <p className="text-center text-xs text-gray-500">
                  No account?{" "}
                  <button type="button" onClick={() => setTab("student-signup")} className="text-[#800000] font-semibold hover:underline">
                    Sign up here
                  </button>
                </p>
              </form>
            )}

            {/* STUDENT SIGNUP */}
            {tab === "student-signup" && (
              <form onSubmit={handleStudentSignup} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={signupForm.name}
                      onChange={(e) => setSignupForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name"
                      className="input-field pl-9"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 XXXXX XXXXX"
                      className="input-field pl-9"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="input-field pl-9"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Create Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={signupForm.password}
                      onChange={(e) => setSignupForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Min. 8 characters"
                      className="input-field pl-9 pr-10"
                      minLength={8}
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
                  {loading ? "Creating account..." : <>Create Account <ArrowRight size={15} /></>}
                </button>
                <p className="text-center text-xs text-gray-500">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setTab("student-login")} className="text-[#800000] font-semibold hover:underline">
                    Login
                  </button>
                </p>
              </form>
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
                      placeholder="admin"
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
                <p className="text-center text-[10px] text-gray-400 mt-2">
                  Default: admin / usc@admin2026
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
