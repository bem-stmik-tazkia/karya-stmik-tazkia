import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: karya, error } = await supabase.from('karya').select('*').limit(1);
  console.log("Team:", JSON.stringify(karya?.[0]?.team, null, 2));
}
test();
