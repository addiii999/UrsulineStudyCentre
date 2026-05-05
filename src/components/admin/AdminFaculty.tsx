"use client";
import { useState } from "react";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { FACULTY as INITIAL_FACULTY } from "@/lib/constants";

interface FacultyMember {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  experience: string;
  role: string;
  is_active: boolean;
}

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState<FacultyMember[]>(
    INITIAL_FACULTY.map((f, i) => ({ ...f, id: String(i + 1), is_active: true }))
  );
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", subject: "", qualification: "", experience: "", role: "" });

  const handleSubmit = () => {
    if (!form.name) return;
    if (editId) {
      setFaculty((prev) => prev.map((f) => (f.id === editId ? { ...f, ...form } : f)));
      setEditId(null);
    } else {
      setFaculty((prev) => [...prev, { id: Date.now().toString(), ...form, is_active: true }]);
    }
    setForm({ name: "", subject: "", qualification: "", experience: "", role: "" });
    setShowForm(false);
  };

  const handleEdit = (f: FacultyMember) => {
    setForm({ name: f.name, subject: f.subject, qualification: f.qualification, experience: f.experience, role: f.role });
    setEditId(f.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Remove this faculty member?")) setFaculty((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleActive = (id: string) => {
    setFaculty((prev) => prev.map((f) => (f.id === id ? { ...f, is_active: !f.is_active } : f)));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "var(--font-serif)" }}>Faculty</h2>
          <p className="text-gray-400 text-xs">Manage teaching staff</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", subject: "", qualification: "", experience: "", role: "" }); }} className="btn-primary text-sm py-2">
          <Plus size={15} /> Add Faculty
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-[#C9A84C]/30 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-gray-900">{editId ? "Edit Faculty" : "Add Faculty Member"}</h3>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-gray-400" /></button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { key: "name", label: "Full Name", placeholder: "e.g. Dr. A. Singh" },
              { key: "subject", label: "Subject", placeholder: "Mathematics" },
              { key: "qualification", label: "Qualification", placeholder: "M.Sc, B.Ed" },
              { key: "experience", label: "Experience", placeholder: "8 Years" },
              { key: "role", label: "Role", placeholder: "Senior Faculty" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="input-field"
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="btn-primary text-sm py-1.5">{editId ? "Update" : "Add"}</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-1.5">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {faculty.map((f) => {
          const initials = f.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
          return (
            <div key={f.id} className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${f.is_active ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#800000] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#C9A84C] text-xs font-bold">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{f.name}</p>
                  <p className="text-[#C9A84C] text-xs font-medium">{f.role}</p>
                  <p className="text-gray-500 text-xs">{f.subject}</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400 space-y-0.5">
                <p>📚 {f.qualification}</p>
                <p>⭐ {f.experience}</p>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => toggleActive(f.id)}>
                  {f.is_active
                    ? <span className="text-xs text-green-600 flex items-center gap-1"><ToggleRight size={16} />Active</span>
                    : <span className="text-xs text-gray-400 flex items-center gap-1"><ToggleLeft size={16} />Inactive</span>}
                </button>
                <div className="flex gap-1.5">
                  <button onClick={() => handleEdit(f)} className="p-1.5 rounded text-gray-400 hover:text-[#800000] hover:bg-gray-100 transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
