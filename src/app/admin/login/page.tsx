"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Home } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Authentication successful! Welcome, Admin.");
        router.push("/admin/dashboard");
      } else {
        toast.error(data.error || "Invalid credentials");
      }
    } catch {
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FDF8F0] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-[#800000]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-[#C9A84C]/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* BACK TO HOME LINK */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#800000] font-medium hover:text-[#600000] transition-colors mb-6 group"
        >
          <Home size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Homepage
        </Link>

        {/* LOGIN CARD */}
        <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(128,0,0,0.08)] border border-[#e8d9b8]/50 overflow-hidden">
          
          {/* CARD HEADER */}
          <div className="bg-[#800000] px-8 py-8 text-center relative overflow-hidden">
            {/* Lighter gold overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#500000] to-[#800000] opacity-50" />
            <div className="relative z-10 flex flex-col items-center">
              <img
                src="/logo.png"
                alt="Ursuline Study Centre"
                className="h-16 w-auto object-contain mb-3 bg-white/95 rounded-xl px-3 py-1.5 shadow-md border border-[#e8d9b8]/30"
              />
              <h1 className="text-white text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
                Ursuline Study Centre
              </h1>
              <p className="text-white/70 text-xs tracking-wider uppercase font-semibold mt-1">
                Admin Control Portal
              </p>
            </div>
          </div>

          {/* CARD FORM BODY */}
          <div className="p-8 space-y-6">
            <div className="bg-[#800000]/5 border border-[#800000]/10 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck size={20} className="text-[#800000] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-[#800000]">Secure Access Area</h4>
                <p className="text-[11px] text-[#800000]/80 mt-0.5 leading-relaxed font-medium">
                  Authorized personnel only. All access attempts are monitored and logged.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Admin Username / Email
                </label>
                <div className="relative">
                  <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="e.g. admin@ursuline.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] text-sm transition-all text-gray-800 placeholder-gray-400 bg-gray-50/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] text-sm transition-all text-gray-800 placeholder-gray-400 bg-gray-50/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#800000] transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#800000] hover:bg-[#600000] text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#800000]/10 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed group border border-[#800000]"
              >
                {loading ? (
                  "Authenticating..."
                ) : (
                  <>
                    Access Admin Panel
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
