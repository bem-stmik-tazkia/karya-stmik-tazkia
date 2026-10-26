import { NextRequest, NextResponse } from "next/server";
import { sendTelegramNotification, formatTelegramMessage } from "@/lib/telegram";
import { createClient, supabaseAdmin } from "@/lib/supabase-server";
import { checkRateLimit } from "@/utils/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const clientId = user.id || ip;
    const { success, reset } = await checkRateLimit(`notify-${clientId}`, 10, 60000);
    if (!success) {
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": retryAfter.toString() },
        }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { z } = await import("zod");
    const schema = z.object({
      type: z.string().max(50).optional(),
      message: z.string().max(3000).optional(),
      title: z.string().max(200).optional(),
      rewardName: z.string().max(200).optional(),
      category: z.string().max(100).optional(),
      recipientName: z.string().max(200).optional(),
      note: z.string().max(2000).optional(),
      karyaTitle: z.string().max(250).optional(),
      authorName: z.string().max(200).optional(),
      isEdit: z.boolean().optional(),
      score: z.union([z.number(), z.string()]).optional(),
      status: z.string().max(50).optional(),
      reason: z.string().max(2000).optional(),
      recipientId: z.string().max(100).optional(),
      recipientIds: z.array(z.string().max(100)).optional(),
      badgeId: z.union([z.number(), z.string()]).optional(),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const dbClient = supabaseAdmin || supabase;

    // A. Sinkronisasi DB untuk PENARIKAN Lencana/Skin (Menggunakan Service Role agar lolos Supabase RLS)
    if (payload.type === "exclusive_badge_revoked" && payload.recipientId) {
      try {
        let authUserId = payload.recipientId;
        const { data: prof } = await dbClient
          .from("mahasiswa_profiles")
          .select("id, user_id")
          .or(`id.eq.${payload.recipientId},user_id.eq.${payload.recipientId}`)
          .maybeSingle();

        if (prof?.user_id) {
          authUserId = prof.user_id;
        }

        const isSkin =
          Number(payload.badgeId) === 101 ||
          (payload.rewardName || "").toLowerCase().includes("skin") ||
          (payload.category || "").toLowerCase().includes("skin");

        const targetBadgeId = payload.badgeId ? Number(payload.badgeId) : isSkin ? 101 : 15;

        const notifTitle = isSkin
          ? `Pemberitahuan Penarikan Tema: ${payload.rewardName || "Tema Kartu"}`
          : `Pemberitahuan Penarikan Lencana: ${payload.rewardName || "Lencana Kehormatan"}`;

        let notifMessage = isSkin
          ? `Hak akses tema "${payload.rewardName || "Tema Kartu"}" telah ditarik kembali oleh pengelola kampus.`
          : `Lencana Kehormatan "${payload.rewardName || "Lencana Kehormatan"}" telah ditarik kembali oleh pengelola kampus.`;

        if (payload.note && payload.note.trim()) {
          notifMessage += ` Catatan Pengelola: "${payload.note.trim()}".`;
        }

        // 1. Masukkan notifikasi penarikan ke notifications
        await dbClient.from("notifications").insert([
          {
            user_id: authUserId,
            type: "badge_revoked",
            title: notifTitle,
            message: notifMessage,
            karya_id: String(targetBadgeId),
          },
        ]);

        // 2. Hapus notifikasi pemberian sebelumnya agar tombol klaim tidak tertinggal
        await dbClient
          .from("notifications")
          .delete()
          .eq("user_id", authUserId)
          .eq("type", "badge_granted")
          .eq("karya_id", String(targetBadgeId));

        // 3. Jika skin yang ditarik, reset card_skin mahasiswa di DB ke classic
        if (isSkin && prof?.id) {
          await dbClient
            .from("mahasiswa_profiles")
            .update({ card_skin: "classic" })
            .eq("id", prof.id);
        }
      } catch (err) {
        console.warn("Could not insert revoke notification via admin:", err);
      }
    }

    // B. Sinkronisasi DB untuk PEMBERIAN Lencana/Skin
    if (
      payload.type === "exclusive_badge_granted" &&
      payload.recipientIds &&
      Array.isArray(payload.recipientIds) &&
      payload.recipientIds.length > 0
    ) {
      try {
        const rawIds = payload.recipientIds;
        const { data: profs } = await dbClient
          .from("mahasiswa_profiles")
          .select("id, user_id")
          .or(rawIds.map((id) => `id.eq.${id},user_id.eq.${id}`).join(","));

        const userIdMap: Record<string, string> = {};
        (profs || []).forEach((p: any) => {
          if (p.id && p.user_id) userIdMap[p.id] = p.user_id;
          if (p.user_id) userIdMap[p.user_id] = p.user_id;
        });

        const isSkin =
          Number(payload.badgeId) === 101 ||
          (payload.rewardName || "").toLowerCase().includes("skin") ||
          (payload.category || "").toLowerCase().includes("skin");

        const targetBadgeId = payload.badgeId ? Number(payload.badgeId) : isSkin ? 101 : 15;

        const notifTitle = isSkin
          ? `Hak Akses Tema: ${payload.rewardName || "Tema Kartu 3D"}`
          : `Lencana Kehormatan: ${payload.rewardName || "Lencana Kehormatan"}`;

        let notifMessage = payload.note
          ? `Pesan Pengelola: "${payload.note}"`
          : isSkin
          ? `Pengelola STMIK Tazkia menganugerahkan hak akses tema ${payload.rewardName} untuk Anda.`
          : `Pengelola STMIK Tazkia menganugerahkan Lencana Kehormatan "${payload.rewardName}" untuk Anda.`;

        if (isSkin) {
          notifMessage += " (Membuka tema Skin Kartu di lemari tema kartu).";
        }

        const notifRows = rawIds.map((targetId) => ({
          user_id: userIdMap[targetId] || targetId,
          type: "badge_granted",
          title: notifTitle,
          message: notifMessage,
          karya_id: String(targetBadgeId),
        }));

        await dbClient.from("notifications").insert(notifRows);
      } catch (err) {
        console.warn("Could not insert grant notifications via admin:", err);
      }
    }

    // Format pesan Telegram secara terstruktur dan estetik
    const formatted = formatTelegramMessage(payload);
    await sendTelegramNotification(formatted);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Gagal mengirim notifikasi Telegram:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
