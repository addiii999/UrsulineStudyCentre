"use client";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X, Star, Quote, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Testimonial { id: string; name: string; role: string; review: string; rating: number; is_active: boolean; }

// ─── Lifted OUT of the main component — never remounts ────────
function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= value ? "text-[#C9A84C] fill-[#C9A84C]" : "text-gray-300"}
          onClick={() => onChange?.(s)}
          style={{ cursor: onChange ? "pointer" : "default" }}
        />
      ))}
    </div>
  );
}

function FormFields({
  data,
  setData,
}: {
  data: Partial<Testimonial>;
  setData: (d: Partial<Testimonial>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Student Name *</label>
          <input
            value={data.name || ""}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#800000] focus:outline-none"
            placeholder="e.g. Riya Sharma"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Class / Stream</label>
          <input
            value={data.role || ""}
            onChange={(e) => setData({ ...data, role: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#800000] focus:outline-none"
            placeholder="e.g. Class 12 (PCM)"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Testimonial Review *</label>
        <textarea
          value={data.review || ""}
          onChange={(e) => setData({ ...data, review: e.target.value })}
          rows={3}
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#800000] focus:outline-none resize-none"
          placeholder="What the student said..."
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Rating</label>
        <StarRating value={data.rating || 5} onChange={(v) => setData({ ...data, rating: v })} />
      </div>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Testimonial>>({});
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<Testimonial>>({ rating: 5, is_active: true });

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      setItems(data.testimonials ?? []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const startEdit = (t: Testimonial) => { setEditingId(t.id); setDraft({ ...t }); };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      toast.success("Testimonial updated");
      fetchTestimonials();
      setEditingId(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      toast.success("Deleted");
      setItems(items.filter((t) => t.id !== id));
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete");
    }
  };

  const toggleActive = async (item: Testimonial) => {
    const newState = !item.is_active;
    setItems(items.map((t) => (t.id === item.id ? { ...t, is_active: newState } : t)));
    try {
      const res = await fetch("/api/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_active: newState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
    } catch (err: any) {
      toast.error(err?.message || "Update failed");
      setItems(items.map((t) => (t.id === item.id ? { ...t, is_active: !newState } : t)));
    }
  };

  const addItem = async () => {
    if (!newItem.name?.trim() || !newItem.review?.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add testimonial");
      toast.success("Added successfully");
      setNewItem({ rating: 5, is_active: true });
      setAdding(false);
      fetchTestimonials();
    } catch (err: any) {
      toast.error(err.message || "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Testimonials</h2>
          <p className="text-gray-500 text-sm mt-0.5">{items.filter((t) => t.is_active).length} visible on website</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#600000] transition-colors"
        >
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {adding && (
        <div className="bg-white rounded-xl border-2 border-[#800000]/30 p-5 shadow-sm space-y-4">
          <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Quote size={16} className="text-[#800000]" /> New Testimonial
          </p>
          <FormFields data={newItem} setData={setNewItem} />
          <div className="flex gap-2 pt-1">
            <button
              onClick={addItem}
              disabled={saving}
              className="flex items-center gap-1.5 bg-[#800000] text-white px-4 py-2 rounded-xl text-xs font-semibold"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
            </button>
            <button
              onClick={() => { setAdding(false); setNewItem({ rating: 5, is_active: true }); }}
              disabled={saving}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold"
            >
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-gray-400 flex flex-col items-center">
          <Loader2 size={24} className="animate-spin mb-2" />
          Loading testimonials...
        </div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
          No testimonials found. Add one to get started.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((t) => (
            <div
              key={t.id}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden ${t.is_active ? "border-gray-200" : "border-gray-100 opacity-60"}`}
            >
              {editingId === t.id ? (
                <div className="p-5 space-y-4">
                  <FormFields data={draft} setData={setDraft} />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="flex items-center gap-1.5 bg-[#800000] text-white px-4 py-2 rounded-xl text-xs font-semibold"
                    >
                      {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      disabled={saving}
                      className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold"
                    >
                      <X size={13} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full bg-[#800000] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#C9A84C] text-sm font-bold">{t.name ? t.name[0] : ""}</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => toggleActive(t)}
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-colors ${t.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}
                      >
                        {t.is_active ? "Visible" : "Hidden"}
                      </button>
                      <button
                        onClick={() => startEdit(t)}
                        className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-[#800000] transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteItem(t.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <StarRating value={t.rating} />
                  <p className="text-gray-600 text-sm italic mt-2 leading-relaxed">&quot;{t.review}&quot;</p>
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
