export type Student = {
  id: string;
  nim: string;
  name: string;
  angkatan: number;
  prodi: "Teknik Informatika" | "Sistem Informasi" | "Bisnis Digital" | string;
  bio: string;
  avatarUrl: string;
  coverUrl?: string;
  statusBadge?: string;
  skills: string[];
  contactEmail: string;
  socials: {
    linkedin?: string;
    github?: string;
    instagram?: string;
    website?: string;
    portfolio?: string;
  };
  isFeatured?: boolean;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  category: "Design" | "Tech" | "Art" | "Research" | "Major" | string;
  tags: string[];
  techStack?: string[];
  imageUrl: string;
  studentId: string;
  teamMembers?: { studentId: string; role: string }[]; // Anggota tim + peran mereka (PM, Frontend, Backend, dll)
  demoUrl?: string;
  githubUrl?: string;
  badge?: string | null;
  views: number | string;
  likes: number | string;
  createdAt?: string;
  isFeatured?: boolean;
};

export const students: Student[] = [
  {
    id: "stu-1",
    nim: "2021001",
    name: "Fathan Abdillah",
    angkatan: 2022,
    prodi: "Teknik Informatika",
    bio: "Fullstack Web Developer & Open Source Enthusiast. Suka membangun aplikasi skala besar dengan Next.js, Supabase, dan TypeScript.",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400",
    coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200",
    statusBadge: "🚀 Open for Collab",
    skills: ["Next.js", "TypeScript", "TailwindCSS", "Supabase", "Node.js"],
    contactEmail: "fathan.dev@stmik-tazkia.ac.id",
    socials: {
      portfolio: "https://fathan.dev",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
    },
    isFeatured: true,
  },
  {
    id: "stu-2",
    nim: "2022015",
    name: "Siti Aisha Rahma",
    angkatan: 2023,
    prodi: "Sistem Informasi",
    bio: "UI/UX Designer & Frontend Developer. Berfokus pada Micro-interactions, Glassmorphism, dan Design Systems modern.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    coverUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=1200",
    statusBadge: "🎨 UI/UX Designer",
    skills: ["Figma", "React", "TailwindCSS", "Framer Motion", "UI/UX"],
    contactEmail: "aisha.ui@stmik-tazkia.ac.id",
    socials: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
    },
    isFeatured: true,
  },
  {
    id: "stu-3",
    nim: "2023042",
    name: "Muhammad Rizky",
    angkatan: 2023,
    prodi: "Teknik Informatika",
    bio: "AI Researcher & Python Engineer. Meneliti LLM, Computer Vision, dan Data Analytics untuk solusi kampus cerdas.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
    statusBadge: "🤖 AI & ML Engineer",
    skills: ["Python", "PyTorch", "FastAPI", "OpenCV", "TensorFlow"],
    contactEmail: "rizky.ai@stmik-tazkia.ac.id",
    socials: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
    },
    isFeatured: false,
  },
  {
    id: "stu-4",
    nim: "2024008",
    name: "Nabilah Putri",
    angkatan: 2024,
    prodi: "Bisnis Digital",
    bio: "Digital Marketer & Product Analyst. Menggabungkan teknologi web dengan strategi pertumbuhan bisnis startup syariah.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    coverUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
    statusBadge: "📈 Growth & Product",
    skills: ["Product Management", "SEO", "Data Analytics", "Figma", "HTML/CSS"],
    contactEmail: "nabilah.biz@stmik-tazkia.ac.id",
    socials: {
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
    },
    isFeatured: false,
  },
  {
    id: "stu-5",
    nim: "2021088",
    name: "Alex Rivera",
    angkatan: 2021,
    prodi: "Teknik Informatika",
    bio: "Passionate about 3D Web Graphics, Interactive Canvas, and WebGL animations. Building next-gen web applications.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    coverUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200",
    statusBadge: "💼 Mencari Magang",
    skills: ["Three.js", "WebGL", "React", "TypeScript", "Tailwind"],
    contactEmail: "alex.rivera@stmik-tazkia.ac.id",
    socials: {
      portfolio: "https://alexrivera.design",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
    },
    isFeatured: true,
  },
];

