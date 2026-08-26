import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: profiles, error: error1 } = await supabase.from('mahasiswa_profiles').select('*').limit(1);
  console.log("Profiles[0]:", JSON.stringify(profiles?.[0], null, 2));
}
test();
