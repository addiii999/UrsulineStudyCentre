"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Database, Trash2, Download, ClipboardList, RefreshCw,
  RotateCcw, AlertTriangle, CheckCircle2, Loader2, X,
  FileJson, FileText, Shield, Clock, HardDrive, Activity,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface TableStat { key: string; label: string; emoji: string; total: number; active: number; deleted: number; }
interface TrashItem  { table: string; singular: string; id: string; label: string; deleted_at: string; storage_path?: string; }
interface AuditLog   { id: string; action: string; table_name: string; item_label?: string; created_at: string; }
interface Stats {
  tableStats:    TableStat[];
  totalDeleted:  number;
  expiringCount: number;
  storage:       { fileCount: number; estimatedMB: string; freePlanLimitMB: number; usagePercent: string; };
  auditLogs:     AuditLog[];
}

// ─── Helpers ─────────────────────────────────────────────────
function relTime(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (d < 60)     return "Just now";
  if (d < 3600)   return `${Math.floor(d/60)}m ago`;
  if (d < 86400)  return `${Math.floor(d/3600)}h ago`;
  if (d < 604800) return `${Math.floor(d/86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const ACTION_COLOR: Record<string, string> = {
  soft_delete:      "text-rose-600 bg-rose-50",
  restore:          "text-emerald-600 bg-emerald-50",
  permanent_delete: "text-red-700 bg-red-50",
  export:           "text-sky-600 bg-sky-50",
  cleanup:          "text-amber-600 bg-amber-50",
};

const ACTION_LABEL: Record<string, string> = {
  soft_delete:      "Deleted",
  restore:          "Restored",
  permanent_delete: "Purged",
  export:           "Exported",
  cleanup:          "Cleanup",
};

// ─── Toast ───────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "err" | "warn"; onClose: () => void }) {
  const bg = type === "ok" ? "bg-emerald-600" : type === "warn" ? "bg-amber-500" : "bg-rose-600";
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold text-white ${bg}`}>
      {type === "ok" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      {msg}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

// ─── EXPORT TABLES LIST ───────────────────────────────────────
const EXPORT_TABLES = [
  { key: "enquiries",    label: "Enquiries",    emoji: "📩" },
  { key: "students",     label: "Students",     emoji: "🎓" },
  { key: "faculty",      label: "Faculty",      emoji: "👩‍🏫" },
  { key: "courses",      label: "Courses",      emoji: "📚" },
  { key: "videos",       label: "YouTube Videos", emoji: "▶️" },
  { key: "gallery",      label: "Gallery",      emoji: "🖼️" },
  { key: "faqs",         label: "FAQs",         emoji: "❓" },
  { key: "testimonials", label: "Testimonials", emoji: "⭐" },
  { key: "notifications",label: "Notifications",emoji: "🔔" },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function AdminStorageManager() {
  const [tab,      setTab]      = useState<"overview" | "trash" | "backup" | "audit">("overview");
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [trash,    setTrash]    = useState<TrashItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState<{ msg: string; type: "ok"|"err"|"warn" } | null>(null);
  const [busy,     setBusy]     = useState<string | null>(null); // item id being processed

  const showToast = (msg: string, type: "ok"|"err"|"warn" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── Fetch Overview Stats ────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/storage/stats");
      const json = await res.json();
      setStats(json);
    } catch { showToast("Failed to load stats", "err"); }
    finally  { setLoading(false); }
  }, []);

  // ─── Fetch Trash ─────────────────────────────────────────────
  const fetchTrash = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/trash");
      const json = await res.json();
      setTrash(json.items ?? []);
    } catch { showToast("Failed to load trash", "err"); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === "overview" || tab === "audit") fetchStats();
    if (tab === "trash") fetchTrash();
  }, [tab, fetchStats, fetchTrash]);

  // ─── Restore ─────────────────────────────────────────────────
  const handleRestore = async (item: TrashItem) => {
    setBusy(item.id);
    try {
      const res = await fetch("/api/trash", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, table: item.table, label: item.label }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setTrash(prev => prev.filter(i => i.id !== item.id));
      showToast(`"${item.label}" restored successfully!`);
    } catch { showToast("Restore failed", "err"); }
    finally  { setBusy(null); }
  };

  // ─── Permanent Delete ─────────────────────────────────────────
  const handlePermanentDelete = async (item: TrashItem) => {
    if (!confirm(`Permanently delete "${item.label}"?\n\nThis CANNOT be undone. The item will be removed from the database and storage forever.`)) return;
    setBusy(item.id);
    try {
      const res = await fetch("/api/trash", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, table: item.table, storage_path: item.storage_path, label: item.label }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setTrash(prev => prev.filter(i => i.id !== item.id));
      showToast(`"${item.label}" permanently deleted.`, "warn");
    } catch { showToast("Delete failed", "err"); }
    finally  { setBusy(null); }
  };

  // ─── Run Cleanup (30-day purge) ───────────────────────────────
  const handleCleanup = async () => {
    if (!confirm("Run 30-day cleanup? Items deleted more than 30 days ago will be permanently removed.")) return;
    setBusy("cleanup");
    try {
      const res  = await fetch("/api/backup", { method: "POST" });
      const json = await res.json();
      showToast(`Cleanup complete. ${json.purged} item(s) permanently removed.`, "warn");
      fetchStats();
      fetchTrash();
    } catch { showToast("Cleanup failed", "err"); }
    finally  { setBusy(null); }
  };

  // ─── Export Download ──────────────────────────────────────────
  const handleExport = (table: string, format: "json" | "csv") => {
    window.open(`/api/backup?table=${table}&format=${format}`, "_blank");
  };

  // ─── Storage Bar ─────────────────────────────────────────────
  const usagePct = parseFloat(stats?.storage.usagePercent ?? "0");
  const barColor = usagePct > 80 ? "bg-rose-500" : usagePct > 50 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Storage & Backup Manager</h1>
          <p className="text-gray-400 text-[13px] mt-0.5">Safe delete · Recovery · Export · Audit · Storage optimization</p>
        </div>
        <button onClick={() => { fetchStats(); fetchTrash(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-[13px] font-semibold hover:bg-gray-200 transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {([
          { id: "overview", label: "Overview",  icon: <HardDrive size={13} /> },
          { id: "trash",    label: "Trash",     icon: <Trash2 size={13} /> },
          { id: "backup",   label: "Backup & Export", icon: <Download size={13} /> },
          { id: "audit",    label: "Audit Log", icon: <ClipboardList size={13} /> },
        ] as { id: typeof tab; label: string; icon: React.ReactNode }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all ${tab === t.id ? "bg-white text-[#800000] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t.icon}{t.label}
            {t.id === "trash" && (stats?.totalDeleted ?? 0) > 0 && (
              <span className="ml-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{stats!.totalDeleted}</span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-400 py-8 justify-center">
          <Loader2 size={18} className="animate-spin" /> Loading…
        </div>
      )}

      {/* ── OVERVIEW TAB ───────────────────────────────────────── */}
      {tab === "overview" && !loading && stats && (
        <div className="space-y-5">
          {/* Storage Bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-[#800000]" />
                <span className="font-bold text-[14px] text-gray-800">Supabase Storage Usage</span>
              </div>
              <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${usagePct > 80 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                {stats.storage.estimatedMB} MB / {stats.storage.freePlanLimitMB} MB
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${Math.max(1, usagePct)}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2.5 text-[11px] text-gray-400">
              <span>{stats.storage.fileCount} files in storage</span>
              <span>{usagePct}% used</span>
            </div>
          </div>

          {/* Alerts */}
          {stats.expiringCount > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 text-amber-700">
              <AlertTriangle size={16} />
              <div>
                <p className="font-bold text-[13px]">{stats.expiringCount} item(s) expiring soon</p>
                <p className="text-[11px] mt-0.5">Items deleted 25+ days ago will be auto-purged in 5 days. Restore them now if needed.</p>
              </div>
              <button onClick={() => setTab("trash")}
                className="ml-auto text-[11px] font-bold bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                View Trash →
              </button>
            </div>
          )}

          {/* Cleanup Button */}
          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
            <div>
              <p className="font-bold text-[13px] text-gray-800 flex items-center gap-2"><Shield size={14} className="text-[#800000]" /> Manual 30-Day Cleanup</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Permanently purge items that have been in trash for 30+ days and free storage.</p>
            </div>
            <button onClick={handleCleanup} disabled={busy === "cleanup"}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#800000] text-white text-[12px] font-bold hover:bg-[#600000] disabled:opacity-50 transition-colors">
              {busy === "cleanup" ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Run Cleanup
            </button>
          </div>

          {/* Table Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.tableStats.map(t => (
              <div key={t.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[18px]">{t.emoji}</span>
                  <span className="text-[12px] font-semibold text-gray-600">{t.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{t.active}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {t.total} total · <span className="text-rose-500">{t.deleted} deleted</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TRASH TAB ──────────────────────────────────────────── */}
      {tab === "trash" && !loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {trash.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300 gap-3">
              <CheckCircle2 size={36} className="opacity-40" />
              <p className="font-semibold text-gray-400">Trash is empty</p>
              <p className="text-[12px] text-gray-300">No items have been soft-deleted recently.</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between bg-rose-50/30">
                <p className="text-[13px] font-bold text-rose-700 flex items-center gap-2">
                  <Trash2 size={14} /> {trash.length} item(s) in trash
                </p>
                <p className="text-[11px] text-gray-400">Items auto-purge after 30 days</p>
              </div>
              <div className="divide-y divide-gray-50">
                {trash.map(item => {
                  const daysAgo = Math.floor((Date.now() - new Date(item.deleted_at).getTime()) / 86400000);
                  const expiring = daysAgo >= 25;
                  return (
                    <div key={item.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/80 transition-colors ${expiring ? "bg-amber-50/30" : ""}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[#800000] bg-[#800000]/10 px-2 py-0.5 rounded-full">{item.singular}</span>
                          {expiring && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1"><Clock size={9} />Expiring soon</span>}
                        </div>
                        <p className="text-[13px] font-semibold text-gray-800 mt-1 truncate">{item.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Deleted {relTime(item.deleted_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleRestore(item)} disabled={busy === item.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold hover:bg-emerald-100 disabled:opacity-50 transition-colors">
                          {busy === item.id ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
                          Restore
                        </button>
                        <button onClick={() => handlePermanentDelete(item)} disabled={busy === item.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-[11px] font-bold hover:bg-rose-100 disabled:opacity-50 transition-colors">
                          <Trash2 size={11} />
                          Purge
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── BACKUP & EXPORT TAB ─────────────────────────────────── */}
      {tab === "backup" && (
        <div className="space-y-5">
          <div className="bg-[#800000] border border-[#5C0000] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2"><Shield size={18} className="text-[#C9A84C]" /> Complete Database Backup</h3>
                <p className="text-white/70 text-sm mt-1 mb-4 max-w-md">Instantly download a complete, highly-compressed ZIP snapshot of your entire database including all operational data.</p>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-white/60">
                  <p>Weekly Backup: <span className="text-white">{typeof window !== 'undefined' ? localStorage.getItem("lastBackupWeek") || "None" : "None"}</span></p>
                  <p>Last Manual: <span className="text-white">{typeof window !== 'undefined' ? localStorage.getItem("lastManualBackup") || "Never" : "Never"}</span></p>
                </div>
              </div>
              <button 
                onClick={async () => {
                  setBusy("full_backup");
                  try {
                    const res = await fetch("/api/backup/full");
                    if (!res.ok) throw new Error();
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `USC_Manual_Backup_${new Date().toISOString().slice(0,10)}.zip`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    localStorage.setItem("lastManualBackup", new Date().toLocaleDateString());
                    showToast("Full backup downloaded successfully!", "ok");
                  } catch(e) {
                    showToast("Backup failed. Please try again.", "err");
                  } finally {
                    setBusy(null);
                  }
                }}
                disabled={busy === "full_backup"}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-white text-[#800000] px-6 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-70"
              >
                {busy === "full_backup" ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {busy === "full_backup" ? "Generating ZIP..." : "Download Full Backup Now"}
              </button>
            </div>
          </div>

          <div className="bg-sky-50 border border-sky-100 rounded-2xl px-5 py-4 text-[12px] text-sky-700">
            <p className="font-bold mb-1">📦 Individual Table Exports</p>
            <p>Download a snapshot of any specific table as <strong>JSON</strong> (full fidelity) or <strong>CSV</strong> (Excel-compatible). Avoids downloading entire database.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EXPORT_TABLES.map(t => (
              <div key={t.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.emoji}</span>
                  <div>
                    <p className="text-[13px] font-bold text-gray-800">{t.label}</p>
                    <p className="text-[10px] text-gray-400">Single table data</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleExport(t.key, "json")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 text-[11px] font-bold hover:bg-sky-100 transition-colors">
                    <FileJson size={12} /> JSON
                  </button>
                  <button onClick={() => handleExport(t.key, "csv")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold hover:bg-emerald-100 transition-colors">
                    <FileText size={12} /> CSV
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AUDIT LOG TAB ────────────────────────────────────────── */}
      {tab === "audit" && !loading && stats && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {stats.auditLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300 gap-3">
              <Activity size={36} className="opacity-40" />
              <p className="font-semibold text-gray-400">No actions logged yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.auditLogs.map(log => (
                <div key={log.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap ${ACTION_COLOR[log.action] ?? "text-gray-500 bg-gray-50"}`}>
                    {ACTION_LABEL[log.action] ?? log.action}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-700 truncate">{log.item_label ?? "(no label)"}</p>
                    <p className="text-[10px] text-gray-400">Table: <strong>{log.table_name}</strong></p>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{relTime(log.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
