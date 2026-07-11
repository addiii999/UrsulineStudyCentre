"use client";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, Loader2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import ImageCropUploader from "@/components/ui/ImageCropUploader";

const FACULTY_CATEGORIES = [
  "Science",
  "Commerce",
  "Humanities",
] as const;

interface FacultyMember {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  experience: string;
  designation: string;
  faculty_category: string;
  is_active: boolean;
  photo_url?: string;
}

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", subject: "", qualification: "", experience: "", designation: "", faculty_category: "Science", photo_url: "" });


  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/faculty");
      const data = await res.json();
      setFaculty(data.faculty ?? []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load faculty");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFaculty(); }, []);


  const handleSubmit = async () => {
    if (!form.name) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const res = await fetch("/api/faculty", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...form }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Request failed");
        toast.success("Faculty updated");
      } else {
        const res = await fetch("/api/faculty", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, is_active: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Request failed");
        toast.success("Faculty added");
      }
      fetchFaculty();
      setForm({ name: "", subject: "", qualification: "", experience: "", designation: "", faculty_category: "Science", photo_url: "" });
      setShowForm(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save faculty");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (f: FacultyMember) => {
    setForm({ 
      name: f.name, 
      subject: f.subject, 
      qualification: f.qualification, 
      experience: f.experience, 
      designation: f.designation,
      faculty_category: f.faculty_category || "Science",
      photo_url: f.photo_url || "" 
    });
    setEditId(f.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this faculty member?")) return;
    try {
      const res = await fetch(`/api/faculty?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      toast.success("Faculty removed");
      setFaculty(faculty.filter(f => f.id !== id));
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete faculty");
    }
  };

  const toggleActive = async (member: FacultyMember) => {
    const newActiveState = !member.is_active;
    setFaculty(faculty.map(f => f.id === member.id ? { ...f, is_active: newActiveState } : f));
    try {
      const res = await fetch("/api/faculty", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, is_active: newActiveState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
      setFaculty(faculty.map(f => f.id === member.id ? { ...f, is_active: !newActiveState } : f));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "var(--font-serif)" }}>Faculty Management</h2>
          <p className="text-gray-400 text-xs">Manage teaching staff and profiles</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", subject: "", qualification: "", experience: "", designation: "", faculty_category: "Science", photo_url: "" }); }} className="btn-primary text-sm py-2">
          <Plus size={15} /> Add Faculty
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-[#C9A84C]/30 p-6 shadow-md animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-900" style={{ fontFamily: "var(--font-serif)" }}>
              {editId ? "Edit Faculty Profile" : "Add New Faculty"}
            </h3>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={18} className="text-gray-500" /></button>
          </div>
          
          <div className="grid md:grid-cols-[200px_1fr] gap-8">
            {/* PHOTO UPLOAD COLUMN — ImageCropUploader */}
            <div className="flex flex-col items-center">
              <ImageCropUploader
                currentUrl={form.photo_url}
                onUpload={(url) => setForm((p) => ({ ...p, photo_url: url }))}
                folder="faculty"
                aspectRatio={3 / 4}
                label="Upload Photo"
              />
            </div>

            {/* DETAILS COLUMN */}
            <div className="grid sm:grid-cols-2 gap-4 h-fit">
              <div className="sm:col-span-2">
                <label className="label">Full Name</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input-field" placeholder="e.g. Vikram Sir" />
              </div>
              <div>
                <label className="label">Role / Designation</label>
                <input value={form.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} className="input-field" placeholder="e.g. Senior Faculty" />
              </div>
              <div>
                <label className="label">Subject</label>
                <input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} className="input-field" placeholder="e.g. Mathematics" />
              </div>
              <div>
                <label className="label">Qualification</label>
                <input value={form.qualification} onChange={(e) => setForm((p) => ({ ...p, qualification: e.target.value }))} className="input-field" placeholder="e.g. M.Sc, B.Ed" />
              </div>
              <div>
                <label className="label">Experience</label>
                <input value={form.experience} onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))} className="input-field" placeholder="e.g. 10+ Years" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Faculty Category</label>
                <select
                  value={form.faculty_category}
                  onChange={(e) => setForm((p) => ({ ...p, faculty_category: e.target.value }))}
                  className="input-field"
                >
                  {FACULTY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Determines which section this teacher appears in on the Faculty page.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button onClick={() => setShowForm(false)} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving} className="btn-primary text-sm px-8 py-2.5 flex items-center gap-2 shadow-md">
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {editId ? "Save Changes" : "Add Faculty"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-400 flex flex-col items-center">
          <Loader2 size={30} className="animate-spin mb-3 text-[#C9A84C]" />
          Loading faculty database...
        </div>
      ) : faculty.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <ImageIcon size={24} className="text-gray-300" />
          </div>
          <p className="font-semibold text-gray-600 mb-1">No faculty members found</p>
          <p className="text-sm">Click "Add Faculty" to start building your team.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {faculty.map((f) => {
            const initials = f.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
            return (
              <div key={f.id} className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-300 ${f.is_active ? "border-gray-200" : "border-gray-100 opacity-60 bg-gray-50"}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    {f.photo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={f.photo_url} alt={f.name} className="w-14 h-14 rounded-xl object-cover shadow-sm border border-gray-100" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#800000] to-[#5C0000] flex items-center justify-center shadow-sm">
                        <span className="text-[#C9A84C] text-lg font-bold" style={{ fontFamily: "var(--font-serif)" }}>{initials}</span>
                      </div>
                    )}
                    {!f.is_active && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gray-400 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="font-bold text-gray-900 text-base truncate" style={{ fontFamily: "var(--font-serif)" }}>{f.name}</p>
                    <p className="text-[#C9A84C] text-xs font-bold uppercase tracking-wider mt-0.5">{f.designation}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-[#FDF8F0]/50 rounded-xl">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Subject</p>
                    <p className="text-xs font-semibold text-gray-800 truncate">{f.subject}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Experience</p>
                    <p className="text-xs font-semibold text-gray-800">{f.experience}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Qualification</p>
                    <p className="text-xs font-semibold text-gray-800 truncate">{f.qualification}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Category</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-[#800000]/10 text-[#800000] text-[10px] font-bold uppercase tracking-wider rounded-full">
                      {f.faculty_category || "Science"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button onClick={() => toggleActive(f)} className="hover:opacity-80 transition-opacity">
                    {f.is_active
                      ? <span className="text-xs font-bold text-green-600 flex items-center gap-1.5"><ToggleRight size={18} /> Active</span>
                      : <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5"><ToggleLeft size={18} /> Inactive</span>}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(f)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 bg-gray-50 hover:text-[#800000] hover:bg-[#800000]/10 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(f.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 bg-gray-50 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
