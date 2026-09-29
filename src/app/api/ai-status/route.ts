import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

export interface AiStatusResult {
  provider: "openrouter" | "gemini" | "none";
  // OpenRouter kredits
  openrouter?: {
    available: boolean;
    credits_remaining: number | null; // USD
    credits_used: number | null;
    credits_limit: number | null;
    is_free_tier: boolean;
  };
  // Gemini
  gemini?: {
    available: boolean;
    model: string;
  };
  // Stats dari DB
  db: {
    pending_count: number;
    processing_count: number;
    stuck_count: number; // processing > 10 menit
  };
  checked_at: string;
}

export async function GET(req: NextRequest) {
  // Hanya admin yang boleh akses (via CRON_SECRET atau Supabase auth)
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  // Cek apakah pakai CRON_SECRET (server-to-server)
  const isCronCall = !!CRON_SECRET && token === CRON_SECRET;

  if (!isCronCall) {
    // Cek via Supabase user auth
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Pastikan user adalah admin
    const { data: adminRecord } = await supabaseAdmin
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!adminRecord) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const result: AiStatusResult = {
    provider: "none",
    checked_at: new Date().toISOString(),
    db: { pending_count: 0, processing_count: 0, stuck_count: 0 },
  };

  // ── Cek OpenRouter saldo ──
  if (OPENROUTER_API_KEY) {
    result.provider = "openrouter";
    try {
      const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        },
        // Timeout 5 detik
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        // OpenRouter response: { data: { label, usage, limit, is_free_tier, rate_limit } }
        const d = data?.data;
        const usage = typeof d?.usage === "number" ? d.usage : null;
        const limit = typeof d?.limit === "number" ? d.limit : null;
        const remaining = limit !== null && usage !== null ? limit - usage : null;

        result.openrouter = {
          available: true,
          credits_remaining: remaining,
          credits_used: usage,
          credits_limit: limit,
          is_free_tier: d?.is_free_tier === true,
        };
      } else {
        result.openrouter = {
          available: false,
          credits_remaining: null,
          credits_used: null,
          credits_limit: null,
          is_free_tier: false,
        };
      }
    } catch {
      result.openrouter = {
        available: false,
        credits_remaining: null,
        credits_used: null,
        credits_limit: null,
        is_free_tier: false,
      };
    }
  }

  // ── Cek Gemini API ──
  if (GEMINI_API_KEY) {
    if (!OPENROUTER_API_KEY) result.provider = "gemini";
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    try {
      // Gemini tidak punya endpoint saldo, kita ping dengan request minimal
      const pingRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "ping" }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
          signal: AbortSignal.timeout(6000),
        }
      );

      result.gemini = {
        available: pingRes.status !== 401 && pingRes.status !== 403 && pingRes.status !== 429,
        model,
      };
    } catch {
      result.gemini = { available: false, model };
    }
  }

  // ── Stats dari DB ──
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const [pendingRes, processingRes, stuckRes] = await Promise.all([
    supabaseAdmin
      .from("karya")
      .select("id", { count: "exact", head: true })
      .eq("ai_review_status", "pending_review"),
    supabaseAdmin
      .from("karya")
      .select("id", { count: "exact", head: true })
      .eq("ai_review_status", "processing"),
    supabaseAdmin
      .from("karya")
      .select("id", { count: "exact", head: true })
      .eq("ai_review_status", "processing")
      .lt("ai_processing_started_at", tenMinutesAgo),
  ]);

  result.db = {
    pending_count: pendingRes.count || 0,
    processing_count: processingRes.count || 0,
    stuck_count: stuckRes.count || 0,
  };

  return NextResponse.json(result);
}
