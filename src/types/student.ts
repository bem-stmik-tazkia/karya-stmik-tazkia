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
  cardSkin?: string;
};

