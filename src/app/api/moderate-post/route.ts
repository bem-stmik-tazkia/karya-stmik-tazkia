import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// Supabase Admin (service role — bypasses RLS)
// ============================================================
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// ============================================================
// Rate Limiting Constants
// ============================================================
const WINDOW_MS = 5 * 60 * 1000;       // 5-minute window
const MAX_CALLS_PER_WINDOW = 10;        // max 10 moderation checks per 5 min
const MAX_FAILS = 3;                    // 3 rejected posts → cooldown
const COOLDOWN_MS = 5 * 60 * 1000;     // 5-minute posting ban

// ============================================================
// AI Models — coba dari atas ke bawah jika ada yang gagal
// ============================================================
const MODERATION_MODELS = [
  "minimax/minimax-m3:free",
  "google/gemini-2.0-flash-exp:free",
  "google/gemma-2-9b-it:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
];

// ============================================================
// Prompt Moderasi — Multi-bahasa & Anti-Leet Speak
// ============================================================
function buildModerationPrompt(content: string, type: string, tags: string[]): string {
  return `Kamu adalah sistem moderasi konten otomatis untuk media sosial kampus STMIK Tazkia (Indonesia).

Tugasmu: Periksa apakah postingan berikut LAYAK dipublikasikan di lingkungan kampus. Fokus pada pelanggaran etika.

═══ DAFTAR BAHASA YANG HARUS DICEK (WAJIB, JANGAN LEWATKAN) ═══
Periksa kata-kata kasar dalam **SEMUA BAHASA DI DUNIA (GLOBAL)**, termasuk namun tidak terbatas pada:
• Jepang: kuso, shine, baka (dalam konteks sangat kasar), dsb.
• Arab: kalb, sharmouta, himar, dsb.
• Rusia: cyka blyat, pizdec, dsb.
• Indonesia (formal & gaul): bangsat, anjing, babi, kontol, memek, tolol, goblok, brengsek, kampret, taik, pepek, sial, keparat, dsb.
• Inggris: fuck, shit, bitch, ass, bastard, dick, cunt, nigger, faggot, asshole, bullshit, damn (jika konteks menghina), dsb.
• Jawa: jancok, jancuk, asu, matamu, matane, jangkrik (konteks marah/mengumpat), keparat, dsb.
• Sunda: sia (menghina), belegug, balingbing (konteks kasar), dsb.
• Melayu/Betawi: celaka, setan (konteks umpatan), bajingan, dsb.
• Slang internet: wtf, stfu, gtfo (konteks agresif/menghina), dsb.
• Leet speak & disamarkan: f*ck, sh1t, b4ngs4t, @nj1ng, k*nt0l, m3m3k, a55, d1ck, dsb.
• Singkatan kasar: wtf, omfg, stfu dalam konteks marah atau menghina orang lain

═══ KRITERIA TIDAK LAYAK (tolak jika ADA SALAH SATU) ═══
1. Kata kasar, makian, umpatan dalam bahasa APAPUN (termasuk yang disamarkan/disingkat)
2. Ujaran kebencian terhadap individu, kelompok, atau institusi
3. Konten seksual, pornografi, atau tidak senonoh
4. Unsur SARA yang menyinggung (Suku, Agama, Ras, Antar-golongan)
5. Ancaman, intimidasi, atau bullying eksplisit
6. Spam jelas (contoh: "aaaaaa", "test123 test123", "hehehehe" berulang tanpa konteks)

═══ TETAP LAYAK jika ═══
• Konten singkat tapi bermakna dan relevan (ide, tanya-jawab, proyek, lomba, kolaborasi)
• Menggunakan istilah teknis wajar (API, Python, JavaScript, Machine Learning, IoT, dsb.)
• Ekspresi informal ringan umum di kalangan mahasiswa yang tidak menyinggung siapapun
• "anjir" atau "gila" dalam konteks kagum (bukan menghina) masih bisa diterima — pertimbangkan konteks

═══ DATA POSTINGAN ═══
Tipe: ${type}
Konten: "${content}"
Hashtag: ${tags.length > 0 ? tags.map((t) => "#" + t).join(", ") : "(tidak ada)"}

═══ FORMAT JAWABAN ═══
Jawab HANYA dalam JSON berikut (tanpa markdown, tanpa kode blok):
{"approved": true, "reason": "Konten aman dan relevan untuk komunitas kampus."}
atau
{"approved": false, "reason": "Konten mengandung kata kasar dalam bahasa Jawa ('jancok') yang tidak pantas untuk komunitas kampus."}`;
}

// ============================================================
// Panggil AI (OpenRouter dengan fallback ke Gemini langsung)
// ============================================================
async function callAI(
  prompt: string
): Promise<{ approved: boolean; reason: string } | null> {
  // ── Coba OpenRouter dulu ──
  if (OPENROUTER_API_KEY) {
    for (const model of MODERATION_MODELS) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer":
              process.env.NEXT_PUBLIC_SUPABASE_URL || "https://localhost",
            "X-Title": "Karya STMIK Tazkia Feed Moderation",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 150,
          }),
        });

        if (res.status === 401 || res.status === 403)
          throw new Error("API_KEY_ERROR");
        if (res.status === 429 || !res.ok) continue; // coba model berikutnya

        const data = await res.json();
        const raw = data?.choices?.[0]?.message?.content?.trim();
        if (!raw) continue;

        const cleaned = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (typeof parsed.approved !== "boolean") continue;

        return { approved: parsed.approved, reason: parsed.reason || "" };
      } catch (err: any) {
        if (err.message === "API_KEY_ERROR") throw err;
        continue;
      }
    }
  }

  // ── Fallback ke Gemini langsung ──
  if (GEMINI_API_KEY) {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 150 },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ],
          }),
        }
      );

      if (!res.ok) return null;
      const data = await res.json();
      const raw =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!raw) return null;

      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (typeof parsed.approved !== "boolean") return null;
      return { approved: parsed.approved, reason: parsed.reason || "" };
    } catch {
      return null;
    }
  }

  return null; // Tidak ada API yang tersedia
}

