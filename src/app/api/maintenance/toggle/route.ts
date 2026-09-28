import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  // Verify admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRecord) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const active: boolean = body.active ?? false;

  // Set cookie to sync proxy with DB state
  const response = NextResponse.json({ success: true, active });

  if (active) {
    response.cookies.set("maintenance_mode", "true", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: false,
      sameSite: "lax",
    });
  } else {
    response.cookies.delete("maintenance_mode");
  }

  return response;
}
