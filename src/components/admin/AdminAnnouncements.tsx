"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Check, X, Megaphone, Bell, AlertTriangle, Info, Calendar, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type AnnType = "info" | "success" | "warning";
interface Announcement { id: string; title: string; message: string; type: AnnType; expires_at: string; is_active: boolean; }

const TYPE_CONFIG = {
  info: { label: "Info", icon: <Info size={14} />, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  success: { label: "Success", icon: <Check size={14} />, bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  warning: { label: "Urgent", icon: <AlertTriangle size={14} />, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
};

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<Announcement>>({ type: "info", is_active: true });

  const today = new Date().toISOString().split("T")[0];
  const isExpired = (a: Announcement) => a.expires_at && a.expires_at < today;

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      setItems(data.announcements ?? []);
    } catch {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      setItems(items.filter((a) => a.id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleActive = async (ann: Announcement) => {
    const newState = !ann.is_active;
    setItems(items.map((a) => a.id === ann.id ? { ...a, is_active: newState } : a));
    try {
      const res = await fetch("/api/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ann.id, is_active: newState }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Failed to update status");
      setItems(items.map((a) => a.id === ann.id ? { ...a, is_active: !newState } : a));
    }
  };

  const addItem = async () => {
    if (!newItem.title?.trim() || !newItem.message?.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) throw new Error();
      toast.success("Added successfully");
      fetchAnnouncements();
      setNewItem({ type: "info", is_active: true });
      setAdding(false);
    } catch {
      toast.error("Failed to add announcement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Announcements</h2>
          <p className="text-gray-500 text-sm mt-0.5">Banners shown on the website to drive urgency</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 bg-[#800000] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#600000] transition-colors">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-[#FDF8F0] border border-[#e8d9b8] rounded-xl p-4 flex items-start gap-3">
        <Bell size={16} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-700">Active announcements are shown on the website. Expired announcements are hidden automatically. Max 3 active at a time.</p>
      </div>

      {adding && (
        <div className="bg-white rounded-xl border-2 border-[#800000]/30 p-5 shadow-sm space-y-4">
          <p className="font-bold text-gray-900 text-sm flex items-center gap-2"><Megaphone size={16} className="text-[#800000]" /> New Announcement</p>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
            <input value={newItem.title || ""} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#800000] focus:outline-none" placeholder="e.g. Admissions Open!" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Message *</label>
            <textarea value={newItem.message || ""} onChange={(e) => setNewItem({ ...newItem, message: e.target.value })} rows={2} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#800000] focus:outline-none resize-none" placeholder="Brief message..." />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
              <select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value as AnnType })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#800000] focus:outline-none cursor-pointer">
                {(Object.entries(TYPE_CONFIG)).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Calendar size={12} /> Expiry Date</label>
              <input type="date" value={newItem.expires_at || ""} onChange={(e) => setNewItem({ ...newItem, expires_at: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#800000] focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addItem} disabled={saving} className="flex items-center gap-1.5 bg-[#800000] text-white px-4 py-2 rounded-xl text-xs font-semibold">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Publish
            </button>
            <button onClick={() => { setAdding(false); setNewItem({ type: "info" }); }} disabled={saving} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold"><X size={13} /> Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-gray-400 flex flex-col items-center">
          <Loader2 size={24} className="animate-spin mb-2" />
          Loading announcements...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-dashed border-gray-200">
          No announcements yet. Add one above.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((ann) => {
            const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.info;
            const expired = isExpired(ann);
            return (
              <div key={ann.id} className={`bg-white rounded-xl border shadow-sm p-5 ${expired ? "opacity-50" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} ${cfg.text} flex items-center justify-center flex-shrink-0`}>{cfg.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 text-sm">{ann.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>{cfg.label}</span>
                      {expired && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">Expired</span>}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{ann.message}</p>
                    {ann.expires_at && <p className="text-gray-400 text-xs mt-1.5 flex items-center gap-1"><Calendar size={11} /> Expires: {new Date(ann.expires_at).toLocaleDateString("en-IN")}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!expired && (
                      <button onClick={() => toggleActive(ann)} className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-colors ${ann.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {ann.is_active ? "Live" : "Paused"}
                      </button>
                    )}
                    <button onClick={() => deleteItem(ann.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
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
