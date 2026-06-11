import { supabase } from "@/lib/supabase/client";
import { SITE_CONFIG } from "@/config/constants";


export async function getGlobalSettings() {
  console.log("=== getGlobalSettings: START FETCH ===");
  try {
    const { data, error } = await supabase.from("settings").select("*");
    console.log("=== getGlobalSettings: END FETCH ===", { count: data?.length, error });
    if (error) return SITE_CONFIG;

    const settingsObj = (data ?? []).reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    return { ...SITE_CONFIG, ...settingsObj };
  } catch (err) {
    console.log("=== getGlobalSettings: CATCH ERROR ===", err);
    return SITE_CONFIG;
  }
}
