import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: profiles, error: error1 } = await supabase.from('mahasiswa_profiles').select('*');
  console.log("Profiles Length:", profiles?.length, "Error:", error1);
  
  const { data: karya, error: error2 } = await supabase.from('karya').select('*');
  console.log("Karya Length:", karya?.length, "Error:", error2);
}
test();
