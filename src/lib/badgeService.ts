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
        let authUserId = grant.recipientId;
        try {
          const { data: prof } = await supabase
            .from("mahasiswa_profiles")
            .select("user_id")
            .or(`id.eq.${grant.recipientId},user_id.eq.${grant.recipientId}`)
            .maybeSingle();
          if (prof?.user_id) {
            authUserId = prof.user_id;
          }
        } catch {}

        const isSkin = grant.badgeId === 101 || (grant.badgeName || "").toLowerCase().includes("skin");
        const title = isSkin
          ? `Hak Akses Tema: ${grant.badgeName}`
          : `Lencana Kehormatan: ${grant.badgeName}`;

        let message = grant.note
          ? `Pesan Pengelola: "${grant.note}"`
          : isSkin
          ? `Pengelola STMIK Tazkia menganugerahkan hak akses tema ${grant.badgeName} untuk Anda.`
          : `Pengelola STMIK Tazkia menganugerahkan Lencana Kehormatan "${grant.badgeName}" untuk Anda.`;

        if (isSkin) {
          message += " (Membuka tema Skin Kartu di lemari tema kartu).";
        }

        await supabase.from("notifications").insert([
          {
            user_id: authUserId,
            type: "badge_granted",
            title,
            message,
            karya_id: String(grant.badgeId),
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
 * Admin mengirimkan penghargaan eksklusif ke BANYAK mahasiswa sekaligus
 */
export async function grantExclusiveBadgeBatch(
  grants: Array<Omit<ExclusiveBadgeGrant, "id" | "grantedAt" | "claimedBy">>
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!grants || grants.length === 0) {
      return { success: true, count: 0 };
    }

    const currentGrants = await getExclusiveBadgeGrants();
    const timestamp = new Date().toISOString();

    const newGrants: ExclusiveBadgeGrant[] = grants.map((g, idx) => ({
      ...g,
      id: `grant_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
      grantedAt: timestamp,
      claimedBy: [],
    }));

    const updated = [...newGrants, ...currentGrants];

    // Simpan ke system_settings
    const { error } = await supabase.from("system_settings").upsert({
      key: SETTINGS_KEY,
      value: JSON.stringify(updated),
    });

    if (error) {
      console.error("Failed to save grants to system_settings:", error);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("tazkia_exclusive_grants_cache", JSON.stringify(updated));
      window.dispatchEvent(new Event("tazkia_badges_updated"));
    }

    // Resolusi user_id penerima ke auth.users(id) agar notifikasi tersimpan valid
    const rawRecipientIds = Array.from(
      new Set(grants.map((g) => g.recipientId).filter(Boolean) as string[])
    );
    const userIdMap: Record<string, string> = {};

    if (rawRecipientIds.length > 0) {
      try {
        const { data: profs } = await supabase
          .from("mahasiswa_profiles")
          .select("id, user_id")
          .or(rawRecipientIds.map((id) => `id.eq.${id},user_id.eq.${id}`).join(","));

        (profs || []).forEach((p: any) => {
          if (p.id && p.user_id) userIdMap[p.id] = p.user_id;
          if (p.user_id) userIdMap[p.user_id] = p.user_id;
        });
      } catch {}
    }

    // Kirimkan notifikasi ke mahasiswa
    const notifRows = grants
      .filter((g) => !!g.recipientId)
      .map((g) => {
        const targetUserId = (g.recipientId && userIdMap[g.recipientId]) || g.recipientId;
        const isSkin = g.badgeId === 101 || (g.badgeName || "").toLowerCase().includes("skin");
        const title = isSkin
          ? `Hak Akses Tema: ${g.badgeName}`
          : `Lencana Kehormatan: ${g.badgeName}`;

        let message = g.note
          ? `Pesan Pengelola: "${g.note}"`
          : isSkin
          ? `Pengelola STMIK Tazkia menganugerahkan hak akses tema ${g.badgeName} untuk Anda.`
          : `Pengelola STMIK Tazkia menganugerahkan Lencana Kehormatan "${g.badgeName}" untuk Anda.`;

        if (isSkin) {
          message += " (Membuka tema Skin Kartu di lemari tema kartu).";
        }

        return {
          user_id: targetUserId,
          type: "badge_granted",
          title,
          message,
          karya_id: String(g.badgeId),
        };
      });

    if (notifRows.length > 0) {
      try {
        await supabase.from("notifications").insert(notifRows);
      } catch (notifErr) {
        console.warn("Could not insert notifications:", notifErr);
      }
    }

    return { success: true, count: newGrants.length };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      error: "Mohon maaf, terjadi kendala saat mengirimkan lencana. Silakan coba kembali sesaat lagi.",
    };
  }
}

/**
 * Admin membatalkan / menarik kembali penghargaan eksklusif dari mahasiswa
 */
export async function revokeExclusiveBadgeGrant(
  grantId: string,
  recipientId?: string,
  badgeId?: number,
  reason?: string
): Promise<boolean> {
  try {
    const currentGrants = await getExclusiveBadgeGrants();
    const grantToRevoke = currentGrants.find((g) => g.id === grantId);
    const updated = currentGrants.filter((g) => g.id !== grantId);

    await supabase
      .from("system_settings")
      .upsert({
        key: SETTINGS_KEY,
        value: JSON.stringify(updated),
      });

    const rawUserId = recipientId || grantToRevoke?.recipientId;
    const targetBadgeId = badgeId || grantToRevoke?.badgeId;
    const badgeName = grantToRevoke?.badgeName || "Penghargaan";
    const isSkin = targetBadgeId === 101 || (badgeName || "").toLowerCase().includes("skin");

    // Pastikan ID penerima adalah auth.users(id) agar notifikasi tersimpan valid
    let authUserId = rawUserId;
    if (rawUserId) {
      try {
        const { data: prof } = await supabase
          .from("mahasiswa_profiles")
          .select("user_id")
          .or(`id.eq.${rawUserId},user_id.eq.${rawUserId}`)
          .maybeSingle();
        if (prof?.user_id) {
          authUserId = prof.user_id;
        }
      } catch {}
    }

    // Kirimkan notifikasi resmi penarikan ke Kotak Pesan mahasiswa
    if (authUserId) {
      const title = isSkin
        ? `Pemberitahuan Penarikan Tema: ${badgeName}`
        : `Pemberitahuan Penarikan Lencana: ${badgeName}`;

      let message = isSkin
        ? `Hak akses tema "${badgeName}" telah dinonaktifkan oleh pengelola kampus.`
        : `Lencana Kehormatan "${badgeName}" telah ditarik kembali oleh pengelola kampus.`;

      if (reason && reason.trim()) {
        message += ` Catatan Pengelola: "${reason.trim()}".`;
      }

      try {
        await supabase.from("notifications").insert([
          {
            user_id: authUserId,
            type: "badge_revoked",
            title,
            message,
            karya_id: targetBadgeId ? String(targetBadgeId) : null,
          },
        ]);

        // Hapus notifikasi pemberian sebelumnya yang belum dibaca agar tidak membingungkan
        await supabase
          .from("notifications")
          .delete()
          .eq("user_id", authUserId)
          .eq("type", "badge_granted")
          .eq("karya_id", targetBadgeId ? String(targetBadgeId) : "101");
      } catch (notifErr) {
        console.warn("Could not insert revoke notification:", notifErr);
      }

      // Jika skin kartu yang ditarik, reset card_skin mahasiswa di database profil ke classic
      if (isSkin) {
        try {
          await supabase
            .from("mahasiswa_profiles")
            .update({ card_skin: "classic" })
            .eq("user_id", authUserId);
        } catch {}
      }
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("tazkia_exclusive_grants_cache", JSON.stringify(updated));

      // Bersihkan klaim lokal jika mahasiswa ada di browser ini
      if (authUserId && targetBadgeId) {
        try {
          const key = `tazkia_claimed_badges_${authUserId}`;
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const next = parsed.filter(
                (id: number | string) =>
                  Number(id) !== Number(targetBadgeId) &&
                  String(id) !== "bem2026" &&
                  String(id) !== "101"
              );
              localStorage.setItem(key, JSON.stringify(next));
            }
          }

          // Bersihkan status lencana terlihat
          const seenKey = `tazkia_seen_badges_${authUserId}`;
          const rawSeen = localStorage.getItem(seenKey);
          if (rawSeen) {
            const seenArr = JSON.parse(rawSeen);
            if (Array.isArray(seenArr)) {
              localStorage.setItem(
                seenKey,
                JSON.stringify(seenArr.filter((id: number) => Number(id) !== Number(targetBadgeId)))
              );
            }
          }

          // Jika skin ditarik dan sedang aktif, kembalikan ke classic
          if (isSkin) {
            const skinKey = `tazkia_profile_skin_${authUserId}`;
            localStorage.setItem(skinKey, "classic");
            localStorage.setItem("tazkia_profile_skin", "classic");
          }
        } catch {}
      }

      window.dispatchEvent(new Event("tazkia_badges_updated"));
      window.dispatchEvent(new Event("tazkia_skin_updated"));
      window.dispatchEvent(new Event("tazkia_profile_skin_updated"));
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
  let locallyClaimed: (number | string)[] = [];
  if (typeof window !== "undefined" && (userId || studentId)) {
    try {
      const raw = localStorage.getItem(`tazkia_claimed_badges_${userId || studentId}`);
      if (raw) locallyClaimed = JSON.parse(raw);
    } catch {}
  }

  const locallyClaimedStrs = locallyClaimed.map(String);

  return grants.filter((g) => {
    // Cocokkan penerima
    const matchesUser =
      (userId && g.recipientId === userId) ||
      (studentId && g.recipientId === studentId) ||
      (email && g.recipientEmail?.toLowerCase() === email.toLowerCase());

    if (!matchesUser) return false;

    // Pastikan belum diklaim di DB atau di lokal
    const isAlreadyClaimedInDB =
      (userId && g.claimedBy?.includes(userId)) ||
      (studentId && g.claimedBy?.includes(studentId));
    const isAlreadyClaimedLocally =
      locallyClaimedStrs.includes(String(g.badgeId)) ||
      (g.badgeId === 101 && locallyClaimedStrs.includes("bem2026"));

    return !isAlreadyClaimedInDB && !isAlreadyClaimedLocally;
  });
}

/**
 * Ambil daftar badge ID eksklusif yang SUDAH diklaim oleh user
 */
export function getClaimedExclusiveBadgeIds(userId?: string, studentId?: string): number[] {
  if (typeof window === "undefined" || (!userId && !studentId)) return [];

  const key = `tazkia_claimed_badges_${userId || studentId}`;
  const claimedSet = new Set<number>();

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.map(Number).filter((n) => !isNaN(n)).forEach((id) => claimedSet.add(id));
      }
    }
  } catch {}

  // Juga periksa apakah sudah tercatat diklaim di grants cache (claimedBy)
  try {
    const cachedRaw = localStorage.getItem("tazkia_exclusive_grants_cache");
    if (cachedRaw) {
      const grants: ExclusiveBadgeGrant[] = JSON.parse(cachedRaw);
      if (Array.isArray(grants)) {
        const activeExclusiveIds = new Set<number>();
        grants.forEach((g) => {
          const matches =
            (userId && g.recipientId === userId) ||
            (studentId && g.recipientId === studentId);
          if (matches) {
            activeExclusiveIds.add(Number(g.badgeId));
            const isClaimedInDB =
              (userId && g.claimedBy?.includes(userId)) ||
              (studentId && g.claimedBy?.includes(studentId));
            if (isClaimedInDB) {
              claimedSet.add(Number(g.badgeId));
            }
          }
        });

        // Filter: lencana eksklusif yang ditarik oleh admin tidak boleh masuk
        return Array.from(claimedSet).filter((bId) => {
          if ([14, 15, 16, 101].includes(bId)) {
            return activeExclusiveIds.has(bId);
          }
          return true;
        });
      }
    }
  } catch {}

  return Array.from(claimedSet);
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
    const badgeIdNum = Number(badgeId);
    const toAdd = [badgeIdNum];
    if (badgeIdNum === 101) {
      toAdd.push("bem2026" as any);
    }

    const next = Array.from(new Set([...current, ...toAdd]));
    localStorage.setItem(key, JSON.stringify(next));

    // Tandai juga sebagai seen agar tidak merah
    const seenKey = `tazkia_seen_badges_${userId}`;
    try {
      const rawSeen = localStorage.getItem(seenKey);
      const seenArr = rawSeen ? JSON.parse(rawSeen) : [];
      if (!seenArr.includes(badgeIdNum)) {
        localStorage.setItem(seenKey, JSON.stringify([...seenArr, badgeIdNum]));
      }
    } catch {}

    // Sinkronkan klaim ke server system_settings
    try {
      const grants = await getExclusiveBadgeGrants();
      let hasChanges = false;
      const updated = grants.map((g) => {
        const isMatch = grantId
          ? g.id === grantId
          : Number(g.badgeId) === badgeIdNum && g.recipientId === userId;

        if (isMatch) {
          const currentClaimed = g.claimedBy || [];
          if (!currentClaimed.includes(userId)) {
            hasChanges = true;
            return { ...g, claimedBy: [...currentClaimed, userId] };
          }
        }
        return g;
      });

      if (hasChanges) {
        await supabase.from("system_settings").upsert({
          key: SETTINGS_KEY,
          value: JSON.stringify(updated),
        });
        localStorage.setItem("tazkia_exclusive_grants_cache", JSON.stringify(updated));
      }
    } catch (err) {
      console.warn("Could not sync claim to server:", err);
    }

    window.dispatchEvent(new Event("tazkia_badges_updated"));
    window.dispatchEvent(new Event("tazkia_badges_viewed"));
    return true;
  } catch {
    return false;
  }
}

