"use client";
import { useState, useEffect } from "react";
import { Search, MessageSquare, CheckCircle, PhoneCall, XCircle, Loader2, Trash2, RotateCcw, Archive, AlertTriangle, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  class: string;
  stream: string;
  message: string;
  status: "new" | "contacted" | "follow_up" | "counselling_scheduled" | "enrolled" | "rejected" | "archived" | "trash";
  created_at: string;
  is_deleted?: boolean;
  deleted_at?: string;
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  new: { color: "bg-blue-50 text-blue-700 border-blue-200", label: "New" },
  contacted: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Contacted" },
  follow_up: { color: "bg-orange-50 text-orange-700 border-orange-200", label: "Follow-Up" },
  counselling_scheduled: { color: "bg-purple-50 text-purple-700 border-purple-200", label: "Counselling" },
  enrolled: { color: "bg-green-50 text-green-700 border-green-200", label: "Enrolled" },
  rejected: { color: "bg-red-50 text-red-700 border-red-200", label: "Rejected" },
  archived: { color: "bg-gray-100 text-gray-700 border-gray-300", label: "Archived" },
  trash: { color: "bg-rose-50 text-rose-700 border-rose-200", label: "Trash" },
};

export default function AdminEnquiries() {
  const [activeEnquiries, setActiveEnquiries] = useState<Enquiry[]>([]);
  const [trashedEnquiries, setTrashedEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"active" | "trash">("active");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | string>("all");
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmPermanent, setConfirmPermanent] = useState<Enquiry | null>(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const [activeRes, trashRes] = await Promise.all([
        fetch("/api/enquiry"),
        fetch("/api/enquiry?trashed=true"),
      ]);
      const [activeData, trashData] = await Promise.all([activeRes.json(), trashRes.json()]);
      
      // Filter out fallback "trash" status from active view if migration was missing
      const activeFiltered = (activeData.enquiries || []).filter((e: Enquiry) => e.status !== "trash");
      setActiveEnquiries(activeFiltered);
      
      // If migration is missing, trash might contain enquiries with status="trash" instead of is_deleted=true
      const fallbackTrash = (activeData.enquiries || []).filter((e: Enquiry) => e.status === "trash");
      setTrashedEnquiries([...(trashData.enquiries || []), ...fallbackTrash]);
    } catch (err) {
      toast.error("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setActionId(id);
    try {
      const res = await fetch("/api/enquiry/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setActiveEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: status as any } : e)));
      toast.success(`Marked as ${STATUS_CONFIG[status]?.label || status}`);
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setActionId(null);
    }
  };

  const approveAdmission = async (id: string, name: string) => {
    setActionId(id);
    try {
      const res = await fetch("/api/enquiry/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed");
      setActiveEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: "enrolled" } : e)));
      toast.success(`${name} approved and added to Student Records!`);
    } catch (err: any) {
      toast.error(err.message || "Approval failed");
    } finally {
      setActionId(null);
    }
  };


  const moveToTrash = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/enquiry/admin?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to move to trash");
      toast.success("Enquiry moved to Trash");
      await fetchEnquiries();
    } catch (err) {
      toast.error("Failed to move to trash");
    } finally {
      setActionId(null);
    }
  };

  const handleRestore = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch("/api/enquiry/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "restore" }),
      });
      if (!res.ok) throw new Error("Restore failed");
      toast.success("Enquiry restored successfully");
      await fetchEnquiries();
    } catch (err) {
      toast.error("Failed to restore enquiry");
    } finally {
      setActionId(null);
    }
  };

  const confirmDelete = async () => {
    if (!confirmPermanent) return;
    setActionId(confirmPermanent.id);
    try {
      const res = await fetch(`/api/enquiry/admin?id=${confirmPermanent.id}&permanent=true`, { method: "DELETE" });
      if (!res.ok) throw new Error("Permanent delete failed");
      toast.success("Enquiry permanently deleted");
      setTrashedEnquiries(prev => prev.filter(e => e.id !== confirmPermanent.id));
      setConfirmPermanent(null);
    } catch (err) {
      toast.error("Failed to permanently delete");
    } finally {
      setActionId(null);
    }
  };

  const activeFiltered = activeEnquiries.filter((e) => {
    const matchFilter = filter === "all" || e.status === filter;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.phone.includes(search);
    return matchFilter && matchSearch;
  });

  const trashFiltered = trashedEnquiries.filter((e) => {
    return e.name.toLowerCase().includes(search.toLowerCase()) || e.phone.includes(search);
  });

  const counts = {
    all: activeEnquiries.length,
    new: activeEnquiries.filter((e) => e.status === "new").length,
    contacted: activeEnquiries.filter((e) => e.status === "contacted").length,
    follow_up: activeEnquiries.filter((e) => e.status === "follow_up").length,
    counselling_scheduled: activeEnquiries.filter((e) => e.status === "counselling_scheduled").length,
    enrolled: activeEnquiries.filter((e) => e.status === "enrolled").length,
    rejected: activeEnquiries.filter((e) => e.status === "rejected").length,
    archived: activeEnquiries.filter((e) => e.status === "archived").length,
  };

  const FILTERS = ["all", "new", "contacted", "follow_up", "counselling_scheduled", "enrolled", "rejected", "archived"];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "var(--font-serif)" }}>Lead CRM Pipeline</h2>
        <p className="text-gray-400 text-xs">Manage admission enquiries, follow-ups, and student onboarding.</p>
      </div>

      {/* TABS */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button onClick={() => setView("active")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${view === "active" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            Active Pipeline ({activeEnquiries.length})
          </button>
          <button onClick={() => setView("trash")} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${view === "trash" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            <Trash2 size={13} /> Trash {trashedEnquiries.length > 0 && <span className="bg-rose-500 text-white text-[10px] rounded-full px-1.5">{trashedEnquiries.length}</span>}
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative min-w-[250px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="input-field pl-9 text-sm w-full"
          />
        </div>
      </div>

      {/* ACTIVE VIEW */}
      {view === "active" && (
        <>
          {/* FILTER PILLS */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const sc = STATUS_CONFIG[f];
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                    filter === f ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {f === "all" ? "All Active" : sc?.label} <span className="opacity-70 ml-1">({counts[f as keyof typeof counts]})</span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE CARDS */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 size={32} className="animate-spin mb-4" />
                <p className="text-sm">Fetching pipeline...</p>
              </div>
            ) : activeFiltered.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">No enquiries found in this view.</div>
            ) : (
              activeFiltered.map((e) => {
                const sc = STATUS_CONFIG[e.status] || STATUS_CONFIG.new;
                return (
                  <div key={e.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-gray-300 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#800000] flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-[#C9A84C] text-sm font-bold">{e.name[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900 text-sm">{e.name}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${sc.color}`}>
                              {sc.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 font-medium">
                            <a href={`tel:+91${e.phone}`} className="flex items-center gap-1 text-[#800000] hover:underline">
                              <PhoneCall size={10} /> {e.phone}
                            </a>
                            <span className="text-gray-300">|</span>
                            <span>{e.class}</span>
                            {e.stream && <><span className="text-gray-300">|</span><span>{e.stream}</span></>}
                            <span className="text-gray-300">|</span>
                            <span>{new Date(e.created_at).toLocaleDateString()}</span>
                          </div>
                          {e.message && (
                            <div className="mt-2.5 bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-[12px] text-gray-600">
                              <MessageSquare size={12} className="inline mr-1.5 text-gray-400" />
                              <span className="italic">"{e.message}"</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* QUICK ACTIONS & STATUS DROPDOWN */}
                      <div className="flex flex-col gap-2 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-gray-100">
                        {/* APPROVE ADMISSION BUTTON */}
                        {e.status !== "enrolled" && e.status !== "rejected" && (
                          <button
                            onClick={() => approveAdmission(e.id, e.name)}
                            disabled={actionId === e.id}
                            className="flex items-center justify-center gap-1.5 text-[11px] font-bold px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors w-full"
                            title="Approve & Enroll Student"
                          >
                            {actionId === e.id ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
                            Approve Admission
                          </button>
                        )}
                        <div className="flex items-center gap-2">
                          <select
                            disabled={actionId === e.id}
                            value={e.status}
                            onChange={(ev) => updateStatus(e.id, ev.target.value)}
                            className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#800000] disabled:opacity-50 flex-1"
                          >
                            {FILTERS.filter(f => f !== "all").map(f => (
                              <option key={f} value={f}>{STATUS_CONFIG[f]?.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => moveToTrash(e.id)}
                            disabled={actionId === e.id}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Move to Trash"
                          >
                            {actionId === e.id ? <Loader2 size={16} className="animate-spin text-rose-600" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* TRASH VIEW */}
      {view === "trash" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
          <div className="px-5 py-3 border-b border-gray-100 bg-rose-50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Trash2 size={15} className="text-rose-600" />
              <p className="text-sm font-bold text-rose-800">Trash — Deleted Enquiries</p>
              <p className="text-xs text-rose-600 ml-1 hidden sm:block">Items here are hidden from the active pipeline and lead analytics.</p>
            </div>
          </div>
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{["Lead Details", "Class/Stream", "Deleted On", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="py-12 text-center text-gray-400"><Loader2 size={20} className="animate-spin mx-auto mb-2" />Loading...</td></tr>
              ) : trashFiltered.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-gray-400">Trash is empty.</td></tr>
              ) : trashFiltered.map(e => (
                <tr key={e.id} className="hover:bg-gray-50/50 opacity-75">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-700 text-sm">{e.name}</p>
                    <p className="text-[11px] text-gray-500">{e.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs font-medium">{e.class} {e.stream && `— ${e.stream}`}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {e.deleted_at ? new Date(e.deleted_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleRestore(e.id)} disabled={actionId === e.id} className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors">
                        {actionId === e.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />} Restore
                      </button>
                      <button onClick={() => setConfirmPermanent(e)} disabled={actionId === e.id} className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 disabled:opacity-50 transition-colors">
                        <XCircle size={12} /> Permanently Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PERMANENT DELETE CONFIRMATION */}
      {confirmPermanent && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center"><AlertTriangle size={22} className="text-rose-600" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Enquiry Forever?</h3>
                <p className="text-xs text-gray-500 mt-0.5">This action is permanent.</p>
              </div>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 mb-5">
              <p className="text-sm font-semibold text-rose-900">{confirmPermanent.name}</p>
              <p className="text-xs text-rose-600">{confirmPermanent.phone} · {confirmPermanent.class}</p>
            </div>
            <p className="text-sm text-gray-600 mb-6">This will completely erase this lead from the database. Spam or fake entries should be permanently deleted to keep analytics clean.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmPermanent(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">Cancel</button>
              <button onClick={confirmDelete} disabled={actionId === confirmPermanent.id} className="flex-1 px-4 py-2.5 text-sm font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors flex justify-center items-center gap-2">
                {actionId === confirmPermanent.id ? <Loader2 size={16} className="animate-spin" /> : null} Yes, Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
