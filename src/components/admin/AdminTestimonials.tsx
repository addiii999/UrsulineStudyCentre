"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Star, Quote } from "lucide-react";

interface Testimonial { id: string; name: string; studentClass: string; quote: string; rating: number; isVisible: boolean; }

const DEFAULT: Testimonial[] = [
  { id: "1", name: "Riya Sharma", studentClass: "Class 12 (PCM)", quote: "The teaching quality here is unmatched. I improved my scores by 30% in 3 months!", rating: 5, isVisible: true },
  { id: "2", name: "Priya Gupta", studentClass: "Class 11 (Commerce)", quote: "A safe and focused environment that helped me build real confidence.", rating: 5, isVisible: true },
];

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>(DEFAULT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Testimonial>>({});
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<Testimonial>>({ rating: 5, isVisible: true });

  const startEdit = (t: Testimonial) => { setEditingId(t.id); setDraft({ ...t }); };
  const saveEdit = () => {
    setItems((p) => p.map((t) => t.id === editingId ? { ...t, ...draft } as Testimonial : t));
    setEditingId(null);
  };
  const deleteItem = (id: string) => setItems((p) => p.filter((t) => t.id !== id));
  const toggleVisible = (id: string) => setItems((p) => p.map((t) => t.id === id ? { ...t, isVisible: !t.isVisible } : t));
  const addItem = () => {
    if (!newItem.name?.trim() || !newItem.quote?.trim()) return;
    setItems((p) => [...p, { id: Date.now().toString(), name: newItem.name!, studentClass: newItem.studentClass || "", quote: newItem.quote!, rating: newItem.rating || 5, isVisible: true }]);
    setNewItem({ rating: 5, isVisible: true }); setAdding(false);
  };

  const StarRating = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={14} className={s <= value ? "text-[#C9A84C] fill-[#C9A84C]" : "text-gray-300"} onClick={() => onChange?.(s)} style={{ cursor: onChange ? "pointer" : "default" }} />
      ))}
    </div>
  );

  const FormFields = ({ data, setData }: { data: Partial<Testimonial>; setData: (d: Partial<Testimonial>) => void }) => (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Student Name *</label>
          <input value={data.name || ""} onChange={(e) => setData({ ...data, name: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#800000] focus:outline-none" placeholder="e.g. Riya Sharma" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Class / Stream</label>
          <input value={data.studentClass || ""} onChange={(e) => setData({ ...data, studentClass: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#800000] focus:outline-none" placeholder="e.g. Class 12 (PCM)" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Testimonial Quote *</label>
        <textarea value={data.quote || ""} onChange={(e) => setData({ ...data, quote: e.target.value })} rows={3} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#800000] focus:outline-none resize-none" placeholder="What the student said..." />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Rating</label>
        <StarRating value={data.rating || 5} onChange={(v) => setData({ ...data, rating: v })} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Testimonials</h2>
          <p className="text-gray-500 text-sm mt-0.5">{items.filter(t => t.isVisible).length} visible on website</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#600000] transition-colors">
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {adding && (
        <div className="bg-white rounded-xl border-2 border-[#800000]/30 p-5 shadow-sm space-y-4">
          <p className="font-bold text-gray-900 text-sm flex items-center gap-2"><Quote size={16} className="text-[#800000]" /> New Testimonial</p>
          <FormFields data={newItem} setData={setNewItem} />
          <div className="flex gap-2 pt-1">
            <button onClick={addItem} className="flex items-center gap-1.5 bg-[#800000] text-white px-4 py-2 rounded-xl text-xs font-semibold"><Check size={13} /> Save</button>
            <button onClick={() => { setAdding(false); setNewItem({ rating: 5 }); }} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold"><X size={13} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((t) => (
          <div key={t.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${t.isVisible ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
            {editingId === t.id ? (
              <div className="p-5 space-y-4">
                <FormFields data={draft} setData={setDraft} />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex items-center gap-1.5 bg-[#800000] text-white px-4 py-2 rounded-xl text-xs font-semibold"><Check size={13} /> Save</button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold"><X size={13} /> Cancel</button>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[#800000] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#C9A84C] text-sm font-bold">{t.name[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button onClick={() => toggleVisible(t.id)} className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-colors ${t.isVisible ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                      {t.isVisible ? "Visible" : "Hidden"}
                    </button>
                    <button onClick={() => startEdit(t)} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-[#800000] transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => deleteItem(t.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                <StarRating value={t.rating} />
                <p className="text-gray-600 text-sm italic mt-2 leading-relaxed">"{t.quote}"</p>
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.studentClass}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
