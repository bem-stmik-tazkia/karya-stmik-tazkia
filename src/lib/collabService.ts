import { supabase } from "@/lib/supabase";

export interface CollabMember {
  name: string;
  role: string;
  avatar?: string;
  user_id?: string;
  status?: "pending" | "accepted" | "rejected";
}

export interface CollabRequest {
  id: string;
  karyaId: string;
  karyaTitle: string;
  inviterUserId: string;
  inviterName: string;
  recipientUserId: string;
  recipientName?: string;
  role?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  respondedAt?: string;
}

const SETTINGS_KEY = "collab_requests";
const CACHE_KEY = "tazkia_collab_requests_cache";

/**
 * Mengambil semua data permintaan kolaborasi dari system_settings / cache
 */
export async function getCollabRequests(): Promise<CollabRequest[]> {
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
          localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch collab requests:", err);
  }

  // Fallback cache
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
  }

  return [];
}

/**
 * Ambil daftar permintaan kolaborasi yang masih PENDING untuk user tertentu
 */
export async function getPendingCollabRequestsForUser(userId?: string): Promise<CollabRequest[]> {
  if (!userId) return [];
  const all = await getCollabRequests();
  return all.filter((r) => r.recipientUserId === userId && r.status === "pending");
}

/**
 * Mengirim permintaan kolaborasi ke mahasiswa
 */
export async function sendCollabRequest(data: {
  karyaId: string;
  karyaTitle: string;
  inviterUserId: string;
  inviterName: string;
  recipientUserId: string;
  recipientName?: string;
  role?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/collab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send",
        ...data,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Gagal mengirim permintaan kolaborasi");
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("tazkia_collab_updated"));
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Gagal mengirim permintaan kolaborasi" };
  }
}

/**
 * Merespons permintaan kolaborasi (Terima / Tolak)
 */
export async function respondCollabRequest(params: {
  requestId?: string;
  karyaId: string;
  action: "accept" | "reject";
  responderUserId: string;
  responderName?: string;
  notificationId?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/collab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: "respond",
        responseAction: params.action,
        requestId: params.requestId,
        karyaId: params.karyaId,
        responderUserId: params.responderUserId,
        responderName: params.responderName,
        notificationId: params.notificationId,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Gagal merespons kolaborasi");
    }

    // Refresh local cache and trigger UI events
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("tazkia_collab_updated"));
      window.dispatchEvent(new Event("tazkia_badges_updated"));
      window.dispatchEvent(new Event("storage"));
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Gagal merespons kolaborasi" };
  }
}
