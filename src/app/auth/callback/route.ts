import { NextResponse, NextRequest } from "next/server";
import { createClient, supabaseAdmin } from "@/lib/supabase-server";

function extractAngkatanFromEmail(email: string): number {
  const match = email.match(/^(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    if (year >= 15 && year <= 35) {
      return 2000 + year;
    }
  }
  return new Date().getFullYear();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const authError = searchParams.get("error");
  const authErrorDesc = searchParams.get("error_description");
  
  const publicOrigin = request.nextUrl.origin;

  // Sanitasi next parameter untuk mencegah open redirect
  const safeNext = (rawNext.startsWith("/") && !rawNext.startsWith("//")) ? rawNext : "/dashboard";

  if (authError) {
    console.error("[OAuth Google Error]:", authError, authErrorDesc);
    return NextResponse.redirect(`${publicOrigin}/login?error=Otorisasi akun Google dibatalkan atau ditolak.`);
  }

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Validate email domain
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email) {
        const normalizedEmail = user.email.toLowerCase().trim();
        const isStudent = normalizedEmail.endsWith("@student.stmik.tazkia.ac.id");
        const isStaff = normalizedEmail.endsWith("@stmik.tazkia.ac.id");
        
        if (!isStudent && !isStaff) {
          // Sign out immediately if domain is not valid
          await supabase.auth.signOut();
          return NextResponse.redirect(`${publicOrigin}/login?error=Akses belum dapat diberikan. Silakan gunakan email resmi kampus STMIK Tazkia.`);
        }

        // Auto-provision mahasiswa profile jika belum ada
        try {
          const dbClient = supabaseAdmin || supabase;
          const { data: existingProfile } = await dbClient
            .from("mahasiswa_profiles")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!existingProfile) {
            const defaultName = user.user_metadata?.full_name || user.user_metadata?.name || normalizedEmail.split("@")[0] || "Mahasiswa";
            const autoAngkatan = extractAngkatanFromEmail(normalizedEmail);

            await dbClient.from("mahasiswa_profiles").insert([{
              user_id: user.id,
              full_name: defaultName,
              email: normalizedEmail,
              prodi: "", // Dikosongkan agar modal Lengkapi Profil otomatis muncul meminta konfirmasi mahasiswa
              angkatan: autoAngkatan, // Nilai tebakan awal (default), tetap bisa diganti bebas oleh mahasiswa di modal & edit profil
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
              skills: [],
            }]);
          }
        } catch (profileErr) {
          console.error("[AUTO_PROFILE_PROVISION_ERROR]:", profileErr);
        }
      }

      return NextResponse.redirect(`${publicOrigin}${safeNext}`);
    } else {
      console.error("[AUTH_CALLBACK_EXCHANGE_ERROR]:", error);
    }
  }

  // Return the user to login page if there's an error
  return NextResponse.redirect(`${publicOrigin}/login?error=Mohon maaf, proses masuk akun belum berhasil. Silakan coba kembali.`);
}
