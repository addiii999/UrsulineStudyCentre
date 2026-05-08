"use client";
import { useState, useEffect } from "react";
import { ShieldAlert, Download, X, Loader2 } from "lucide-react";

// Get current ISO week string, e.g. "2026-W29"
function getCurrentWeekString() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

export default function WeeklyBackupReminder() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only show if it's Monday (1) or later. Actually, the requirement is "Every Monday... continue appearing until current week backup downloaded"
    // Just checking if the current week string is marked as downloaded in localStorage.
    const currentWeek = getCurrentWeekString();
    const lastBackupWeek = localStorage.getItem("lastBackupWeek");
    const dismissedUntil = localStorage.getItem("backupDismissedUntil");
    
    // If we haven't backed up this week
    if (lastBackupWeek !== currentWeek) {
      // Check if user clicked "Remind me later" today
      const today = new Date().toISOString().slice(0, 10);
      if (dismissedUntil !== today) {
        // Show after a short delay for better UX
        const timer = setTimeout(() => setShow(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Trigger the full backup ZIP generation
      const res = await fetch("/api/backup/full");
      if (!res.ok) throw new Error("Backup generation failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `USC_Backup_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Mark as completed for this week
      const currentWeek = getCurrentWeekString();
      localStorage.setItem("lastBackupWeek", currentWeek);
      setShow(false);
    } catch (err) {
      console.error(err);
      alert("Failed to generate backup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemindLater = () => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("backupDismissedUntil", today); // Dismiss for today
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={handleRemindLater}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
        
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Weekly Safety Backup Recommended
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed px-4">
            For security, recovery, and institutional record safety, please download this week’s comprehensive backup. It includes all operational data.
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={handleDownload}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#800000] text-white py-3 rounded-xl font-semibold hover:bg-[#5c0000] shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {loading ? "Generating Backup (This may take a moment)..." : "Download Backup Now"}
            </button>
            <button
              onClick={handleRemindLater}
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Remind Me Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