export const projects: Project[] = [
  {
    id: "proj-1",
    title: "Tazkia Smart Academic Portal",
    description: "Portal akademik mahasiswa modern dengan sistem rekomendasi mata kuliah cerdas berbasis AI dan antarmuka real-time.",
    category: "Tech",
    tags: ["Next.js", "TypeScript", "Supabase", "TailwindCSS"],
    techStack: ["Next.js", "TypeScript", "Supabase", "TailwindCSS"],
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200",
    studentId: "stu-1",
    teamMembers: [
      { studentId: "stu-1", role: "Project Manager & Backend" },
      { studentId: "stu-2", role: "UI/UX Designer" },
      { studentId: "stu-3", role: "AI / ML Engineer" },
    ],
    badge: "🔥 TOP PROJECT",
    views: 12400,
    likes: 3200,
    demoUrl: "https://academic.stmik-tazkia.ac.id",
    githubUrl: "https://github.com",
    createdAt: "2026-01-15",
    isFeatured: true,
  },
  {
    id: "proj-2",
    title: "Design System STMIK Tazkia v2.0",
    description: "Sistem desain antarmuka komprehensif untuk seluruh aplikasi web & mobile di lingkungan kampus STMIK Tazkia.",
    category: "Design",
    tags: ["Figma", "TailwindCSS", "Storybook", "Framer Motion"],
    techStack: ["Figma", "TailwindCSS", "Storybook", "Framer Motion"],
    imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=1200",
    studentId: "stu-2",
    badge: "👁️ TOP VIEWS",
    views: 24100,
    likes: 5500,
    demoUrl: "https://design.stmik-tazkia.ac.id",
    githubUrl: "https://github.com",
    createdAt: "2026-02-01",
    isFeatured: true,
  },
  {
    id: "proj-3",
    title: "Tazkia Campus AI Assistant",
    description: "Chatbot kecerdasan buatan berbasis RAG (Retrieval-Augmented Generation) untuk menjawab pertanyaan seputar kampus & tugas.",
    category: "Research",
    tags: ["Python", "FastAPI", "LangChain", "OpenAI"],
    techStack: ["Python", "FastAPI", "LangChain", "OpenAI"],
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
    studentId: "stu-3",
    badge: "🏆 BEST INNOVATION",
    views: 15200,
    likes: 4800,
    demoUrl: "https://ai.stmik-tazkia.ac.id",
    githubUrl: "https://github.com",
    createdAt: "2026-02-10",
    isFeatured: true,
  },
  {
    id: "proj-4",
    title: "EcoTrack Mobile Syariah",
    description: "Aplikasi mobile pelacak jejak karbon dan gaya hidup ramah lingkungan terintegrasi dengan dompet digital syariah.",
    category: "Tech",
    tags: ["Flutter", "Dart", "Firebase", "REST API"],
    techStack: ["Flutter", "Dart", "Firebase", "REST API"],
    imageUrl: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=1200",
    studentId: "stu-4",
    badge: "✨ STAFF PICK",
    views: 8900,
    likes: 1200,
    demoUrl: "https://ecotrack.example.com",
    githubUrl: "https://github.com",
    createdAt: "2026-02-18",
    isFeatured: false,
  },
  {
    id: "proj-5",
    title: "Neon Genesis 3D Typography",
    description: "Seri seni digital ekspresif yang mengeksplorasi tipografi futuristik dan estetika cyberpunk berbasis Three.js & WebGL.",
    category: "Art",
    tags: ["Three.js", "WebGL", "Cyberpunk", "3D"],
    techStack: ["Three.js", "WebGL", "Cinema4D"],
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200",
    studentId: "stu-5",
    badge: "🎨 CREATIVE AWARD",
    views: 18400,
    likes: 6100,
    demoUrl: "https://neontypo.example.com",
    githubUrl: "https://github.com",
    createdAt: "2026-01-28",
    isFeatured: true,
  },
  {
    id: "proj-6",
    title: "Tazkia IoT Campus Monitor",
    description: "Sistem monitoring kondisi ruangan kampus berbasis IoT, menampilkan data suhu, kelembapan, dan kehadiran secara real-time di dashboard web.",
    category: "Tech",
    tags: ["IoT", "Arduino", "Node.js", "WebSocket"],
    techStack: ["Arduino", "Node.js", "WebSocket", "SQLite"],
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
    studentId: "stu-5",
    badge: null,
    views: 7200,
    likes: 980,
    demoUrl: "https://iot.stmik-tazkia.ac.id",
    githubUrl: "https://github.com",
    createdAt: "2026-03-05",
    isFeatured: false,
  },
  {
    id: "proj-7",
    title: "Halal Fintech Dashboard",
    description: "Dashboard analitik keuangan syariah untuk UMKM berbasis Next.js dengan visualisasi data dan laporan otomatis.",
    category: "Tech",
    tags: ["Next.js", "Chart.js", "REST API", "Keuangan"],
    techStack: ["Next.js", "Chart.js", "Prisma", "PostgreSQL"],
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
    studentId: "stu-4",
    teamMembers: [
      { studentId: "stu-4", role: "Product Manager" },
      { studentId: "stu-1", role: "Frontend Developer" },
    ],
    badge: null,
    views: 5400,
    likes: 720,
    demoUrl: "https://fintech.stmik-tazkia.ac.id",
    githubUrl: "https://github.com",
    createdAt: "2026-03-20",
    isFeatured: false,
  },
];

