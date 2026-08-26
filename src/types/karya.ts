// ============================================================
// Types matching the Supabase shared database (BEM STMIK Tazkia)
// ============================================================

/**
 * Tabel: public.karya
 * Kategori yang valid: "Technology" | "Programming" | "Research" | "IoT" | "Multimedia"
 */
export type Karya = {
  id: string;
  title: string;
  slug: string;
  category: "Technology" | "Programming" | "Research" | "IoT" | "Multimedia" | string;
  description: string;
  github_url?: string | null;
  live_url?: string | null;
  image_url?: string | null;
  images?: string[];
  gallery?: { url: string; caption?: string }[];
  team?: { name: string; role?: string; avatar?: string; user_id?: string }[];
  tech_stack?: string[];
  views: number;
  likes: number;
  status?: "pending" | "approved" | "rejected";
  reject_reason?: string | null;
  features?: { title: string; description: string }[];
  video_url?: string | null;
  user_id?: string | null;
  created_at: string;
};

/**
 * Tabel: public.mahasiswa_profiles
 */
export type MahasiswaProfile = {
  id: string;
  user_id?: string | null;
  nim?: string | null;
  full_name: string;
  email: string;
  angkatan: number;
  prodi: "Teknik Informatika" | "Sistem Informasi" | "Bisnis Digital" | string;
  avatar_url?: string | null;
  cover_url?: string | null;
  bio?: string | null;
  status_badge?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  instagram_url?: string | null;
  website_url?: string | null;
  skills?: string[];
  is_featured?: boolean;
  created_at: string;
  updated_at?: string;
};

/**
 * Tabel: public.mahasiswa_projects
 */
export type MahasiswaProject = {
  id: string;
  mahasiswa_id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  tech_stack?: string[];
  demo_url?: string | null;
  github_url?: string | null;
  cover_image?: string | null;
  likes_count?: number;
  is_featured?: boolean;
  created_at: string;
  updated_at?: string;
};

// ============================================================
// Kategori mapping — nilai DB → label yang tampil di UI
// (Sama persis dengan BEM STMIK Tazkia)
// ============================================================
export type KaryaCategory = "Technology" | "Programming" | "Research" | "IoT" | "Multimedia";

export const KARYA_CATEGORIES: { value: string; label: string }[] = [
  { value: "All", label: "Semua Karya" },
  { value: "Technology", label: "Web & System Apps" },
  { value: "Programming", label: "Mobile Apps" },
  { value: "Research", label: "Research & Journals" },
  { value: "IoT", label: "IoT Projects" },
  { value: "Multimedia", label: "Design & Others" },
];
