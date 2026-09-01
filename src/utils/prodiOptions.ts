import { supabase } from "@/lib/supabase";

export const ALL_PRODI_VALUE = "ALL";

export const PRODI_OPTIONS_DEFAULT = [
  { value: "Teknik Informatika", label: "Teknik Informatika" },
  { value: "Sistem Informasi", label: "Sistem Informasi" },
  { value: "Bisnis Digital", label: "Bisnis Digital" },
];

export const PRODI_FILTER_OPTIONS_DEFAULT = [
  { value: ALL_PRODI_VALUE, label: "Semua Prodi" },
  ...PRODI_OPTIONS_DEFAULT,
];

// Keep backward-compat exports (used in components as static fallback)
export const PRODI_OPTIONS = PRODI_OPTIONS_DEFAULT;
export const PRODI_FILTER_OPTIONS = PRODI_FILTER_OPTIONS_DEFAULT;

export function isAllProdi(value: string) {
  return value === ALL_PRODI_VALUE || value === "" || value.toLowerCase() === "semua prodi";
}

export function getProdiDisplayLabel(prodi: string) {
  if (!prodi || isAllProdi(prodi)) return "Semua Prodi";
  return prodi;
}

/** 
 * Fetch master prodi list from system_settings 
 * (same pattern as web BEM — shared DB).
 */
export async function fetchMasterProdiOptions(): Promise<{ value: string; label: string }[]> {
  try {
    const { data } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "master_prodi")
      .maybeSingle();

    if (data?.value) {
      const parsed: string[] = JSON.parse(data.value);
      if (parsed.length > 0) {
        return parsed.map((name) => ({ value: name, label: name }));
      }
    }
  } catch {
    // silently fallback
  }
  return PRODI_OPTIONS_DEFAULT;
}

/**
 * Fetch master angkatan list from system_settings.
 * Handles both:
 *   - Old format: ["1","2","3"]
 *   - New format: [{"value":"1","label":"Angkatan 1 (2024)"}]
 */
export async function fetchMasterAngkatanOptions(): Promise<{ value: string; label: string }[]> {
  const fallback = [
    { value: "1", label: "Angkatan 1" },
    { value: "2", label: "Angkatan 2" },
    { value: "3", label: "Angkatan 3" },
  ];

  try {
    const { data } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "master_angkatan")
      .maybeSingle();

    if (data?.value) {
      const parsed = JSON.parse(data.value);
      if (!Array.isArray(parsed) || parsed.length === 0) return fallback;

      // Old format: array of strings ["1","2"]
      if (typeof parsed[0] === "string") {
        return parsed.map((v: string) => ({ value: v, label: `Angkatan ${v}` }));
      }

      // New format: array of objects [{value:"1", label:"Angkatan 1 (2024)"}]
      return parsed as { value: string; label: string }[];
    }
  } catch {
    // silently fallback
  }
  return fallback;
}
