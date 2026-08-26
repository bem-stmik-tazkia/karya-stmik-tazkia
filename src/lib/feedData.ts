// ============================================================
// Feed types — digunakan oleh halaman Feed (belum ada di Supabase)
// ============================================================
export type FeedPost = {
  id: string;
  studentId: string;
  type: "project" | "update" | "collab";
  content: string;
  tags?: string[];
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
};

// Local student type (dipakai di Feed, bukan dari Supabase)
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

// Dummy data untuk Feed (sementara, sebelum fitur Feed pindah ke Supabase)
export const students: Student[] = [
  {
    id: "stu-1",
    nim: "2021001",
    name: "Fathan Abdillah",
    angkatan: 2022,
    prodi: "Teknik Informatika",
    bio: "Fullstack Web Developer & Open Source Enthusiast.",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400",
    statusBadge: "🚀 Open for Collab",
    skills: ["Next.js", "TypeScript", "TailwindCSS", "Supabase"],
    contactEmail: "fathan.dev@stmik-tazkia.ac.id",
    socials: { github: "https://github.com", linkedin: "https://linkedin.com" },
    isFeatured: true,
  },
  {
    id: "stu-2",
    nim: "2022015",
    name: "Siti Aisha Rahma",
    angkatan: 2023,
    prodi: "Sistem Informasi",
    bio: "UI/UX Designer & Frontend Developer.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    statusBadge: "🎨 UI/UX Designer",
    skills: ["Figma", "React", "TailwindCSS"],
    contactEmail: "aisha.ui@stmik-tazkia.ac.id",
    socials: { github: "https://github.com", instagram: "https://instagram.com" },
    isFeatured: true,
  },
  {
    id: "stu-3",
    nim: "2023042",
    name: "Muhammad Rizky",
    angkatan: 2023,
    prodi: "Teknik Informatika",
    bio: "AI Researcher & Python Engineer.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    statusBadge: "🤖 AI & ML Engineer",
    skills: ["Python", "PyTorch", "FastAPI"],
    contactEmail: "rizky.ai@stmik-tazkia.ac.id",
    socials: { github: "https://github.com" },
    isFeatured: false,
  },
  {
    id: "stu-4",
    nim: "2024008",
    name: "Nabilah Putri",
    angkatan: 2024,
    prodi: "Bisnis Digital",
    bio: "Digital Marketer & Product Analyst.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    statusBadge: "📈 Growth & Product",
    skills: ["Product Management", "SEO", "Data Analytics"],
    contactEmail: "nabilah.biz@stmik-tazkia.ac.id",
    socials: { linkedin: "https://linkedin.com" },
    isFeatured: false,
  },
];

export const dummyPosts: FeedPost[] = [
  {
    id: "post-1",
    studentId: "stu-1",
    type: "project",
    content: "Akhirnya selesai juga build aplikasi Manajemen Kos berbasis Next.js dan Supabase! 🔥 Ini proyek pertama saya yang full-stack. Ada masukan untuk UI-nya?",
    tags: ["NextJS", "Supabase", "TailwindCSS"],
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    likes: 42,
    comments: 5,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-2",
    studentId: "stu-2",
    type: "collab",
    content: "Halo! Saya sedang mencari 1 Frontend Developer untuk join tim Lomba Gemastik cabang UI/UX. Desain Figma sudah 80% selesai. Ada yang tertarik? 🚀\n\nPrasyarat:\n• Familiar dengan Tailwind CSS\n• Bisa meeting online minimal 2x seminggu",
    tags: ["Gemastik", "Frontend", "Lomba"],
    likes: 128,
    comments: 14,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-3",
    studentId: "stu-3",
    type: "update",
    content: "Hari ini belajar tentang fine-tuning LLM pakai LLaMA 3. Ternyata tidak seberat yang dibayangkan kalau pakai metode LoRA. Seru banget! 🤯",
    tags: ["AI", "LLM", "MachineLearning"],
    likes: 85,
    comments: 8,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-4",
    studentId: "stu-4",
    type: "update",
    content: "Tips buat temen-temen yang mau mulai karier di Digital Marketing 📈\n\n1. Pelajari Google Analytics 4\n2. Kuasai 1 platform ads dulu\n3. Bangun portofolio dari projek kampus\n4. Sertifikasi Google Digital Marketing itu gratis lho!",
    tags: ["DigitalMarketing", "TipsKarier"],
    likes: 67,
    comments: 11,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
