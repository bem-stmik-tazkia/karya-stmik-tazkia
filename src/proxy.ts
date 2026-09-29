import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.nextUrl.hostname;

  // ─── 1. LOCALHOST / DEVELOPMENT BYPASS ────────────────────────────────────
  // Di local development, maintenance mode TIDAK berlaku sama sekali.
  // Halaman /maintenance tetap bisa dibuka untuk testing UI.
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    process.env.NODE_ENV === "development";

  if (isLocalhost) {
    return NextResponse.next();
  }

  // ─── 2. SELALU IZINKAN JALUR PENTING ──────────────────────────────────────
  const isAdminOrApi =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    pathname.startsWith("/icon");

  if (isAdminOrApi) {
    return NextResponse.next();
  }

  // ─── 3. AMBIL STATUS MAINTENANCE LANGSUNG DARI DB ─────────────────────────
  // Kita harus mengecek database karena pengunjung baru tidak memiliki cookie `maintenance_mode`.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let isMaintenanceActive = false;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/system_settings?key=eq.maintenance_mode&select=value`, {
      headers: {
        "apikey": supabaseKey || "",
        "Authorization": `Bearer ${supabaseKey || ""}`
      },
      // Cache response untuk 30 detik agar tidak membebani database
      next: { revalidate: 30 } 
    });
    const data = await res.json();
    if (data && data.length > 0 && data[0].value === "true") {
      isMaintenanceActive = true;
    }
  } catch (error) {
    // Abaikan jika error
  }

  // ─── 4. CEK BYPASS COOKIE (KONAMI CODE) ───────────────────────────────────
  const bypassCookie = request.cookies.get("maintenance_bypass");
  const bypassSecret = process.env.MAINTENANCE_BYPASS_SECRET;

  if (bypassSecret && bypassCookie?.value === bypassSecret) {
    return NextResponse.next();
  }

  // ─── 5. SEMBUNYIKAN /maintenance SAAT MODE TIDAK AKTIF ────────────────────
  if (pathname.startsWith("/maintenance")) {
    if (!isMaintenanceActive) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Mode aktif → biarkan akses /maintenance
    return NextResponse.next();
  }

  // ─── 6. REDIRECT KE MAINTENANCE JIKA MODE AKTIF ───────────────────────────
  if (isMaintenanceActive) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match semua route kecuali file statis
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon.svg).*)",
  ],
};
