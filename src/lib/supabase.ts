import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pmrowiyvuqnxgzmlbfzx.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-anon-key";


export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

