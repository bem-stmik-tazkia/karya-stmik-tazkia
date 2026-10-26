import type { MahasiswaProfile, Karya } from "@/types/karya";
import type { Student, StudentBadge } from "@/types/student";
import { PREDEFINED_SKILLS } from "@/utils/skillOptions";

// Helper: check if a karya belongs to the student (by user_id, studentId, or team member)
export function isStudentKarya(
  k: Karya,
  studentName: string,
  studentUserId?: string | null,
  studentId?: string | null
): boolean {
  if (studentUserId && k.user_id === studentUserId) return true;
  if (studentId && k.user_id === studentId) return true;
  if (k.team && Array.isArray(k.team)) {
    return k.team.some((tm: any) => {
      if (tm.status === "rejected") return false;
      if (studentUserId && tm.user_id === studentUserId) return true;
      if (studentId && tm.user_id === studentId) return true;
      if (tm.name && tm.name.toLowerCase() === studentName.toLowerCase()) return true;
      return false;
    });
  }
  return false;
}

export function normalizeStatusBadge(raw?: string | null): string {
  if (!raw) return "Open for Collab";
  // Remove leading emojis/special chars and trim
  const cleaned = raw.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s]+/u, "").trim();
  return cleaned || "Open for Collab";
}

export function getStudentBadges(m: MahasiswaProfile, allKarya: Karya[] = []): StudentBadge[] {
  if (Array.isArray(m.badges) && m.badges.length > 0) {
    return m.badges.map((b: any, idx: number) =>
      typeof b === "string"
        ? { id: `b-${idx}`, label: b, icon: "🎖️" }
        : b
    );
  }

  const list: StudentBadge[] = [];

  // Project creator badge
  const studentProjects = allKarya.filter((k) =>
    isStudentKarya(k, m.full_name, m.user_id, m.id)
  );
  if (studentProjects.length > 0) {
    list.push({ id: "creator", label: `${studentProjects.length} Karya Terbit`, icon: "🚀" });
  }

  if (m.is_featured) {
    list.push({ id: "featured", label: "Mahasiswa Unggulan", icon: "🏆" });
  }

  const normalizedStatus = normalizeStatusBadge(m.status_badge);
  if (normalizedStatus === "Siap Freelance") {
    list.push({ id: "freelance", label: "Siap Freelance", icon: "💼" });
  } else if (normalizedStatus === "Mencari Magang") {
    list.push({ id: "intern", label: "Mencari Magang", icon: "🎯" });
  } else if (normalizedStatus === "Mencari Mentor") {
    list.push({ id: "mentor", label: "Eksplorasi Karir", icon: "🔍" });
  } else if (normalizedStatus === "Open for Collab") {
    list.push({ id: "collab", label: "Open Collab", icon: "🤝" });
  } else if (normalizedStatus === "Fokus Belajar") {
    list.push({ id: "study", label: "Fokus Studi", icon: "📚" });
  }

  if (m.angkatan === 1) {
    list.push({ id: "gen1", label: "Perintis Gen 1", icon: "🌟" });
  } else if (m.angkatan === 2) {
    list.push({ id: "gen2", label: "Talenta Gen 2", icon: "⚡" });
  }

  const validSkills = (m.skills || []).filter((s) => Boolean(s) && PREDEFINED_SKILLS.includes(s));
  const skillsStr = validSkills.join(" ").toLowerCase();
  if (skillsStr.includes("cyber") || skillsStr.includes("security")) {
    list.push({ id: "cyber", label: "Cyber Security", icon: "🛡️" });
  }
  if (skillsStr.includes("design") || skillsStr.includes("photo") || skillsStr.includes("video")) {
    list.push({ id: "media", label: "Creative Media", icon: "🎨" });
  }
  if (skillsStr.includes("frontend") || skillsStr.includes("backend") || skillsStr.includes("developer") || skillsStr.includes("web")) {
    list.push({ id: "engineer", label: "Software Engineer", icon: "💻" });
  }
  if (skillsStr.includes("network") || skillsStr.includes("support") || skillsStr.includes("it")) {
    list.push({ id: "itnet", label: "Network & SysAdmin", icon: "⚡" });
  }
  if (skillsStr.includes("data") || skillsStr.includes("analyst")) {
    list.push({ id: "data", label: "Data Specialist", icon: "📊" });
  }

  if (list.length === 0) {
    list.push({ id: "tazkia", label: "Talenta Digital", icon: "✨" });
  }

  return list;
}

// Adapter: convert MahasiswaProfile (Supabase) → Student (local type for UI components)
export function toStudent(m: MahasiswaProfile, allKarya: Karya[] = []): Student {
  const validSkills = Array.isArray(m.skills)
    ? m.skills.filter((s) => Boolean(s && typeof s === "string" && s.trim()))
    : [];
  return {
    id: m.id,
    name: m.full_name,
    angkatan: Number(m.angkatan) || m.angkatan,
    prodi: m.prodi,
    bio: m.bio ?? "",
    avatarUrl: m.avatar_url ?? "",
    coverUrl: m.cover_url ?? undefined,
    statusBadge: normalizeStatusBadge(m.status_badge),
    rawStatusBadge: m.status_badge ?? undefined,
    skills: validSkills,
    contactEmail: (m as any).contact_email || m.email || "",
    socials: {
      github: m.github_url ?? undefined,
      linkedin: m.linkedin_url ?? undefined,
      instagram: m.instagram_url ?? undefined,
      website: m.website_url ?? undefined,
      portfolio: m.website_url ?? undefined,
    },
    isFeatured: m.is_featured ?? false,
    userId: m.user_id ?? undefined,
    followersCount: (m as any).followers_count || 0,
    followingCount: (m as any).following_count || 0,
    badges: getStudentBadges(m, allKarya),
    cardSkin: (m as any).card_skin || (m as any).cardSkin || (m as any).skin_id || undefined,
    featuredBadgeIds: (m as any).featured_badge_ids || (m as any).featuredBadgeIds || undefined,
    unlockedBadgeIds: (m as any).unlocked_badge_ids || (m as any).unlockedBadgeIds || undefined,
  };
}

