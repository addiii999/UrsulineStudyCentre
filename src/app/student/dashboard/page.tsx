"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, BookOpen, Calendar, Bell, LogOut, Home, 
  User, MapPin, Phone, Shield, FileText, Download, TrendingUp, 
  Clock, AlertCircle, Settings, ChevronRight, CheckCircle2, 
  AlertTriangle, CreditCard, HelpCircle, Loader2
} from "lucide-react";

type Tab = "overview" | "academics" | "documents" | "settings";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    // Mock fetching student data - in production this would verify session token
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch announcements for the notice board
        const annRes = await fetch("/api/announcements");
        const annData = await annRes.json();
        if (annData.announcements) {
          setNotices(annData.announcements);
        }

        // Mock student profile data
        setStudent({
          id: "USC-2026-0492",
          full_name: "Aditya Kumar",
          present_class: "Class 12",
          course: "Science PCM + JEE Mains",
          session: "2026-27",
          admission_status: "enrolled",
          present_phone: "9876543210",
          batch_timing: "Morning Batch (8:00 AM - 12:30 PM)",
          class_mode: "Offline Classroom",
          attendance_pct: 85,
          emergency_contact: "9876543211",
        });

      } catch (error) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    document.cookie = "student_session=; path=/; max-age=0";
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#800000]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      {/* HEADER */}
      <header className="bg-white border-b border-[#e8d9b8] px-4 md:px-8 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#800000] flex items-center justify-center shadow-inner">
              <GraduationCap size={20} className="text-[#C9A84C]" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-base leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
                Ursuline Study Centre
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-gray-500 text-[11px] font-medium tracking-wide uppercase">Student Portal</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/" className="hidden md:flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-[#800000] transition-colors">
              <Home size={15} /> Website
            </Link>
            <div className="h-4 w-px bg-gray-200 hidden md:block"></div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-[13px] font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-[#e8d9b8] shadow-sm overflow-hidden sticky top-24">
            {/* Student Mini Profile */}
            <div className="p-6 border-b border-gray-50 bg-gradient-to-b from-[#FDF8F0] to-white">
              <div className="w-16 h-16 rounded-full bg-[#800000]/10 flex items-center justify-center border-2 border-white shadow-sm mb-3">
                <span className="text-[#800000] text-xl font-bold">{student?.full_name?.charAt(0)}</span>
              </div>
              <h2 className="font-bold text-gray-900 text-lg">{student?.full_name}</h2>
              <p className="text-gray-500 text-xs font-medium tracking-wide">{student?.id}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{student?.admission_status}</span>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="p-3 space-y-1">
              {[
                { id: "overview", label: "Dashboard Overview", icon: <User size={16} /> },
                { id: "academics", label: "Academic Profile", icon: <BookOpen size={16} /> },
                { id: "documents", label: "My Documents", icon: <FileText size={16} /> },
                { id: "settings", label: "Account Settings", icon: <Settings size={16} /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === item.id 
                      ? "bg-[#800000] text-white shadow-md shadow-[#800000]/20" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={activeTab === item.id ? "text-[#C9A84C]" : "text-gray-400"}>{item.icon}</span>
                    {item.label}
                  </div>
                  {activeTab === item.id && <ChevronRight size={16} className="text-white/50" />}
                </button>
              ))}
            </nav>

            {/* Quick Support */}
            <div className="p-4 m-3 bg-[#FDF8F0] border border-[#e8d9b8] rounded-xl">
              <p className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5"><HelpCircle size={14} className="text-[#800000]"/> Need Help?</p>
              <p className="text-[11px] text-gray-600 mb-3">Contact the admin office for profile changes or queries.</p>
              <a href="tel:+918809462255" className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-[#800000] hover:text-[#800000] transition-colors">
                <Phone size={12} /> Contact Office
              </a>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 min-w-0 space-y-6">
          
          {/* ── OVERVIEW TAB ────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              
              {/* Welcome Banner */}
              <div className="bg-[#800000] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C9A84C]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('/pattern.svg')" }} />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                      Welcome back, {student?.full_name.split(' ')[0]}!
                    </h2>
                    <p className="text-white/80 text-sm max-w-md leading-relaxed">
                      Your current session is active. Keep up the good work and check your academic notices regularly.
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex-shrink-0 text-center min-w-[140px]">
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Session</p>
                    <p className="text-xl font-bold tracking-wider">{student?.session}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Class", value: student?.present_class, icon: <GraduationCap size={18} />, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Stream", value: student?.course?.split('+')[0].trim(), icon: <BookOpen size={18} />, color: "text-purple-600", bg: "bg-purple-50" },
                  { label: "Attendance", value: `${student?.attendance_pct}%`, icon: <TrendingUp size={18} />, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Batch", value: "Morning", icon: <Clock size={18} />, color: "text-amber-600", bg: "bg-amber-50" },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-[#e8d9b8] p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                      {stat.icon}
                    </div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{stat.label}</p>
                    <p className="font-bold text-gray-900 text-sm mt-1 truncate" title={stat.value}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Notice Board */}
              <div className="bg-white rounded-2xl border border-[#e8d9b8] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#FDF8F0]/50">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-[#800000]" />
                    <h3 className="font-bold text-gray-900 text-[15px]">Institute Notice Board</h3>
                  </div>
                  <span className="text-[11px] font-bold bg-[#800000]/10 text-[#800000] px-2.5 py-1 rounded-full">{notices.length} Updates</span>
                </div>
                <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                  {notices.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">
                      <Bell size={32} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No new notices at the moment.</p>
                    </div>
                  ) : (
                    notices.map((notice) => (
                      <div key={notice.id} className="p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-bold text-gray-900 text-sm">{notice.title}</h4>
                          <span className="flex-shrink-0 text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-medium">
                            {new Date(notice.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed">{notice.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ACADEMICS TAB ────────────────────────────────────────── */}
          {activeTab === "academics" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="bg-white rounded-2xl border border-[#e8d9b8] shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-[#FDF8F0]/50">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <BookOpen size={20} className="text-[#800000]" /> Academic Profile
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Your current enrollment details and batch information.</p>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Enrolled Course</p>
                        <p className="text-sm font-semibold text-gray-900">{student?.course}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Present Class</p>
                        <p className="text-sm font-semibold text-gray-900">{student?.present_class}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Batch Timing</p>
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Clock size={14} className="text-amber-500"/> {student?.batch_timing}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Class Mode</p>
                        <p className="text-sm font-semibold text-gray-900">{student?.class_mode}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Academic Session</p>
                        <p className="text-sm font-semibold text-gray-900">{student?.session}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Admission Status</p>
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded border border-emerald-100 text-xs font-bold uppercase">
                          <CheckCircle2 size={14} /> Confirmed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#e8d9b8] shadow-sm overflow-hidden opacity-75 relative">
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                  <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm text-xs font-bold text-gray-500 flex items-center gap-2">
                    <AlertCircle size={14} /> Performance module locked until first test
                  </div>
                </div>
                <div className="px-6 py-5 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-base">Test Results & Performance</h3>
                </div>
                <div className="p-6">
                  <div className="h-24 bg-gray-50 rounded-xl border border-dashed border-gray-200"></div>
                </div>
              </div>
            </div>
          )}

          {/* ── DOCUMENTS TAB ────────────────────────────────────────── */}
          {activeTab === "documents" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="bg-white rounded-2xl border border-[#e8d9b8] shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-[#FDF8F0]/50 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      <FileText size={20} className="text-[#800000]" /> Student Documents
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Safely view and download your institutional records.</p>
                  </div>
                </div>
                <div className="p-6 grid gap-4">
                  {[
                    { title: "Admission Receipt", desc: "Proof of enrollment and fee payment", date: "Generated on admission", icon: <CreditCard size={20}/> },
                    { title: "Enrollment Confirmation", desc: "Official institute identity document", date: "Valid for 2026-27", icon: <Shield size={20}/> },
                    { title: "Institute Guidelines", desc: "Rules, regulations and academic calendar", date: "Updated 1st April", icon: <BookOpen size={20}/> },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#800000]/30 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#800000]/5 group-hover:text-[#800000] transition-colors">
                          {doc.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{doc.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{doc.desc} · <span className="text-gray-400">{doc.date}</span></p>
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-[#800000] hover:bg-[#800000]/5 rounded-lg transition-colors" title="Download">
                        <Download size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ────────────────────────────────────────── */}
          {activeTab === "settings" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3 text-amber-800">
                <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">Security Notice</h4>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    For institutional security, core academic fields (Class, Stream, Aadhaar) cannot be edited directly. To request a change to protected data, please contact the administration office. All profile edits are securely logged.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#e8d9b8] shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-base">Editable Profile Information</h3>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Registered Phone Number</label>
                      <input type="text" defaultValue={student?.present_phone} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Emergency Contact</label>
                      <input type="text" defaultValue={student?.emergency_contact} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Update Password</label>
                    <input type="password" placeholder="Enter new password" className="w-full md:w-1/2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]" />
                  </div>
                  
                  <div className="pt-4 flex items-center gap-3 border-t border-gray-50">
                    <button className="bg-[#800000] text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-sm hover:bg-[#600000] transition-colors">
                      Save Changes
                    </button>
                    <button className="text-gray-500 text-sm font-semibold px-4 py-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
