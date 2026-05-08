"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  GraduationCap, Bell, LogOut, Home, BookOpen, Clock,
  Settings, ChevronRight, CheckCircle2, AlertTriangle,
  Phone, HelpCircle, Loader2, User, RefreshCw,
} from "lucide-react";

type Tab = "overview" | "settings";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [student, setStudent] = useState<any>(null);
  const [editPhone, setEditPhone] = useState("");
  const [editEmergency, setEditEmergency] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [annRes, settingsRes] = await Promise.all([
        fetch("/api/announcements"),
        fetch("/api/settings"),
      ]);
      const [annData, settingsData] = await Promise.all([
        annRes.json(),
        settingsRes.json(),
      ]);
      if (annData.announcements) setNotices(annData.announcements);
      if (settingsData.settings) setSettings(settingsData.settings);

      // Read phone from cookie set by /api/student/login server response
      const phone = document.cookie
        .split("; ")
        .find((c) => c.startsWith("student_phone="))
        ?.split("=")[1];

      if (phone) {
        const stuRes = await fetch(`/api/student/profile`);
        const stuData = await stuRes.json();
        if (stuData.student) {
          setStudent(stuData.student);
          setEditPhone(stuData.student.present_phone ?? "");
          setEditEmergency(stuData.student.emergency_contact ?? "");
        }
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogout = () => {
    document.cookie = "student_session=; path=/; max-age=0";
    document.cookie = "student_phone=; path=/; max-age=0";
    router.push("/login");
  };

  const handleSaveSettings = async () => {
    if (!student) return;
    if (editPhone.length !== 10) { toast.error("Phone must be 10 digits"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/student/profile?phone=${student.present_phone}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ present_phone: editPhone, emergency_contact: editEmergency }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Profile updated successfully");
      setStudent((prev: any) => ({ ...prev, present_phone: editPhone, emergency_contact: editEmergency }));
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (s: string) => {
    if (s === "enrolled") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "approved") return "bg-blue-50 text-blue-700 border-blue-200";
    if (s === "applied") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  const TABS = [
    { id: "overview" as Tab, label: "Dashboard", icon: <User size={15} /> },
    { id: "settings" as Tab, label: "Settings", icon: <Settings size={15} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      {/* HEADER */}
      <header className="bg-white border-b border-[#e8d9b8] sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#800000] flex items-center justify-center">
              <GraduationCap size={18} className="text-[#C9A84C]" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-[13px] leading-tight" style={{ fontFamily: "var(--font-serif)" }}>Ursuline Study Centre</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Student Portal</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={fetchAll} className="p-2 text-gray-400 hover:text-[#800000] hover:bg-gray-50 rounded-lg transition-colors" title="Refresh">
              <RefreshCw size={15} />
            </button>
            <Link href="/" className="hidden md:flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-[#800000] transition-colors">
              <Home size={14} /> Website
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-[12px] font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-7">

        {/* SIDEBAR */}
        <aside className="w-full lg:w-60 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-[#e8d9b8] shadow-sm overflow-hidden sticky top-24">
            {/* Mini profile */}
            <div className="p-5 border-b border-gray-50">
              <div className="w-14 h-14 rounded-full bg-[#800000]/10 border-2 border-white shadow flex items-center justify-center mb-3">
                <span className="text-[#800000] text-lg font-bold">
                  {student?.full_name?.charAt(0) ?? "?"}
                </span>
              </div>
              {student ? (
                <>
                  <p className="font-bold text-gray-900 text-sm">{student.full_name}</p>
                  <p className="text-gray-400 text-[11px] font-medium mt-0.5 truncate">{student.id?.slice(0, 13)}</p>
                  <span className={`mt-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${statusColor(student.admission_status)}`}>
                    <CheckCircle2 size={10} /> {student.admission_status}
                  </span>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                  <div className="h-2.5 w-20 bg-gray-100 rounded animate-pulse" />
                </div>
              )}
            </div>

            {/* Nav */}
            <nav className="p-2.5 space-y-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                    activeTab === t.id
                      ? "bg-[#800000] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={activeTab === t.id ? "text-[#C9A84C]" : "text-gray-400"}>{t.icon}</span>
                    {t.label}
                  </div>
                  {activeTab === t.id && <ChevronRight size={14} className="text-white/50" />}
                </button>
              ))}
            </nav>

            {/* Support block */}
            <div className="p-3 m-3 mt-1 bg-[#FDF8F0] border border-[#e8d9b8] rounded-xl">
              <p className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <HelpCircle size={12} className="text-[#800000]" /> Support
              </p>
              <p className="text-[10px] text-gray-500 mb-2.5 leading-relaxed">
                {settings.office_hours ?? "Mon–Sat, 8AM–4PM"}
              </p>
              <a
                href={`tel:${settings.phone ?? "+918809462255"}`}
                className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 hover:border-[#800000] hover:text-[#800000] transition-colors"
              >
                <Phone size={11} /> {settings.phone ?? "Contact Office"}
              </a>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="space-y-5">

              {/* Welcome banner — admin-controlled session from settings */}
              <div className="bg-[#800000] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-56 h-56 bg-[#C9A84C]/15 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-serif)" }}>
                      Welcome back{student?.full_name ? `, ${student.full_name.split(" ")[0]}` : ""}!
                    </h2>
                    <p className="text-white/75 text-sm leading-relaxed">
                      {settings.welcome_message ?? "Your student portal is active. Stay updated with the latest institute notices."}
                    </p>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center flex-shrink-0">
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Session</p>
                    <p className="text-lg font-bold">{student?.session ?? settings.current_session ?? "2026-27"}</p>
                  </div>
                </div>
              </div>

              {/* Profile summary card */}
              {loading ? (
                <div className="bg-white rounded-2xl border border-[#e8d9b8] p-6 shadow-sm space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  ))}
                </div>
              ) : student ? (
                <div className="bg-white rounded-2xl border border-[#e8d9b8] shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 bg-[#FDF8F0]/40 flex items-center gap-2">
                    <BookOpen size={15} className="text-[#800000]" />
                    <h3 className="font-bold text-gray-900 text-[14px]">Enrollment Summary</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                    {[
                      { label: "Full Name", value: student.full_name },
                      { label: "Class", value: student.present_class },
                      { label: "Course / Stream", value: student.course },
                      { label: "Session", value: student.session ?? settings.current_session ?? "2026-27" },
                      { label: "Phone", value: student.present_phone },
                      { label: "Admission Status", value: student.admission_status?.replace("_", " "), pill: true, status: student.admission_status },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                        {item.pill ? (
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded border capitalize ${statusColor(item.status ?? "")}`}>
                            <CheckCircle2 size={11} /> {item.value}
                          </span>
                        ) : (
                          <p className="text-sm font-semibold text-gray-900">{item.value || "—"}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Batch timing from admin settings */}
                  {settings.batch_timing && (
                    <div className="mx-6 mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                      <Clock size={16} className="text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Batch Timing</p>
                        <p className="text-sm font-semibold text-amber-900">{settings.batch_timing}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#e8d9b8] p-10 shadow-sm text-center text-gray-400">
                  <User size={36} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Student profile not found.</p>
                  <p className="text-xs mt-1">Please log in again or contact the admin office.</p>
                </div>
              )}

              {/* Notice Board — fully dynamic from admin */}
              <div className="bg-white rounded-2xl border border-[#e8d9b8] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 bg-[#FDF8F0]/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={15} className="text-[#800000]" />
                    <h3 className="font-bold text-gray-900 text-[14px]">Institute Notice Board</h3>
                  </div>
                  {notices.length > 0 && (
                    <span className="text-[10px] font-bold bg-[#800000]/10 text-[#800000] px-2.5 py-0.5 rounded-full">
                      {notices.length} active
                    </span>
                  )}
                </div>
                <div className="divide-y divide-gray-50 max-h-[440px] overflow-y-auto">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="p-5 space-y-2">
                        <div className="h-3.5 w-2/3 bg-gray-100 rounded animate-pulse" />
                        <div className="h-2.5 w-full bg-gray-50 rounded animate-pulse" />
                      </div>
                    ))
                  ) : notices.length === 0 ? (
                    <div className="p-12 text-center text-gray-300">
                      <Bell size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No notices at the moment.</p>
                    </div>
                  ) : (
                    notices.map((n) => (
                      <div key={n.id} className="p-5 hover:bg-gray-50/70 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <h4 className="font-bold text-gray-900 text-[13px] leading-snug">{n.title}</h4>
                          <span className="flex-shrink-0 text-[10px] text-gray-400 font-medium">
                            {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        {n.content && <p className="text-[12px] text-gray-500 leading-relaxed">{n.content}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Contact info from admin settings */}
              <div className="bg-white rounded-2xl border border-[#e8d9b8] shadow-sm p-6">
                <h3 className="font-bold text-gray-900 text-[14px] mb-4 flex items-center gap-2">
                  <Phone size={15} className="text-[#800000]" /> Institute Contact
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                    <a href={`tel:${settings.phone}`} className="font-semibold text-[#800000] hover:underline">{settings.phone ?? "—"}</a>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Office Hours</p>
                    <p className="font-semibold text-gray-800">{settings.office_hours ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Address</p>
                    <p className="font-semibold text-gray-800">{settings.address ?? "Ranchi, Jharkhand"}</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === "settings" && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-800">
                <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                <p className="text-[12px] leading-relaxed">
                  <strong>Security:</strong> Academic fields (Class, Stream, Aadhaar, Admission Status) are admin-controlled and cannot be edited here. All changes are logged in the audit system.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#e8d9b8] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h3 className="font-bold text-gray-900 text-[14px]">Update Contact Information</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">You may only update your phone number and emergency contact.</p>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Registered Phone <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        maxLength={10}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/20 transition-all"
                        placeholder="10-digit phone"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Emergency Contact
                      </label>
                      <input
                        type="tel"
                        value={editEmergency}
                        onChange={(e) => setEditEmergency(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        maxLength={10}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]/20 transition-all"
                        placeholder="Parent / Guardian number"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving || !student}
                      className="bg-[#800000] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-[#600000] transition-colors disabled:opacity-60 flex items-center gap-2 shadow-sm"
                    >
                      {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => {
                        setEditPhone(student?.present_phone ?? "");
                        setEditEmergency(student?.emergency_contact ?? "");
                      }}
                      className="text-gray-500 text-sm font-semibold px-4 py-2.5 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Read-only identity fields */}
              <div className="bg-white rounded-2xl border border-[#e8d9b8] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h3 className="font-bold text-gray-900 text-[14px]">Academic Identity</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">These fields are admin-controlled. Contact the office to request changes.</p>
                </div>
                <div className="p-6 grid sm:grid-cols-2 gap-5">
                  {[
                    { label: "Full Name", value: student?.full_name },
                    { label: "Class", value: student?.present_class },
                    { label: "Course / Stream", value: student?.course },
                    { label: "Admission Status", value: student?.admission_status?.replace("_", " ") },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                      <div className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-500 font-medium cursor-not-allowed capitalize">
                        {f.value ?? "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
