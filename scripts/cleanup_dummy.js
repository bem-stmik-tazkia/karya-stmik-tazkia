import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanup() {
  console.log('Starting cleanup process...');

  // 1. Find the dummy users
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Failed to list users:', authError);
    return;
  }

  const dummyUsers = authData.users.filter(u => u.email?.startsWith('dummy_') && u.email?.endsWith('@student.stmik.tazkia.ac.id'));

  if (dummyUsers.length === 0) {
    console.log('No dummy users found.');
    return;
  }

  console.log(`Found ${dummyUsers.length} dummy user(s). Proceeding with cleanup...`);

  for (const user of dummyUsers) {
    const userId = user.id;
    console.log(`Cleaning up data for dummy user: ${user.email} (${userId})`);

    // Delete Feed Posts
    const { error: feedError } = await supabase.from('feed_posts').delete().eq('student_id', userId);
    if (feedError) console.error('Error deleting feed posts:', feedError);
    else console.log('- Deleted feed posts');

    // Delete Karya
    const { error: karyaError } = await supabase.from('karya').delete().eq('user_id', userId);
    if (karyaError) console.error('Error deleting karya:', karyaError);
    else console.log('- Deleted karya');

    // Delete Mahasiswa Profiles
    const { error: profileError } = await supabase.from('mahasiswa_profiles').delete().eq('user_id', userId);
    if (profileError) console.error('Error deleting profile:', profileError);
    else console.log('- Deleted mahasiswa profile');

    // Delete Auth User
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteAuthError) console.error('Error deleting auth user:', deleteAuthError);
    else console.log('- Deleted auth user');
  }

  console.log('Cleanup completed successfully!');
}

cleanup();
