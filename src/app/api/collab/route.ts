import { NextRequest, NextResponse } from "next/server";
import { createClient, supabaseAdmin } from "@/lib/supabase-server";

const SETTINGS_KEY = "collab_requests";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;
    const dbClient = supabaseAdmin || supabase;

    // 1. ACTION: SEND INVITATION
    if (action === "send") {
      const {
        karyaId,
        karyaTitle,
        recipientUserId,
        recipientName,
        role,
      } = body;

      if (!karyaId || !recipientUserId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      // 1. Tolak jika recipientUserId sama dengan user.id (tidak boleh mengundang diri sendiri)
      if (recipientUserId === user.id) {
        return NextResponse.json(
          { error: "Tidak dapat mengundang diri sendiri ke dalam tim." },
          { status: 400 }
        );
      }

      // 2. Ambil data karya dari DB dan verifikasi kepemilikan (hanya pemilik karya yang boleh mengundang)
      const { data: karya, error: karyaErr } = await dbClient
        .from("karya")
        .select("id, title, user_id, team")
        .eq("id", karyaId)
        .maybeSingle();

      if (karyaErr || !karya) {
        return NextResponse.json({ error: "Karya tidak ditemukan" }, { status: 404 });
      }

      if (karya.user_id !== user.id) {
        return NextResponse.json(
          { error: "Forbidden: Hanya pemilik karya yang berhak mengundang anggota tim." },
          { status: 403 }
        );
      }

      // 3. Kunci inviterName ke sesi login server (Anti-Spoofing nama)
      const invName = user.user_metadata?.full_name || "Pemilik Karya";
      const resolvedTitle = karya.title || karyaTitle || "Projek";

      // 4. Ambil currentRequests dari system_settings untuk cek duplikat undangan pending
      const { data: currentSetting } = await dbClient
        .from("system_settings")
        .select("value")
        .eq("key", SETTINGS_KEY)
        .maybeSingle();

      let currentRequests: any[] = [];
      if (currentSetting?.value) {
        try {
          currentRequests = JSON.parse(currentSetting.value);
        } catch {}
      }

      // 5. Tolak jika sudah ada request 'pending' untuk karyaId + recipientUserId yang sama (Anti-Spam)
      const isAlreadyPending = currentRequests.some(
        (r) => r.karyaId === karyaId && r.recipientUserId === recipientUserId && r.status === "pending"
      );
      if (isAlreadyPending) {
        return NextResponse.json(
          { error: "Undangan kolaborasi untuk mahasiswa ini masih berstatus pending." },
          { status: 409 }
        );
      }

      const newRequest = {
        id: `collab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        karyaId,
        karyaTitle: resolvedTitle,
        inviterUserId: user.id,
        inviterName: invName,
        recipientUserId,
        recipientName: recipientName || "Mahasiswa",
        role: role || "Anggota Tim",
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const updated = [newRequest, ...currentRequests];

      await dbClient.from("system_settings").upsert({
        key: SETTINGS_KEY,
        value: JSON.stringify(updated),
      });

      // Kirim notifikasi ke penerima
      try {
        await dbClient.from("notifications").insert([
          {
            user_id: recipientUserId,
            type: "collab_request",
            title: `🤝 Undangan Kolaborasi Tim Projek`,
            message: `${invName} mengundang Anda untuk bergabung ke dalam tim projek "${resolvedTitle}" sebagai ${role || "Anggota Tim"}.`,
            karya_id: karyaId,
            is_read: false,
          },
        ]);
      } catch (notifErr) {
        console.warn("Failed to insert collab notification:", notifErr);
      }

      return NextResponse.json({ success: true, request: newRequest });
    }

    // 2. ACTION: RESPOND TO INVITATION (ACCEPT / REJECT)
    if (action === "respond" || body.intent === "respond") {
      const {
        karyaId,
        notificationId,
      } = body;
      const responseAction = body.responseAction || body.action;

      if (!karyaId || !responseAction) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      // Whitelist responseAction: hanya 'accept' atau 'reject'
      if (responseAction !== "accept" && responseAction !== "reject") {
        return NextResponse.json(
          { error: "Invalid responseAction. Harus bernilai 'accept' atau 'reject'." },
          { status: 400 }
        );
      }

      // Kunci identitas responder murni dari sesi login server (Anti-IDOR & Anti-Spoofing)
      const activeUserId = user.id;
      const respName = user.user_metadata?.full_name || "Mahasiswa";
      const isAccept = responseAction === "accept";

      // 1. Ambil data karya saat ini
      const { data: karya, error: karyaErr } = await dbClient
        .from("karya")
        .select("id, title, user_id, team")
        .eq("id", karyaId)
        .maybeSingle();

      if (karyaErr || !karya) {
        return NextResponse.json({ error: "Karya tidak ditemukan" }, { status: 404 });
      }

      // 2. Ambil daftar undangan kolaborasi dari system_settings
      const { data: currentSetting } = await dbClient
        .from("system_settings")
        .select("value")
        .eq("key", SETTINGS_KEY)
        .maybeSingle();

      let currentRequests: any[] = [];
      if (currentSetting?.value) {
        try {
          currentRequests = JSON.parse(currentSetting.value);
        } catch {}
      }

      // 3. Verifikasi ketat: user HARUS memiliki undangan berstatus 'pending'
      const currentTeam: any[] = Array.isArray(karya.team) ? karya.team : [];
      const isInvitedInTeam = currentTeam.some(
        (m: any) => m.user_id === activeUserId && m.status === "pending"
      );
      const isInvitedInRequests = currentRequests.some(
        (r: any) => r.karyaId === karyaId && r.recipientUserId === activeUserId && r.status === "pending"
      );

      if (!isInvitedInTeam && !isInvitedInRequests) {
        return NextResponse.json(
          { error: "Forbidden: Anda tidak memiliki undangan pending untuk karya ini." },
          { status: 403 }
        );
      }

      // 4. Update status anggota di karya.team
      let memberFound = false;
      const updatedTeam = currentTeam.map((member) => {
        if (member.user_id === activeUserId) {
          memberFound = true;
          return {
            ...member,
            status: isAccept ? "accepted" : "rejected",
          };
        }
        return member;
      });

      // Jika diundang via collab_requests tapi belum ada di team array saat accept
      if (!memberFound && isAccept) {
        const reqItem = currentRequests.find(
          (r: any) => r.karyaId === karyaId && r.recipientUserId === activeUserId && r.status === "pending"
        );
        updatedTeam.push({
          name: respName,
          role: reqItem?.role || "Anggota Tim",
          user_id: activeUserId,
          avatar: user.user_metadata?.avatar_url || "",
          status: "accepted",
        });
      }

      const { error: updateKaryaErr } = await dbClient
        .from("karya")
        .update({ team: updatedTeam })
        .eq("id", karyaId);

      if (updateKaryaErr) {
        console.error("Failed to update karya team:", updateKaryaErr);
      }

      // 5. Update status di system_settings key collab_requests (menggunakan currentRequests yang sudah dibaca)
      if (currentRequests.length > 0) {
        try {
          const updatedRequests = currentRequests.map((r: any) => {
            if (r.karyaId === karyaId && r.recipientUserId === activeUserId && r.status === "pending") {
              return {
                ...r,
                status: isAccept ? "accepted" : "rejected",
                respondedAt: new Date().toISOString(),
              };
            }
            return r;
          });

          await dbClient.from("system_settings").upsert({
            key: SETTINGS_KEY,
            value: JSON.stringify(updatedRequests),
          });
        } catch {}
      }

      // 6. Update notifikasi yang masuk menjadi read (Wajib difilter user_id agar tidak memanipulasi milik orang lain)
      if (notificationId) {
        await dbClient
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notificationId)
          .eq("user_id", activeUserId);
      } else {
        await dbClient
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", activeUserId)
          .eq("karya_id", karyaId)
          .eq("type", "collab_request");
      }

      // 5. Kirim notifikasi balasan ke pemilik/pembuat karya (karya.user_id)
      if (karya.user_id && karya.user_id !== activeUserId) {
        try {
          await dbClient.from("notifications").insert([
            {
              user_id: karya.user_id,
              type: isAccept ? "collab_accepted" : "collab_rejected",
              title: isAccept ? "🎉 Undangan Kolaborasi Diterima!" : "Undangan Kolaborasi Ditolak",
              message: isAccept
                ? `${respName} telah MENERIMA undangan untuk bergabung ke dalam tim projek "${karya.title}"! Kolaborasi kini resmi aktif.`
                : `${respName} menolak undangan bergabung ke dalam tim projek "${karya.title}".`,
              karya_id: karyaId,
              is_read: false,
            },
          ]);
        } catch (notifErr) {
          console.warn("Failed to notify inviter:", notifErr);
        }
      }

      return NextResponse.json({
        success: true,
        action: responseAction,
        team: updatedTeam,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Collab API error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
