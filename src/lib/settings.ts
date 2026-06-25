import { supabase } from "@/lib/supabase";
import { SITE_CONFIG } from "./constants";

export async function getGlobalSettings() {
  console.log("=== getGlobalSettings: START FETCH ===");
  try {
    const { data, error } = await supabase.from("settings").select("*");
    console.log("=== getGlobalSettings: END FETCH ===", { count: data?.length, error });
    if (error) return SITE_CONFIG;

    const settingsObj = (data ?? []).reduce<Record<string, string>>((acc, row: { key: string; value: string }) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    return { ...SITE_CONFIG, ...settingsObj };
  } catch (err) {
    console.log("=== getGlobalSettings: CATCH ERROR ===", err);
    return SITE_CONFIG;
  }
}

