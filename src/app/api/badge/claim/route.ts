import { NextRequest, NextResponse } from "next/server";
import { createClient, supabaseAdmin } from "@/lib/supabase-server";
import { checkRateLimit } from "@/utils/rateLimit";

/** Harus cocok persis dengan key di tabel system_settings di DB produksi. */
const BADGE_GRANTS_KEY = "exclusive_badges_grants"; // DB: exclusive_badges_grants (pakai "badges")

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting: Batasi percobaan klaim agar tidak diserang brute-force
    const ip = req.headers.get("x-forwarded-for") || "anon";
    const { success: isAllowed } = await checkRateLimit(`badge_claim_${ip}`, 10, 60000); // 10 request per menit
    if (!isAllowed) {
      return NextResponse.json(
        { success: false, error: "Terlalu banyak permintaan klaim. Harap tunggu sebentar." },
        { status: 429 }
      );
    }

    // 2. Verifikasi Sesi Server
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Request body tidak valid." },
        { status: 400 }
      );
    }

    const { badgeId, grantId } = body;
    const badgeIdNum = Number(badgeId);

    if (!badgeIdNum) {
      return NextResponse.json(
        { success: false, error: "Parameter badgeId wajib diisi dan berupa angka." },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Konfigurasi server (supabaseAdmin) belum tersedia." },
        { status: 500 }
      );
    }

    // 3. Ambil data profil mahasiswa user untuk mencocokkan id profil dan email
    const { data: profile } = await supabaseAdmin
      .from("mahasiswa_profiles")
      .select("id, email")
      .eq("user_id", user.id)
      .maybeSingle();

    const allowedRecipientIds = [user.id, profile?.id].filter(Boolean) as string[];
    const userEmail = (user.email || profile?.email || "").toLowerCase();

    // 4. Ambil master grants dari system_settings
    const { data: settingData, error: fetchErr } = await supabaseAdmin
      .from("system_settings")
      .select("value")
      .eq("key", BADGE_GRANTS_KEY)
      .maybeSingle();

    if (fetchErr) {
      return NextResponse.json(
        { success: false, error: `Gagal membaca data grant: ${fetchErr.message}` },
        { status: 500 }
      );
    }

    const grants: any[] = settingData?.value ? JSON.parse(settingData.value) : [];

    // 5. Verifikasi apakah grant memang ditujukan kepada mahasiswa ini
    const targetGrant = grants.find((g) => {
      if (grantId && g.id !== grantId) return false;
      if (Number(g.badgeId) !== badgeIdNum) return false;

      const matchId = allowedRecipientIds.includes(g.recipientId);
      const matchEmail =
        g.recipientEmail && g.recipientEmail.toLowerCase() === userEmail;
      return matchId || matchEmail;
    });

    if (!targetGrant) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Anda tidak memiliki hak untuk mengklaim lencana ini." },
        { status: 403 }
      );
    }

    // 6. Update status claimedBy secara atomik di sisi server menggunakan supabaseAdmin
    const currentClaimed: string[] = targetGrant.claimedBy || [];
    const idsToAdd = [user.id, profile?.id].filter(Boolean) as string[];
    const missing = idsToAdd.filter((id) => !currentClaimed.includes(id));

    if (missing.length > 0) {
      targetGrant.claimedBy = [...currentClaimed, ...missing];
      const { error: updateErr } = await supabaseAdmin
        .from("system_settings")
        .upsert({
          key: BADGE_GRANTS_KEY,
          value: JSON.stringify(grants),
        });

      if (updateErr) {
        return NextResponse.json(
          { success: false, error: `Gagal menyimpan klaim: ${updateErr.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      badgeId: badgeIdNum,
      grantId: targetGrant.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
