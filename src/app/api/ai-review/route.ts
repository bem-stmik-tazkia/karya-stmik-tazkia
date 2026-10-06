import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendTelegramNotification, escapeHtml } from "@/lib/telegram";

// ============================================================
// Gunakan Service Role Key biar bisa update tanpa RLS
// Tambahkan SUPABASE_SERVICE_ROLE_KEY ke .env.local
// (dapatkan dari Supabase Dashboard > Settings > API > service_role key)
// ============================================================
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET!;

// Daftar model AI cadangan (dari yang paling pintar/cepat ke alternatifnya)
// AI akan mencoba satu per satu dari atas ke bawah.
const FALLBACK_MODELS = [
  "minimax/minimax-m3:free",              // Model gratis yang terbukti sangat stabil saat ini
  "google/gemini-2.0-flash-exp:free",     // Gemini Flash terbaru (kalau tersedia)
  "google/gemma-2-9b-it:free",            // Alternatif Google Gemma
  "nvidia/nemotron-3-ultra-550b-a55b:free" // Model cadangan Nvidia
];

const BATCH_SIZE = 10; // Maks 10 karya per run (limit)
const DELAY_MS = 2000; // Jeda 2 detik antar request ke AI

// ============================================================
// Prompt AI - Pengecekan Etika & Kelayakan Karya
// ============================================================
function buildPrompt(karya: any): string {
  const featuresText = Array.isArray(karya.features)
    ? karya.features.map((f: any) => `- ${f.title}: ${f.desc || f.description || ""}`).join("\n")
    : "-";

  return `Kamu adalah sistem review konten otomatis untuk galeri karya mahasiswa STMIK Tazkia (kampus teknologi informasi Indonesia). Platform ini KHUSUS menampilkan karya akademis di bidang teknologi, penelitian, desain, dan multimedia.

Tugasmu: Periksa apakah karya berikut LAYAK dipublikasikan. Periksa DUA hal: Etika dan Relevansi.

════════════════════════════════════════════════
 LAPIS 1 — ETIKA (tolak jika ada SALAH SATU)
════════════════════════════════════════════════
1. Mengandung kata-kata kasar, makian, atau ujaran kebencian (dalam bahasa apapun, termasuk yang disamarkan dengan angka/simbol)
2. Mengandung konten seksual, pornografi, atau tidak pantas
3. Mengandung unsur SARA yang menyinggung
4. Deskripsi jelas-jelas asal ketik / spam / tidak bermakna (misal: "aaaaaa", "test123", kalimat tidak koheren)
5. Judul atau deskripsi yang mengandung ancaman atau intimidasi

════════════════════════════════════════════════
 LAPIS 2 — RELEVANSI (tolak jika TIDAK berkaitan dengan akademik/teknologi)
════════════════════════════════════════════════
Tolak jika karya:
1. Jelas bukan karya akademis atau teknologi:
   - Panduan/guide game online (Mobile Legends, PUBG, Free Fire, dll.)
   - Konten hiburan murni tanpa nilai akademik (meme, video lucu, tips gaming)
   - Proyek lelucon atau iseng yang tidak bisa dikategorikan sebagai karya nyata
2. Tidak sesuai dengan 5 kategori platform:
   - Technology: Aplikasi Web & Sistem
   - Programming: Aplikasi Mobile
   - Research: Karya Tulis & Jurnal
   - IoT: Proyek IoT
   - Multimedia: Desain & Karya Kreatif
3. Deskripsi fitur yang tidak masuk akal untuk kategorinya (misal: kategori "Aplikasi Web" tapi fiturnya adalah "hero META terkuat" atau "cara push rank")

════════════════════════════════════════════════
 KARYA TETAP DITERIMA jika
════════════════════════════════════════════════
- Deskripsi singkat tapi bermakna dan relevan dengan topik teknologi/penelitian/desain
- Menggunakan istilah teknis atau bahasa asing yang wajar (Python, JavaScript, API, Machine Learning, IoT, dll.)
- Kurang detail tapi tidak melanggar etika dan masih berkaitan dengan bidang teknologi/akademik
- Karya multimedia/desain yang memiliki tujuan kreatif yang jelas

Data Karya:
- Judul: ${karya.title}
- Kategori: ${karya.category}
- Deskripsi: ${karya.description}
- Fitur: 
${featuresText}

Jawab HANYA dalam format JSON berikut. JANGAN TULIS PROSES BERPIKIRMU (NO CHAIN OF THOUGHT). JANGAN TULIS APAPUN SELAIN JSON MURNI:
{"approved": true, "score": 85, "reason": "Karya berisi deskripsi yang jelas dan tidak melanggar etika, relevan sebagai proyek web."}

atau

{"approved": false, "score": 10, "reason": "Karya berisi panduan game (tips push rank Mobile Legends) yang tidak relevan untuk galeri karya akademis kampus teknologi."}`;
}

