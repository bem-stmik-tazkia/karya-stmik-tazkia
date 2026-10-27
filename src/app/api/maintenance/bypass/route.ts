import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// POST /api/maintenance/bypass
// Dipanggil untuk membuka bypass maintenance
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { checkRateLimit } = await import("@/utils/rateLimit");
  
  // 1. Rate Limiter ketat: Maksimal 5 percobaan per menit per IP (Cegah Brute-force PIN)
  const { success, reset } = await checkRateLimit(`bypass-${ip}`, 5, 60000);
  if (!success) {
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Terlalu banyak percobaan bypass. Silakan tunggu 1 menit." },
      { 
        status: 429,
        headers: { "Retry-After": retryAfter.toString() }
      }
    );
  }

  const secret = process.env.MAINTENANCE_BYPASS_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Bypass not configured" }, { status: 500 });
  }

  // 2. Baca body jika ada PIN kiriman
  let providedPin: string | null = null;
  try {
    const body = await req.json();
    providedPin = body.pin || null;
  } catch {
    // Body kosong
  }

  // 3. Cek Otorisasi (Jalur 1: Cek apakah user adalah Admin yang login)
  let isAuthorized = false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: adminRecord } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminRecord) {
        isAuthorized = true;
      }
    }
  } catch {
    // Gagal cek auth
  }

  // Jalur 2: Cek apakah PIN yang dikirim cocok dengan rahasia server
  if (providedPin && providedPin === secret) {
    isAuthorized = true;
  }

  // 4. JIKA TIDAK LOLOS KEDUA JALUR: TOLAK DENGAN 403 FORBIDDEN!
  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Akses ditolak: Anda tidak memiliki izin atau PIN salah." },
      { status: 403 }
    );
  }

  // 5. JIKA LOLOS: Berikan kuki dengan proteksi httpOnly (Anti-XSS)
  const response = NextResponse.json({ success: true });
  response.cookies.set("maintenance_bypass", secret, {
    path: "/",
    maxAge: 60 * 60 * 8, // 8 jam
    httpOnly: true,       // 🛡️ AMAN: Tidak bisa dicuri lewat console browser
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

// DELETE /api/maintenance/bypass
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("maintenance_bypass");
  return response;
}