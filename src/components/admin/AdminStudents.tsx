"use client";
import { useState, useEffect } from "react";
import { Search, Loader2, Edit3, Trash2, X, Save, Download, RotateCcw, AlertTriangle, XCircle } from "lucide-react";

interface Student {
  id: string; full_name: string; dob: string; aadhaar_last4: string;
  mother_name: string; father_name: string; prev_board: string; prev_school: string;
  prev_year: string; prev_marks: string; present_class: string; present_board: string;
  present_school: string; present_year: string; course: string; vocational: string;
  present_village: string; present_district: string; present_ps: string;
  present_phone: string; permanent_village: string; permanent_district: string;
  permanent_ps: string; permanent_phone: string; admission_status: string;
  admin_notes: string; session: string; created_at: string; updated_at: string;
  is_deleted?: boolean; deleted_at?: string; deleted_by?: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [trashed, setTrashed] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"active" | "trash">("active");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmPermanent, setConfirmPermanent] = useState<Student | null>(null);
  const [migrationNeeded, setMigrationNeeded] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const [activeRes, trashRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/students?trashed=true"),
      ]);
      const [activeData, trashData] = await Promise.all([activeRes.json(), trashRes.json()]);
      if (activeData.students) setStudents(activeData.students);
      if (trashData.students) setTrashed(trashData.students);
      if (activeData.migrationNeeded || trashData.migrationNeeded) setMigrationNeeded(true);
    } catch { alert("Failed to load student records"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (editingStudent.present_phone && editingStudent.present_phone.length !== 10) { alert("Phone must be 10 digits"); return; }
    if (editingStudent.aadhaar_last4 && editingStudent.aadhaar_last4.length !== 4) { alert("Aadhaar requires 4 digits"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/students", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingStudent) });
      if (!res.ok) throw new Error((await res.json()).error || "Update failed");
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? editingStudent : s));
      setEditingStudent(null);
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Move this student to Trash? They can be restored later.")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/students?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        if (data.migrationNeeded) {
          setMigrationNeeded(true);
          alert("⚠️ Database migration required!\n\nPlease run 'supabase_migration_students_softdelete.sql' in your Supabase SQL Editor first, then try again.");
        } else { alert(data.error || "Failed to archive record"); }
        return;
      }
      await fetchStudents();
    } catch { alert("Connection error. Please try again."); }
    finally { setActionId(null); }
  };

  const handleRestore = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch("/api/students", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "restore" }) });
      if (!res.ok) throw new Error((await res.json()).error || "Restore failed");
      await fetchStudents();
    } catch (err: any) { alert(err.message); }
    finally { setActionId(null); }
  };

  const handlePermanentDelete = async (student: Student) => {
    setConfirmPermanent(student);
  };

  const confirmDelete = async () => {
    if (!confirmPermanent) return;
    setActionId(confirmPermanent.id);
    setConfirmPermanent(null);
    try {
      const res = await fetch(`/api/students?id=${confirmPermanent.id}&permanent=true`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Delete failed");
      setTrashed(prev => prev.filter(s => s.id !== confirmPermanent.id));
    } catch (err: any) { alert(err.message); }
    finally { setActionId(null); }
  };

  const classes = Array.from(new Set(students.map(s => s.present_class).filter(Boolean)));
  const filtered = students.filter(s => {
    const matchSearch = s.full_name?.toLowerCase().includes(search.toLowerCase()) || s.present_phone?.includes(search) || s.course?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.admission_status === filterStatus;
    const matchClass = filterClass === "all" || s.present_class === filterClass;
    return matchSearch && matchStatus && matchClass;
  });

  const statusColors: Record<string, string> = {
    enrolled: "bg-purple-50 text-purple-700 border-purple-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    applied: "bg-blue-50 text-blue-700 border-blue-200",
    under_review: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "var(--font-serif)" }}>Student Records Management</h2>
          <p className="text-gray-400 text-xs">Full database of submitted applications and enrolled students</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.open("/api/backup?table=students&format=json", "_blank")} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100">
            <Download size={12} /> JSON Export
          </button>
          <button onClick={() => window.open("/api/backup?table=students&format=csv", "_blank")} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100">
            <Download size={12} /> CSV Export
          </button>
        </div>
      </div>

      {/* MIGRATION WARNING */}
      {migrationNeeded && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-800 text-sm">Database Migration Required</p>
            <p className="text-rose-700 text-xs mt-1">The <code>is_deleted</code> column is missing from your students table. Please run <strong>supabase_migration_students_softdelete.sql</strong> in your Supabase SQL Editor to enable the archive system.</p>
          </div>
        </div>
      )}

      {/* VIEW TABS */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setView("active")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${view === "active" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
          Active ({students.length})
        </button>
        <button onClick={() => setView("trash")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${view === "trash" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
          <Trash2 size={13} /> Trash {trashed.length > 0 && <span className="bg-rose-500 text-white text-[10px] rounded-full px-1.5">{trashed.length}</span>}
        </button>
      </div>

      {/* ACTIVE VIEW */}
      {view === "active" && (
        <>
          <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, or course..." className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-[#800000]" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#800000]">
              <option value="all">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="enrolled">Enrolled</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#800000]">
              <option value="all">All Classes</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{["Name", "Phone", "Class & Course", "Status", "Reg Date", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="py-12 text-center text-gray-400"><Loader2 size={20} className="animate-spin mx-auto mb-2" />Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-gray-400">No records found</td></tr>
                ) : filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#800000] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{(s.full_name || "?")[0]}</div>
                        <div><p className="font-semibold text-gray-900">{s.full_name}</p><p className="text-[10px] text-gray-400">{s.id.split("-")[0]}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{s.present_phone}</td>
                    <td className="px-4 py-3"><p className="font-medium text-gray-800">{s.present_class}</p><p className="text-xs text-gray-500">{s.course}</p></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${statusColors[s.admission_status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {s.admission_status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingStudent(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit3 size={15} /></button>
                        <button onClick={() => handleArchive(s.id)} disabled={actionId === s.id} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded disabled:opacity-50" title="Move to Trash">
                          {actionId === s.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TRASH VIEW */}
      {view === "trash" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
          <div className="px-5 py-3 border-b border-gray-100 bg-rose-50 flex items-center gap-2">
            <Trash2 size={15} className="text-rose-600" />
            <p className="text-sm font-bold text-rose-800">Trash — Recently Deleted</p>
            <p className="text-xs text-rose-600 ml-1">Records here are hidden from all views. Restore or permanently delete.</p>
          </div>
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{["Name", "Phone", "Class", "Archived On", "Archived By", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400"><Loader2 size={20} className="animate-spin mx-auto mb-2" />Loading...</td></tr>
              ) : trashed.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">Trash is empty</td></tr>
              ) : trashed.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50 opacity-75">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{(s.full_name || "?")[0]}</div>
                      <p className="font-semibold text-gray-600">{s.full_name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.present_phone}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.present_class} — {s.course}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{s.deleted_at ? new Date(s.deleted_at).toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs capitalize">{s.deleted_by ?? "admin"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleRestore(s.id)} disabled={actionId === s.id} className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors">
                        {actionId === s.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />} Restore
                      </button>
                      <button onClick={() => handlePermanentDelete(s)} disabled={actionId === s.id} className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 disabled:opacity-50 transition-colors">
                        <XCircle size={12} /> Delete Forever
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PERMANENT DELETE CONFIRMATION */}
      {confirmPermanent && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center"><AlertTriangle size={22} className="text-rose-600" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Permanently Delete?</h3>
                <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 mb-5">
              <p className="text-sm font-semibold text-rose-900">{confirmPermanent.full_name}</p>
              <p className="text-xs text-rose-600">{confirmPermanent.present_phone} · {confirmPermanent.present_class}</p>
            </div>
            <p className="text-sm text-gray-600 mb-6">This will <strong>permanently remove</strong> all data for this student from the database. This cannot be recovered.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmPermanent(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 text-sm font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors">Yes, Delete Forever</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div><h3 className="font-bold text-gray-900 text-lg">Edit Student Profile</h3><p className="text-xs text-gray-500 mt-0.5">ID: {editingStudent.id}</p></div>
              <button onClick={() => setEditingStudent(null)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="edit-student-form" onSubmit={handleSave} className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b pb-1">Personal Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Full Name", key: "full_name", required: true },
                      { label: "Date of Birth", key: "dob", type: "date" },
                      { label: "Aadhaar (Last 4)", key: "aadhaar_last4", maxLength: 4 },
                      { label: "Father's Name", key: "father_name" },
                      { label: "Mother's Name", key: "mother_name" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                        <input type={f.type ?? "text"} maxLength={f.maxLength} required={f.required}
                          value={(editingStudent as any)[f.key] ?? ""}
                          onChange={e => setEditingStudent({ ...editingStudent, [f.key]: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#800000] outline-none" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b pb-1">Contact & Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Phone Number", key: "present_phone", required: true, maxLength: 10 },
                      { label: "Village/City", key: "present_village" },
                      { label: "District", key: "present_district" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                        <input maxLength={f.maxLength} required={f.required}
                          value={(editingStudent as any)[f.key] ?? ""}
                          onChange={e => setEditingStudent({ ...editingStudent, [f.key]: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#800000] outline-none" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b pb-1">Academic Profile</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Class", key: "present_class" },
                      { label: "Course/Stream", key: "course" },
                      { label: "Vocational", key: "vocational" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                        <input value={(editingStudent as any)[f.key] ?? ""}
                          onChange={e => setEditingStudent({ ...editingStudent, [f.key]: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#800000] outline-none" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-1.5"><AlertTriangle size={14} /> Admin Controls</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-amber-800 mb-1">Admission Status</label>
                      <select value={editingStudent.admission_status} onChange={e => setEditingStudent({ ...editingStudent, admission_status: e.target.value })}
                        className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-amber-400">
                        <option value="applied">Applied</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="enrolled">Enrolled</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-amber-800 mb-1">Admin Notes (Private)</label>
                      <textarea value={editingStudent.admin_notes || ""}
                        onChange={e => setEditingStudent({ ...editingStudent, admin_notes: e.target.value })}
                        className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-amber-400 resize-none h-[40px]"
                        placeholder="Internal notes..." />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button onClick={() => setEditingStudent(null)} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
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
