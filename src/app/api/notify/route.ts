import { NextRequest, NextResponse } from "next/server";
import { sendTelegramNotification, formatTelegramMessage } from "@/lib/telegram";
import { createClient } from "@/lib/supabase-server";
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
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    // Format pesan Telegram secara terstruktur dan estetik
    const formatted = formatTelegramMessage(payload);
    await sendTelegramNotification(formatted);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Gagal mengirim notifikasi Telegram:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
