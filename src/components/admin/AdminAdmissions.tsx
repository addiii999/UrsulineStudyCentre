"use client";
import { useState } from "react";
import { CheckCircle, XCircle, Clock, Search } from "lucide-react";

interface Student {
  id: string;
  name: string;
  phone: string;
  class: string;
  stream: string;
  admission_status: "pending" | "approved" | "rejected";
  applied_date: string;
}

const SAMPLE_STUDENTS: Student[] = [
  { id: "1", name: "Riya Sharma", phone: "9507589xxx", class: "Class 11", stream: "PCM", admission_status: "pending", applied_date: "2026-05-01" },
  { id: "2", name: "Priya Gupta", phone: "9876543xxx", class: "Class 9", stream: "—", admission_status: "approved", applied_date: "2026-04-28" },
  { id: "3", name: "Anjali Singh", phone: "8765432xxx", class: "Class 12", stream: "PCB", admission_status: "approved", applied_date: "2026-04-25" },
  { id: "4", name: "Kavya Verma", phone: "7654321xxx", class: "Class 10", stream: "—", admission_status: "pending", applied_date: "2026-05-02" },
  { id: "5", name: "Simran Mehta", phone: "6543210xxx", class: "Class 11", stream: "Commerce", admission_status: "rejected", applied_date: "2026-04-20" },
];

const STATUS_CONFIG = {
  pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: <Clock size={12} /> },
  approved: { color: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle size={12} /> },
  rejected: { color: "bg-red-50 text-red-700 border-red-200", icon: <XCircle size={12} /> },
};

export default function AdminAdmissions() {
  const [students, setStudents] = useState<Student[]>(SAMPLE_STUDENTS);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = useState("");

  const updateStatus = (id: string, status: Student["admission_status"]) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, admission_status: status } : s)));
  };

  const filtered = students.filter((s) => {
    const matchFilter = filter === "all" || s.admission_status === filter;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search);
    return matchFilter && matchSearch;
  });

  const counts = {
    all: students.length,
    pending: students.filter((s) => s.admission_status === "pending").length,
    approved: students.filter((s) => s.admission_status === "approved").length,
    rejected: students.filter((s) => s.admission_status === "rejected").length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "var(--font-serif)" }}>Admissions</h2>
        <p className="text-gray-400 text-xs">Manage student applications and admission status</p>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              filter === f ? "bg-[#800000] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f} ({counts[f]})
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Student", "Phone", "Class", "Stream", "Applied", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((s) => {
              const sc = STATUS_CONFIG[s.admission_status];
              return (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#800000] flex items-center justify-center flex-shrink-0">
                        <span className="text-[#C9A84C] text-[10px] font-bold">{s.name[0]}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.phone}</td>
                  <td className="px-4 py-3 text-gray-700">{s.class}</td>
                  <td className="px-4 py-3 text-gray-500">{s.stream}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{s.applied_date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${sc.color}`}>
                      {sc.icon} {s.admission_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {s.admission_status !== "approved" && (
                        <button onClick={() => updateStatus(s.id, "approved")} className="p-1.5 rounded text-green-500 hover:bg-green-50 transition-colors" title="Approve">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {s.admission_status !== "rejected" && (
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
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">No applications found</div>
        )}
      </div>
    </div>
  );
}
