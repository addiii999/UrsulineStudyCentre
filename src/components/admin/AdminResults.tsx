"use client";
import { useState, useEffect } from "react";
import { Plus, Pencil, Check, X, Trophy, Info, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Stat { id: string; label: string; value: string; source: "USC" | "Academic Origin" | "Both"; is_visible: boolean; }

const SOURCE_COLORS: Record<string, string> = {
  USC: "bg-[#800000]/10 text-[#800000] border-[#800000]/20",
  "Academic Origin": "bg-blue-50 text-blue-700 border-blue-200",
  Both: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function AdminResults() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Stat>>({});
  const [adding, setAdding] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/results");
      const data = await res.json();
      setStats(data.results ?? []);
    } catch {
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResults(); }, []);

  const startEdit = (s: Stat) => { setEditingId(s.id); setDraft({ ...s }); };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/results", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...draft }),
      });
      if (!res.ok) throw new Error();
      toast.success("Updated successfully");
      fetchResults();
      setEditingId(null);
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const addStat = async () => {
    if (!draft.label || !draft.value || !draft.source) return;
    setSaving(true);
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, is_visible: true }),
      });
      if (!res.ok) throw new Error();
      toast.success("Added successfully");
      fetchResults();
      setAdding(false);
      setDraft({});
    } catch {
      toast.error("Failed to add");
    } finally {
      setSaving(false);
    }
  };

  const deleteStat = async (id: string) => {
    if (!confirm("Delete this result?")) return;
    try {
      const res = await fetch(`/api/results?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      setStats(stats.filter(s => s.id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleVisible = async (item: Stat) => {
    const newState = !item.is_visible;
    setStats(stats.map(s => s.id === item.id ? { ...s, is_visible: newState } : s));
    try {
      const res = await fetch("/api/results", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_visible: newState }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Update failed");
      setStats(stats.map(s => s.id === item.id ? { ...s, is_visible: !newState } : s));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Results & Achievements</h2>
          <p className="text-gray-500 text-sm mt-0.5">Control the stats and trust numbers shown on the homepage</p>
        </div>
        <button onClick={() => { setAdding(true); setDraft({ source: "USC" }); }} className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#600000] transition-colors">
          <Plus size={16} /> Add Result
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          <p className="font-bold">Source Label is Important</p>
          <p className="mt-0.5">Always mark which institution the stat belongs to — <strong>USC</strong> or <strong>Academic Origin</strong>. This maintains credibility and trust with parents.</p>
        </div>
      </div>

      {adding && (
        <div className="bg-white rounded-xl border-2 border-[#800000]/30 p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm text-gray-900">Add New Result</h3>
          <div className="grid gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Label</label>
              <input value={draft.label || ""} onChange={(e) => setDraft({ ...draft, label: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm" placeholder="e.g. Board Pass Rate" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Value (e.g. 2500+, 95%)</label>
              <input value={draft.value || ""} onChange={(e) => setDraft({ ...draft, value: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm" placeholder="e.g. 95%" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Source Institution</label>
              <select value={draft.source || "USC"} onChange={(e) => setDraft({ ...draft, source: e.target.value as Stat["source"] })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm">
                <option value="USC">USC (Ursuline Study Centre)</option>
                <option value="Academic Origin">Academic Origin</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={addStat} disabled={saving} className="flex items-center gap-1.5 bg-[#800000] text-white px-4 py-2 rounded-xl text-xs font-semibold"><Check size={13} /> Save</button>
            <button onClick={() => { setAdding(false); setDraft({}); }} disabled={saving} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold"><X size={13} /> Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-gray-400 flex flex-col items-center">
          <Loader2 size={24} className="animate-spin mb-2" />
          Loading results...
        </div>
      ) : stats.length === 0 ? (
        <div className="py-10 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
          No results found. Add one to get started.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${!s.is_visible ? "opacity-60" : ""}`}>
              {editingId === s.id ? (
                <div className="p-5 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Label</label>
                    <input value={draft.label || ""} onChange={(e) => setDraft({ ...draft, label: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Value (e.g. 2500+, 95%)</label>
                    <input value={draft.value || ""} onChange={(e) => setDraft({ ...draft, value: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Source Institution</label>
                    <select value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value as Stat["source"] })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm">
                      <option value="USC">USC (Ursuline Study Centre)</option>
                      <option value="Academic Origin">Academic Origin</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 bg-[#800000] text-white px-4 py-2 rounded-xl text-xs font-semibold"><Check size={13} /> Save</button>
                    <button onClick={() => setEditingId(null)} disabled={saving} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold"><X size={13} /> Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#800000]/10 flex items-center justify-center">
                      <Trophy size={18} className="text-[#800000]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleVisible(s)} className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-colors ${s.is_visible ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {s.is_visible ? "Shown" : "Hidden"}
                      </button>
                      <button onClick={() => startEdit(s)} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-[#800000] transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => deleteStat(s.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
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
      )}
    </div>
  );
}
