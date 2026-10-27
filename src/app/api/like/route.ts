import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { createClient, supabaseAdmin, supabaseServer } from "@/lib/supabase-server";

// ─── 1. IN-MEMORY RATE LIMITER (Anti-Spam Burp Suite per IP) ────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 Menit
const MAX_REQUESTS_PER_WINDOW = 20; // Maksimal 20 klik like per menit per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip);

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  clientData.count += 1;
  return false;
}

// Bersihkan memori rate limit secara berkala agar tidak memory leak
if (process.env.NODE_ENV !== "test") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

// ─── 2. REDIS CONFIG (JIKA ADA) ─────────────────────────────────────────────
const isRedisConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const uuidRegex = /^[a-zA-Z0-9_\-]{1,128}$/;

// ─── POST: PROSES LIKE / UNLIKE ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // A. Proteksi IP Rate Limiting
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan like. Silakan coba sesaat lagi." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { karyaId, deviceId, action } = body as {
      karyaId?: string;
      deviceId?: string;
      action?: "like" | "unlike";
    };

    // B. Validasi Input Format
    if (!karyaId || !uuidRegex.test(karyaId)) {
      return NextResponse.json({ error: "Invalid karyaId" }, { status: 400 });
    }
    if (!deviceId || !uuidRegex.test(deviceId)) {
      return NextResponse.json({ error: "Invalid deviceId" }, { status: 400 });
    }
    if (action !== "like" && action !== "unlike") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // C. Otorisasi Asli: Dapatkan User ID yang SAH dari Session Cookie (Bukan dari body klien!)
    const userClient = await createClient();
    const {
      data: { user: sessionUser },
    } = await userClient.auth.getUser();

    const authenticatedUserId = sessionUser?.id || null;
    const identity = authenticatedUserId || deviceId;
    const redisKey = `liked:${karyaId}:${identity}`;

    const db = supabaseAdmin || userClient || supabaseServer;

    // D. Anti-Duplicate: Cek Redis atau Database Log DULUAN
    if (redis) {
      const alreadyLiked = await redis.get(redisKey);
      if (action === "like" && alreadyLiked) {
        return NextResponse.json({ error: "Already liked", liked: true }, { status: 409 });
      }
      if (action === "unlike" && !alreadyLiked) {
        return NextResponse.json({ error: "Not liked yet", liked: false }, { status: 409 });
      }
    } else {
      // Cek apakah sudah pernah like di tabel karya_likes_log
      const checkQuery = db.from("karya_likes_log").select("id").eq("karya_id", karyaId);
      const { data: existingLike } = authenticatedUserId
        ? await checkQuery.eq("user_id", authenticatedUserId).maybeSingle()
        : await checkQuery.eq("device_id", deviceId).maybeSingle();

      if (action === "like" && existingLike) {
        return NextResponse.json({ error: "Already liked", liked: true }, { status: 409 });
      }
      if (action === "unlike" && !existingLike) {
        return NextResponse.json({ error: "Not liked yet", liked: false }, { status: 409 });
      }
    }

    // E. Catat Log Terlebih Dahulu (Safe Transactional Flow)
    if (action === "like") {
      if (redis) {
        await redis.set(redisKey, "1", { ex: 60 * 60 * 24 * 365 });
      } else {
        const { error: insertError } = await db.from("karya_likes_log").insert({
          karya_id: karyaId,
          device_id: deviceId,
          ...(authenticatedUserId ? { user_id: authenticatedUserId } : {}),
        });

        if (insertError) {
          // Jika melanggar unique constraint (duplicate like), tolak!
          return NextResponse.json({ error: "Already liked", liked: true }, { status: 409 });
        }
      }
    } else {
      // Action: unlike
      if (redis) {
        await redis.del(redisKey);
      } else {
        const delQuery = db.from("karya_likes_log").delete().eq("karya_id", karyaId);
        if (authenticatedUserId) {
          await delQuery.eq("user_id", authenticatedUserId);
        } else {
          await delQuery.eq("device_id", deviceId);
        }
      }
    }

    // F. BARU NAIKKAN / TURUNKAN ANGKA LIKES (Setelah log berhasil dicatat!)
    const { error: rpcError } = await db.rpc("increment_likes", {
      karya_id: karyaId,
      delta: action === "like" ? 1 : -1,
    });

    if (rpcError) {
      console.warn("[/api/like] RPC increment_likes gagal, fallback ke manual update:", rpcError.message);
      const { data: karyaData } = await db.from("karya").select("likes").eq("id", karyaId).single();
      if (karyaData) {
        const currentLikes: number = karyaData.likes || 0;
        const newLikes = action === "like" ? currentLikes + 1 : Math.max(0, currentLikes - 1);
        await db.from("karya").update({ likes: newLikes }).eq("id", karyaId);
      }
    }

    return NextResponse.json({ liked: action === "like" });
  } catch (err) {
    console.error("[/api/like] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── GET: CEK STATUS LIKED ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const karyaId = searchParams.get("karyaId");
    const deviceId = searchParams.get("deviceId");

    if (!deviceId || !uuidRegex.test(deviceId)) {
      return NextResponse.json({ error: "Invalid deviceId" }, { status: 400 });
    }
    if (karyaId && !uuidRegex.test(karyaId)) {
      return NextResponse.json({ error: "Invalid karyaId" }, { status: 400 });
    }

    // Ambil session login dari cookie
    const userClient = await createClient();
    const {
      data: { user: sessionUser },
    } = await userClient.auth.getUser();

    const authenticatedUserId = sessionUser?.id || null;
    const identity = authenticatedUserId || deviceId;
    const db = supabaseAdmin || userClient || supabaseServer;

    if (karyaId) {
      if (redis) {
        const redisKey = `liked:${karyaId}:${identity}`;
        const liked = await redis.get(redisKey);
        return NextResponse.json({ liked: !!liked });
      }

      const query = db.from("karya_likes_log").select("id").eq("karya_id", karyaId);
      const { data } = authenticatedUserId
        ? await query.eq("user_id", authenticatedUserId).maybeSingle()
        : await query.eq("device_id", deviceId).maybeSingle();

      return NextResponse.json({ liked: !!data });
    }

    // Fetch semua liked karya untuk user/device ini
    const query = db.from("karya_likes_log").select("karya_id");
    const { data } = authenticatedUserId
      ? await query.eq("user_id", authenticatedUserId)
      : await query.eq("device_id", deviceId);

    const likedIds = (data || []).map((r: { karya_id: string }) => r.karya_id);
    return NextResponse.json({ likedIds });
  } catch (err) {
    console.error("[/api/like GET] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}