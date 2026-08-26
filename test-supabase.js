require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data: profiles, error: error1 } = await supabase.from('mahasiswa_profiles').select('*');
  console.log("Profiles:", profiles, "Error:", error1);
  
  const { data: karya, error: error2 } = await supabase.from('karya').select('*');
  console.log("Karya:", karya ? karya.length : 0, "Error:", error2);
}
test();
