import { NextRequest, NextResponse } from "next/server";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const { message, type } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: "Pesan kosong" }, { status: 400 });
    }

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
