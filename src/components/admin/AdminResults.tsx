"use client";
import { useState } from "react";
import { Pencil, Check, X, Trophy, Info } from "lucide-react";

interface Stat { id: string; label: string; value: string; source: "USC" | "Academic Origin" | "Both"; isVisible: boolean; }

const DEFAULT_STATS: Stat[] = [
  { id: "1", label: "Students Mentored", value: "2500+", source: "Academic Origin", isVisible: true },
  { id: "2", label: "Years of Teaching Excellence", value: "10+", source: "Academic Origin", isVisible: true },
  { id: "3", label: "JEE/NEET Selections", value: "50+", source: "Academic Origin", isVisible: true },
  { id: "4", label: "Board Pass Rate", value: "95%", source: "USC", isVisible: true },
];

const SOURCE_COLORS = {
  USC: "bg-[#800000]/10 text-[#800000] border-[#800000]/20",
  "Academic Origin": "bg-blue-50 text-blue-700 border-blue-200",
  Both: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function AdminResults() {
  const [stats, setStats] = useState<Stat[]>(DEFAULT_STATS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Stat>>({});

  const startEdit = (s: Stat) => { setEditingId(s.id); setDraft({ ...s }); };
  const saveEdit = () => {
    setStats((p) => p.map((s) => s.id === editingId ? { ...s, ...draft } as Stat : s));
    setEditingId(null);
  };
  const toggleVisible = (id: string) => setStats((p) => p.map((s) => s.id === id ? { ...s, isVisible: !s.isVisible } : s));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Results & Achievements</h2>
        <p className="text-gray-500 text-sm mt-0.5">Control the stats and trust numbers shown on the homepage</p>
      </div>

      {/* Important Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          <p className="font-bold">Source Label is Important</p>
          <p className="mt-0.5">Always mark which institution the stat belongs to — <strong>USC</strong> (Ursuline Study Centre) or <strong>Academic Origin</strong>. This maintains credibility and trust with parents.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${!s.isVisible ? "opacity-60" : ""}`}>
            {editingId === s.id ? (
              <div className="p-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Label</label>
                  <input value={draft.label || ""} onChange={(e) => setDraft({ ...draft, label: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#800000] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Value (e.g. 2500+, 95%)</label>
                  <input value={draft.value || ""} onChange={(e) => setDraft({ ...draft, value: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#800000] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Source Institution</label>
                  <select value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value as Stat["source"] })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#800000] focus:outline-none cursor-pointer">
                    <option value="USC">USC (Ursuline Study Centre)</option>
                    <option value="Academic Origin">Academic Origin</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveEdit} className="flex items-center gap-1.5 bg-[#800000] text-white px-4 py-2 rounded-xl text-xs font-semibold"><Check size={13} /> Save</button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold"><X size={13} /> Cancel</button>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#800000]/10 flex items-center justify-center">
                    <Trophy size={18} className="text-[#800000]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleVisible(s.id)} className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-colors ${s.isVisible ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                      {s.isVisible ? "Shown" : "Hidden"}
                    </button>
                    <button onClick={() => startEdit(s)} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-[#800000] transition-colors"><Pencil size={14} /></button>
                  </div>
                </div>
                <p className="text-3xl font-black text-gray-900" style={{ fontFamily: "var(--font-serif)" }}>{s.value}</p>
                <p className="text-gray-700 font-semibold text-sm mt-1">{s.label}</p>
                <span className={`inline-flex items-center mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${SOURCE_COLORS[s.source]}`}>
                  {s.source}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
