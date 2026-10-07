import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { supabaseAdmin } from "@/lib/supabase-server";

// Redis bersifat opsional — jika tidak dikonfigurasi, anti-spam dilewati
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { karyaId, deviceId, userId, action } = body as {
      karyaId?: string;
      deviceId?: string;
      userId?: string | null;
      action?: "like" | "unlike";
    };

    // Validasi input
    if (!karyaId || !uuidRegex.test(karyaId)) {
      return NextResponse.json({ error: "Invalid karyaId" }, { status: 400 });
    }
    if (!deviceId || !uuidRegex.test(deviceId)) {
      return NextResponse.json({ error: "Invalid deviceId" }, { status: 400 });
    }
    if (action !== "like" && action !== "unlike") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Identity: prefer userId (auth), fallback ke deviceId (anonymous)
    const identity =
      userId && typeof userId === "string" && uuidRegex.test(userId)
        ? userId
        : deviceId;
    const redisKey = `liked:${karyaId}:${identity}`;

    // ─── Cek Redis (jika dikonfigurasi) ───────────────────────────────────
    if (redis) {
      if (action === "like") {
        const alreadyLiked = await redis.get(redisKey);
        if (alreadyLiked) {
          return NextResponse.json({ error: "Already liked", liked: true }, { status: 409 });
        }
      } else {
        const alreadyLiked = await redis.get(redisKey);
        if (!alreadyLiked) {
          return NextResponse.json({ error: "Not liked yet", liked: false }, { status: 409 });
        }
      }
    }

    // ─── Update DB via supabaseAdmin ───────────────────────────────────────
    // Ambil likes terkini lalu update
    const { data: karyaData, error: fetchError } = await supabaseAdmin
      .from("karya")
      .select("likes")
      .eq("id", karyaId)
      .single();

    if (fetchError || !karyaData) {
      console.error("[/api/like] Fetch error:", fetchError?.message);
      return NextResponse.json({ error: "Karya not found" }, { status: 404 });
    }

    const currentLikes: number = karyaData.likes || 0;
    const newLikes =
      action === "like"
        ? currentLikes + 1
        : Math.max(0, currentLikes - 1);

    const { error: updateError } = await supabaseAdmin
      .from("karya")
      .update({ likes: newLikes })
      .eq("id", karyaId);

    if (updateError) {
      console.error("[/api/like] Update error:", updateError.message);
      return NextResponse.json({ error: "Failed to update likes" }, { status: 500 });
    }

    // ─── Update Redis (jika dikonfigurasi) ────────────────────────────────
    if (redis) {
      if (action === "like") {
        await redis.set(redisKey, "1", { ex: 60 * 60 * 24 * 365 });
      } else {
        await redis.del(redisKey);
      }
    }

    return NextResponse.json({ liked: action === "like" });
  } catch (err) {
    console.error("[/api/like] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET — cek status liked
export async function GET(req: NextRequest) {
  try {
    if (!redis) {
      return NextResponse.json({ liked: false });
    }

    const { searchParams } = new URL(req.url);
    const karyaId = searchParams.get("karyaId");
    const deviceId = searchParams.get("deviceId");
    const userId = searchParams.get("userId");

    if (!karyaId || !deviceId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }
    if (!uuidRegex.test(karyaId) || !uuidRegex.test(deviceId)) {
      return NextResponse.json({ error: "Invalid characters" }, { status: 400 });
    }

    const identity =
      userId && uuidRegex.test(userId) ? userId : deviceId;
    const redisKey = `liked:${karyaId}:${identity}`;
    const liked = await redis.get(redisKey);

    return NextResponse.json({ liked: !!liked });
  } catch (err) {
    console.error("[/api/like GET] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
