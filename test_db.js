import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '/mnt/c369c338-f77c-46ea-923a-21cd51718e89/Apiss/Projek/Karya STMIK Tazkia/.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function run() {
  const { data, error } = await supabase.from('conversation_participants').select('*').eq('conversation_id', 'eff9b3e4-d512-4c82-9f07-0e8a3c29259f')
  console.log('Participants:', data, error)
  
  if (data && data.length > 0) {
    const { data: profile } = await supabase.from('mahasiswa_profiles').select('id, user_id, full_name').in('user_id', data.map(d => d.student_id))
    console.log('Profiles:', profile)
  }
}
run()
