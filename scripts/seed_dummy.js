import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log('Starting seed process...');

  // 1. Create a dummy user in auth.users
  const dummyEmail = `dummy_${Date.now()}@student.stmik.tazkia.ac.id`;
  console.log(`Creating dummy auth user: ${dummyEmail}`);
  
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: dummyEmail,
    password: 'password123',
    email_confirm: true,
    user_metadata: { full_name: 'Fulan bin Fulan', avatar_url: 'https://i.pravatar.cc/150?u=fulan' }
  });

  if (authError) {
    console.error('Failed to create auth user:', authError);
    return;
  }

  const userId = authData.user.id;
  console.log(`Created auth user with ID: ${userId}`);

  // 2. Create profile
  const { error: profileError } = await supabase.from('mahasiswa_profiles').insert({
    user_id: userId,
    full_name: 'Fulan bin Fulan',
    prodi: 'S1 Informatika',
    angkatan: 2021,
    avatar_url: 'https://i.pravatar.cc/150?u=fulan',
    email: dummyEmail
  });

  if (profileError) {
    console.error('Failed to create profile (might already exist by trigger, ignoring):', profileError.message);
  } else {
    console.log('Created mahasiswa profile.');
  }

  // 3. Insert Dummy Karya (Unggulan)
  const dummyKarya = [
    {
      user_id: userId,
      title: 'Sistem Navigasi Cerdas Kampus',
      slug: 'sistem-navigasi-' + Date.now(),
      category: 'Technology',
      description: 'Aplikasi peta interaktif untuk membantu mahasiswa baru menemukan ruang kelas dan fasilitas di area kampus STMIK Tazkia secara real-time.',
      tech_stack: ['React', 'Node.js', 'PostgreSQL', 'Mapbox'],
      live_url: 'https://demo-nav.tazkia.edu',
      github_url: 'https://github.com/tazkia/navigasi',
      image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200&auto=format&fit=crop',
      status: 'approved',
      views: 1250,
      likes: 85,
      features: [{title: 'Real-time Tracking', desc: 'Lacak posisi terkini di area kampus.'}],
      team: [{name: 'Fulan bin Fulan', role: 'Project Lead', avatar: 'https://i.pravatar.cc/150?u=fulan'}]
    },
    {
      user_id: userId,
      title: 'Aplikasi Deteksi Kualitas Daun Teh',
      slug: 'deteksi-teh-' + Date.now(),
      category: 'Programming',
      description: 'Aplikasi mobile menggunakan AI (Computer Vision) untuk mengklasifikasikan kualitas daun teh langsung dari kamera smartphone.',
      tech_stack: ['Flutter', 'Python', 'TensorFlow Lite'],
      live_url: 'https://play.google.com/store/apps/demo-tea',
      image_url: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8c0a1?q=80&w=1200&auto=format&fit=crop',
      status: 'approved',
      views: 3420,
      likes: 210,
      features: [{title: 'Scan Kamera', desc: 'Langsung scan daun dari HP.'}],
      team: [{name: 'Fulan bin Fulan', role: 'AI Engineer'}]
    },
    {
      user_id: userId,
      title: 'Smart Garden IoT System',
      slug: 'smart-garden-' + Date.now(),
      category: 'IoT',
      description: 'Sistem penyiraman tanaman otomatis berbasis IoT dengan sensor kelembaban tanah dan dashboard monitoring cuaca terintegrasi.',
      tech_stack: ['Arduino', 'ESP32', 'Vue.js', 'Firebase'],
      live_url: 'https://iot-garden.demo.app',
      image_url: 'https://images.unsplash.com/photo-1558904541-efa843a96f0f?q=80&w=1200&auto=format&fit=crop',
      status: 'approved',
      views: 890,
      likes: 56,
      features: [{title: 'Otomasi Penyiraman', desc: 'Menyiram jika tanah kering.'}],
      team: [{name: 'Fulan bin Fulan', role: 'Hardware Engineer'}]
    }
  ];

  console.log('Inserting dummy Karya...');
  const { error: karyaError } = await supabase.from('karya').insert(dummyKarya);
  if (karyaError) console.error('Error inserting Karya:', karyaError);
  else console.log('Successfully inserted 3 Karya Unggulan.');

  // 4. Insert Dummy Feed Posts
  const dummyPosts = [
    {
      student_id: userId,
      content: 'Halo teman-teman! Saya baru saja mempublikasikan proyek Smart Garden IoT. Sistem ini bisa mengatur penyiraman secara mandiri berdasarkan cuaca. Cek di galeri ya! #IoT #SmartFarming',
      type: 'project',
      tags: ['IoT', 'SmartFarming', 'Arduino']
    },
    {
      student_id: userId,
      content: 'Ada yang tertarik collab untuk lomba Gemastik tahun depan? Saya cari orang yang jago UI/UX dan Mobile Dev. #Collab #Gemastik',
      type: 'collab',
      tags: ['Collab', 'Gemastik', 'MobileDev']
    }
  ];

  console.log('Inserting dummy Feed Posts...');
  const { error: feedError } = await supabase.from('feed_posts').insert(dummyPosts);
  if (feedError) console.error('Error inserting Feed Posts:', feedError);
  else console.log('Successfully inserted 2 Feed Posts.');

  console.log('Done seeding dummy data!');
}

seed();
