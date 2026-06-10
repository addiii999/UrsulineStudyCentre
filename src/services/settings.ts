import { supabase } from "@/lib/supabase/client";
import { SITE_CONFIG } from "@/config/constants";

export const revalidate = 0;

export async function getGlobalSettings() {
  try {
    const { data, error } = await supabase.from("settings").select("*");
    if (error) return SITE_CONFIG;

    const settingsObj = (data ?? []).reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    return { ...SITE_CONFIG, ...settingsObj };
  } catch {
    return SITE_CONFIG;
  }
}