// ============================================================
// POST /api/moderate-post
// ============================================================
export async function POST(req: NextRequest) {
  // ── 1. Autentikasi user via JWT ──
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;
  const now = new Date();

  // ── 2. Ambil data rate limit user ──
  const { data: rateRecord } = await supabaseAdmin
    .from("post_rate_limits")
    .select("*")
    .eq("user_id", userId)
    .single();

  let currentFailCount = 0;
  let windowExpired = true;

  if (rateRecord) {
    // Cek apakah user masih kena cooldown
    if (
      rateRecord.cooldown_until &&
      new Date(rateRecord.cooldown_until) > now
    ) {
      return NextResponse.json(
        {
          error: "cooldown",
          message:
            "Kamu terlalu sering memposting konten yang melanggar aturan. Tunggu sebentar.",
          cooldown_until: rateRecord.cooldown_until,
        },
        { status: 429 }
      );
    }

    // Cek apakah window rate limit sudah expired
    const windowStart = new Date(rateRecord.window_start);
    windowExpired = now.getTime() - windowStart.getTime() > WINDOW_MS;

    // Cek jumlah request dalam window aktif
    if (!windowExpired && rateRecord.call_count >= MAX_CALLS_PER_WINDOW) {
      return NextResponse.json(
        {
          error: "rate_limit",
          message: `Terlalu banyak permintaan dalam waktu singkat. Coba lagi dalam beberapa menit.`,
        },
        { status: 429 }
      );
    }

    currentFailCount = windowExpired ? 0 : rateRecord.fail_count;

    // Update call_count (reset window jika expired)
    await supabaseAdmin
      .from("post_rate_limits")
      .update({
        call_count: windowExpired ? 1 : rateRecord.call_count + 1,
        fail_count: windowExpired ? 0 : rateRecord.fail_count,
        window_start: windowExpired
          ? now.toISOString()
          : rateRecord.window_start,
        cooldown_until: null, // aman: kita sudah konfirmasi tidak ada cooldown aktif
        updated_at: now.toISOString(),
      })
      .eq("user_id", userId);
  } else {
    // User pertama kali — buat record baru
    const { error: insertErr } = await supabaseAdmin
      .from("post_rate_limits")
      .insert({
        user_id: userId,
        call_count: 1,
        fail_count: 0,
        window_start: now.toISOString(),
        updated_at: now.toISOString(),
      });

    if (insertErr) {
      console.warn("[Moderation] Rate limit insert error:", insertErr.message);
    }
    currentFailCount = 0;
    windowExpired = true;
  }

  // ── 3. Parse body request ──
  let body: { content?: string; type?: string; tags?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const { content, type = "update", tags = [] } = body;

  if (!content?.trim()) {
    return NextResponse.json(
      { error: "Konten tidak boleh kosong" },
      { status: 400 }
    );
  }

  // ── 4. Panggil AI untuk moderasi ──
  const prompt = buildModerationPrompt(content, type, tags);
  let result: { approved: boolean; reason: string } | null = null;

  try {
    result = await callAI(prompt);
  } catch (err: any) {
    // API key error / konfigurasi error — izinkan posting agar user tidak stuck
    console.error("[Moderation] AI configuration error:", err.message);
    return NextResponse.json({
      approved: true,
      reason: "Layanan moderasi sedang tidak tersedia, postingan diizinkan.",
    });
  }

  // Jika semua model AI tidak tersedia (rate limit semua) — izinkan posting
  if (!result) {
    console.warn("[Moderation] Semua model AI tidak tersedia, posting diizinkan.");
    return NextResponse.json({
      approved: true,
      reason: "Layanan moderasi sedang sibuk, postingan diizinkan.",
    });
  }

  // ── 5. Update fail_count jika konten ditolak ──
  if (!result.approved) {
    const newFailCount = currentFailCount + 1;
    const updates: Record<string, unknown> = {
      fail_count: newFailCount,
      updated_at: now.toISOString(),
    };

    let cooldownUntil: string | undefined;
    if (newFailCount >= MAX_FAILS) {
      cooldownUntil = new Date(now.getTime() + COOLDOWN_MS).toISOString();
      updates.cooldown_until = cooldownUntil;
    }

    await supabaseAdmin
      .from("post_rate_limits")
      .update(updates)
      .eq("user_id", userId);

    const responseData: Record<string, unknown> = {
      approved: false,
      reason: result.reason,
      fail_count: newFailCount,
      max_fails: MAX_FAILS,
    };

    if (cooldownUntil) {
      responseData.cooldown_triggered = true;
      responseData.cooldown_until = cooldownUntil;
    }

    return NextResponse.json(responseData);
  }

  // ── 6. Konten LULUS ──
  return NextResponse.json({ approved: true, reason: result.reason });
}
