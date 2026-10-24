export type StudentBadge = {
  id: string;
  label: string;
  icon?: string;
  color?: string;
};

export type Student = {
  id: string;
  name: string;
  angkatan: number;
  prodi: "Teknik Informatika" | "Sistem Informasi" | "Bisnis Digital" | string;
  bio: string;
  avatarUrl: string;
  coverUrl?: string;
  statusBadge?: string;
  rawStatusBadge?: string; // format DB asli, misal "🤝 Siap Freelance" (sebelum normalize)
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
  userId?: string;
  followersCount?: number;
  followingCount?: number;
  badges?: StudentBadge[];
  featuredBadgeIds?: number[];
  unlockedBadgeIds?: number[];
  cardSkin?: string;
};

