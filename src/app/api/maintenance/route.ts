import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET: Cek status maintenance mode
export async function GET() {
  const { data, error } = await supabase
    .from("system_settings")
    .select("key, value")
    .in("key", ["maintenance_mode", "maintenance_message", "maintenance_end_time"])
    .order("key");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: Record<string, string> = {};
  data?.forEach((row) => {
    settings[row.key] = row.value;
  });

  const isActive = settings["maintenance_mode"] === "true";

  return NextResponse.json({
    active: isActive,
    message: settings["maintenance_message"] || "Kami sedang melakukan pemeliharaan sistem.",
    endTime: settings["maintenance_end_time"] || null,
  });
}
