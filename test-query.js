const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('mahasiswa_profiles').select('id, user_id, nim, full_name, email, prodi, angkatan, avatar_url, cover_url, bio, skills, status_badge, github_url, linkedin_url, instagram_url, website_url, is_featured, created_at, updated_at').limit(1);
  console.log("Data:", data);
  console.log("Error:", error);
}
test();
