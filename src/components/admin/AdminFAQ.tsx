"use client";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronUp, HelpCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface FAQ { id: string; question: string; answer: string; is_active: boolean; }

export default function AdminFAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [adding, setAdding] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/faqs");
      const data = await res.json();
      setFaqs(data.faqs ?? []);
    } catch {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFaqs(); }, []);

  const startEdit = (faq: FAQ) => { setEditingId(faq.id); setEditQ(faq.question); setEditA(faq.answer); };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/faqs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, question: editQ, answer: editA }),
      });
      if (!res.ok) throw new Error();
      toast.success("Updated");
      fetchFaqs();
      setEditingId(null);
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const deleteFaq = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      const res = await fetch(`/api/faqs?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      setFaqs(faqs.filter(f => f.id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleActive = async (faq: FAQ) => {
    const newState = !faq.is_active;
    setFaqs(faqs.map(f => f.id === faq.id ? { ...f, is_active: newState } : f));
    try {
      const res = await fetch("/api/faqs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: faq.id, is_active: newState }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Update failed");
      setFaqs(faqs.map(f => f.id === faq.id ? { ...f, is_active: !newState } : f));
    }
  };

  const addFaq = async () => {
    if (!newQ.trim() || !newA.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQ, answer: newA, is_active: true }),
      });
      if (!res.ok) throw new Error();
      toast.success("Added");
      fetchFaqs();
      setNewQ(""); setNewA(""); setAdding(false);
    } catch {
      toast.error("Failed to add");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">FAQ Management</h2>
          <p className="text-gray-500 text-sm mt-0.5">{faqs.filter(f => f.is_active).length} active FAQs shown on website</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#600000] transition-colors">
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      {adding && (
        <div className="bg-white rounded-xl border-2 border-[#800000]/30 p-5 shadow-sm space-y-4">
          <p className="font-bold text-gray-900 text-sm flex items-center gap-2"><HelpCircle size={16} className="text-[#800000]" /> New FAQ</p>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Question</label>
            <input value={newQ} onChange={(e) => setNewQ(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#800000] focus:outline-none" placeholder="Type the question..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Answer</label>
            <textarea value={newA} onChange={(e) => setNewA(e.target.value)} rows={3} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#800000] focus:outline-none resize-none" placeholder="Type the answer..." />
          </div>
          <div className="flex gap-2">
            <button onClick={addFaq} disabled={saving} className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2 rounded-xl text-sm font-semibold">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save FAQ
            </button>
            <button onClick={() => { setAdding(false); setNewQ(""); setNewA(""); }} disabled={saving} className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-gray-400 flex flex-col items-center">
          <Loader2 size={24} className="animate-spin mb-2" />
          Loading FAQs...
        </div>
      ) : faqs.length === 0 ? (
        <div className="py-10 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
          No FAQs found. Add one to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={faq.id} className={`bg-white rounded-xl border ${faq.is_active ? "border-gray-200" : "border-gray-100 opacity-60"} shadow-sm overflow-hidden`}>
              {editingId === faq.id ? (
                <div className="p-5 space-y-3">
                  <input value={editQ} onChange={(e) => setEditQ(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:border-[#800000] focus:outline-none" />
                  <textarea value={editA} onChange={(e) => setEditA(e.target.value)} rows={3} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#800000] focus:outline-none resize-none" />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 bg-[#800000] text-white px-4 py-2 rounded-xl text-xs font-semibold">
                      {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
                    </button>
                    <button onClick={() => setEditingId(null)} disabled={saving} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold"><X size={13} /> Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 px-5 py-4 cursor-pointer" onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}>
                    <span className="w-6 h-6 rounded-full bg-[#800000]/10 text-[#800000] text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                    <p className={`flex-1 text-sm font-semibold ${faq.is_active ? "text-gray-900" : "text-gray-400"}`}>{faq.question}</p>
                    <div className="flex items-center gap-2 ml-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleActive(faq)} className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-colors ${faq.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {faq.is_active ? "Active" : "Hidden"}
                      </button>
                      <button onClick={() => startEdit(faq)} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-[#800000] transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => deleteFaq(faq.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                    {expandedId === faq.id ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                  </div>
                  {expandedId === faq.id && (
                    <div className="px-5 pb-4 text-sm text-gray-600 border-t border-gray-50 pt-3 leading-relaxed">{faq.answer}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
