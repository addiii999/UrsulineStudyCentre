"use client";
import { useState } from "react";
import { Pencil, Check, X, Settings, Phone, Mail, MessageCircle, MapPin, Play, Smartphone, ToggleLeft, ToggleRight } from "lucide-react";

interface SiteSettings {
  phone: string; phone2: string; email: string; whatsapp: string;
  address: string; mapsLink: string; playStoreLink: string; youtubeChannel: string;
  admissionsOpen: boolean;
}

const INIT: SiteSettings = {
  phone: "+91 95075 89503",
  phone2: "+91 62025 78886",
  email: "ursulinestudycentre@gmail.com",
  whatsapp: "919507589503",
  address: "Ursuline Convent Campus, Dr. Camil Bulcke Path, Ranchi",
  mapsLink: "https://maps.google.com",
  playStoreLink: "https://play.google.com/store/apps/details?id=com.vefytech.academicorigin",
  youtubeChannel: "https://youtube.com/@academicorigin",
  admissionsOpen: true,
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(INIT);
  const [editingField, setEditingField] = useState<keyof SiteSettings | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [saved, setSaved] = useState(false);

  const startEdit = (key: keyof SiteSettings) => {
    if (key === "admissionsOpen") return;
    setEditingField(key);
    setDraftValue(String(settings[key]));
  };
  const saveField = () => {
    if (!editingField) return;
    setSettings((p) => ({ ...p, [editingField]: draftValue }));
    setEditingField(null);
  };
  const saveAll = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const FIELDS: { key: keyof SiteSettings; label: string; icon: React.ReactNode; hint?: string }[] = [
    { key: "phone", label: "Primary Phone", icon: <Phone size={15} className="text-[#800000]" />, hint: "Format: +91 XXXXX XXXXX" },
    { key: "phone2", label: "Secondary Phone", icon: <Phone size={15} className="text-[#800000]" />, hint: "Second contact number" },
    { key: "email", label: "Email Address", icon: <Mail size={15} className="text-[#800000]" /> },
    { key: "whatsapp", label: "WhatsApp Number (with country code)", icon: <MessageCircle size={15} className="text-[#800000]" />, hint: "e.g. 919507589503 (no + or spaces)" },
    { key: "address", label: "Institute Address", icon: <MapPin size={15} className="text-[#800000]" /> },
    { key: "mapsLink", label: "Google Maps Link", icon: <MapPin size={15} className="text-[#800000]" />, hint: "Full Google Maps URL" },
    { key: "playStoreLink", label: "Play Store App Link", icon: <Smartphone size={15} className="text-[#800000]" />, hint: "Direct app download URL" },
    { key: "youtubeChannel", label: "YouTube Channel URL", icon: <Play size={15} className="text-[#800000]" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Website Settings</h2>
          <p className="text-gray-500 text-sm mt-0.5">Control all contact details and external links</p>
        </div>
        <button onClick={saveAll} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${saved ? "bg-green-500 text-white" : "bg-[#800000] text-white hover:bg-[#600000]"}`}>
          {saved ? <><Check size={16} /> Saved!</> : <><Settings size={16} /> Save Changes</>}
        </button>
      </div>

      {/* ADMISSIONS TOGGLE */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900 text-sm">Admission Status</p>
            <p className="text-gray-500 text-xs mt-0.5">Controls the "Admission Open / Closed" badge across the website</p>
          </div>
          <button
            onClick={() => setSettings((p) => ({ ...p, admissionsOpen: !p.admissionsOpen }))}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${settings.admissionsOpen ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}
          >
            {settings.admissionsOpen ? <><ToggleRight size={18} /> Admissions OPEN</> : <><ToggleLeft size={18} /> Admissions CLOSED</>}
          </button>
        </div>
      </div>

      {/* CONTACT FIELDS */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">Contact & Links</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {FIELDS.map((f) => (
            <div key={f.key} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#800000]/8 flex items-center justify-center flex-shrink-0 mt-0.5">{f.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{f.label}</p>
                    {editingField === f.key ? (
                      <div className="mt-2 flex gap-2">
                        <input
                          value={draftValue}
                          onChange={(e) => setDraftValue(e.target.value)}
                          autoFocus
                          className="flex-1 border-2 border-[#800000]/30 rounded-xl px-3 py-2 text-sm focus:border-[#800000] focus:outline-none"
                        />
                        <button onClick={saveField} className="p-2 bg-[#800000] text-white rounded-xl hover:bg-[#600000]"><Check size={14} /></button>
                        <button onClick={() => setEditingField(null)} className="p-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50"><X size={14} /></button>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{String(settings[f.key])}</p>
                    )}
                    {f.hint && editingField === f.key && <p className="text-xs text-gray-400 mt-1">{f.hint}</p>}
                  </div>
                </div>
                {editingField !== f.key && (
                  <button onClick={() => startEdit(f.key)} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-[#800000] transition-colors flex-shrink-0"><Pencil size={14} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        ⚠️ <strong>Note:</strong> Changes here update the admin view only. To permanently sync these to the live website, ask your developer to connect this to the database (Supabase key-value store).
      </div>
    </div>
  );
}
