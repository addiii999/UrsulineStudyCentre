"use client";
import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Check, X,
  ChevronDown, HelpCircle, Loader2, Eye, EyeOff, Save,
} from "lucide-react";
import toast from "react-hot-toast";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order?: number;
}

export default function AdminFAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");

  // Add state
  const [adding, setAdding] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");

  // Expand state (accordion preview)
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ── DATA ─────────────────────────────────────────────── */
  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/faqs");
      const data = await res.json();
      setFaqs(data.faqs ?? []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFaqs(); }, []);

  /* ── EDIT ─────────────────────────────────────────────── */
  const startEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setEditQ(faq.question);
    setEditA(faq.answer);
    setExpandedId(null);   // close accordion when editing
    setAdding(false);       // close add form
  };

  const cancelEdit = () => { setEditingId(null); setEditQ(""); setEditA(""); };

  const saveEdit = async () => {
    if (!editQ.trim() || !editA.trim()) {
      toast.error("Question and answer cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/faqs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, question: editQ.trim(), answer: editA.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      toast.success("FAQ updated!");
      await fetchFaqs();
      cancelEdit();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  /* ── DELETE ───────────────────────────────────────────── */
  const deleteFaq = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const res = await fetch(`/api/faqs?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      toast.success("FAQ deleted");
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete");
    }
  };

  /* ── TOGGLE ACTIVE ────────────────────────────────────── */
  const toggleActive = async (faq: FAQ) => {
    const newState = !faq.is_active;
    // Optimistic update
    setFaqs((prev) => prev.map((f) => f.id === faq.id ? { ...f, is_active: newState } : f));
    try {
      const res = await fetch("/api/faqs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: faq.id, is_active: newState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      toast.success(newState ? "FAQ shown on website" : "FAQ hidden from website");
    } catch {
      // Revert on failure
      setFaqs((prev) => prev.map((f) => f.id === faq.id ? { ...f, is_active: !newState } : f));
      toast.error("Update failed");
    }
  };

  /* ── ADD ──────────────────────────────────────────────── */
  const startAdding = () => { setAdding(true); setEditingId(null); };
  const cancelAdd = () => { setAdding(false); setNewQ(""); setNewA(""); };

  const addFaq = async () => {
    if (!newQ.trim() || !newA.trim()) {
      toast.error("Question and answer cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQ.trim(), answer: newA.trim(), is_active: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      toast.success("New FAQ added!");
      await fetchFaqs();
      cancelAdd();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add FAQ");
    } finally {
      setSaving(false);
    }
  };

  /* ── RENDER ───────────────────────────────────────────── */
  const activeFaqCount = faqs.filter((f) => f.is_active).length;

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "var(--font-serif)" }}>
            FAQ Management
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">
            {activeFaqCount} of {faqs.length} FAQs shown publicly on website
          </p>
        </div>
        <button
          onClick={startAdding}
          disabled={adding}
          className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6a0000] transition-colors shadow-sm flex-shrink-0"
        >
          <Plus size={15} /> Add FAQ
        </button>
      </div>

      {/* ADD FORM */}
      {adding && (
        <div className="bg-white rounded-2xl border-2 border-[#800000]/25 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-50 bg-[#800000]/3">
            <HelpCircle size={15} className="text-[#800000]" />
            <p className="font-semibold text-[#800000] text-sm">New FAQ</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="label">Question *</label>
              <input
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
                className="input-field"
                placeholder="e.g. What classes does USC offer?"
                autoFocus
              />
            </div>
            <div>
              <label className="label">Answer *</label>
              <textarea
                value={newA}
                onChange={(e) => setNewA(e.target.value)}
                rows={4}
                className="input-field resize-none"
                placeholder="Write a clear, helpful answer..."
              />
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={addFaq}
                disabled={saving || !newQ.trim() || !newA.trim()}
                className="flex items-center gap-2 bg-[#800000] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6a0000] disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save FAQ
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

      {/* LIST */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100" />
                <div className="flex-1 h-3.5 bg-gray-100 rounded" />
                <div className="w-16 h-5 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <div className="py-14 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <HelpCircle size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">No FAQs found</p>
          <p className="text-gray-300 text-xs mt-1">Click "Add FAQ" to get started</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {faqs.map((faq, idx) => (
            <div
              key={faq.id}
              className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${
                faq.is_active ? "border-gray-100" : "border-gray-100 opacity-55"
              } ${editingId === faq.id ? "border-[#800000]/30 shadow-md" : "hover:border-gray-200"}`}
              style={{ boxShadow: editingId === faq.id ? undefined : "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              {/* ─ EDIT MODE ─ */}
              {editingId === faq.id ? (
                <div className="p-5 space-y-3">
                  <p className="text-xs font-semibold text-[#800000] flex items-center gap-1.5 mb-1">
                    <Pencil size={11} /> Editing FAQ #{idx + 1}
                  </p>
                  <div>
                    <label className="label">Question</label>
                    <input
                      value={editQ}
                      onChange={(e) => setEditQ(e.target.value)}
                      className="input-field font-medium"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="label">Answer</label>
                    <textarea
                      value={editA}
                      onChange={(e) => setEditA(e.target.value)}
                      rows={4}
                      className="input-field resize-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#6a0000] disabled:opacity-50 transition-colors"
                    >
                      {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="flex items-center gap-2 border border-gray-200 text-gray-500 px-4 py-2 rounded-xl text-xs font-medium hover:bg-gray-50"
                    >
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ─ VIEW MODE ─ */
                <div>
                  {/* Question row */}
                  <div
                    className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
                    onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  >
                    {/* Index */}
                    <span className="w-6 h-6 rounded-full bg-[#800000]/8 text-[#800000] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>

                    {/* Question text */}
                    <p className={`flex-1 text-[13.5px] font-semibold leading-snug min-w-0 ${faq.is_active ? "text-gray-800" : "text-gray-400"}`}>
                      {faq.question}
                    </p>

                    {/* Actions — stop propagation so they don't toggle accordion */}
                    <div className="flex items-center gap-1.5 ml-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Active toggle */}
                      <button
                        onClick={() => toggleActive(faq)}
                        title={faq.is_active ? "Hide from website" : "Show on website"}
                        className={`flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                          faq.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {faq.is_active
                          ? <><Eye size={10} /> Visible</>
                          : <><EyeOff size={10} /> Hidden</>
                        }
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => startEdit(faq)}
                        title="Edit FAQ"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#800000] hover:bg-[#800000]/5 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteFaq(faq.id)}
                        title="Delete FAQ"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Chevron */}
                    <ChevronDown
                      size={15}
                      className={`text-gray-300 flex-shrink-0 transition-transform duration-200 ${expandedId === faq.id ? "rotate-180" : ""}`}
                    />
                  </div>

                  {/* Expanded answer */}
                  {expandedId === faq.id && (
                    <div className="px-5 pb-5 border-t border-gray-50 pt-3">
                      <p className="text-gray-600 text-[13px] leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info note */}
      {faqs.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-[12px] text-blue-700 leading-relaxed">
          <strong>Tip:</strong> Click any row to preview the answer. Use the <strong>Visible/Hidden</strong> toggle to control what appears on the public website without deleting the FAQ.
        </div>
      )}
    </div>
  );
}
