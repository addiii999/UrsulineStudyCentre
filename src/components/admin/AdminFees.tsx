"use client";
import { useState, useEffect } from "react";
import { IndianRupee, Save, Loader2, CheckCircle, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

interface FeeRow {
  stream: string;
  annual: string;
  includes: string;
}

interface FeesData {
  session: string;
  admissionsOpen: boolean;
  fees: FeeRow[];
}

const DEFAULT_FEES: FeesData = {
  session: "2026-27",
  admissionsOpen: true,
  fees: [
    { stream: "Science (PCM)", annual: "15000", includes: "JEE Prep Included" },
    { stream: "Science (PCB)", annual: "15000", includes: "NEET Prep Included" },
    { stream: "Commerce", annual: "15000", includes: "Tally Basics Included" },
    { stream: "Humanities", annual: "15000", includes: "CLAT Basics Included" },
  ],
};

export default function AdminFees() {
  const [data, setData] = useState<FeesData>(DEFAULT_FEES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await fetch("/api/settings");
        const json = await res.json();
        const feesData = json.settings?.fees_data;
        if (feesData) {
          setData(typeof feesData === "string" ? JSON.parse(feesData) : feesData);
        }
      } catch {
        toast.error("Failed to load fee data");
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  const updateFee = (index: number, field: keyof FeeRow, value: string) => {
    setData((prev) => {
      const updatedFees = [...prev.fees];
      updatedFees[index] = { ...updatedFees[index], [field]: value };
      return { ...prev, fees: updatedFees };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fees_data: JSON.stringify(data) }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      toast.success("Fee structure updated! Public website will update instantly.");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* HEADER */}
      <div>
        <h2 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "var(--font-serif)" }}>
          Fees Management
        </h2>
        <p className="text-gray-400 text-xs mt-0.5">
          Update fee amounts shown publicly on website
        </p>
      </div>

      {/* SESSION + ADMISSION STATUS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
        <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
          General Settings
        </h3>

        {/* SESSION YEAR */}
        <div>
          <label className="label">Academic Session</label>
          <input
            type="text"
            value={data.session}
            onChange={(e) => setData((p) => ({ ...p, session: e.target.value }))}
            className="input-field max-w-xs"
            placeholder="e.g. 2026-27"
          />
          <p className="text-xs text-gray-400 mt-1">Shown as label in fee structure on website</p>
        </div>

        {/* ADMISSION STATUS TOGGLE */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="font-semibold text-sm text-gray-800">Admission Status</p>
            <p className="text-xs text-gray-400 mt-0.5">Controls "Admissions Open" badge on website</p>
          </div>
          <button
            onClick={() => setData((p) => ({ ...p, admissionsOpen: !p.admissionsOpen }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
              data.admissionsOpen
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-500 border border-gray-200"
            }`}
          >
            {data.admissionsOpen ? (
              <><ToggleRight size={20} /> Open</>
            ) : (
              <><ToggleLeft size={20} /> Closed</>
            )}
          </button>
        </div>
      </div>

      {/* FEE STRUCTURE EDITOR */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <IndianRupee size={16} className="text-[#C9A84C]" />
          <h3 className="font-bold text-sm text-gray-900">Fee Structure — {data.session}</h3>
        </div>

        <div className="divide-y divide-gray-50">
          {data.fees.map((row, i) => (
            <div key={row.stream} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
              {/* STREAM NAME (read-only) */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{row.stream}</p>
                <input
                  type="text"
                  value={row.includes}
                  onChange={(e) => updateFee(i, "includes", e.target.value)}
                  className="text-xs text-gray-400 mt-0.5 bg-transparent border-none outline-none w-full focus:text-gray-700 focus:bg-green-50 rounded px-1 -ml-1 transition-colors"
                  placeholder="e.g. JEE Prep Included"
                />
              </div>

              {/* FEE AMOUNT INPUT */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-gray-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  value={row.annual}
                  onChange={(e) => updateFee(i, "annual", e.target.value)}
                  className="w-28 px-3 py-2 text-right font-bold text-[#800000] text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]/50 transition-all"
                  min={0}
                />
                <span className="text-xs text-gray-400 w-14">/yr</span>
              </div>
            </div>
          ))}
        </div>

        {/* INFO NOTE */}
        <div className="px-5 py-3 bg-[#FDF8F0] border-t border-[#e8d9b8]">
          <p className="text-xs text-gray-500">
            ✏️ Click any fee amount to edit. Changes go live on website after saving.
          </p>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-8 py-2.5 flex items-center gap-2 shadow-md"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving...</>
          ) : saved ? (
            <><CheckCircle size={16} /> Saved!</>
          ) : (
            <><Save size={16} /> Save Changes</>
          )}
        </button>
        {saved && (
          <p className="text-green-600 text-sm font-semibold animate-in fade-in">
            ✓ Fee structure updated on public website
          </p>
        )}
      </div>

      {/* PREVIEW NOTE */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
        <strong>How it works:</strong> When you save, the new fee amounts will instantly appear
        in the "Admission" section of the public website for all visitors.
      </div>
    </div>
  );
}
