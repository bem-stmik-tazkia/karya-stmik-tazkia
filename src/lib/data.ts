import { supabase } from "@/lib/supabase";
import type { Karya, MahasiswaProfile, MahasiswaProject } from "@/types/karya";

// Re-export types for backward compatibility
export type { Karya, MahasiswaProfile, MahasiswaProject };

// ============================================================
// Karya (Projects) — from shared Supabase `karya` table
// ============================================================

/**
 * Fetch semua karya yang sudah approved, diurutkan dari terbaru.
 * @param category - Filter berdasarkan kategori (opsional). Gunakan nilai DB: "Technology", "Programming", "Research", "IoT", "Multimedia"
 * @param search - Filter berdasarkan kata kunci di title atau description (opsional)
 */
export async function getKarya(options?: {
  category?: string;
  search?: string;
}): Promise<Karya[]> {
  let query = supabase
    .from("karya")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (options?.category && options.category !== "All") {
    query = query.eq("category", options.category);
  }

  if (options?.search) {
    query = query.or(
      `title.ilike.%${options.search}%,description.ilike.%${options.search}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getKarya] Error:", error.message);
    return [];
  }
  return (data as Karya[]) ?? [];
}

/**
 * Fetch detail 1 karya berdasarkan ID.
 */
export async function getKaryaById(id: string): Promise<Karya | null> {
  const { data, error } = await supabase
    .from("karya")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (error) {
    console.error("[getKaryaById] Error:", error.message);
    return null;
  }
  return (data as Karya) ?? null;
}

/**
 * Tambah view ke karya (anti-spam 24 jam per device).
 * Memanggil RPC function yang sudah ada di Supabase BEM.
 */
export async function incrementKaryaView(karyaId: string, deviceId: string) {
  const { error } = await supabase.rpc("increment_karya_view", {
    p_karya_id: karyaId,
    p_device_id: deviceId,
  });
  if (error) console.error("[incrementKaryaView] Error:", error.message);
}

// ============================================================
// Mahasiswa Profiles — from shared Supabase `mahasiswa_profiles` table
// ============================================================

/**
 * Fetch semua profil mahasiswa.
 * @param featured - Jika true, hanya fetch mahasiswa yang is_featured = true
 */
export async function getMahasiswaProfiles(options?: {
  featured?: boolean;
  prodi?: string;
  angkatan?: number;
  limit?: number;
}): Promise<MahasiswaProfile[]> {
  let query = supabase
    .from("mahasiswa_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.featured) {
    query = query.eq("is_featured", true);
  }
  if (options?.prodi) {
    query = query.eq("prodi", options.prodi);
  }
  if (options?.angkatan) {
    query = query.eq("angkatan", options.angkatan);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getMahasiswaProfiles] Error:", error.message);
    return [];
  }
  return (data as MahasiswaProfile[]) ?? [];
}

/**
 * Fetch detail 1 profil mahasiswa berdasarkan ID.
 * Mencoba match dari kolom `id` dulu, lalu fallback ke `user_id`.
 */
export async function getMahasiswaById(id: string): Promise<MahasiswaProfile | null> {
  // Try matching by primary key `id` first
  const { data: byId, error: err1 } = await supabase
    .from("mahasiswa_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (err1) {
    console.error("[getMahasiswaById] Error (by id):", err1.message);
  }
  if (byId) return byId as MahasiswaProfile;

  // Fallback: try matching by `user_id` column (for auth users)
  const { data: byUserId, error: err2 } = await supabase
    .from("mahasiswa_profiles")
    .select("*")
    .eq("user_id", id)
    .maybeSingle();

  if (err2) {
    console.error("[getMahasiswaById] Error (by user_id):", err2.message);
  }
  return (byUserId as MahasiswaProfile) ?? null;
}

/**
 * Fetch proyek-proyek milik satu mahasiswa dari tabel karya (bukan mahasiswa_projects).
 */
export async function getMahasiswaProjects(mahasiswaId: string): Promise<Karya[]> {
  const { data, error } = await supabase
    .from("karya")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getMahasiswaProjects] Error:", error.message);
    return [];
  }

  // Filter in JS since querying JSONB array of objects in Supabase is tricky
  const allKarya = (data as Karya[]) || [];
  return allKarya.filter((k) => {
    // If they are the main creator
    if (k.user_id === mahasiswaId) return true;
    // Or if they are in the team array
    if (k.team && Array.isArray(k.team)) {
      return k.team.some((member) => member.user_id === mahasiswaId);
    }
    return false;
  });
}

// ============================================================
// Utility
// ============================================================
export function formatNumber(num: number | string): string {
  const n = typeof num === "string" ? parseInt(num) || 0 : num;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
