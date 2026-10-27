"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { sendTelegramNotification, escapeHtml } from "@/lib/telegram";

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
    updatePayload = {
      ...updatePayload,
      ...pendingEdits,
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

