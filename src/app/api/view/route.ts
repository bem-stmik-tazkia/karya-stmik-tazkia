import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase-server";

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

    // Gunakan supabaseAdmin jika service role key tersedia, jika tidak gunakan supabaseServer (anon key)
    const db = supabaseAdmin || supabaseServer;

    let success = false;
    let lastError: string | null = null;

    // 1. Coba RPC increment_karya_view (signature 1: karya_id UUID)
    const res1 = await db.rpc("increment_karya_view", {
      karya_id: karyaId,
    });

    if (!res1.error) {
      success = true;
    } else {
      lastError = res1.error.message;
      // 2. Coba signature 2: p_karya_id
      const res2 = await db.rpc("increment_karya_view", {
        p_karya_id: karyaId,
      });

      if (!res2.error) {
        success = true;
      } else {
        lastError = res2.error.message;
        // 3. Coba signature 3: (p_karya_id, p_device_id, p_user_id)
        const res3 = await db.rpc("increment_karya_view", {
          p_karya_id: karyaId,
          p_device_id: deviceId || null,
          p_user_id: userId || null,
        });

        if (!res3.error) {
          success = true;
        } else {
          lastError = res3.error.message;
          // 4. Fallback direct update hanya jika supabaseAdmin aktif
          if (supabaseAdmin) {
            console.warn("[/api/view] Semua RPC gagal, mencoba fallback direct update:", lastError);
            const { data: current, error: fetchErr } = await supabaseAdmin
              .from("karya")
              .select("views")
              .eq("id", karyaId)
              .single();

            if (!fetchErr && current) {
              const { error: updateErr } = await supabaseAdmin
                .from("karya")
                .update({ views: (current.views || 0) + 1 })
                .eq("id", karyaId);

              if (!updateErr) {
                success = true;
              } else {
                lastError = updateErr.message;
              }
            } else if (fetchErr) {
              lastError = fetchErr.message;
            }
          }
        }
      }
    }

    if (!success) {
      console.error("[/api/view] Gagal menambah view untuk karyaId:", karyaId, "Error:", lastError);
      return NextResponse.json(
        { success: false, error: lastError || "Gagal menambah view" },
        { status: 500 }
      );
    }

    // Log ke karya_views_log jika ada tabelnya
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

