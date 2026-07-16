"use client";
import { useState, useEffect } from "react";
import { Phone, MessageCircle, CalendarCheck } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

const WA_PREFILL = encodeURIComponent(
  "Hi, I want to enquire about admission at Ursuline Study Centre."
);

export default function MobileActionBar() {
  const [settings, setSettings] = useState(SITE_CONFIG);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.settings && Object.keys(data.settings).length > 0) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      })
      .catch(console.error);
  }, []);
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="grid grid-cols-3 h-[62px]">
        {/* CALL */}
        <a
          href={`tel:${settings.phone}`}
          className="flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-[#800000] hover:bg-[#800000]/5 transition-colors active:bg-gray-100"
        >
          <div className="w-8 h-8 rounded-full bg-[#800000]/8 flex items-center justify-center">
            <Phone size={16} className="text-[#800000]" />
          </div>
          <span className="text-[10px] font-semibold text-gray-600 leading-none">Call Us</span>
        </a>

        {/* CENTER DIVIDER */}
        <div className="relative flex flex-col items-center justify-center">
          {/* left divider */}
          <div className="absolute left-0 top-2 bottom-2 w-px bg-gray-100" />
          {/* RIGHT DIVIDER */}
          <div className="absolute right-0 top-2 bottom-2 w-px bg-gray-100" />
          {/* BOOK COUNSELLING - PRIMARY */}
          <button
            onClick={scrollToContact}
            className="flex flex-col items-center justify-center gap-1 w-full h-full bg-[#C9A84C] hover:bg-[#A07830] active:bg-[#A07830] transition-colors"
          >
            <CalendarCheck size={18} className="text-white" />
            <span className="text-[10px] font-bold text-white leading-none">Book Free</span>
          </button>
        </div>

        {/* WHATSAPP */}
        <a
          href={`https://wa.me/${settings.whatsapp}?text=${WA_PREFILL}`}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-[#25D366] hover:bg-green-50 transition-colors active:bg-gray-100"
        >
          <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center">
            <MessageCircle size={16} className="text-[#25D366]" />
          </div>
          <span className="text-[10px] font-semibold text-gray-600 leading-none">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