export type FeedPost = {
  id: string;
  studentId: string;
  type: "project" | "update" | "collab";
  content: string;
  tags?: string[];
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: string; // ISO string
};

export const dummyPosts: FeedPost[] = [
  {
    id: "post-1",
    studentId: "stu-1",
    type: "project",
    content: "Akhirnya selesai juga build aplikasi Manajemen Kos berbasis Next.js dan Supabase! 🔥 Ini proyek pertama saya yang full-stack. Ada masukan untuk UI-nya?",
    tags: ["NextJS", "Supabase", "TailwindCSS"],
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    likes: 42,
    comments: 5,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-2",
    studentId: "stu-2",
    type: "collab",
    content: "Halo! Saya sedang mencari 1 Frontend Developer (diutamakan yang bisa React/Next.js) untuk join tim Lomba Gemastik cabang UI/UX. Desain Figma sudah 80% selesai. Ada yang tertarik? 🚀\n\nPrasyarat:\n• Familiar dengan Tailwind CSS\n• Bisa meeting online minimal 2x seminggu\n• Deadline submit: 1 bulan lagi",
    tags: ["Gemastik", "Frontend", "Lomba"],
    likes: 128,
    comments: 14,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-3",
    studentId: "stu-3",
    type: "update",
    content: "Hari ini belajar tentang fine-tuning LLM pakai LLaMA 3. Ternyata tidak seberat yang dibayangkan kalau pakai metode LoRA. Seru banget sumpah! 🤯\n\nNanti saya akan share dokumentasi eksperimennya minggu depan. Stay tuned!",
    tags: ["AI", "LLM", "MachineLearning"],
    likes: 85,
    comments: 8,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-4",
    studentId: "stu-4",
    type: "update",
    content: "Tips buat temen-temen yang mau mulai karier di Digital Marketing 📈\n\n1. Pelajari Google Analytics 4 — ini wajib sekarang\n2. Kuasai 1 platform ads dulu (Meta atau Google)\n3. Bangun portofolio dari projek kampus atau UMKM sekitar\n4. Sertifikasi Google Digital Marketing itu gratis lho!\n\nSemangat ya! Karier di bidang ini masih sangat menjanjikan 💪",
    tags: ["DigitalMarketing", "TipsKarier", "InfoKampus"],
    likes: 67,
    comments: 11,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-5",
    studentId: "stu-5",
    type: "project",
    content: "Akhirnya selesai bikin eksperimen dengan Three.js dan WebGL! Ini adalah visualisasi data 3D interaktif untuk tugas mata kuliah Komputasi Grafis. Bisa diputar, di-zoom, dan klik node-nya! ✨",
    tags: ["ThreeJS", "WebGL", "3D"],
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    likes: 204,
    comments: 22,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-6",
    studentId: "stu-1",
    type: "collab",
    content: "Open source project baru! 🎉\n\nSaya lagi bangun template starter kit untuk Next.js 15 + Supabase + Shadcn UI yang sudah include:\n✅ Auth (email + Google)\n✅ Dashboard layout\n✅ Row Level Security (RLS) setup\n✅ Dark mode\n\nButuh kontributor buat dokumentasi dan testing. Cek repo-nya ya!",
    tags: ["OpenSource", "NextJS", "Kontribusi"],
    likes: 91,
    comments: 17,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-7",
    studentId: "stu-2",
    type: "update",
    content: "Selesai redesign halaman landing page untuk UMKM lokal di sekitar kampus! 🎨\n\nFokus di aksesibilitas dan kecepatan load. Hasilnya PageSpeed Insights dari 43 → 94! Ternyata kuncinya cuma 3 hal: kompresi gambar, lazy loading, dan hapus CSS yang tidak terpakai. Simpel tapi impactful banget.",
    tags: ["UIDesign", "WebPerformance", "Freelance"],
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
    likes: 156,
    comments: 9,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

