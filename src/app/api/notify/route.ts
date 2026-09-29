import { NextRequest, NextResponse } from "next/server";
import { sendTelegramNotification } from "@/lib/telegram";
import { createClient } from "@/lib/supabase-server";
import { checkRateLimit } from "@/utils/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const clientId = user.id || ip;
    const { success, reset } = await checkRateLimit(`notify-${clientId}`, 5, 60000);
    if (!success) {
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return NextResponse.json({ error: "Too many requests" }, { 
        status: 429,
        headers: { "Retry-After": retryAfter.toString() }
      });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { z } = await import("zod");
    const schema = z.object({
      message: z.string().min(1).max(1000),
      type: z.string().max(50).optional(),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
    }
    const { message, type } = parsed.data;

    let icon = "🔔";
    if (type === "submission") icon = "🚀";
    if (type === "error") icon = "🚨";
    if (type === "info") icon = "ℹ️";

    await sendTelegramNotification(`${icon} <b>Pemberitahuan Sistem</b>\n\n${message}`);
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Gagal mengirim notifikasi:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
