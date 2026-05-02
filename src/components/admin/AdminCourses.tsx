"use client";
import { useState } from "react";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";

interface Course {
  id: string;
  name: string;
  category: string;
  description: string;
  is_active: boolean;
}

const INITIAL_COURSES: Course[] = [
  { id: "1", name: "Science (PCM)", category: "Academic", description: "Physics, Chemistry, Mathematics", is_active: true },
  { id: "2", name: "Science (PCB)", category: "Academic", description: "Physics, Chemistry, Biology", is_active: true },
  { id: "3", name: "Commerce", category: "Academic", description: "Accountancy, Business Studies, Economics", is_active: true },
  { id: "4", name: "Humanities", category: "Academic", description: "History, Geography, Political Science", is_active: true },
  { id: "5", name: "JEE", category: "Competitive", description: "JEE Main & Advanced preparation", is_active: true },
  { id: "6", name: "NEET", category: "Competitive", description: "Medical entrance preparation", is_active: true },
  { id: "7", name: "DCA", category: "Vocational", description: "Diploma in Computer Applications", is_active: true },
];

const CATEGORIES = ["Academic", "Competitive", "Vocational"];

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", category: "Academic", description: "" });

  const handleSubmit = () => {
    if (!form.name) return;
    if (editId) {
      setCourses((prev) =>
        prev.map((c) => (c.id === editId ? { ...c, ...form } : c))
      );
      setEditId(null);
    } else {
      setCourses((prev) => [
        ...prev,
        { id: Date.now().toString(), ...form, is_active: true },
      ]);
    }
    setForm({ name: "", category: "Academic", description: "" });
    setShowForm(false);
  };

  const handleEdit = (c: Course) => {
    setForm({ name: c.name, category: c.category, description: c.description });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this course?")) setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleActive = (id: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !c.is_active } : c))
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "var(--font-serif)" }}>
            Courses
          </h2>
          <p className="text-gray-400 text-xs">Manage all course offerings</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", category: "Academic", description: "" }); }}
          className="btn-primary text-sm py-2"
        >
          <Plus size={15} /> Add Course
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#C9A84C]/30 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-gray-900">{editId ? "Edit Course" : "Add New Course"}</h3>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-gray-400" /></button>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="label">Course Name</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input-field" placeholder="e.g., Science PCM" />
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="input-field">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Description</label>
              <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="input-field" placeholder="Brief description" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="btn-primary text-sm py-1.5">{editId ? "Update" : "Add Course"}</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-1.5">Cancel</button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Course</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Description</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 font-semibold text-gray-900">{course.name}</td>
                <td className="px-4 py-3">
                  <span className="maroon-chip text-[10px]">{course.category}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{course.description}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleActive(course.id)}>
                    {course.is_active
                      ? <ToggleRight size={22} className="text-green-500 mx-auto" />
                      : <ToggleLeft size={22} className="text-gray-300 mx-auto" />}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => handleEdit(course)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#800000] hover:bg-gray-100 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(course.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
