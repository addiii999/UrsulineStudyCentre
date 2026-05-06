"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, BookOpen, Users, Play, ClipboardList,
  CreditCard, MessageSquare, LogOut, GraduationCap, Menu,
  ChevronLeft, Bell, HelpCircle, Star, Megaphone, Trophy,
  Settings, ExternalLink,
} from "lucide-react";
import clsx from "clsx";

// Admin sub-pages
import AdminDashboardHome from "@/components/admin/AdminDashboardHome";
import AdminCourses from "@/components/admin/AdminCourses";
import AdminFaculty from "@/components/admin/AdminFaculty";
import AdminVideos from "@/components/admin/AdminVideos";
import AdminAdmissions from "@/components/admin/AdminAdmissions";
import AdminFees from "@/components/admin/AdminFees";
import AdminEnquiries from "@/components/admin/AdminEnquiries";
import AdminFAQ from "@/components/admin/AdminFAQ";
import AdminTestimonials from "@/components/admin/AdminTestimonials";
import AdminAnnouncements from "@/components/admin/AdminAnnouncements";
import AdminResults from "@/components/admin/AdminResults";
import AdminSettings from "@/components/admin/AdminSettings";

type AdminSection =
  | "dashboard"
  | "courses" | "faculty" | "videos" | "testimonials" | "results" | "faq"
  | "admissions" | "fees" | "enquiries"
  | "announcements"
  | "settings";

