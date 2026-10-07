import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { supabaseAdmin } from "@/lib/supabase-server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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
    if (!karyaId || typeof karyaId !== "string") {
      return NextResponse.json({ error: "Invalid karyaId" }, { status: 400 });
    }
    if (!deviceId || typeof deviceId !== "string") {
      return NextResponse.json({ error: "Invalid deviceId" }, { status: 400 });
    }
    if (action !== "like" && action !== "unlike") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Sanitasi input — hanya boleh UUID/alphanumeric
    const uuidRegex = /^[a-zA-Z0-9_\-]{1,128}$/;
    if (!uuidRegex.test(karyaId) || !uuidRegex.test(deviceId)) {
      return NextResponse.json({ error: "Invalid characters in input" }, { status: 400 });
    }

    // Key Redis: prefer userId (auth), fallback ke deviceId (anonymous)
    const identity = userId && typeof userId === "string" && uuidRegex.test(userId) ? userId : deviceId;
    const redisKey = `liked:${karyaId}:${identity}`;

    if (action === "like") {
      // Cek apakah sudah like sebelumnya
      const alreadyLiked = await redis.get(redisKey);
      if (alreadyLiked) {
        return NextResponse.json({ error: "Already liked", liked: true }, { status: 409 });
      }

      // Gunakan atomic increment di DB
      const { data, error } = await supabaseAdmin.rpc("increment_karya_likes", {
        karya_id: karyaId,
      });

      if (error) {
        // Fallback: manual fetch + update jika RPC belum ada
        if (error.message.includes("does not exist")) {
          const { data: karyaData, error: fetchError } = await supabaseAdmin
            .from("karya")
            .select("likes")
            .eq("id", karyaId)
            .single();

          if (fetchError || !karyaData) {
            return NextResponse.json({ error: "Karya not found" }, { status: 404 });
          }

          const newLikes = (karyaData.likes || 0) + 1;
          const { error: updateError } = await supabaseAdmin
            .from("karya")
            .update({ likes: newLikes })
            .eq("id", karyaId);

          if (updateError) {
            return NextResponse.json({ error: "Failed to update likes" }, { status: 500 });
          }
        } else {
          console.error("[/api/like] increment error:", error.message);
          return NextResponse.json({ error: "Failed to update likes" }, { status: 500 });
        }
      }

      // Simpan ke Redis (TTL 365 hari)
      await redis.set(redisKey, "1", { ex: 60 * 60 * 24 * 365 });

      return NextResponse.json({ liked: true });

    } else {
      // unlike
      const alreadyLiked = await redis.get(redisKey);
      if (!alreadyLiked) {
        return NextResponse.json({ error: "Not liked yet", liked: false }, { status: 409 });
      }

      // Gunakan atomic decrement di DB
      const { data, error } = await supabaseAdmin.rpc("decrement_karya_likes", {
        karya_id: karyaId,
      });

      if (error) {
        // Fallback: manual fetch + update jika RPC belum ada
        if (error.message.includes("does not exist")) {
          const { data: karyaData, error: fetchError } = await supabaseAdmin
            .from("karya")
            .select("likes")
            .eq("id", karyaId)
            .single();

          if (fetchError || !karyaData) {
            return NextResponse.json({ error: "Karya not found" }, { status: 404 });
          }

          const newLikes = Math.max(0, (karyaData.likes || 0) - 1);
          const { error: updateError } = await supabaseAdmin
            .from("karya")
            .update({ likes: newLikes })
            .eq("id", karyaId);

          if (updateError) {
            return NextResponse.json({ error: "Failed to update likes" }, { status: 500 });
          }
        } else {
          console.error("[/api/like] decrement error:", error.message);
          return NextResponse.json({ error: "Failed to update likes" }, { status: 500 });
        }
      }

      // Hapus dari Redis
      await redis.del(redisKey);

      return NextResponse.json({ liked: false });
    }
  } catch (err) {
    console.error("[/api/like] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Endpoint GET untuk cek status liked
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const karyaId = searchParams.get("karyaId");
    const deviceId = searchParams.get("deviceId");
    const userId = searchParams.get("userId");

    if (!karyaId || !deviceId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const uuidRegex = /^[a-zA-Z0-9_\-]{1,128}$/;
    if (!uuidRegex.test(karyaId) || !uuidRegex.test(deviceId)) {
      return NextResponse.json({ error: "Invalid characters" }, { status: 400 });
    }

    const identity = userId && uuidRegex.test(userId) ? userId : deviceId;
    const redisKey = `liked:${karyaId}:${identity}`;
    const liked = await redis.get(redisKey);

    return NextResponse.json({ liked: !!liked });
  } catch (err) {
    console.error("[/api/like GET] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
