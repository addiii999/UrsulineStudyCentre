import { IndianRupee, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { FEE_TABLE } from "@/lib/constants";

const FEE_RECORDS = [
  { id: "1", student: "Priya Gupta", stream: "Science (PCM)", amount: 15000, date: "2026-04-28", receipt: "USC-001", status: "paid" },
  { id: "2", student: "Anjali Singh", stream: "Science (PCB)", amount: 15000, date: "2026-04-25", receipt: "USC-002", status: "paid" },
  { id: "3", student: "Kavya Verma", stream: "Humanities", amount: 15000, date: "—", receipt: "—", status: "pending" },
  { id: "4", student: "Simran Mehta", stream: "Commerce", amount: 15000, date: "2026-04-15", receipt: "USC-003", status: "overdue" },
];

const STATUS = {
  paid: { color: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle size={12} /> },
  pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: <Clock size={12} /> },
  overdue: { color: "bg-red-50 text-red-700 border-red-200", icon: <AlertCircle size={12} /> },
};

export default function AdminFees() {
  const totalCollected = FEE_RECORDS.filter((f) => f.status === "paid").reduce((a, f) => a + f.amount, 0);
  const totalPending = FEE_RECORDS.filter((f) => f.status !== "paid").reduce((a, f) => a + f.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "var(--font-serif)" }}>Fees Management</h2>
        <p className="text-gray-400 text-xs">Track payments and fee collection</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Collected</p>
          <p className="text-2xl font-bold text-green-700 mt-1" style={{ fontFamily: "var(--font-serif)" }}>
            ₹{totalCollected.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-xs text-yellow-600 font-semibold uppercase tracking-wide">Pending</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1" style={{ fontFamily: "var(--font-serif)" }}>
            ₹{totalPending.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-[#800000]/5 border border-[#800000]/20 rounded-xl p-4">
          <p className="text-xs text-[#800000] font-semibold uppercase tracking-wide">Total Students</p>
          <p className="text-2xl font-bold text-[#800000] mt-1" style={{ fontFamily: "var(--font-serif)" }}>
            {FEE_RECORDS.length}
          </p>
        </div>
      </div>

      {/* FEE STRUCTURE TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <IndianRupee size={16} className="text-[#C9A84C]" />
          <h3 className="font-bold text-sm text-gray-900">Fee Structure — 2026-27</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase">Stream</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Annual Fee</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Includes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {FEE_TABLE.map((row) => (
              <tr key={row.stream}>
                <td className="px-5 py-3 font-semibold text-gray-900">{row.stream}</td>
                <td className="px-4 py-3 font-bold text-[#800000]">{row.annual}</td>
                <td className="px-4 py-3 text-xs text-green-700">{row.includes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAYMENT RECORDS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-sm text-gray-900">Payment Records</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Student", "Stream", "Amount", "Date", "Receipt No.", "Status"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {FEE_RECORDS.map((r) => {
              const sc = STATUS[r.status as keyof typeof STATUS];
              return (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{r.student}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.stream}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">₹{r.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{r.date}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{r.receipt}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${sc.color}`}>
                      {sc.icon} {r.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
