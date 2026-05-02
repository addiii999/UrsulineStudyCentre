"use client";
import { useState, useEffect } from "react";
import { Search, MessageSquare, CheckCircle, PhoneCall, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  class: string;
  stream: string;
  message: string;
  status: "new" | "contacted" | "admitted" | "rejected";
  created_at: string;
}

const STATUS_CONFIG = {
  new: { color: "bg-blue-50 text-blue-700 border-blue-200", label: "New" },
  contacted: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Contacted" },
  admitted: { color: "bg-green-50 text-green-700 border-green-200", label: "Admitted" },
  rejected: { color: "bg-red-50 text-red-700 border-red-200", label: "Rejected" },
};

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Enquiry["status"]>("all");

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const res = await fetch("/api/enquiry");
      const data = await res.json();
      if (data.enquiries) {
        setEnquiries(data.enquiries);
      }
    } catch (err) {
      toast.error("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Enquiry["status"]) => {
    // For now, updating local state. In a real app, you'd send a PATCH/PUT request.
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    toast.success(`Status updated to ${status}`);
  };

  const filtered = enquiries.filter((e) => {
    const matchFilter = filter === "all" || e.status === filter;
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) || e.phone.includes(search);
    return matchFilter && matchSearch;
  });

  const counts = {
    all: enquiries.length,
    new: enquiries.filter((e) => e.status === "new").length,
    contacted: enquiries.filter((e) => e.status === "contacted").length,
    admitted: enquiries.filter((e) => e.status === "admitted").length,
    rejected: enquiries.filter((e) => e.status === "rejected").length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "var(--font-serif)" }}>Enquiries</h2>
        <p className="text-gray-400 text-xs">Manage all incoming student enquiries</p>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2">
        {(["all", "new", "contacted", "admitted", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              filter === f ? "bg-[#800000] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="input-field pl-9 text-sm"
        />
      </div>

      {/* CARDS */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={32} className="animate-spin mb-4" />
            <p className="text-sm">Fetching enquiries...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No enquiries found</div>
        ) : (
          filtered.map((e) => {
            const sc = STATUS_CONFIG[e.status];
            return (
              <div key={e.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#800000] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#C9A84C] text-xs font-bold">{e.name[0]}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-sm">{e.name}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.color}`}>
                          {sc.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>📞 {e.phone}</span>
                        <span>·</span>
                        <span>{e.class}</span>
                        {e.stream && <><span>·</span><span>{e.stream}</span></>}
                        <span>·</span>
                        <span>{new Date(e.created_at).toLocaleDateString()}</span>
                      </div>
                      {e.message && (
                        <p className="text-xs text-gray-400 mt-1.5 italic">
                          <MessageSquare size={10} className="inline mr-1" />
                          {e.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <a
                      href={`tel:+91${e.phone}`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#800000] hover:bg-gray-100 transition-colors"
                      title="Call"
                    >
                      <PhoneCall size={14} />
                    </a>
                    {e.status !== "contacted" && e.status !== "admitted" && (
                      <button
                        onClick={() => updateStatus(e.id, "contacted")}
                        className="px-2.5 py-1 text-[10px] font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full hover:bg-yellow-100 transition-colors"
                      >
                        Mark Contacted
                      </button>
                    )}
                    {e.status !== "admitted" && (
                      <button
                        onClick={() => updateStatus(e.id, "admitted")}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 transition-colors"
                        title="Admit"
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}
                    {e.status !== "rejected" && (
                      <button
                        onClick={() => updateStatus(e.id, "rejected")}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Reject"
                      >
                        <XCircle size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
