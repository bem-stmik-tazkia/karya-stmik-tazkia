"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  getMahasiswaById,
  getMahasiswaProjects,
  toggleKaryaLike,
  getLikedKaryaIds,
} from "@/lib/data";
import { getDeviceId } from "@/utils/identity";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import type { MahasiswaProfile, Karya } from "@/types/karya";
import { KARYA_CATEGORIES } from "@/types/karya";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  calculateStudentEarnedBadges,
  type PenghargaanBadge,
} from "@/data/penghargaanCatalog";
import { getClaimedExclusiveBadgeIds } from "@/lib/badgeService";
import ShareProfileModal from "@/components/mahasiswa/modals/ShareProfileModal";
import SkinPreviewModal from "@/components/mahasiswa/modals/SkinPreviewModal";
import { getSkinById } from "@/utils/skinConfig";
import { getSkinDefinition, isSkinUnlocked } from "@/components/cards";
import {
  StudentProfileHeader,
  StudentBadgesSection,
  StudentBadgeDetailModal,
  StudentProjectsSection,
} from "@/components/mahasiswa/profile";

export default function StudentClient({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [mahasiswa, setMahasiswa] = useState<MahasiswaProfile | null>(null);
  const [projects, setProjects] = useState<Karya[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [likedKarya, setLikedKarya] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSkinModal, setShowSkinModal] = useState(false);
  const [activeSkinId, setActiveSkinId] = useState<string>("classic");
  const [selectedBadge, setSelectedBadge] = useState<PenghargaanBadge | null>(null);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tazkia_profile_skin");
      if (saved) setActiveSkinId(saved);
    }
  }, []);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/student/${resolvedParams.id}`
      : "";

  const [isLiking, setIsLiking] = useState<Record<string, boolean>>({});

  const toggleLike = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLiking[id]) return;

    setIsLiking((prev) => ({ ...prev, [id]: true }));
    const wasLiked = likedKarya[id];
    setLikedKarya((prev) => ({ ...prev, [id]: !wasLiked }));
    setProjects((prev) =>
      prev.map((k) =>
        k.id === id
          ? { ...k, likes: Math.max(0, (k.likes ?? 0) + (wasLiked ? -1 : 1)) }
          : k
      )
    );

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      const deviceId = getDeviceId();

      const actionToTake = wasLiked ? "unlike" : "like";
      const isNowLiked = await toggleKaryaLike(id, deviceId, userId, actionToTake);
      setLikedKarya((prev) => ({ ...prev, [id]: isNowLiked }));
      if (isNowLiked) {
        localStorage.setItem(`liked_${id}`, "true");
      } else {
        localStorage.removeItem(`liked_${id}`);
      }
    } catch (err) {
      console.error(err);
      setLikedKarya((prev) => ({ ...prev, [id]: wasLiked }));
      setProjects((prev) =>
        prev.map((k) =>
          k.id === id
            ? { ...k, likes: Math.max(0, (k.likes ?? 0) + (wasLiked ? 1 : -1)) }
            : k
        )
      );
    } finally {
      setIsLiking((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [projects, activeCategory]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const availableCategories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category));
    return KARYA_CATEGORIES.filter((c) => c.value === "All" || cats.has(c.value));
  }, [projects]);

  const studentSkills = useMemo(() => {
    return Array.from(new Set(mahasiswa?.skills || [])).filter(
      (s) => Boolean(s && typeof s === "string" && s.trim())
    );
  }, [mahasiswa?.skills]);

  // Top 3 Karya Pilihan Kurator Kampus
  const [topCuratorProjectIds, setTopCuratorProjectIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadCuratorTop() {
      try {
        const { data } = await supabase
          .from("karya")
          .select("id, likes, views")
          .eq("status", "approved");
        if (data && data.length > 0) {
          const top3 = [...data]
            .sort((a, b) => {
              const scoreA = (a.likes || 0) * 3 + (a.views || 0);
              const scoreB = (b.likes || 0) * 3 + (b.views || 0);
              return scoreB - scoreA;
            })
            .slice(0, 3)
            .map((k) => k.id);
          setTopCuratorProjectIds(top3);
        }
      } catch (e) {
        console.error("Gagal memuat top kurator karya:", e);
      }
    }
    loadCuratorTop();
  }, []);

  const evaluatedProjects = useMemo(() => {
    return (projects || []).map((p: any) => {
      const isTopCurator =
        topCuratorProjectIds.includes(p.id) ||
        Boolean(p.is_featured || p.is_curator_spotlight);
      const liveDemoUrl =
        p.live_url || p.demo_url || (p as any).liveUrl || (p as any).demoUrl || "";
      return {
        ...p,
        likes: p.likes ?? p.likes_count ?? 0,
        views: p.views ?? p.views_count ?? 0,
        live_url: liveDemoUrl,
        demo_url: liveDemoUrl,
        is_featured: isTopCurator,
        is_curator_spotlight: isTopCurator,
      };
    });
  }, [projects, topCuratorProjectIds]);

  const studentUserId = mahasiswa?.user_id || mahasiswa?.id;
  const studentBadgeIds = useMemo(() => {
    return calculateStudentEarnedBadges({
      userId: studentUserId,
      projects: evaluatedProjects,
      angkatan: mahasiswa?.angkatan,
      skills: mahasiswa?.skills,
      bio: mahasiswa?.bio,
      statusBadge: mahasiswa?.status_badge,
      cardSkin: activeSkinId,
      unlockedBadgeIds:
        (mahasiswa as any)?.unlockedBadgeIds || (mahasiswa as any)?.unlocked_badge_ids,
      claimedBadgeIds: getClaimedExclusiveBadgeIds(studentUserId, mahasiswa?.id),
    });
  }, [
    studentUserId,
    evaluatedProjects,
    mahasiswa?.angkatan,
    mahasiswa?.skills,
    mahasiswa?.bio,
    mahasiswa?.status_badge,
    activeSkinId,
    (mahasiswa as any)?.unlockedBadgeIds,
    (mahasiswa as any)?.unlocked_badge_ids,
  ]);

  const [skinVersion, setSkinVersion] = useState(0);
  const activeSkin = useMemo(() => {
    const skin = getSkinById(activeSkinId);
    const skinDef = getSkinDefinition(skin.id);
    if (!isSkinUnlocked(skinDef, studentBadgeIds)) {
      return getSkinById("classic");
    }
    return skin;
  }, [activeSkinId, skinVersion, studentBadgeIds]);

  const handleApplySkin = (skinId: string) => {
    const skinDef = getSkinDefinition(skinId);
    if (!isSkinUnlocked(skinDef, studentBadgeIds)) {
      toast.error(
        "Tema eksklusif ini masih terkunci. Anda dapat menggunakannya setelah menerima lencana kehormatan terkait."
      );
      return;
    }
    setActiveSkinId(skinId);
    setSkinVersion((v) => v + 1);
    if (typeof window !== "undefined") {
      localStorage.setItem("tazkia_profile_skin", skinId);
      if (mahasiswa?.id) {
        localStorage.setItem(`tazkia_profile_skin_${mahasiswa.id}`, skinId);
      }
      if (mahasiswa?.user_id) {
        localStorage.setItem(`tazkia_profile_skin_${mahasiswa.user_id}`, skinId);
      }
      window.dispatchEvent(new Event("tazkia_profile_skin_updated"));
      window.dispatchEvent(
        new CustomEvent("tazkia_profile_skin_updated", {
          detail: { skinId, studentId: mahasiswa?.id },
        })
      );
      window.dispatchEvent(new Event("storage"));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getMahasiswaById(resolvedParams.id);
      if (!data) {
        notFound();
        return;
      }
      setMahasiswa(data);

      const projs = await getMahasiswaProjects(data.user_id ?? data.id);

      const initialLiked: Record<string, boolean> = {};
      projs.forEach((k) => {
        if (localStorage.getItem(`liked_${k.id}`) === "true") {
          initialLiked[k.id] = true;
        }
      });
      setLikedKarya(initialLiked);
      setProjects(projs);

      try {
        const deviceId = getDeviceId();
        const ids = await getLikedKaryaIds(deviceId, user?.id || null);
        if (ids && ids.length > 0) {
          setLikedKarya((prev) => {
            const updated = { ...prev };
            ids.forEach((id) => {
              updated[id] = true;
            });
            return updated;
          });
        }
      } catch {
        // abaikan jika gagal
      }

      setLoading(false);
    };
    fetchData();
  }, [resolvedParams.id, user]);

  const isOwnProfile = user?.id === mahasiswa?.user_id;

  // Notifikasi Penghargaan Baru Terbuka untuk Profil Pribadi (Seen / Unread tracking)
  const [seenBadgeIds, setSeenBadgeIds] = useState<number[]>([]);
  const [hasLoadedSeenBadges, setHasLoadedSeenBadges] = useState(false);

  const seenKey = useMemo(() => {
    return `tazkia_seen_badges_${
      mahasiswa?.user_id || mahasiswa?.id || user?.id || "default"
    }`;
  }, [mahasiswa?.user_id, mahasiswa?.id, user?.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(seenKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setSeenBadgeIds(parsed);
          }
        }
      } catch {
        // ignore
      }
      setHasLoadedSeenBadges(true);
    }
  }, [seenKey]);

  const newlyUnlockedBadgeIds = useMemo(() => {
    if (!isOwnProfile || !hasLoadedSeenBadges) return [];
    return studentBadgeIds.filter((id: number) => !seenBadgeIds.includes(id));
  }, [isOwnProfile, hasLoadedSeenBadges, studentBadgeIds, seenBadgeIds]);

  const markBadgeAsSeen = (badgeId: number) => {
    if (!seenBadgeIds.includes(badgeId)) {
      const next = [...seenBadgeIds, badgeId];
      setSeenBadgeIds(next);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(seenKey, JSON.stringify(next));
        } catch {}
      }
    }
  };

  const markAllAsSeen = () => {
    const next = Array.from(new Set([...seenBadgeIds, ...studentBadgeIds]));
    setSeenBadgeIds(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(seenKey, JSON.stringify(next));
      } catch {}
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="font-bold text-muted-foreground">Memuat profil mahasiswa...</p>
      </div>
    );
  }

  if (!mahasiswa) return null;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
      {/* 1. Header & Identity Section */}
      <StudentProfileHeader
        mahasiswa={mahasiswa}
        activeSkin={activeSkin}
        studentSkills={studentSkills}
        isOwnProfile={isOwnProfile}
        onOpenSkinModal={() => setShowSkinModal(true)}
        onOpenShareModal={() => setShowShareModal(true)}
        onBack={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
          } else {
            router.push("/student");
          }
        }}
      />

      {/* 2. Badges & Prestasi Section */}
      <StudentBadgesSection
        studentBadgeIds={studentBadgeIds}
        newlyUnlockedBadgeIds={newlyUnlockedBadgeIds}
        isOwnProfile={isOwnProfile}
        onSelectBadge={(badge) => setSelectedBadge(badge)}
        onMarkBadgeAsSeen={markBadgeAsSeen}
        onMarkAllAsSeen={markAllAsSeen}
      />

      {/* 3. Portofolio Karya Section */}
      <StudentProjectsSection
        studentName={mahasiswa.full_name}
        studentAvatarUrl={mahasiswa.avatar_url}
        projects={projects}
        filteredProjects={filteredProjects}
        paginatedProjects={paginatedProjects}
        availableCategories={availableCategories}
        activeCategory={activeCategory}
        likedKarya={likedKarya}
        currentPage={currentPage}
        totalPages={totalPages}
        onCategoryChange={handleCategoryChange}
        onPageChange={(page) => setCurrentPage(page)}
        onToggleLike={toggleLike}
      />

      {/* Modals */}
      {showShareModal && mahasiswa && (
        <ShareProfileModal
          studentName={mahasiswa.full_name}
          shareUrl={shareUrl}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showSkinModal && mahasiswa && (
        <SkinPreviewModal
          studentName={mahasiswa.full_name}
          prodi={mahasiswa.prodi}
          angkatan={mahasiswa.angkatan}
          avatarUrl={mahasiswa.avatar_url}
          bio={mahasiswa.bio}
          skills={studentSkills}
          statusBadge={mahasiswa.status_badge}
          activeSkinId={activeSkin.id}
          unlockedBadgeIds={studentBadgeIds}
          studentId={mahasiswa.id || mahasiswa.user_id}
          userId={mahasiswa.user_id || user?.id}
          onApplySkin={handleApplySkin}
          onClose={() => setShowSkinModal(false)}
        />
      )}

      <StudentBadgeDetailModal
        selectedBadge={selectedBadge}
        studentBadgeIds={studentBadgeIds}
        studentUserId={studentUserId}
        evaluatedProjects={evaluatedProjects}
        mahasiswa={mahasiswa}
        activeSkinId={activeSkinId}
        onClose={() => setSelectedBadge(null)}
      />
    </div>
  );
}
