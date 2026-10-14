import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { createClient, supabaseAdmin } from "@/lib/supabase-server";

// Redis opsional — jika tidak dikonfigurasi, fallback ke karya_likes_log
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

    const db = supabaseAdmin || (await createClient());

    // ─── Cek Redis lock (jika dikonfigurasi) ─────────────────────────────
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
    } else {
      // ─── Fallback anti-spam via karya_likes_log ───────────────────────
      // Prioritas: cek user_id jika login, fallback ke device_id
      const query = db
        .from("karya_likes_log")
        .select("id")
        .eq("karya_id", karyaId);

      const { data: existingLike } = userId
        ? await query.eq("user_id", userId).maybeSingle()
        : await query.eq("device_id", deviceId).maybeSingle();

      if (action === "like" && existingLike) {
        return NextResponse.json({ error: "Already liked", liked: true }, { status: 409 });
      }
      if (action === "unlike" && !existingLike) {
        return NextResponse.json({ error: "Not liked yet", liked: false }, { status: 409 });
      }
    }

    // ─── Atomic increment/decrement via Supabase RPC ──────────────────────
    const { error: rpcError } = await db.rpc("increment_likes", {
      karya_id: karyaId,
      delta: action === "like" ? 1 : -1,
    });

    if (rpcError) {
      // Fallback ke manual update jika RPC belum ada
      console.warn("[/api/like] RPC increment_likes gagal, fallback ke manual update:", rpcError.message);

      const { data: karyaData, error: fetchError } = await db
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

      const { error: updateError } = await db
        .from("karya")
        .update({ likes: newLikes })
        .eq("id", karyaId);

      if (updateError) {
        console.error("[/api/like] Update error:", updateError.message);
        return NextResponse.json({ error: "Failed to update likes" }, { status: 500 });
      }
    }

    // ─── Catat/hapus status like (Redis atau karya_likes_log) ────────────
    if (redis) {
      if (action === "like") {
        await redis.set(redisKey, "1", { ex: 60 * 60 * 24 * 365 });
      } else {
        await redis.del(redisKey);
      }
    } else {
      // Fallback: insert / delete ke karya_likes_log
      if (action === "like") {
        await db
          .from("karya_likes_log")
          .insert({
            karya_id: karyaId,
            device_id: deviceId,
            ...(userId ? { user_id: userId } : {}),
          });
      } else {
        const deleteQuery = db
          .from("karya_likes_log")
          .delete()
          .eq("karya_id", karyaId);

        if (userId) {
          await deleteQuery.eq("user_id", userId);
        } else {
          await deleteQuery.eq("device_id", deviceId);
        }
      }
    }

    return NextResponse.json({ liked: action === "like" });
  } catch (err) {
    console.error("[/api/like] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET — cek status liked (dari Redis atau karya_likes_log)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const karyaId = searchParams.get("karyaId");
    const deviceId = searchParams.get("deviceId");
    const userId = searchParams.get("userId");

    if (!deviceId) {
      return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });
    }
    if (!uuidRegex.test(deviceId)) {
      return NextResponse.json({ error: "Invalid deviceId" }, { status: 400 });
    }
    if (karyaId && !uuidRegex.test(karyaId)) {
      return NextResponse.json({ error: "Invalid karyaId" }, { status: 400 });
    }

    const identity = userId && uuidRegex.test(userId) ? userId : deviceId;
    const db = supabaseAdmin || (await createClient());

    // Kasus 1: Cek single karyaId
    if (karyaId) {
      if (redis) {
        const redisKey = `liked:${karyaId}:${identity}`;
        const liked = await redis.get(redisKey);
        return NextResponse.json({ liked: !!liked });
      }

      // Fallback ke karya_likes_log
      const query = db
        .from("karya_likes_log")
        .select("id")
        .eq("karya_id", karyaId);

      const { data } = userId && uuidRegex.test(userId)
        ? await query.eq("user_id", userId).maybeSingle()
        : await query.eq("device_id", deviceId).maybeSingle();

      return NextResponse.json({ liked: !!data });
    }

    // Kasus 2: Fetch semua liked karya untuk user/device ini
    const query = db.from("karya_likes_log").select("karya_id");
    const { data } = userId && uuidRegex.test(userId)
      ? await query.eq("user_id", userId)
      : await query.eq("device_id", deviceId);

    const likedIds = (data || []).map((r: { karya_id: string }) => r.karya_id);
    return NextResponse.json({ likedIds });
  } catch (err) {
    console.error("[/api/like GET] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

