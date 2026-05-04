"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Play,
  ClipboardList,
  CreditCard,
  MessageSquare,
  LogOut,
  GraduationCap,
  Menu,
  X,
  Bell,
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

type AdminSection =
  | "dashboard"
  | "courses"
  | "faculty"
  | "videos"
  | "admissions"
  | "fees"
  | "enquiries";

const NAV_ITEMS: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { id: "courses", label: "Courses", icon: <BookOpen size={16} /> },
  { id: "faculty", label: "Faculty", icon: <Users size={16} /> },
  { id: "videos", label: "Videos", icon: <Play size={16} /> },
  { id: "admissions", label: "Admissions", icon: <ClipboardList size={16} /> },
  { id: "fees", label: "Fees", icon: <CreditCard size={16} /> },
  { id: "enquiries", label: "Enquiries", icon: <MessageSquare size={16} /> },
];

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard": return <AdminDashboardHome />;
      case "courses": return <AdminCourses />;
      case "faculty": return <AdminFaculty />;
      case "videos": return <AdminVideos />;
      case "admissions": return <AdminAdmissions />;
      case "fees": return <AdminFees />;
      case "enquiries": return <AdminEnquiries />;
      default: return <AdminDashboardHome />;
    }
  };

  const handleLogout = () => {
    router.push("/login");
  };

  const currentNav = NAV_ITEMS.find((n) => n.id === activeSection);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={clsx(
          "flex flex-col bg-[#0D0505] text-white transition-all duration-300 flex-shrink-0",
          sidebarOpen ? "w-56" : "w-16"
        )}
      >
        {/* LOGO */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 min-h-[64px]">
          <img
            src="/logo.png"
            alt="USC Logo"
            className="h-8 w-auto object-contain bg-white/95 rounded px-1 py-0.5 flex-shrink-0"
          />
          {sidebarOpen && (
            <div>
              <div className="text-white text-xs font-bold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
                USC Admin
              </div>
              <div className="text-white/40 text-[9px]">Control Panel</div>
            </div>
          )}
        </div>

        {/* NAV ITEMS */}
        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              title={!sidebarOpen ? item.label : undefined}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                activeSection === item.id
                  ? "bg-[#C9A84C]/20 text-[#C9A84C] font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* BOTTOM */}
        <div className="px-2 py-4 border-t border-white/10 space-y-1">
          <Link
            href="/"
            target="_blank"
            title={!sidebarOpen ? "View Website" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 text-xs transition-colors"
          >
            <GraduationCap size={14} />
            {sidebarOpen && "View Website"}
          </Link>
          <button
            onClick={handleLogout}
            title={!sidebarOpen ? "Logout" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-red-400 text-xs transition-colors"
          >
            <LogOut size={14} />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP BAR */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <h1 className="font-bold text-gray-900 text-sm" style={{ fontFamily: "var(--font-serif)" }}>
                {currentNav?.label}
              </h1>
              <p className="text-gray-400 text-xs">Ursuline Study Centre - Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C9A84C] rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#800000] flex items-center justify-center">
                <span className="text-[#C9A84C] text-xs font-bold">A</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-800">Admin</p>
                <p className="text-[10px] text-gray-400">usc@admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
