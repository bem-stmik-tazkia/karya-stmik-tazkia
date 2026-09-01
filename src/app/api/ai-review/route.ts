import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

  return `Kamu adalah sistem moderasi konten otomatis untuk galeri karya mahasiswa STMIK Tazkia (kampus teknologi Indonesia).

Tugasmu: Periksa apakah karya berikut LAYAK dipublikasikan. Fokus utama adalah pelanggaran ETIKA, bukan kualitas teknis.

KRITERIA TIDAK LAYAK (tolak jika ada salah satu):
1. Mengandung kata-kata kasar, makian, atau ujaran kebencian (dalam bahasa apapun: Indonesia, Inggris, Sunda, Jawa, slang, singkatan, atau disamarkan dengan angka/simbol seperti "f*ck", "sh1t", "b4ji" dsb.)
2. Mengandung konten seksual, pornografi, atau tidak pantas
3. Mengandung unsur SARA (Suku, Agama, Ras, Antar-golongan) yang menyinggung
4. Deskripsi jelas-jelas asal ketik / spam / tidak bermakna (misal: "aaaaaa", "test123", "skripsi aku keren banget lah pokoknya")
5. Judul, deskripsi, atau nama fitur yang mengandung ancaman atau intimidasi

KARYA TETAP DITERIMA jika:
- Deskripsi singkat tapi bermakna dan relevan dengan topik teknologi/penelitian
- Menggunakan istilah teknis atau bahasa asing yang wajar (Python, JavaScript, API, dll.)
- Kurang detail tapi tidak melanggar etika

Data Karya:
- Judul: ${karya.title}
- Kategori: ${karya.category}
- Deskripsi: ${karya.description}
- Fitur: 
${featuresText}

Jawab HANYA dalam format JSON berikut (tanpa markdown, tanpa kode blok):
{"approved": true, "score": 85, "reason": "Karya berisi deskripsi yang jelas dan tidak melanggar etika."}

atau

{"approved": false, "score": 20, "reason": "Deskripsi mengandung kata kasar dalam bahasa Inggris."}`;
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
            max_tokens: 200,
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
            maxOutputTokens: 200,
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

  // Parse response — format berbeda antara OpenRouter & Gemini langsung
  let rawText: string;
  if (OPENROUTER_API_KEY) {
    rawText = data?.choices?.[0]?.message?.content?.trim();
  } else {
    rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  }

  if (!rawText) {
    throw new Error("Gemini tidak mengembalikan teks");
  }

  try {
    // Bersihkan kalau ada markdown code block
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (typeof parsed.approved !== "boolean" || typeof parsed.score !== "number") {
      throw new Error("Format JSON tidak valid dari Gemini");
    }

    return {
      approved: parsed.approved,
      score: Math.min(100, Math.max(0, parsed.score)),
      reason: parsed.reason || "",
    };
  } catch {
    throw new Error(`Gagal parse respons Gemini: ${rawText}`);
  }
}


// ============================================================
// Main Worker Handler
// ============================================================
export async function POST(req: NextRequest) {
  // Validasi secret token (keamanan: hanya Cron atau admin yang bisa panggil)
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (token !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    // (misal karena server mati tiba-tiba saat mereview)
    // ======================================================
    await supabaseAdmin.rpc("reset_stuck_processing_karya");

    // ======================================================
    // MUTEX: Ambil karya pending dan kunci sekaligus
    // Pakai RPC (stored function) supaya bisa pakai FOR UPDATE SKIP LOCKED
    // ======================================================
    const { data: pendingKarya, error: fetchError } = await supabaseAdmin.rpc(
      "claim_pending_karya_for_review",
      { batch_size: BATCH_SIZE }
    );

    if (fetchError) {
      console.error("[AI Worker] Fetch error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
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

          console.log(
            `[AI Worker] ✅ Karya "${karya.title}" → ${newStatus} (score: ${review.score})`
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
          adminReason = "Perlu Review Manual: AI memberikan jawaban dengan format yang rusak (bukan JSON).";
        } else if (errorMsg.includes("Gemini API error 5")) {
          adminReason = "Perlu Review Manual: Server Google Gemini sedang mengalami gangguan/down.";
        } else if (errorMsg.includes("tidak mengembalikan teks")) {
          adminReason = "Perlu Review Manual: AI menolak menjawab (kemungkinan karya memicu filter keamanan Google).";
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
