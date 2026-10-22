import { supabase } from "@/lib/supabase";

export interface ExclusiveBadgeGrant {
  id: string;
  badgeId: number;
  badgeName: string;
  recipientId?: string;
  recipientName?: string;
  recipientEmail?: string;
  note?: string;
  grantedAt: string;
  claimedBy: string[]; // user_ids or student IDs who have claimed this
}

const SETTINGS_KEY = "exclusive_badges_grants";

/**
 * Mengambil semua grant penghargaan eksklusif dari system_settings (dengan fallback localStorage)
 */
export async function getExclusiveBadgeGrants(): Promise<ExclusiveBadgeGrant[]> {
  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();

    if (!error && data?.value) {
      const parsed = JSON.parse(data.value);
      if (Array.isArray(parsed)) {
        if (typeof window !== "undefined") {
          localStorage.setItem("tazkia_exclusive_grants_cache", JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error fetching exclusive badge grants:", err);
  }

  // Fallback ke localStorage
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("tazkia_exclusive_grants_cache");
      if (cached) return JSON.parse(cached);
    } catch {}
  }

  return [];
}

/**
 * Admin mengirimkan penghargaan eksklusif ke mahasiswa
 */
export async function grantExclusiveBadge(grant: Omit<ExclusiveBadgeGrant, "id" | "grantedAt" | "claimedBy">): Promise<{ success: boolean; error?: string }> {
  try {
    const currentGrants = await getExclusiveBadgeGrants();
    
    const newGrant: ExclusiveBadgeGrant = {
      ...grant,
      id: `grant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      grantedAt: new Date().toISOString(),
      claimedBy: [],
    };

    const updated = [newGrant, ...currentGrants];

    // Simpan ke system_settings
    const { error } = await supabase
      .from("system_settings")
      .upsert({
        key: SETTINGS_KEY,
        value: JSON.stringify(updated),
      });

    if (error) {
      console.error("Failed to save grant to system_settings:", error);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("tazkia_exclusive_grants_cache", JSON.stringify(updated));
      window.dispatchEvent(new Event("tazkia_badges_updated"));
    }

    // Jika ada recipientId (user_id), buat notifikasi di public.notifications
    if (grant.recipientId) {
      try {
        await supabase.from("notifications").insert([
          {
            user_id: grant.recipientId,
            type: "info",
            title: `👑 Lencana Kehormatan: ${grant.badgeName}`,
            message: `Admin telah mengirimkan Lencana Eksklusif "${grant.badgeName}" untuk Anda! Buka menu Profil di dashboard untuk mengklaim lencana ini.`,
          },
        ]);
      } catch (notifErr) {
        console.warn("Could not insert notification row:", notifErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Gagal mengirim lencana" };
  }
}

/**
 * Admin membatalkan / mencabut grant penghargaan eksklusif
 */
export async function revokeExclusiveBadgeGrant(grantId: string): Promise<boolean> {
  try {
    const currentGrants = await getExclusiveBadgeGrants();
    const updated = currentGrants.filter((g) => g.id !== grantId);

    await supabase
      .from("system_settings")
      .upsert({
        key: SETTINGS_KEY,
        value: JSON.stringify(updated),
      });

    if (typeof window !== "undefined") {
      localStorage.setItem("tazkia_exclusive_grants_cache", JSON.stringify(updated));
      window.dispatchEvent(new Event("tazkia_badges_updated"));
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Cek lencana eksklusif yang dikirim admin ke user tertentu tapi belum diklaim
 */
export function getClaimableGrantsForUser(
  grants: ExclusiveBadgeGrant[],
  userIdentities: { userId?: string; email?: string; studentId?: string }
): ExclusiveBadgeGrant[] {
  const { userId, email, studentId } = userIdentities;

  // Lencana yang sudah diklaim secara lokal
  let locallyClaimed: number[] = [];
  if (typeof window !== "undefined" && (userId || studentId)) {
    try {
      const raw = localStorage.getItem(`tazkia_claimed_badges_${userId || studentId}`);
      if (raw) locallyClaimed = JSON.parse(raw);
    } catch {}
  }

  return grants.filter((g) => {
    // Cocokkan penerima
    const matchesUser =
      (userId && g.recipientId === userId) ||
      (studentId && g.recipientId === studentId) ||
      (email && g.recipientEmail?.toLowerCase() === email.toLowerCase());

    if (!matchesUser) return false;

    // Pastikan belum diklaim
    const isAlreadyClaimedInDB = userId && g.claimedBy?.includes(userId);
    const isAlreadyClaimedLocally = locallyClaimed.includes(g.badgeId);

    return !isAlreadyClaimedInDB && !isAlreadyClaimedLocally;
  });
}

/**
 * Ambil daftar badge ID eksklusif yang SUDAH diklaim oleh user
 */
export function getClaimedExclusiveBadgeIds(userId?: string, studentId?: string): number[] {
  if (typeof window === "undefined" || (!userId && !studentId)) return [];

  const key = `tazkia_claimed_badges_${userId || studentId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(Number);
    }
  } catch {}

  return [];
}

/**
 * User mengklaim penghargaan eksklusif yang diberikan oleh Admin
 */
export async function claimExclusiveBadge(
  badgeId: number,
  userId: string,
  grantId?: string
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const key = `tazkia_claimed_badges_${userId}`;
  try {
    const current = getClaimedExclusiveBadgeIds(userId);
    if (!current.includes(badgeId)) {
      const next = [...current, badgeId];
      localStorage.setItem(key, JSON.stringify(next));
    }

    // Tandai juga sebagai seen agar tidak merah
    const seenKey = `tazkia_seen_badges_${userId}`;
    try {
      const rawSeen = localStorage.getItem(seenKey);
      const seenArr = rawSeen ? JSON.parse(rawSeen) : [];
      if (!seenArr.includes(badgeId)) {
        localStorage.setItem(seenKey, JSON.stringify([...seenArr, badgeId]));
      }
    } catch {}

    // Update grant di server jika ada grantId
    if (grantId) {
      try {
        const grants = await getExclusiveBadgeGrants();
        const updated = grants.map((g) => {
          if (g.id === grantId) {
            const currentClaimed = g.claimedBy || [];
            if (!currentClaimed.includes(userId)) {
              return { ...g, claimedBy: [...currentClaimed, userId] };
            }
          }
          return g;
        });

        await supabase.from("system_settings").upsert({
          key: SETTINGS_KEY,
          value: JSON.stringify(updated),
        });
      } catch (err) {
        console.warn("Could not sync claim to server:", err);
      }
    }

    window.dispatchEvent(new Event("tazkia_badges_updated"));
    window.dispatchEvent(new Event("tazkia_badges_viewed"));
    return true;
  } catch {
    return false;
  }
}

