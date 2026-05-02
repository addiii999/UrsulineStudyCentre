import { SITE_CONFIG } from "@/lib/constants";
import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp() {
  return (
    <a
      href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=Hello! I'm interested in admission at Ursuline Study Centre.`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 animate-pulse-ring"
    >
      <MessageCircle size={26} className="text-white" fill="white" />
    </a>
  );
}
