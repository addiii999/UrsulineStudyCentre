"use client";
import { useState, useEffect } from "react";
import { 
  Search, Loader2, Edit3, Trash2, X, Save, 
  CheckCircle, FileText, Download, Phone, MapPin, 
  Clock, RotateCcw, AlertTriangle
} from "lucide-react";

interface Student {
  id: string;
  full_name: string;
  dob: string;
  aadhaar_last4: string;
  mother_name: string;
  father_name: string;
  prev_board: string;
  prev_school: string;
  prev_year: string;
  prev_marks: string;
  present_class: string;
  present_board: string;
  present_school: string;
  present_year: string;
  course: string;
  vocational: string;
  present_village: string;
  present_district: string;
  present_ps: string;
  present_phone: string;
  permanent_village: string;
  permanent_district: string;
  permanent_ps: string;
  permanent_phone: string;
  admission_status: string;
  admin_notes: string;
  session: string;
  created_at: string;
  updated_at: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterClass, setFilterClass] = useState<string>("all");
  
  // Modal states
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/students");
      const data = await res.json();
      if (data.students) setStudents(data.students);
    } catch (err) {
      alert("Failed to load student records");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    // Basic validations
    if (editingStudent.present_phone && editingStudent.present_phone.length !== 10) {
      alert("Phone number must be 10 digits");
      return;
    }
    if (editingStudent.aadhaar_last4 && editingStudent.aadhaar_last4.length !== 4) {
      alert("Aadhaar requires exactly 4 digits");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingStudent),
      });
      
      if (!res.ok) throw new Error("Update failed");
      
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? editingStudent : s));
      setEditingStudent(null);
    } catch (err) {
      alert("Failed to save changes. Check audit logs.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to move ${name} to Trash? They can be restored within 30 days.`)) return;
    
    try {
      setDeleting(id);
      const res = await fetch(`/api/students?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert("Failed to archive record");
    } finally {
      setDeleting(null);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    window.open(`/api/backup?table=students&format=${format}`, "_blank");
  };

  // Derived filters
  const classes = Array.from(new Set(students.map(s => s.present_class).filter(Boolean)));
  
  const filtered = students.filter(s => {
    const matchSearch = s.full_name?.toLowerCase().includes(search.toLowerCase()) || 
                        s.present_phone?.includes(search) ||
                        s.course?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.admission_status === filterStatus;
    const matchClass = filterClass === "all" || s.present_class === filterClass;
    return matchSearch && matchStatus && matchClass;
  });

  return (
    <div className="space-y-5 relative">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "var(--font-serif)" }}>
            Student Records Management
          </h2>
          <p className="text-gray-400 text-xs">Full database of all submitted applications and enrolled students</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleExport("json")} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100">
            <Download size={12} /> JSON Export
          </button>
          <button onClick={() => handleExport("csv")} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100">
            <Download size={12} /> CSV Export
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or course..."
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-[#800000]"
          />
        </div>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#800000] capitalize"
        >
          <option value="all">All Statuses</option>
          <option value="applied">Applied</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="enrolled">Enrolled</option>
          <option value="rejected">Rejected</option>
        </select>
        <select 
          value={filterClass} 
          onChange={(e) => setFilterClass(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#800000]"
        >
          <option value="all">All Classes</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Name", "Phone", "Class & Course", "Status", "Reg Date", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400"><Loader2 size={20} className="animate-spin mx-auto mb-2" />Loading database...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No student records found</td></tr>
            ) : filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#800000] flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                      {(s.full_name || "?")[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{s.full_name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{s.id.split("-")[0]}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{s.present_phone}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{s.present_class}</p>
                  <p className="text-xs text-gray-500">{s.course}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border uppercase
                    ${s.admission_status === 'enrolled' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      s.admission_status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      s.admission_status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'}`}
                  >
                    {s.admission_status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingStudent(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit Profile">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => handleDelete(s.id, s.full_name)} disabled={deleting === s.id} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded disabled:opacity-50" title="Move to Trash">
                      {deleting === s.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Edit Student Profile</h3>
                <p className="text-xs text-gray-500 mt-0.5">ID: {editingStudent.id}</p>
              </div>
              <button onClick={() => setEditingStudent(null)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="edit-student-form" onSubmit={handleSave} className="space-y-6">
                
                {/* Section 1: Personal */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b pb-1">Personal Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                      <input value={editingStudent.full_name} onChange={e => setEditingStudent({...editingStudent, full_name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#800000] outline-none" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
                      <input type="date" value={editingStudent.dob || ""} onChange={e => setEditingStudent({...editingStudent, dob: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#800000] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Aadhaar (Last 4)</label>
                      <input value={editingStudent.aadhaar_last4 || ""} onChange={e => setEditingStudent({...editingStudent, aadhaar_last4: e.target.value})} maxLength={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#800000] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Father's Name</label>
                      <input value={editingStudent.father_name || ""} onChange={e => setEditingStudent({...editingStudent, father_name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#800000] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Mother's Name</label>
                      <input value={editingStudent.mother_name || ""} onChange={e => setEditingStudent({...editingStudent, mother_name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#800000] outline-none" />
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b pb-1">Contact & Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                      <input value={editingStudent.present_phone} onChange={e => setEditingStudent({...editingStudent, present_phone: e.target.value})} maxLength={10} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#800000] outline-none" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Present Village/City</label>
                      <input value={editingStudent.present_village || ""} onChange={e => setEditingStudent({...editingStudent, present_village: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#800000] outline-none" />
                    </div>
                  </div>
                </div>

                {/* Section 3: Academic */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b pb-1">Academic Profile</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Class</label>
                      <input value={editingStudent.present_class || ""} onChange={e => setEditingStudent({...editingStudent, present_class: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#800000] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Course/Stream</label>
                      <input value={editingStudent.course || ""} onChange={e => setEditingStudent({...editingStudent, course: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#800000] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Vocational Subject</label>
                      <input value={editingStudent.vocational || ""} onChange={e => setEditingStudent({...editingStudent, vocational: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#800000] outline-none" />
                    </div>
                  </div>
                </div>

                {/* Section 4: Admin Controls */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-1.5"><AlertTriangle size={14}/> Admin Controls</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-amber-800 mb-1">Admission Status</label>
                      <select 
                        value={editingStudent.admission_status} 
                        onChange={e => setEditingStudent({...editingStudent, admission_status: e.target.value})}
                        className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-amber-400 capitalize"
                      >
                        <option value="applied">Applied</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="enrolled">Enrolled</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-amber-800 mb-1">Admin Notes (Private)</label>
                      <textarea 
                        value={editingStudent.admin_notes || ""} 
                        onChange={e => setEditingStudent({...editingStudent, admin_notes: e.target.value})}
                        className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-amber-400 resize-none h-[40px]"
                        placeholder="Internal notes about student..."
                      />
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button onClick={() => setEditingStudent(null)} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button form="edit-student-form" type="submit" disabled={saving} className="px-6 py-2 bg-[#800000] text-white text-sm font-bold rounded-xl hover:bg-[#5C0000] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
