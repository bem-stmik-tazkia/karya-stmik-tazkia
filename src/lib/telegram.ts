import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pmrowiyvuqnxgzmlbfzx.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "placeholder-key"
);

function cleanTelegramText(text: string): string {
  return text
    .replace(/&ldquo;/gi, "“")
    .replace(/&rdquo;/gi, "”")
    .replace(/&lsquo;/gi, "‘")
    .replace(/&rsquo;/gi, "’")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&amp;/gi, "&");
}

export const escapeHtml = (unsafe: string | null | undefined): string => {
  if (!unsafe) return "";
  const cleaned = cleanTelegramText(String(unsafe));
  return cleaned
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

export interface TelegramNotificationData {
  type?:
    | "exclusive_badge_granted"
    | "exclusive_badge_revoked"
    | "reward_claimed"
    | "submission"
    | "admin_review"
    | "ai_review"
    | "karya_deleted"
    | "error"
    | "info"
    | string;
  title?: string;
  message?: string;
  rewardName?: string;
  category?: string;
  recipientName?: string;
  note?: string;
  karyaTitle?: string;
  authorName?: string;
  isEdit?: boolean;
  score?: number | string;
  status?: "approved" | "rejected" | string;
  reason?: string;
}

const DIVIDER = "━━━━━━━━━━━━━━━━━━━━━";

function getFormattedTimestamp(): string {
  try {
    return (
      new Date().toLocaleDateString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    );
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Memformat pesan Telegram dengan tampilan modern, elegan, dan terstruktur rapi.
 */
export function formatTelegramMessage(data: TelegramNotificationData | string): string {
  if (typeof data === "string") {
    return data;
  }

  let {
    type,
    title,
    message,
    rewardName,
    category,
    recipientName,
    note,
    karyaTitle,
    authorName,
    isEdit,
    score,
    status,
    reason,
  } = data;

  const timestamp = getFormattedTimestamp();

  // ─── PARSER OTOMATIS JIKA MESSAGE BERISI POLA LEGACY ───
  if (message) {
    // 1. Deteksi Approval Admin
    if (message.includes("Admin telah menyetujui")) {
      type = "admin_review";
      status = "approved";
      isEdit = message.includes("[EDIT]");
      const tMatch = message.match(/📌 <b>(.*?)<\/b>/i);
      if (tMatch) karyaTitle = tMatch[1];
    }
    // 2. Deteksi Rejection Admin
    else if (message.includes("Admin telah menolak")) {
      type = "admin_review";
      status = "rejected";
      isEdit = message.includes("[EDIT]");
      const tMatch = message.match(/📌 <b>(.*?)<\/b>/i);
      if (tMatch) karyaTitle = tMatch[1];
      const rMatch = message.match(/💬 Alasan:\s*(.*)/i);
      if (rMatch) reason = rMatch[1];
    }
    // 3. Deteksi Penghapusan Permanen
    else if (message.includes("Admin telah menghapus permanen")) {
      type = "karya_deleted";
      const tMatch = message.match(/📌 <b>(.*?)<\/b>/i);
      if (tMatch) karyaTitle = tMatch[1];
    }
    // 4. Deteksi Submission Karya
    else if (
      type === "submission" ||
      message.includes("mengajukan edit") ||
      message.includes("mengunggah karya baru")
    ) {
      type = "submission";
      isEdit = message.includes("[EDIT]") || message.toLowerCase().includes("edit");
      const tMatch =
        message.match(/📌 <b>Judul:<\/b>\s*(.*)/i) ||
        message.match(/📌 <b>(.*?)<\/b>/i);
      if (tMatch && !karyaTitle) karyaTitle = tMatch[1].replace(/<[^>]+>/g, "").trim();
      const cMatch = message.match(/📁 <b>Kategori:<\/b>\s*(.*)/i);
      if (cMatch && !category) category = cMatch[1].replace(/<[^>]+>/g, "").trim();
    }
  }

  // ─── 1. PENGANUGERAHAN PENGHARGAAN (Lencana / Skin Kartu) ───
  if (type === "exclusive_badge_granted") {
    const isSkin =
      (category || "").toLowerCase().includes("skin") ||
      (rewardName || "").toLowerCase().includes("skin");

    const header = isSkin
      ? "👑 <b>PEMBERIAN HAK AKSES TEMA KARTU 3D</b>"
      : "🎖️ <b>PENGANUGERAHAN LENCANA KEHORMATAN</b>";

    const lines = [
      header,
      DIVIDER,
      `🏆 <b>Penghargaan:</b> ${escapeHtml(rewardName || "Penghargaan Kampus")}`,
      `🏷️ <b>Kategori:</b> ${escapeHtml(category || (isSkin ? "Tema Kartu 3D" : "Lencana Kehormatan"))}`,
      `👤 <b>Penerima:</b> ${escapeHtml(recipientName || "Mahasiswa")}`,
    ];

    if (note && note.trim()) {
      lines.push(
        `💬 <b>Catatan Pengelola:</b>`,
        `<blockquote>“${escapeHtml(note.trim())}”</blockquote>`
      );
    }

    lines.push(
      `📅 <b>Waktu:</b> ${timestamp}`,
      DIVIDER,
      `<i>Karya STMIK Tazkia • Sistem Prestasi Mahasiswa</i>`
    );

    return lines.join("\n");
  }

  // ─── 2. PENARIKAN PENGHARGAAN (Lencana / Skin Kartu) ───
  if (type === "exclusive_badge_revoked") {
    const isSkin =
      (category || "").toLowerCase().includes("skin") ||
      (rewardName || "").toLowerCase().includes("skin");

    const lines = [
      "🔄 <b>PENARIKAN PENGHARGAAN KAMPUS</b>",
      DIVIDER,
      `🏆 <b>Penghargaan:</b> ${escapeHtml(rewardName || "Penghargaan Kampus")}`,
      `🏷️ <b>Kategori:</b> ${escapeHtml(category || (isSkin ? "Tema Kartu 3D" : "Lencana Kehormatan"))}`,
      `👤 <b>Mahasiswa:</b> ${escapeHtml(recipientName || "Mahasiswa")}`,
    ];

    if (note && note.trim()) {
      lines.push(
        `💬 <b>Catatan Pengelola:</b>`,
        `<blockquote>“${escapeHtml(note.trim())}”</blockquote>`
      );
    }

    lines.push(
      `⚠️ <b>Status:</b> ${isSkin ? "Hak akses tema dinonaktifkan (kembali ke Classic)" : "Lencana ditarik dari rak profil"}`,
      `📅 <b>Waktu:</b> ${timestamp}`,
      DIVIDER,
      `<i>Karya STMIK Tazkia • Administrasi Kampus</i>`
    );

    return lines.join("\n");
  }

  // ─── 3. MAHASISWA MENGKLAIM PENGHARGAAN ───
  if (type === "reward_claimed") {
    const isSkin =
      (category || "").toLowerCase().includes("skin") ||
      (rewardName || "").toLowerCase().includes("skin");

    const lines = [
      "✨ <b>PENGHARGAAN BERHASIL DIKLAIM</b>",
      DIVIDER,
      `🏆 <b>Penghargaan:</b> ${escapeHtml(rewardName || "Penghargaan")}`,
      `🏷️ <b>Kategori:</b> ${escapeHtml(category || (isSkin ? "Tema Kartu 3D" : "Lencana Kehormatan"))}`,
      `👤 <b>Mahasiswa:</b> ${escapeHtml(recipientName || "Mahasiswa")}`,
      `🎨 <b>Tindakan:</b> ${isSkin ? "Tema 3D langsung aktif di kartu profil" : "Lencana tersemat di rak profil"}`,
      `📅 <b>Waktu:</b> ${timestamp}`,
      DIVIDER,
      `<i>Karya STMIK Tazkia • Prestasi Mahasiswa</i>`,
    ];

    return lines.join("\n");
  }

  // ─── 4. PENGAJUAN KARYA BARU ATAU EDIT ───
  if (type === "submission") {
    const header = isEdit
      ? "✏️ <b>PENGAJUAN PERUBAHAN KARYA (EDIT)</b>"
      : "🚀 <b>PENGAJUAN KARYA BARU MAHASISWA</b>";

    const lines = [
      header,
      DIVIDER,
      `📌 <b>Judul:</b> ${escapeHtml(karyaTitle || "Karya Mahasiswa")}`,
      `📁 <b>Kategori:</b> ${escapeHtml(category || "Portofolio")}`,
    ];

    if (authorName) {
      lines.push(`👤 <b>Pengunggah:</b> ${escapeHtml(authorName)}`);
    }

    lines.push(
      `🤖 <b>Status:</b> Masuk antrean review AI`,
      `📅 <b>Waktu:</b> ${timestamp}`,
      DIVIDER,
      `<i>Karya STMIK Tazkia • Antrean Kurasi</i>`
    );

    return lines.join("\n");
  }

  // ─── 5. REVIEW HASIL AI ATAU ADMIN ───
  if (type === "admin_review" || type === "ai_review") {
    const isApproved =
      status === "approved" ||
      status === "DITERIMA" ||
      status === "DITERIMA (Publik)";

    const header = isApproved
      ? "✅ <b>KARYA MAHASISWA DISETUJUI &amp; PUBLIK</b>"
      : "❌ <b>KARYA MAHASISWA DITOLAK</b>";

    const lines = [
      header,
      DIVIDER,
      `📌 <b>Judul:</b> ${escapeHtml(karyaTitle || "Karya Mahasiswa")}`,
      `📁 <b>Kategori:</b> ${escapeHtml(category || "Portofolio")}`,
    ];

    if (score !== undefined && score !== null) {
      lines.push(`⭐ <b>Skor Review:</b> ${score}/100`);
    }

    lines.push(
      `🎯 <b>Status:</b> ${isApproved ? "Diterbitkan ke Galeri Portofolio" : "Ditolak / Perlu Perbaikan"}`
    );

    if (reason && reason.trim()) {
      lines.push(
        `💬 <b>Catatan Review:</b>`,
        `<blockquote>“${escapeHtml(reason.trim())}”</blockquote>`
      );
    }

    lines.push(
      `📅 <b>Waktu:</b> ${timestamp}`,
      DIVIDER,
      `<i>Karya STMIK Tazkia • Kurasi Karya</i>`
    );

    return lines.join("\n");
  }

  // ─── 6. PENGHAPUSAN KARYA ───
  if (type === "karya_deleted") {
    const lines = [
      "🗑️ <b>PENGHAPUSAN KARYA MAHASISWA</b>",
      DIVIDER,
      `📌 <b>Judul:</b> ${escapeHtml(karyaTitle || "Karya Mahasiswa")}`,
      `⚠️ <b>Aksi:</b> Dihapus permanen dari sistem oleh Admin`,
      `📅 <b>Waktu:</b> ${timestamp}`,
      DIVIDER,
      `<i>Karya STMIK Tazkia • Manajemen Konten</i>`,
    ];

    return lines.join("\n");
  }

  // ─── 7. GENERIC / FALLBACK MESSAGE ───
  const headerIcon =
    type === "error" ? "⚠️" : type === "submission" ? "📄" : "🔔";
  const headerTitle = title || "PEMBERITAHUAN SISTEM";

  // Bersihkan tag mentah seperti [BARU], [EDIT], [HAPUS] dari pesan jika ada
  let cleanMessage = message || "";
  cleanMessage = cleanMessage
    .replace(/^\[(BARU|EDIT|HAPUS)\]\s*/i, "")
    .trim();

  return [
    `${headerIcon} <b>${escapeHtml(headerTitle)}</b>`,
    DIVIDER,
    cleanMessage,
    DIVIDER,
    `📅 <i>${timestamp} • Karya STMIK Tazkia</i>`,
  ].join("\n");
}

export const sendTelegramNotification = async (
  payload: string | TelegramNotificationData
) => {
  let token = process.env.TELEGRAM_BOT_TOKEN;
  let chatId = process.env.TELEGRAM_CHAT_ID;

  try {
    const { data } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", ["telegram_bot_token", "telegram_chat_id"]);

    if (data) {
      const dbToken = data.find((d) => d.key === "telegram_bot_token")?.value;
      const dbChatId = data.find((d) => d.key === "telegram_chat_id")?.value;
      if (dbToken && dbToken !== "null" && dbToken.trim() !== "") token = dbToken;
      if (dbChatId && dbChatId !== "null" && dbChatId.trim() !== "") chatId = dbChatId;
    }
  } catch (e) {
    console.error("Gagal mengambil setting telegram dari DB:", e);
  }

  if (!token || !chatId) {
    console.warn("Telegram Bot Token atau Chat ID belum diset.");
    return;
  }

  const formattedMessage =
    typeof payload === "string" ? payload : formatTelegramMessage(payload);

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedMessage,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      console.error("Gagal mengirim Telegram", await response.text());
    }
  } catch (error) {
    console.error("Telegram error:", error);
  }
};
