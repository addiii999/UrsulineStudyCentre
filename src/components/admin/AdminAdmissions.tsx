"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Search, Loader2, BookOpen, GraduationCap } from "lucide-react";
import toast from "react-hot-toast";

interface Student {
  id: string;
  full_name: string;
  present_phone: string;
  present_class: string;
  course: string;
  admission_status: "applied" | "under_review" | "approved" | "rejected" | "enrolled";
  created_at: string;
}

const STATUS_CONFIG = {
  applied: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: <Clock size={12} />, label: "Applied" },
  under_review: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: <Search size={12} />, label: "Under Review" },
  approved: { color: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle size={12} />, label: "Approved" },
  rejected: { color: "bg-red-50 text-red-700 border-red-200", icon: <XCircle size={12} />, label: "Rejected" },
  enrolled: { color: "bg-purple-50 text-purple-700 border-purple-200", icon: <GraduationCap size={12} />, label: "Enrolled" },
};

export default function AdminAdmissions() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Student["admission_status"]>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      if (data.students) {
        setStudents(data.students);
      }
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Student["admission_status"]) => {
    try {
      const res = await fetch("/api/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, admission_status: status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, admission_status: status } : s)));
      toast.success(`Status updated to ${status.replace("_", " ")}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filtered = students.filter((s) => {
    const matchFilter = filter === "all" || s.admission_status === filter;
    const matchSearch = (s.full_name || "").toLowerCase().includes(search.toLowerCase()) || (s.present_phone || "").includes(search);
    return matchFilter && matchSearch;
  });

  const counts = {
    all: students.length,
    applied: students.filter((s) => s.admission_status === "applied").length,
    under_review: students.filter((s) => s.admission_status === "under_review").length,
    approved: students.filter((s) => s.admission_status === "approved").length,
    rejected: students.filter((s) => s.admission_status === "rejected").length,
    enrolled: students.filter((s) => s.admission_status === "enrolled").length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "var(--font-serif)" }}>Admissions</h2>
        <p className="text-gray-400 text-xs">Manage student applications and admission status</p>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2">
        {(["all", "applied", "under_review", "approved", "enrolled", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              filter === f ? "bg-[#800000] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.replace("_", " ")} ({counts[f]})
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="input-field pl-9 text-sm"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Student", "Phone", "Class", "Course", "Applied", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                  Loading applications...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">No applications found</td>
              </tr>
            ) : filtered.map((s) => {
              const sc = STATUS_CONFIG[s.admission_status];
              return (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#800000] flex items-center justify-center flex-shrink-0">
                        <span className="text-[#C9A84C] text-[10px] font-bold">{(s.full_name || "?")[0]}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{s.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.present_phone}</td>
                  <td className="px-4 py-3 text-gray-700">{s.present_class || "-"}</td>
                  <td className="px-4 py-3 text-gray-500">{s.course}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${sc.color}`}>
                      {sc.icon} {sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {s.admission_status === "applied" && (
                        <button onClick={() => updateStatus(s.id, "under_review")} className="px-2 py-1 text-[10px] font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200 rounded hover:bg-yellow-100 transition-colors">
                          Review
                        </button>
                      )}
                      {(s.admission_status === "applied" || s.admission_status === "under_review") && (
                        <button onClick={() => updateStatus(s.id, "approved")} className="px-2 py-1 text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors">
                          Approve
                        </button>
                      )}
                      {s.admission_status === "approved" && (
                        <button onClick={() => updateStatus(s.id, "enrolled")} className="px-2 py-1 text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100 transition-colors">
                          Enroll
                        </button>
                      )}
                      {s.admission_status !== "rejected" && s.admission_status !== "enrolled" && (
                        <button onClick={() => updateStatus(s.id, "rejected")} className="p-1.5 rounded text-red-400 hover:bg-red-50 transition-colors" title="Reject">
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
