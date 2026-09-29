import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("system_settings")
    .select("key, value")
    .in("key", ["announcement_active", "announcement_message", "app_version"]);

  if (error || !data) {
    return NextResponse.json({ active: false, message: "" });
  }

  const info = { active: false, message: "", version: "v1.0.0" };
  for (const item of data) {
    if (item.key === "announcement_active") info.active = item.value === "true";
    if (item.key === "announcement_message") info.message = item.value;
    if (item.key === "app_version") info.version = item.value;
  }

  return NextResponse.json(info);
}

export async function POST(request: Request) {
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

  const { checkRateLimit } = await import("@/utils/rateLimit");
  const { success, reset } = await checkRateLimit(`announcement-${user.id}`, 10, 60000);
  if (!success) {
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return NextResponse.json({ error: "Too many requests" }, { 
      status: 429,
      headers: { "Retry-After": retryAfter.toString() }
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { z } = await import("zod");
  const schema = z.object({
    active: z.boolean().optional(),
    message: z.string().max(500).optional(),
    version: z.string().max(50).optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.issues }, { status: 400 });
  }
  const { active, message, version } = parsed.data;

  const updates = [];
  if (active !== undefined) {
    updates.push(
      supabase.from("system_settings").upsert({ key: "announcement_active", value: String(active) })
    );
  }
  if (message !== undefined) {
    updates.push(
      supabase.from("system_settings").upsert({ key: "announcement_message", value: message })
    );
  }
  if (version !== undefined) {
    updates.push(
      supabase.from("system_settings").upsert({ key: "app_version", value: version })
    );
  }

  await Promise.all(updates);
  return NextResponse.json({ success: true });
}
