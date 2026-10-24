"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { UserX, ChevronLeft, ChevronRight, RotateCcw, Sparkles, ArrowRight } from "lucide-react";
import { getMahasiswaProfiles, getKarya } from "@/lib/data";
import type { MahasiswaProfile, Karya } from "@/types/karya";
import type { Student, StudentBadge } from "@/types/student";
import MahasiswaHero from "@/components/mahasiswa/MahasiswaHero";
import MahasiswaCard from "@/components/mahasiswa/MahasiswaCard";
import MahasiswaProfileDrawer from "@/components/mahasiswa/MahasiswaProfileDrawer";
import {
  ALL_PRODI_VALUE,
  isAllProdi,
  fetchMasterAngkatanOptions,
  fetchMasterProdiOptions,
} from "@/utils/prodiOptions";
import { PREDEFINED_SKILLS } from "@/utils/skillOptions";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import toast from "react-hot-toast";
import { checkIsFollowingBulk, toggleFollow } from "@/lib/followService";

// Helper: generate real, meaningful achievement badges based on real student data
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
function toStudent(m: MahasiswaProfile, allKarya: Karya[] = []): Student {
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

function StudentShowcaseContent() {
  const [allMahasiswa, setAllMahasiswa] = useState<MahasiswaProfile[]>([]);
  const [allKarya, setAllKarya] = useState<Karya[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAngkatan, setSelectedAngkatan] = useState<number | null>(null);
  const [selectedProdi, setSelectedProdi] = useState(ALL_PRODI_VALUE);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState<"Nama" | "Angkatan" | "Karya">("Nama");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const { user } = useAuth();

  const [angkatanOptions, setAngkatanOptions] = useState<{ value: string; label: string }[]>([]);
  const [prodiOptions, setProdiOptions] = useState<{ value: string; label: string }[]>([]);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user && allMahasiswa.length > 0) {
      const ids = allMahasiswa.map((m) => m.user_id).filter(Boolean) as string[];
      checkIsFollowingBulk(ids, user.id).then(setFollowingStatus);
    }
  }, [user, allMahasiswa]);

  const handleToggleFollow = async (studentUserId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    const isCurrentlyFollowing = followingStatus[studentUserId] || false;
    // Optimistic UI update
    setFollowingStatus((prev) => ({ ...prev, [studentUserId]: !isCurrentlyFollowing }));
    try {
      await toggleFollow(studentUserId, user.id, isCurrentlyFollowing);
    } catch (error) {
      // Revert if error
      setFollowingStatus((prev) => ({ ...prev, [studentUserId]: isCurrentlyFollowing }));
      toast.error("Gagal melakukan aksi ikuti. Silakan coba lagi.");
    }
  };

  useEffect(() => {
    Promise.all([
      getMahasiswaProfiles(),
      getKarya(),
      fetchMasterAngkatanOptions(),
      fetchMasterProdiOptions(),
    ]).then(([mahasiswa, karya, angkData, prodiData]) => {
      setAllMahasiswa(mahasiswa);
      setAllKarya(karya);
      setAngkatanOptions(angkData);
      setProdiOptions([{ value: ALL_PRODI_VALUE, label: "Semua Prodi" }, ...prodiData]);
      setLoading(false);
    });
  }, []);

  const students = useMemo(
    () => allMahasiswa.map((m) => toStudent(m, allKarya)),
    [allMahasiswa, allKarya]
  );

  // Fallback available angkatan if master list empty
  const availableAngkatan = useMemo(() => {
    if (angkatanOptions.length > 0) {
      return angkatanOptions.map((a) => Number(a.value)).filter((n) => !isNaN(n));
    }
    return Array.from(new Set(students.map((s) => s.angkatan))).sort((a, b) => a - b);
  }, [students, angkatanOptions]);

  // Filter students based on Angkatan, Prodi, Status, and Search Query
  const filteredStudents = useMemo(() => {
    let result = students.filter((student) => {
      // Angkatan Filter
      if (selectedAngkatan !== null && student.angkatan !== selectedAngkatan) {
        return false;
      }

      // Prodi Filter
      if (!isAllProdi(selectedProdi) && student.prodi !== selectedProdi) {
        return false;
      }

      // Status Filter
      if (selectedStatus !== "ALL" && (student.statusBadge || "Open for Collab") !== selectedStatus) {
        return false;
      }

      // Search Query Filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesBio = student.bio.toLowerCase().includes(query);
        const matchesSkills = student.skills?.some((sk) =>
          sk.toLowerCase().includes(query)
        );

        const studentProjects = allKarya.filter((k) =>
          isStudentKarya(k, student.name, student.userId, student.id)
        );
        const matchesProject = studentProjects.some(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            (p.tech_stack ?? []).some((t) => t.toLowerCase().includes(query))
        );

        return matchesName || matchesBio || matchesSkills || matchesProject;
      }

      return true;
    });

    // Sorting matching Mahasiswa.dc.html
    if (sortBy === "Nama") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "Angkatan") {
      result = [...result].sort((a, b) => b.angkatan - a.angkatan);
    } else if (sortBy === "Karya") {
      result = [...result].sort((a, b) => {
        const aCount = allKarya.filter((k) =>
          isStudentKarya(k, a.name, a.userId, a.id)
        ).length;
        const bCount = allKarya.filter((k) =>
          isStudentKarya(k, b.name, b.userId, b.id)
        ).length;
        return bCount - aCount;
      });
    }

    return result;
  }, [
    searchQuery,
    selectedAngkatan,
    selectedProdi,
    selectedStatus,
    sortBy,
    students,
    allKarya,
  ]);

  // Pagination Logic (8 items per page persis seperti mockup)
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  // Staggered entrance animation ticker matching Mahasiswa.dc.html
  const [animTick, setAnimTick] = useState(0);
  useEffect(() => {
    setAnimTick((t) => t + 1);
  }, [
    searchQuery,
    selectedAngkatan,
    selectedProdi,
    selectedStatus,
    sortBy,
    currentPage,
  ]);
  const inClass = animTick % 2 === 0 ? "g-in-a" : "g-in-b";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedAngkatan(null);
    setSelectedProdi(ALL_PRODI_VALUE);
    setSelectedStatus("ALL");
    setSortBy("Nama");
    setCurrentPage(1);
  };

  const selectedStudentProjects = useMemo(() => {
    if (!selectedStudent) return [];
    return allKarya.filter((k) =>
      isStudentKarya(k, selectedStudent.name, selectedStudent.userId, selectedStudent.id)
    );
  }, [selectedStudent, allKarya]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-muted-foreground text-sm">Memuat direktori mahasiswa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors selection:bg-[#FF8A2B] selection:text-[#0B1F4A]">
      {/* ── HERO SECTION (#atas) Sesuai Mockup Mahasiswa.dc.html ── */}
      <MahasiswaHero
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        selectedAngkatan={selectedAngkatan}
        setSelectedAngkatan={(year) => {
          setSelectedAngkatan(year);
          setCurrentPage(1);
        }}
        selectedProdi={selectedProdi}
        setSelectedProdi={(prodi) => {
          setSelectedProdi(prodi);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        setSelectedStatus={(st) => {
          setSelectedStatus(st);
          setCurrentPage(1);
        }}
        totalMahasiswa={students.length}
        totalProjects={allKarya.length}
        availableAngkatan={availableAngkatan}
        angkatanOptions={angkatanOptions}
        prodiOptions={prodiOptions}
      />

      {/* ── DAFTAR MAHASISWA SECTION (#daftar) ── */}
      <main
        id="daftar"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 w-full"
      >
        {/* Section Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl tracking-tight text-foreground mb-1.5">
              Daftar mahasiswa
            </h2>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Menampilkan{" "}
              <strong className="text-foreground font-bold">
                {filteredStudents.length}
              </strong>{" "}
              mahasiswa STMIK Tazkia
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="urut-mhs"
                className="text-xs sm:text-sm text-muted-foreground font-medium"
              >
                Urutkan
              </label>
              <select
                id="urut-mhs"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#FF8A2B]/30 focus:border-[#FF8A2B] outline-none cursor-pointer transition-all shadow-2xs"
              >
                <option value="Nama">Nama A–Z</option>
                <option value="Angkatan">Angkatan terbaru</option>
                <option value="Karya">Karya terbanyak</option>
              </select>
            </div>

            {/* Reset Filters button if any active */}
            {(searchQuery ||
              selectedAngkatan !== null ||
              !isAllProdi(selectedProdi) ||
              selectedStatus !== "ALL") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs text-[#FF8A2B] hover:underline font-semibold cursor-pointer ml-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>
        </div>

        {/* Divider line */}
        <div className="h-px bg-border mb-8 sm:mb-10" />

        {/* Student Cards Grid */}
        {filteredStudents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 items-stretch py-2 px-1">
              {paginatedStudents.map((student, idx) => {
                const studentProjects = allKarya.filter((k) =>
                  isStudentKarya(k, student.name, student.userId, student.id)
                );
                return (
                  <MahasiswaCard
                    key={`student-card-${student.id || student.name}-${idx}`}
                    student={student}
                    projectCount={studentProjects.length}
                    projects={studentProjects}
                    searchQuery={searchQuery}
                    isFollowing={followingStatus[student.userId || ""] || false}
                    onToggleFollow={handleToggleFollow}
                    onFilterAngkatan={(ang) => {
                      setSelectedAngkatan(ang);
                      setCurrentPage(1);
                    }}
                    onFilterStatus={(st) => {
                      setSelectedStatus(st);
                      setCurrentPage(1);
                    }}
                    onFilterSkill={(sk) => {
                      setSearchQuery(sk);
                      setCurrentPage(1);
                    }}
                    inClass={inClass}
                    animationDelay={idx * 70}
                    onSelect={(s) => setSelectedStudent(s)}
                  />
                );
              })}
            </div>

            {/* Pagination Controls in Pill Style */}
            {totalPages > 1 && (
              <div
                className="mt-12 flex justify-center items-center gap-2"
                role="navigation"
                aria-label="Halaman"
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 min-h-[44px] px-4 rounded-full bg-card border border-border text-xs sm:text-sm font-semibold text-foreground disabled:opacity-40 hover:bg-muted transition-all cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={`pagination-page-${page}`}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[44px] min-h-[44px] rounded-full border text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center ${
                      currentPage === page
                        ? "bg-[#FF8A2B] text-[#1A0F05] border-[#FF8A2B] font-bold shadow-xs"
                        : "bg-card border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 min-h-[44px] px-4 rounded-full bg-card border border-border text-xs sm:text-sm font-semibold text-foreground disabled:opacity-40 hover:bg-muted transition-all cursor-pointer shadow-xs"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="border border-dashed border-border rounded-[20px] p-10 sm:p-14 text-center max-w-lg mx-auto my-12 bg-card/40">
            <div className="w-12 h-12 rounded-full bg-[#FF8A2B]/10 text-[#FF8A2B] flex items-center justify-center mx-auto mb-4">
              <UserX className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 font-heading">
              Belum ada mahasiswa yang cocok
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm mb-6 leading-relaxed">
              Coba ubah kata kunci pencarian, filter angkatan, atau program studi.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FF8A2B] text-[#1A0F05] text-xs sm:text-sm font-bold shadow-xs hover:bg-[#ea580c] transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua Filter</span>
            </button>
          </div>
        )}
      </main>

      {/* ── CTA Floating Card ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 sm:pb-24">
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-[#FF8A2B] text-[#0B1F4A] p-8 sm:p-12 md:p-14 shadow-lg shadow-orange-500/15 border border-orange-300/40">
          {/* Subtle Ambient Light */}
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/20 blur-3xl pointer-events-none"
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-10">
            <div className="max-w-2xl">
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[40px] tracking-tight text-[#0B1F4A] mb-2.5 leading-tight">
                Belum ada profilmu di sini?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-[#0B1F4A]/90 leading-relaxed font-medium max-w-xl">
                Login dan masuk sekarang menggunakan akun kampus STMIK Tazkia untuk menampilkan portofolio dan karyamu.
              </p>
            </div>

            <Link
              href={user ? "/dashboard/profile" : "/login"}
              className="inline-flex items-center justify-center gap-2.5 min-h-[50px] sm:min-h-[54px] px-8 sm:px-10 rounded-full bg-[#0B1F4A] hover:bg-[#071533] text-white font-bold text-sm sm:text-base hover:-translate-y-0.5 active:translate-y-0.5 transition-all shadow-md hover:shadow-xl shrink-0 self-start md:self-auto cursor-pointer group"
            >
              <span>{user ? "Lengkapi Profil" : "Masuk Sekarang"}</span>
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Side Profile Drawer */}
      <MahasiswaProfileDrawer
        student={selectedStudent}
        projects={selectedStudentProjects}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}

export default function StudentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-bold text-[#FF8A2B] text-lg">
          Memuat direktori...
        </div>
      }
    >
      <StudentShowcaseContent />
    </Suspense>
  );
}