// ============================================================
// Jeda antar request (mencegah Rate Limit)
// ============================================================
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// Kirim ke AI (OpenRouter jika ada key-nya, fallback ke Gemini langsung)
// ============================================================
async function reviewWithGemini(karya: any): Promise<{
  approved: boolean;
  score: number;
  reason: string;
} | null> {
  const prompt = buildPrompt(karya);

  let response: Response | null = null;
  let lastError = "";
  let usedModel = "";

  if (OPENROUTER_API_KEY) {
    // ── Gunakan OpenRouter dengan sistem AUTO-FALLBACK ──
    for (const model of FALLBACK_MODELS) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_SUPABASE_URL || "https://localhost",
            "X-Title": "Karya STMIK Tazkia AI Review",
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 1500,
          }),
        });

        if (res.status === 401 || res.status === 403) {
          // Error fatal: API Key tidak valid / quota habis permanen
          // Tidak perlu coba model lain karena pakai key yang sama
          throw new Error("API_KEY_ERROR");
        }

        if (res.status === 429) {
          lastError = `Model ${model} terkena limit (429).`;
          continue; // Lanjut coba model berikutnya
        }

        if (!res.ok) {
          lastError = `Model ${model} error: ${res.status}.`;
          continue; // Lanjut coba model berikutnya
        }

        response = res;
        usedModel = model;
        break; // Berhasil! Keluar dari loop pencarian model
      } catch (err: any) {
        if (err.message === "API_KEY_ERROR") throw err; // Lempar ke luar loop
        lastError = `Gagal fetch ${model}: ${err.message}`;
      }
    }
  } else {
    // ── Fallback: Gemini langsung (butuh API key yang valid) ──
    if (!GEMINI_API_KEY) {
      throw new Error("API_KEY_ERROR"); // Tidak ada key yang bisa dipakai
    }
    
    const fallbackGeminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${fallbackGeminiModel}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1500,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
        }),
      }
    );
    usedModel = fallbackGeminiModel;
    
    if (response.status === 401 || response.status === 403) {
      throw new Error("API_KEY_ERROR");
    }
  }

  // Jika response masih null atau statusnya 429 setelah semua dicoba
  if (!response || response.status === 429) {
    throw new Error("RATE_LIMIT");
  }

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`AI API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();

  if (data?.error) {
    const errMsg = data.error.message || "";
    if (
      errMsg.toLowerCase().includes("overloaded") ||
      errMsg.toLowerCase().includes("rate limit") ||
      data.error.code === 429 ||
      data.error.code === 529 ||
      data.error.code === 503 ||
      data.error.code === 502
    ) {
      throw new Error("RATE_LIMIT");
    }
    throw new Error(`AI API error payload: ${JSON.stringify(data.error)}`);
  }

  // Parse response — format berbeda antara OpenRouter & Gemini langsung
  let rawText: string;
  if (OPENROUTER_API_KEY) {
    rawText = data?.choices?.[0]?.message?.content?.trim();
  } else {
    rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  }

  if (!rawText) {
    throw new Error(`AI tidak mengembalikan teks. Full Response: ${JSON.stringify(data)}`);
  }

  try {
    // Bersihkan teks pemikiran (CoT) dari model seperti Minimax
    let cleaned = rawText.replace(/<think>[\s\S]*?<\/think>/gi, "");
    
    // Bersihkan karakter aneh di luar kurung kurawal
    cleaned = cleaned.replace(/```json|```/gi, "").trim();
    const startIdx = cleaned.indexOf("{");
    const endIdx = cleaned.lastIndexOf("}");
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      cleaned = cleaned.substring(startIdx, endIdx + 1);
    }
    const parsed = JSON.parse(cleaned);

    const isApproved = typeof parsed.approved === "boolean" 
      ? parsed.approved 
      : String(parsed.approved).toLowerCase() === "true";
      
    const parsedScore = Number(parsed.score);
    if (isNaN(parsedScore)) {
      throw new Error(`Skor bukan angka: ${parsed.score}`);
    }

    return {
      approved: isApproved,
      score: Math.min(100, Math.max(0, parsedScore)),
      reason: parsed.reason || "Review otomatis oleh AI",
    };
  } catch (e: any) {
    throw new Error(`Gagal parse respons Gemini: ${rawText} | Error: ${e.message}`);
  }
}


// ============================================================
// Main Worker Handler
// ============================================================
export async function POST(req: NextRequest) {
  let isCron = false;
  let currentUserId: string | null = null;

  // Cek apakah dipanggil via Cron/Server dengan secret
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (CRON_SECRET && token === CRON_SECRET) {
    isCron = true;
  } else {
    // Cek session user (dari browser)
    const { createClient } = await import("@/lib/supabase-server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      currentUserId = user.id;
      // Cek apakah admin
      const { data: adminRecord } = await supabaseAdmin
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      if (adminRecord) {
        isCron = true; // Admin punya hak setara Cron untuk memproses semua
      }
    }
  }

  // Jika bukan cron dan bukan user valid, tolak.
  if (!isCron && !currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate Limiting untuk pengguna biasa agar tidak spam worker
  if (!isCron) {
    const { checkRateLimit } = await import("@/utils/rateLimit");
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const clientId = currentUserId || ip;
    const { success, reset } = await checkRateLimit(`ai-review-${clientId}`, 5, 60000);
    if (!success) {
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return NextResponse.json({ error: "Too many requests" }, { 
        status: 429,
        headers: { "Retry-After": retryAfter.toString() }
      });
    }
  }

  const results = {
    processed: 0,
    approved: 0,
    rejected: 0,
    skipped_rate_limit: false,
    errors: [] as string[],
  };

  try {
    // ======================================================
    // AUTO-RECOVERY: Reset karya yang nyangkut/stuck di "processing"
    // ======================================================
    if (isCron) {
      await supabaseAdmin.rpc("reset_stuck_processing_karya");
    }

    // ======================================================
    // Ambil karya pending
    // ======================================================
    let pendingKarya: any[] = [];
    if (isCron) {
      // Cron mengambil semua dari antrean dengan Mutex/RPC
      const { data, error: fetchError } = await supabaseAdmin.rpc(
        "claim_pending_karya_for_review",
        { batch_size: BATCH_SIZE }
      );
      if (fetchError) {
        console.error("[AI Worker] Fetch error:", fetchError);
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }
      pendingKarya = data || [];
    } else {
      // User hanya memproses antreannya sendiri (dan kita set ke processing langsung via Update)
      const { data, error: fetchError } = await supabaseAdmin
        .from("karya")
        .update({
          ai_review_status: "processing",
          ai_processing_started_at: new Date().toISOString()
        })
        .eq("ai_review_status", "pending_review")
        .eq("user_id", currentUserId)
        .limit(BATCH_SIZE)
        .select();

      if (fetchError) {
        console.error("[AI Worker] Fetch error:", fetchError);
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }
      pendingKarya = data || [];
    }

    if (!pendingKarya || pendingKarya.length === 0) {
      return NextResponse.json({ message: "Tidak ada karya yang perlu direview.", results });
    }

    console.log(`[AI Worker] Memproses ${pendingKarya.length} karya...`);

    // ======================================================
    // Proses satu per satu dengan jeda (anti rate-limit)
    // ======================================================
    for (const karya of pendingKarya) {
      try {
        const review = await reviewWithGemini(karya);

        if (!review) continue;

        const newStatus = review.approved ? "approved" : "rejected";

        // Update status karya di DB
        // KUNCI: Kita tambahkan .eq("status", "pending") 
        // untuk memastikan kita TIDAK MENIMPA keputusan admin jika admin kebetulan 
        // menyetujui/menolak karya ini secara manual ketika AI sedang berpikir.
        const { error: updateError } = await supabaseAdmin
          .from("karya")
          .update({
            status: newStatus,
            reject_reason: review.approved ? null : review.reason,
            ai_review_status: "reviewed",
            ai_review_score: review.score,
            ai_review_reason: review.reason,
            ai_reviewed_at: new Date().toISOString(),
          })
          .eq("id", karya.id)
          .eq("status", "pending");

        if (updateError) {
          results.errors.push(`Karya ${karya.id}: ${updateError.message}`);
        } else {
          results.processed++;
          if (review.approved) results.approved++;
          else results.rejected++;

          const consoleMsg = `[AI Worker] ✅ Karya "${karya.title}" → ${newStatus} (score: ${review.score})`;
          console.log(consoleMsg);
          
          const truncatedReason = review.reason.length > 1000 ? review.reason.substring(0, 1000) + "..." : review.reason;
          await sendTelegramNotification(
            `🤖 <b>Review AI Selesai</b>\n\n📌 <b>Judul:</b> ${escapeHtml(karya.title)}\n📊 <b>Kategori:</b> ${escapeHtml(karya.category)}\n\n✅ <b>Keputusan:</b> ${review.approved ? 'DITERIMA (Publik)' : 'DITOLAK'}\n⭐ <b>Skor:</b> ${review.score}/100\n💬 <b>Alasan:</b>\n<i>${escapeHtml(truncatedReason)}</i>`
          );
        }
      } catch (err: any) {
        const errorMsg = err.message || "";

        if (errorMsg === "RATE_LIMIT") {
          // Semua model kena limit! Kembalikan ke pending
          console.warn("[AI Worker] ⚠️ Semua model AI terkena limit, berhenti dan akan coba lagi nanti.");
          await supabaseAdmin
            .from("karya")
            .update({
              ai_review_status: "pending_review",
              ai_review_reason: "Semua server AI sedang sibuk (akan dicoba lagi otomatis).",
              ai_processing_started_at: null,
            })
            .eq("id", karya.id);

          results.skipped_rate_limit = true;
          break; // Hentikan loop, sisa karya akan diproses di run berikutnya
        }

        let adminReason = `Perlu Review Manual: Terjadi error sistem tidak terduga (${errorMsg})`;

        if (errorMsg === "API_KEY_ERROR") {
          adminReason = "Perlu Review Manual: Kunci API (API Key) AI hangus atau tidak diizinkan. Harap perbarui di pengaturan (.env).";
        } else if (errorMsg.includes("Gagal parse respons Gemini") || errorMsg.includes("Format JSON tidak valid")) {
          adminReason = `Perlu Review Manual: Format AI rusak. Detail: ${errorMsg}`;
        } else if (errorMsg.includes("Gemini API error 5")) {
          adminReason = "Perlu Review Manual: Server Google Gemini sedang mengalami gangguan/down.";
        } else if (errorMsg.includes("AI tidak mengembalikan teks")) {
          adminReason = `Perlu Review Manual: AI mengembalikan respons kosong. Detail: ${errorMsg}`;
        }
        
        // Error lain (koneksi, format, dll.) — catat tapi lanjut ke karya berikutnya
        console.error(`[AI Worker] ❌ Error karya ${karya.id}:`, err.message);
        results.errors.push(`Karya ${karya.id}: ${err.message}`);

        // Set ke 'reviewed' dengan score null agar admin bisa cek manual dan tidak diproses ulang otomatis terus-terusan
        await supabaseAdmin
          .from("karya")
          .update({
            ai_review_status: "reviewed",
            ai_review_reason: adminReason,
            ai_processing_started_at: null,
          })
          .eq("id", karya.id);
          
        const truncatedReason = adminReason.length > 1000 ? adminReason.substring(0, 1000) + "..." : adminReason;
        await sendTelegramNotification(
          `⚠️ <b>Gagal Diperiksa AI</b>\n\n📌 <b>Judul:</b> ${escapeHtml(karya.title)}\n\n🚨 <b>Penyebab:</b>\n${escapeHtml(truncatedReason)}`
        );
      }

      // Jeda antar request ke Gemini (aman dari rate limit)
      await sleep(DELAY_MS);
    }
  } catch (err: any) {
    console.error("[AI Worker] Fatal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Worker selesai.", results });
}

// Juga bisa di-GET untuk manual test (butuh token yang sama)
export async function GET(req: NextRequest) {
  return POST(req);
}
