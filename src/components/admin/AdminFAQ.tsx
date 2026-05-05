"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

interface FAQ { id: string; question: string; answer: string; isActive: boolean; }

const DEFAULT_FAQS: FAQ[] = [
  { id: "1", question: "Is Ursuline Study Centre exclusively for girls?", answer: "Yes, Ursuline Study Centre is a 100% girls-only premium educational institution. This ensures a safe, focused, and empowering academic environment for all our students.", isActive: true },
  { id: "2", question: "Which boards do you cover?", answer: "We cover both JAC (Jharkhand Academic Council) and CBSE boards for Classes 9–12.", isActive: true },
  { id: "3", question: "Do you offer JEE and NEET preparation?", answer: "Yes! We offer integrated preparation for JEE, NEET, and CLAT alongside regular board curriculum.", isActive: true },
];

export default function AdminFAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>(DEFAULT_FAQS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [adding, setAdding] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const startEdit = (faq: FAQ) => { setEditingId(faq.id); setEditQ(faq.question); setEditA(faq.answer); };
  const saveEdit = () => {
    setFaqs((p) => p.map((f) => f.id === editingId ? { ...f, question: editQ, answer: editA } : f));
    setEditingId(null);
  };
  const deleteFaq = (id: string) => setFaqs((p) => p.filter((f) => f.id !== id));
  const toggleActive = (id: string) => setFaqs((p) => p.map((f) => f.id === id ? { ...f, isActive: !f.isActive } : f));
  const addFaq = () => {
    if (!newQ.trim() || !newA.trim()) return;
    setFaqs((p) => [...p, { id: Date.now().toString(), question: newQ, answer: newA, isActive: true }]);
    setNewQ(""); setNewA(""); setAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">FAQ Management</h2>
          <p className="text-gray-500 text-sm mt-0.5">{faqs.filter(f => f.isActive).length} active FAQs shown on website</p>
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
            <button onClick={addFaq} className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2 rounded-xl text-sm font-semibold"><Check size={14} /> Save FAQ</button>
            <button onClick={() => { setAdding(false); setNewQ(""); setNewA(""); }} className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={faq.id} className={`bg-white rounded-xl border ${faq.isActive ? "border-gray-200" : "border-gray-100 opacity-60"} shadow-sm overflow-hidden`}>
            {editingId === faq.id ? (
              <div className="p-5 space-y-3">
                <input value={editQ} onChange={(e) => setEditQ(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:border-[#800000] focus:outline-none" />
                <textarea value={editA} onChange={(e) => setEditA(e.target.value)} rows={3} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#800000] focus:outline-none resize-none" />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex items-center gap-1.5 bg-[#800000] text-white px-4 py-2 rounded-xl text-xs font-semibold"><Check size={13} /> Save</button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold"><X size={13} /> Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 px-5 py-4 cursor-pointer" onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}>
                  <span className="w-6 h-6 rounded-full bg-[#800000]/10 text-[#800000] text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                  <p className={`flex-1 text-sm font-semibold ${faq.isActive ? "text-gray-900" : "text-gray-400"}`}>{faq.question}</p>
                  <div className="flex items-center gap-2 ml-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => toggleActive(faq.id)} className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-colors ${faq.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                      {faq.isActive ? "Active" : "Hidden"}
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
    </div>
  );
}
