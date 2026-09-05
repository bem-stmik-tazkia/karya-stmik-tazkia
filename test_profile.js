import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '.env.local') })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function run() {
  const { data: participants, error: pErr } = await supabase
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', 'eff9b3e4-d512-4c82-9f07-0e8a3c29259f')
  console.log('Participants:', participants, pErr)
  
  if (participants && participants.length > 0) {
    const { data: profiles, error: profErr } = await supabase
      .from('mahasiswa_profiles')
      .select('id, user_id, full_name')
      .in('user_id', participants.map(p => p.student_id))
    console.log('Profiles:', profiles, profErr)
  }
}
run()
