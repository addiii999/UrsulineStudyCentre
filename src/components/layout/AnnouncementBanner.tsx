import { supabase } from "@/lib/supabase";
import { AlertTriangle, Info, Check, Calendar } from "lucide-react";

export const revalidate = 0;

export default async function AnnouncementBanner() {
  const today = new Date().toISOString().split("T")[0];
  
  const { data: announcementsData } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .gte("expires_at", today)
    .order("created_at", { ascending: false })
    .limit(3);

  const announcements = announcementsData ?? [];

  if (announcements.length === 0) return null;

  return (
    <div className="flex flex-col">
      {announcements.map((ann) => {
        let bgClass = "bg-blue-600";
        let icon = <Info size={16} className="text-white" />;
        
        if (ann.type === "success") {
          bgClass = "bg-[#27663b]";
          icon = <Check size={16} className="text-white" />;
        } else if (ann.type === "warning") {
          bgClass = "bg-[#d35400]";
          icon = <AlertTriangle size={16} className="text-white" />;
        }

        return (
          <div key={ann.id} className={`${bgClass} text-white px-4 py-2.5 text-center shadow-md relative z-40`}>
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium">
              <span className="flex items-center gap-2">
                {icon}
                <strong className="tracking-wide">{ann.title}</strong>
              </span>
              <span className="hidden sm:inline opacity-60">|</span>
              <span className="opacity-90">{ann.message}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
