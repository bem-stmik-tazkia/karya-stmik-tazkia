import { createClient } from "@supabase/supabase-js";

// Standard Supabase client for Server Components (read-only / public data)
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
