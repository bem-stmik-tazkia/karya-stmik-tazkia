import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pmrowiyvuqnxgzmlbfzx.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-anon-key";
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasValidServiceRoleKey = Boolean(
  rawServiceKey &&
  rawServiceKey.trim() !== "" &&
  rawServiceKey !== "placeholder-service-key"
);

// Digunakan untuk route yang butuh Auth/Cookies (membuat halaman jadi Dynamic)
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Digunakan khusus untuk mengambil data publik (seperti di homepage) 
// agar halaman tetap bisa di-cache/ISR tanpa harus bergantung pada cookies user.
export const supabaseServer = createSupabaseClient(
  supabaseUrl,
  supabaseAnonKey
);

// Digunakan khusus untuk server-side operasi yang membutuhkan admin privilege
// Bernilai null jika SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi, agar fallback berjalan semestinya
export const supabaseAdmin = hasValidServiceRoleKey
  ? createSupabaseClient(supabaseUrl, rawServiceKey!)
  : null;

