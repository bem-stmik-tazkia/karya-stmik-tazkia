import { NextRequest, NextResponse } from "next/server";
import { createClient, supabaseAdmin } from "@/lib/supabase-server";

const uuidRegex = /^[a-zA-Z0-9_\-]{1,128}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { karyaId, deviceId, userId } = body as {
      karyaId?: string;
      deviceId?: string;
      userId?: string | null;
    };

    if (!karyaId || !uuidRegex.test(karyaId)) {
      return NextResponse.json({ error: "Invalid karyaId" }, { status: 400 });
    }

    const db = supabaseAdmin || (await createClient());

    // 1. Coba RPC increment_karya_view (signature karya_id)
    let { error: rpcError } = await db.rpc("increment_karya_view", {
      karya_id: karyaId,
    });

    // 2. Jika gagal, coba signature alternatif (p_karya_id, p_device_id, p_user_id)
    if (rpcError) {
      const res2 = await db.rpc("increment_karya_view", {
        p_karya_id: karyaId,
        p_device_id: deviceId || null,
        p_user_id: userId || null,
      });
      rpcError = res2.error;
    }

    // 3. Fallback: jika RPC belum ada di database, update langsung via service role
    if (rpcError) {
      console.warn("[/api/view] RPC increment_karya_view gagal, fallback ke direct update:", rpcError.message);
      
      const { data: current, error: fetchErr } = await db
        .from("karya")
        .select("views")
        .eq("id", karyaId)
        .single();

      if (!fetchErr && current) {
        await db
          .from("karya")
          .update({ views: (current.views || 0) + 1 })
          .eq("id", karyaId);
      }
    }

    // Log ke karya_views_log jika ada
    if (deviceId) {
      try {
        await db.from("karya_views_log").insert({
          karya_id: karyaId,
          device_id: deviceId,
          ...(userId ? { user_id: userId } : {}),
        });
      } catch {
        // Abaikan jika tabel karya_views_log belum ada / error
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/view] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

