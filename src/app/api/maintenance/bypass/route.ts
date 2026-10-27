import { NextResponse } from "next/server";

async function timingSafeCompare(a?: string | null, b?: string | null): Promise<boolean> {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  if (a.length > 512 || b.length > 512) {
    return false;
  }

  const encoder = new TextEncoder();
  const [hashA, hashB] = await Promise.all([
    globalThis.crypto.subtle.digest("SHA-256", encoder.encode(a)),
    globalThis.crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);

  const u8A = new Uint8Array(hashA);
  const u8B = new Uint8Array(hashB);

  let mismatch = (a.length ^ b.length) !== 0 ? 1 : 0;
  for (let i = 0; i < 32; i++) {
    mismatch |= u8A[i] ^ u8B[i];
  }

  return mismatch === 0;
}

// POST /api/maintenance/bypass
// Dipanggil setelah Konami Code dimasukkan di halaman maintenance
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { checkRateLimit } = await import("@/utils/rateLimit");

  // Rate Limiting: Maksimal 10 percobaan per menit per IP
  const { success, reset } = await checkRateLimit(`bypass-${ip}`, 10, 60000);
  if (!success) {
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Terlalu banyak permintaan bypass. Silakan tunggu sebentar." },
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

  // Verifikasi bahwa request berasal dari event Konami Code
  try {
    const body = await req.json();
    if (!(await timingSafeCompare(body.code, "konami-tazkia-unlocked"))) {
      return NextResponse.json({ error: "Invalid trigger" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Set kuki bypass dengan httpOnly (anti-XSS)
  const response = NextResponse.json({ success: true, message: "Konami Code Berhasil" });
  response.cookies.set("maintenance_bypass", secret, {
    path: "/",
    maxAge: 60 * 60 * 8, // 8 jam
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

// DELETE /api/maintenance/bypass
// Hapus bypass cookie (logout dari bypass)
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("maintenance_bypass");
  return response;
}
