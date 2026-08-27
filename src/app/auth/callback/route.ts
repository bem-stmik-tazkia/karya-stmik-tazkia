import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  
  const publicOrigin = request.nextUrl.origin;

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Validate email domain
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email) {
        const isStudent = user.email.endsWith("@student.stmik.tazkia.ac.id");
        const isStaff = user.email.endsWith("@stmik.tazkia.ac.id");
        
        if (!isStudent && !isStaff) {
          // Sign out immediately if domain is not valid
          await supabase.auth.signOut();
          return NextResponse.redirect(`${publicOrigin}/login?error=Akses ditolak. Silakan gunakan email kampus STMIK Tazkia.`);
        }
      }

      return NextResponse.redirect(`${publicOrigin}${next}`);
    }
  }

  // Return the user to login page if there's an error
  return NextResponse.redirect(`${publicOrigin}/login?error=Gagal login. Silakan coba lagi.`);
}
