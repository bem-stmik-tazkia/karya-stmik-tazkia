"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { sendTelegramNotification, escapeHtml } from "@/lib/telegram";
import { isSafeHttpUrl } from "@/lib/safeUrl";

/**
 * Field yang diizinkan dari pending_edits (ditulis mahasiswa dari browser).
 * Hanya field yang memang ada di form edit karya.
 * Field sensitif (status, user_id, views, likes, slug, ai_review_*, dll.) dibuang.
 */
const PENDING_EDITS_WHITELIST = [
  "title",
  "category",
  "description",
  "tech_stack",
  "github_url",
  "live_url",
  "image_url",
  "features",
  "team",
  "gallery",
] as const;

type PendingEditsWhitelistKey = (typeof PENDING_EDITS_WHITELIST)[number];

/**
 * Server Action: Menyetujui karya oleh Admin.
 * Verifikasi hak akses admin dilakukan sepenuhnya di sisi server.
 */
export async function adminApproveKarya(karyaId: string, pendingEdits?: any, karyaTitle?: string, authorUserId?: string) {
  const supabase = await createClient();

  // 1. Verifikasi Sesi Pengguna
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized: Silakan login terlebih dahulu." };
  }

  // 2. Verifikasi Role Admin di Database (Server-Side Check)
  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRecord) {
    return { success: false, error: "Forbidden: Hanya admin yang diizinkan menyetujui karya." };
  }

  // 3. Tangani Pengajuan Hapus jika ada
  if (pendingEdits && pendingEdits.type === "delete") {
    const { error: deleteError } = await supabase
      .from("karya")
      .delete()
      .eq("id", karyaId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    if (authorUserId) {
      await supabase.from("notifications").insert({
        user_id: authorUserId,
        title: "[HAPUS] Penghapusan Karya Disetujui",
        message: `Pengajuan hapus untuk karya "${karyaTitle || "Karya"}" telah disetujui oleh admin.`,
        karya_id: karyaId,
        type: "success",
      });
    }

    revalidatePath("/admin/karya");
    revalidatePath("/explore");
    revalidatePath("/");
    return { success: true, action: "deleted" };
  }

  // 4. Update Status Karya Menjadi Approved (Publik)
  let updatePayload: any = {
    status: "approved",
    reject_reason: null,
    pending_edits: null,
  };

  if (pendingEdits) {
    // pending_edits ditulis mahasiswa dari browser — isinya TIDAK tepercaya.
    // Ambil hanya field yang diizinkan (whitelist), buang sisanya.
    const safeEdits: Partial<Record<PendingEditsWhitelistKey, any>> = {};
    for (const key of PENDING_EDITS_WHITELIST) {
      if (key in pendingEdits) {
        safeEdits[key] = pendingEdits[key];
      }
    }

    // Validasi & trim URL fields
    const urlFields = ["github_url", "live_url", "image_url"] as const;
    for (const field of urlFields) {
      const val = safeEdits[field];
      if (val !== undefined && val !== null) {
        const trimmed = String(val).trim();
        if (trimmed === "") {
          safeEdits[field] = null; // izinkan pengosongan
        } else if (!isSafeHttpUrl(trimmed)) {
          return {
            success: false,
            error: `URL tidak aman pada field "${field}": ${trimmed}`,
          };
        } else {
          safeEdits[field] = trimmed;
        }
      }
    }

    // Validasi gallery (array of { url, caption })
    if (Array.isArray(safeEdits.gallery)) {
      for (const item of safeEdits.gallery) {
        const url = typeof item === "string" ? item : item?.url;
        if (url) {
          const trimmed = String(url).trim();
          if (trimmed && !isSafeHttpUrl(trimmed)) {
            return { success: false, error: `URL tidak aman di galeri: ${trimmed}` };
          }
        }
      }
    }

    // Validasi avatar & kontrol status keanggotaan di dalam team
    if (Array.isArray(safeEdits.team)) {
      // Ambil data karya saat ini untuk mengetahui anggota yang sah sudah accepted
      const { data: existingKarya } = await supabase
        .from("karya")
        .select("user_id, team")
        .eq("id", karyaId)
        .maybeSingle();

      const existingAcceptedUserIds = new Set<string>();
      if (existingKarya?.user_id) existingAcceptedUserIds.add(existingKarya.user_id);
      if (authorUserId) existingAcceptedUserIds.add(authorUserId);
      if (Array.isArray(existingKarya?.team)) {
        for (const m of existingKarya.team) {
          if (m?.user_id && m.status === "accepted") {
            existingAcceptedUserIds.add(m.user_id);
          }
        }
      }

      for (const member of safeEdits.team) {
        if (member?.avatar) {
          const trimmed = String(member.avatar).trim();
          if (trimmed && !isSafeHttpUrl(trimmed)) {
            return { success: false, error: `URL avatar tidak aman di tim: ${trimmed}` };
          }
          member.avatar = trimmed;
        }

        // KONTROL STATUS ANGGOTA TIM:
        // Anggota baru atau yang belum pernah accepted di DB TIDAK BOLEH menjadi 'accepted'
        // lewat pending_edits tanpa melalui persetujuan undangan kolaborasi (/api/collab).
        const isLegitAccepted = !!(member.user_id && existingAcceptedUserIds.has(member.user_id));
        if (!isLegitAccepted && member.status === "accepted") {
          member.status = "pending";
        }
      }
    }

    updatePayload = {
      ...updatePayload,
      ...safeEdits,
      pending_edits: null,
    };
  }

  const { error: updateError } = await supabase
    .from("karya")
    .update(updatePayload)
    .eq("id", karyaId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // 5. Kirim Notifikasi Dalam Aplikasi ke Mahasiswa
  if (authorUserId) {
    await supabase.from("notifications").insert({
      user_id: authorUserId,
      title: pendingEdits ? "[EDIT] Perubahan Karya Disetujui" : "Karya Disetujui! 🎉",
      message: pendingEdits
        ? `Perubahan untuk karya "${karyaTitle || "Karya"}" telah disetujui admin dan diperbarui ke publik.`
        : `Karya "${karyaTitle || "Karya"}" telah disetujui oleh admin dan kini dapat dilihat di galeri publik!`,
      karya_id: karyaId,
      type: "success",
    });
  }

  // 6. Notifikasi Telegram Admin
  sendTelegramNotification(
    `<b>Kurasi Karya Disetujui</b>\n\n📌 <b>Judul:</b> ${escapeHtml(karyaTitle || "Karya")}\n👤 <b>Admin:</b> ${user.email}\n✅ <b>Status:</b> Publik (Approved)`
  ).catch(() => {});

  revalidatePath("/admin/karya");
  revalidatePath("/explore");
  revalidatePath("/");
  return { success: true, action: "approved" };
}

/**
 * Server Action: Menolak karya oleh Admin dengan alasan penolakan wajib.
 */
export async function adminRejectKarya(
  karyaId: string,
  rejectReason: string,
  isEdit: boolean = false,
  karyaTitle?: string,
  authorUserId?: string
) {
  const supabase = await createClient();

  // 1. Verifikasi Sesi
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized: Silakan login terlebih dahulu." };
  }

  // 2. Verifikasi Role Admin di Server
  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRecord) {
    return { success: false, error: "Forbidden: Hanya admin yang diizinkan menolak karya." };
  }

  const cleanReason = (rejectReason || "").trim();
  if (!cleanReason) {
    return { success: false, error: "Alasan penolakan wajib diisi agar mahasiswa memahami perbaikan yang dibutuhkan." };
  }

  // 3. Tentukan Payload Penolakan
  let updatePayload: any = {
    status: "rejected",
    reject_reason: cleanReason,
  };

  if (isEdit) {
    // Jika penolakan pengajuan edit: pertahankan status approved versi sebelumnya, batalkan draft pending_edits
    updatePayload = {
      status: "approved",
      reject_reason: null,
      pending_edits: null,
    };
  }

  const { error: updateError } = await supabase
    .from("karya")
    .update(updatePayload)
    .eq("id", karyaId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // 4. Kirim Notifikasi Dalam Aplikasi ke Mahasiswa dengan Catatan Penolakan
  if (authorUserId) {
    await supabase.from("notifications").insert({
      user_id: authorUserId,
      title: isEdit ? "[EDIT] Pengajuan Edit Ditolak" : "Karya Perlu Revisi / Ditolak",
      message: isEdit
        ? `Pengajuan edit untuk karya "${karyaTitle || "Karya"}" ditolak oleh admin. Alasan: ${cleanReason}`
        : `Karya "${karyaTitle || "Karya"}" belum disetujui oleh admin. Catatan/Alasan: ${cleanReason}`,
      karya_id: karyaId,
      type: "error",
    });
  }

  // 5. Notifikasi Telegram Admin
  sendTelegramNotification(
    `<b>Kurasi Karya Ditolak</b>\n\n📌 <b>Judul:</b> ${escapeHtml(karyaTitle || "Karya")}\n👤 <b>Admin:</b> ${user.email}\n❌ <b>Keputusan:</b> Ditolak\n💬 <b>Alasan:</b>\n<i>${escapeHtml(cleanReason)}</i>`
  ).catch(() => {});

  revalidatePath("/admin/karya");
  return { success: true, action: "rejected" };
}

/**
 * Server Action: Hapus karya langsung oleh Admin.
 */
export async function adminDeleteKarya(karyaId: string, karyaTitle?: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRecord) {
    return { success: false, error: "Forbidden: Hanya admin yang diizinkan menghapus karya." };
  }

  const { error } = await supabase.from("karya").delete().eq("id", karyaId);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/karya");
  revalidatePath("/explore");
  revalidatePath("/");
  return { success: true, action: "deleted" };
}