type NavGroup = { label: string; items: { id: AdminSection; label: string; icon: React.ReactNode }[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> }],
  },
  {
    label: "Content",
    items: [
      { id: "courses",      label: "Courses",       icon: <BookOpen size={16} /> },
      { id: "faculty",      label: "Faculty",        icon: <Users size={16} /> },
      { id: "videos",       label: "Videos",         icon: <Play size={16} /> },
      { id: "testimonials", label: "Testimonials",   icon: <Star size={16} /> },
      { id: "results",      label: "Results",        icon: <Trophy size={16} /> },
      { id: "faq",          label: "FAQ",            icon: <HelpCircle size={16} /> },
    ],
  },
  {
    label: "Students & Leads",
    items: [
      { id: "enquiries",  label: "Enquiries",   icon: <MessageSquare size={16} /> },
      { id: "admissions", label: "Admissions",  icon: <ClipboardList size={16} /> },
      { id: "fees",       label: "Fees",        icon: <CreditCard size={16} /> },
    ],
  },
  {
    label: "Promotions",
    items: [
      { id: "announcements", label: "Announcements", icon: <Megaphone size={16} /> },
    ],
  },
  {
    label: "System",
    items: [
      { id: "settings", label: "Settings", icon: <Settings size={16} /> },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":    return <AdminDashboardHome />;
      case "courses":      return <AdminCourses />;
      case "faculty":      return <AdminFaculty />;
      case "videos":       return <AdminVideos />;
      case "admissions":   return <AdminAdmissions />;
      case "fees":         return <AdminFees />;
      case "enquiries":    return <AdminEnquiries />;
      case "faq":          return <AdminFAQ />;
      case "testimonials": return <AdminTestimonials />;
      case "announcements":return <AdminAnnouncements />;
      case "results":      return <AdminResults />;
      case "settings":     return <AdminSettings />;
      default:             return <AdminDashboardHome />;
    }
  };

  const handleLogout = async () => {
    try { await fetch("/api/admin/login", { method: "DELETE" }); } catch {}
    router.push("/login");
  };

  const currentNav = ALL_NAV_ITEMS.find((n) => n.id === activeSection);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F4F6F9", fontFamily: "'Inter', 'Manrope', system-ui, sans-serif" }}>

      {/* ─── SIDEBAR ─────────────────────────────────────────── */}
      <aside
        className={clsx(
          "flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out",
          "border-r border-white/[0.06]",
          sidebarOpen ? "w-[220px]" : "w-[64px]"
        )}
        style={{ background: "linear-gradient(180deg, #1A0A0A 0%, #120606 100%)" }}
      >
        {/* Logo row */}
        <div className={clsx(
          "flex items-center border-b border-white/[0.07] min-h-[60px]",
          sidebarOpen ? "px-4 gap-3" : "px-0 justify-center"
        )}>
          <img
            src="/logo.png"
            alt="USC"
            className="h-7 w-auto object-contain bg-white/90 rounded-md px-1.5 py-0.5 flex-shrink-0"
          />
          {sidebarOpen && (
            <div className="min-w-0">
              <div className="text-white text-[11px] font-bold leading-tight tracking-wide">USC Admin</div>
              <div className="text-white/30 text-[9px] tracking-widest uppercase mt-0.5">Control Panel</div>
            </div>
          )}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-none">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-0.5">
              {sidebarOpen && (
                <p className="text-white/20 text-[9px] font-bold uppercase tracking-[0.14em] px-5 pt-4 pb-1.5 select-none">
                  {group.label}
                </p>
              )}
              {!sidebarOpen && <div className="h-3" />}
              <div className="space-y-0.5 px-2">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      title={!sidebarOpen ? item.label : undefined}
                      className={clsx(
                        "w-full flex items-center rounded-lg text-[13px] transition-all duration-150 group relative",
                        sidebarOpen ? "gap-3 px-3 py-2.5" : "justify-center px-0 py-2.5",
                        isActive
                          ? "bg-[#C9A84C]/15 text-[#C9A84C]"
                          : "text-white/45 hover:text-white/90 hover:bg-white/[0.05]"
                      )}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#C9A84C] rounded-r-full" />
                      )}
                      <span className={clsx("flex-shrink-0 transition-colors", isActive ? "text-[#C9A84C]" : "text-white/40 group-hover:text-white/80")}>
                        {item.icon}
                      </span>
                      {sidebarOpen && (
                        <span className={clsx("font-medium", isActive ? "font-semibold" : "")}>
                          {item.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className={clsx(
          "py-3 border-t border-white/[0.06] space-y-0.5",
          sidebarOpen ? "px-2" : "px-2"
        )}>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            title={!sidebarOpen ? "View Website" : undefined}
            className={clsx(
              "w-full flex items-center rounded-lg text-[12px] text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-150 group",
              sidebarOpen ? "gap-3 px-3 py-2" : "justify-center px-0 py-2.5"
            )}
          >
            <ExternalLink size={14} className="flex-shrink-0" />
            {sidebarOpen && "View Website"}
          </a>
          <button
            onClick={handleLogout}
            title={!sidebarOpen ? "Logout" : undefined}
            className={clsx(
              "w-full flex items-center rounded-lg text-[12px] text-white/30 hover:text-red-400/80 hover:bg-red-500/[0.06] transition-all duration-150",
              sidebarOpen ? "gap-3 px-3 py-2" : "justify-center px-0 py-2.5"
            )}
          >
            <LogOut size={14} className="flex-shrink-0" />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      {/* ─── MAIN AREA ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center justify-between bg-white border-b border-gray-100/80 px-5 h-[60px]"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          {/* Left: toggle + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-150"
              title="Toggle sidebar"
            >
              {sidebarOpen
                ? <ChevronLeft size={17} />
                : <Menu size={17} />
              }
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <div>
              <h1 className="font-semibold text-gray-800 text-[13.5px] leading-tight tracking-[-0.01em]">
                {currentNav?.label ?? "Dashboard"}
              </h1>
              <p className="text-gray-400 text-[10.5px] tracking-wide">Ursuline Study Centre</p>
            </div>
          </div>

          {/* Right: bell + avatar */}
          <div className="flex items-center gap-2.5">
            <button className="relative p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-150">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#C9A84C] rounded-full ring-1 ring-white" />
            </button>
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #800000 0%, #5c0000 100%)" }}>
                <GraduationCap size={15} className="text-[#C9A84C]" />
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-[12px] font-semibold text-gray-800">Admin</p>
                <p className="text-[10px] text-gray-400">ursulinestudycentre</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
