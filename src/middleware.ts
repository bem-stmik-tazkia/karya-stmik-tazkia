import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Constant-time string comparison menggunakan cryptographic hash SHA-256 (Web Crypto API).
 * Menghilangkan celah timing attack dan kebocoran panjang secret (length leakage):
 * Berapapun panjang string yang dikirim oleh penyerang, kedua string di-hash menjadi
 * tepat 32 bytes (256 bits), dan perbandingan byte dijamin selalu berputar persis 32 kali.
 */
async function timingSafeCompare(a?: string | null, b?: string | null): Promise<boolean> {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  // Batasi panjang input wajar untuk mencegah payload abuse
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── 1. LOCALHOST BYPASS OPSIONAL ─────────────────────────────────────────
  // Jika ingin bypass khusus di development, set BYPASS_LOCAL_MAINTENANCE=true di .env.local
  if (process.env.BYPASS_LOCAL_MAINTENANCE === "true") {
    return NextResponse.next();
  }

  // ─── 2. SELALU IZINKAN FILE STATIS, ASSET, AUTH CALLBACK, & API MAINTENANCE
  const isStaticOrSystem =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/api/maintenance") ||
    pathname.startsWith("/auth/callback");

  if (isStaticOrSystem) {
    return NextResponse.next();
  }

  // ─── 3. AMBIL STATUS MAINTENANCE DARI DATABASE ─────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let isMaintenanceActive = false;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/system_settings?key=eq.maintenance_mode&select=value`, {
      headers: {
        "apikey": supabaseKey || "",
        "Authorization": `Bearer ${supabaseKey || ""}`
      },
      // Revalidate 10 detik agar pergantian status maintenance cepat terdeteksi
      next: { revalidate: 10 } 
    });
    const data = await res.json();
    if (data && data.length > 0 && data[0].value === "true") {
      isMaintenanceActive = true;
    }
  } catch (error) {
    // Abaikan jika error
  }

  // ─── 4. JIKA MODE MAINTENANCE TIDAK AKTIF ─────────────────────────────────
  if (!isMaintenanceActive) {
    // Sembunyikan halaman /maintenance jika maintenance sudah selesai
    if (pathname.startsWith("/maintenance")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ─── 5. MAINTENANCE AKTIF: VERIFIKASI SESI ADMIN DI SERVER ────────────────
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  let isAdmin = false;

  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: adminRecord } = await supabase
          .from("admin_users")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (adminRecord) {
          isAdmin = true;
        }
      }
    } catch {
      // Sesi tidak valid atau koneksi auth gagal
      isAdmin = false;
    }
  }

  // Jika user terbukti memiliki sesi Admin yang sah di Supabase:
  if (isAdmin) {
    // Admin bebas mengakses seluruh route website saat maintenance
    return response;
  }

  // ─── 6. BUKAN ADMIN: CEK KONAMI CODE BYPASS KHUSUS HALAMAN LOGIN ──────────
  const bypassCookie = request.cookies.get("maintenance_bypass")?.value;
  const bypassSecret = process.env.MAINTENANCE_BYPASS_SECRET;
  const isKonamiUnlocked = await timingSafeCompare(bypassCookie, bypassSecret);

  // Jika pengguna telah membuka Konami Code, izinkan mengakses form /login untuk masuk sebagai admin
  if (isKonamiUnlocked && pathname.startsWith("/login")) {
    return response;
  }

  // Halaman /maintenance tetap bisa diakses agar pengunjung membaca informasi pemeliharaan
  if (pathname.startsWith("/maintenance")) {
    return response;
  }

  // Semua halaman lain (termasuk /login tanpa Konami, /, /explore, /dashboard, /admin) dialihkan ke /maintenance
  return NextResponse.redirect(new URL("/maintenance", request.url));
}

export const config = {
  matcher: [
    // Match semua route kecuali file statis
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon.svg).*)",
  ],
};
