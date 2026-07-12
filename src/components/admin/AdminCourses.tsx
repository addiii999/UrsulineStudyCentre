"use client";
import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Check, X,
  BookOpen, Loader2, Eye, EyeOff, Save,
} from "lucide-react";
import toast from "react-hot-toast";

interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  is_active: boolean;
  annual_fee?: number;
  display_order?: number;
}

const CATEGORIES = ["Academic Streams", "Competitive Exams", "Vocational Skills"];

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Academic Streams");
  const [editDesc, setEditDesc] = useState("");
  const [editAnnualFee, setEditAnnualFee] = useState("");

  // Add state
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Academic Streams");
  const [newDesc, setNewDesc] = useState("");
  const [newAnnualFee, setNewAnnualFee] = useState("");

  /* ── DATA ─────────────────────────────────────────────── */
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      setCourses(data.courses ?? []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  /* ── EDIT ─────────────────────────────────────────────── */
  const startEdit = (course: Course) => {
    setEditingId(course.id);
    setEditTitle(course.title);
    setEditCategory(course.category);
    setEditDesc(course.description || "");
    setEditAnnualFee(course.annual_fee?.toString() || "");
    setAdding(false);
  };

  const cancelEdit = () => { setEditingId(null); setEditTitle(""); setEditDesc(""); setEditAnnualFee(""); };

  const saveEdit = async () => {
    if (!editTitle.trim()) {
      toast.error("Course title cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          title: editTitle.trim(),
          category: editCategory,
          description: editDesc.trim(),
          annual_fee: editAnnualFee ? parseInt(editAnnualFee) || 0 : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      toast.success("Course updated!");
      await fetchCourses();
      cancelEdit();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  /* ── DELETE ───────────────────────────────────────────── */
  const deleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`/api/courses?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      toast.success("Course deleted");
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete");
    }
  };

  /* ── TOGGLE ACTIVE ────────────────────────────────────── */
  const toggleActive = async (course: Course) => {
    const newState = !course.is_active;
    setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, is_active: newState } : c));
    try {
      const res = await fetch("/api/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: course.id, is_active: newState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      toast.success(newState ? "Course visible on website" : "Course hidden");
    } catch {
      setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, is_active: !newState } : c));
      toast.error("Update failed");
    }
  };

  /* ── ADD ──────────────────────────────────────────────── */
  const startAdding = () => { setAdding(true); setEditingId(null); };
  const cancelAdd = () => { setAdding(false); setNewTitle(""); setNewDesc(""); setNewCategory("Academic Streams"); setNewAnnualFee(""); };

  const addCourse = async () => {
    if (!newTitle.trim()) {
      toast.error("Course title cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          description: newDesc.trim(),
          annual_fee: newAnnualFee ? parseInt(newAnnualFee) || 0 : 0,
          is_active: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      toast.success("New Course added!");
      await fetchCourses();
      cancelAdd();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add course");
    } finally {
      setSaving(false);
    }
  };

  /* ── RENDER ───────────────────────────────────────────── */
  const activeCourseCount = courses.filter((c) => c.is_active).length;

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "var(--font-serif)" }}>
            Courses Management
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">
            {activeCourseCount} of {courses.length} courses shown publicly on website
          </p>
        </div>
        <button
          onClick={startAdding}
          disabled={adding}
          className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6a0000] transition-colors shadow-sm flex-shrink-0"
        >
          <Plus size={15} /> Add Course
        </button>
      </div>

      {/* ADD FORM */}
      {adding && (
        <div className="bg-white rounded-2xl border-2 border-[#800000]/25 shadow-sm overflow-hidden mb-6">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-50 bg-[#800000]/3">
            <BookOpen size={15} className="text-[#800000]" />
            <p className="font-semibold text-[#800000] text-sm">New Course</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Course Title *</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Science (PCM)"
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="input-field"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Description</label>
                <input
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="input-field"
                  placeholder="Brief description (e.g. Physics, Chemistry, Maths)"
                />
              </div>
              <div>
                <label className="label">Annual Fee (₹)</label>
                <input
                  type="number"
                  value={newAnnualFee}
                  onChange={(e) => setNewAnnualFee(e.target.value)}
                  className="input-field"
                  placeholder="e.g. 45000"
                />
              </div>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={addCourse}
                disabled={saving || !newTitle.trim()}
                className="flex items-center gap-2 bg-[#800000] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6a0000] disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Course
              </button>
              <button
                onClick={cancelAdd}
                disabled={saving}
                className="flex items-center gap-2 border border-gray-200 text-gray-500 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Course Title</th>
              <th className="px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
              <th className="px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Annual Fee</th>
              <th className="px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Description</th>
              <th className="px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/80">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <Loader2 size={24} className="animate-spin text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Loading courses...</p>
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm font-medium">No courses found</p>
                  <p className="text-gray-300 text-xs mt-1">Click "Add Course" to get started</p>
                </td>
              </tr>
            ) : (
              courses.map((course, idx) => (
                editingId === course.id ? (
                  /* ─ EDIT ROW ─ */
                  <tr key={course.id} className="bg-[#800000]/[0.02]">
                    <td colSpan={5} className="p-5 border-l-[3px] border-[#800000]">
                      <div className="space-y-4 max-w-2xl">
                        <p className="text-xs font-semibold text-[#800000] flex items-center gap-1.5">
                          <Pencil size={11} /> Editing Course
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="label">Course Title</label>
                            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="input-field bg-white" autoFocus />
                          </div>
                          <div>
                            <label className="label">Category</label>
                            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="input-field bg-white">
                              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="label">Description</label>
                            <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="input-field bg-white" />
                          </div>
                          <div>
                            <label className="label">Annual Fee (₹)</label>
                            <input type="number" value={editAnnualFee} onChange={(e) => setEditAnnualFee(e.target.value)} className="input-field bg-white" />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button onClick={saveEdit} disabled={saving} className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#6a0000] disabled:opacity-50 transition-colors">
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save Changes
                          </button>
                          <button onClick={cancelEdit} disabled={saving} className="flex items-center gap-2 border border-gray-200 text-gray-500 px-4 py-2 rounded-xl text-xs font-medium hover:bg-white">
                            <X size={12} /> Cancel
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* ─ VIEW ROW ─ */
                  <tr key={course.id} className={`hover:bg-gray-50/40 transition-colors ${!course.is_active ? "opacity-60" : ""}`}>
                    <td className="px-5 py-4">
                      <p className={`font-semibold text-[13px] ${course.is_active ? "text-gray-900" : "text-gray-500"}`}>{course.title}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200 text-[10.5px] font-semibold whitespace-nowrap">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-gray-700 text-[12px] font-medium">
                        {course.annual_fee ? `₹${course.annual_fee.toLocaleString()}` : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-gray-500 text-[12px] truncate max-w-xs">{course.description || "—"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => toggleActive(course)}
                          title={course.is_active ? "Hide from website" : "Show on website"}
                          className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-md border transition-colors ${
                            course.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {course.is_active ? <Eye size={11} /> : <EyeOff size={11} />}
                        </button>

                        <button
                          onClick={() => startEdit(course)}
                          title="Edit"
                          className="p-1.5 rounded-md text-gray-400 hover:text-[#800000] hover:bg-[#800000]/5 transition-colors"
                        >
                          <Pencil size={13} />
                        </button>

                        <button
                          onClick={() => deleteCourse(course.id)}
                          title="Delete"
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
