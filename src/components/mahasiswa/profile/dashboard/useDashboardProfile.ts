"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  PENGHARGAAN_CATALOG,
  calculateStudentEarnedBadges,
  type PenghargaanBadge,
} from "@/data/penghargaanCatalog";
import {
  getExclusiveBadgeGrants,
  getClaimableGrantsForUser,
  getClaimedExclusiveBadgeIds,
  claimExclusiveBadge,
  type ExclusiveBadgeGrant,
} from "@/lib/badgeService";
import {
  getPendingCollabRequestsForUser,
  respondCollabRequest,
  type CollabRequest,
} from "@/lib/collabService";
import { getSkinById } from "@/utils/skinConfig";
import { getSkinDefinition, isSkinUnlocked } from "@/components/cards";
import type { ProfileViewData } from "./DashboardProfileHeader";
import type { ProjectData } from "./NeobrutalismProjectCard";

export function useDashboardProfile({
  profile,
  projects,
  isOwnProfile,
  user,
}: {
  profile: ProfileViewData;
  projects: ProjectData[];
  isOwnProfile: boolean;
  user: any;
}) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSkinModal, setShowSkinModal] = useState(false);
  const [activeSkinId, setActiveSkinId] = useState<string>("classic");
  const [selectedBadge, setSelectedBadge] = useState<PenghargaanBadge | null>(null);

  // Exclusive Grants & Claims
  const [claimedExclusiveBadgeIds, setClaimedExclusiveBadgeIds] = useState<number[]>([]);
  const [claimableGrants, setClaimableGrants] = useState<ExclusiveBadgeGrant[]>([]);

  const refreshGrantsAndClaims = useCallback(async () => {
    if (typeof window === "undefined") return;
    const uid = profile?.user_id || profile?.id || user?.id;
    const claimed = getClaimedExclusiveBadgeIds(uid, profile?.id);
    setClaimedExclusiveBadgeIds(claimed);

    try {
      const grants = await getExclusiveBadgeGrants();
      const claimable = getClaimableGrantsForUser(grants, {
        userId: uid,
        email: profile?.email || user?.email,
        studentId: profile?.id,
      });
      setClaimableGrants(claimable);
    } catch {}
  }, [profile?.user_id, profile?.id, profile?.email, user?.id, user?.email]);

  useEffect(() => {
    refreshGrantsAndClaims();
    window.addEventListener("tazkia_badges_updated", refreshGrantsAndClaims);
    return () => window.removeEventListener("tazkia_badges_updated", refreshGrantsAndClaims);
  }, [refreshGrantsAndClaims]);

  // Evaluated Projects
  const evaluatedProjects = useMemo(() => {
    return (projects || []).map((p: any) => ({
      ...p,
      likes: p.likes ?? p.likes_count ?? 0,
      views: p.views ?? p.views_count ?? 0,
    }));
  }, [projects]);

  // Evaluasi Penghargaan Mahasiswa
  const studentUserId = profile?.user_id || profile?.id || user?.id;
  const studentBadgeIds = useMemo(() => {
    return calculateStudentEarnedBadges({
      userId: studentUserId,
      projects: evaluatedProjects,
      angkatan: profile?.angkatan,
      skills: profile?.skills || [],
      bio: profile?.bio,
      statusBadge: profile?.status_badge,
      cardSkin: activeSkinId,
      claimedBadgeIds: claimedExclusiveBadgeIds,
      unlockedBadgeIds: (profile as any)?.unlockedBadgeIds || (profile as any)?.unlocked_badge_ids,
    });
  }, [
    studentUserId,
    evaluatedProjects,
    profile?.angkatan,
    profile?.skills,
    profile?.bio,
    profile?.status_badge,
    activeSkinId,
    claimedExclusiveBadgeIds,
    (profile as any)?.unlockedBadgeIds,
    (profile as any)?.unlocked_badge_ids,
  ]);

  // Badge Filter Tab & Shelf
  const [activeBadgeTab, setActiveBadgeTab] = useState<"umum" | "terbatas">("umum");
  const displayedBadges = useMemo(() => {
    return PENGHARGAAN_CATALOG.filter((b) => b.group === activeBadgeTab);
  }, [activeBadgeTab]);

  const [featuredBadgeIds, setFeaturedBadgeIds] = useState<number[]>([]);
  const [isCustomizingShelf, setIsCustomizingShelf] = useState<boolean>(false);
  const [badgeToSwap, setBadgeToSwap] = useState<PenghargaanBadge | null>(null);

  // Unread badge notifications
  const [seenBadgeIds, setSeenBadgeIds] = useState<number[]>([]);
  const [hasLoadedSeenBadges, setHasLoadedSeenBadges] = useState(false);

  const seenKey = useMemo(() => {
    return `tazkia_seen_badges_${profile?.user_id || profile?.id || user?.id || "default"}`;
  }, [profile?.user_id, profile?.id, user?.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(seenKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setSeenBadgeIds(parsed);
        }
      } catch {}
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
          const remaining = studentBadgeIds.filter((id: number) => !next.includes(id));
          if (remaining.length === 0 && claimableGrants.length === 0) {
            localStorage.setItem("tazkia_has_unopened_badge", "false");
            window.dispatchEvent(new Event("tazkia_badges_viewed"));
          }
          window.dispatchEvent(new Event("tazkia_badges_updated"));
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
        if (claimableGrants.length === 0) {
          localStorage.setItem("tazkia_has_unopened_badge", "false");
          window.dispatchEvent(new Event("tazkia_badges_viewed"));
        }
        window.dispatchEvent(new Event("tazkia_badges_updated"));
      } catch {}
    }
    toast.success("Semua notifikasi penghargaan telah ditandai sudah dilihat.");
  };

  const handleClaimBadge = (badgeId: number) => {
    const grant = claimableGrants.find((g) => g.badgeId === badgeId);
    const isSkin =
      badgeId === 101 ||
      (grant?.badgeName || "").toLowerCase().includes("skin");

    window.dispatchEvent(
      new CustomEvent("tazkia_open_reward_modal", {
        detail: {
          badgeIds: isSkin ? [101] : [badgeId],
          grant,
          skinId: isSkin ? "bem2026" : undefined,
          note: grant?.note,
        },
      })
    );
  };

  const handleClaimAll = async () => {
    const uid = profile?.user_id || profile?.id || user?.id || "default";
    const skinGrant = claimableGrants.find(
      (g) => g.badgeId === 101 || (g.badgeName || "").toLowerCase().includes("skin")
    );
    const hasSkin = Boolean(skinGrant);
    const grantsToClaim = [...claimableGrants];

    for (const grant of grantsToClaim) {
      await claimExclusiveBadge(grant.badgeId, uid, grant.id);
      markBadgeAsSeen(grant.badgeId);
    }

    await refreshGrantsAndClaims();

    window.dispatchEvent(
      new CustomEvent("tazkia_open_reward_modal", {
        detail: {
          badgeIds: grantsToClaim.map((g) => g.badgeId),
          grant: skinGrant || grantsToClaim[0],
          skinId: hasSkin ? "bem2026" : undefined,
          note: skinGrant?.note || grantsToClaim[0]?.note,
        },
      })
    );
  };

  // Collab requests
  const [pendingCollabRequests, setPendingCollabRequests] = useState<CollabRequest[]>([]);

  const refreshCollabRequests = useCallback(async () => {
    if (!isOwnProfile) return;
    const uid = profile?.user_id || user?.id;
    if (uid) {
      const reqs = await getPendingCollabRequestsForUser(uid);
      setPendingCollabRequests(reqs);
    }
  }, [isOwnProfile, profile?.user_id, user?.id]);

  useEffect(() => {
    refreshCollabRequests();
    const handleCollabUpdated = () => refreshCollabRequests();
    window.addEventListener("tazkia_collab_updated", handleCollabUpdated);
    return () => window.removeEventListener("tazkia_collab_updated", handleCollabUpdated);
  }, [refreshCollabRequests]);

  const handleAcceptCollab = async (req: CollabRequest) => {
    const uid = profile?.user_id || user?.id;
    if (!uid) return;
    const toastId = toast.loading("Menerima kolaborasi...");
    const res = await respondCollabRequest({
      requestId: req.id,
      karyaId: req.karyaId,
      action: "accept",
      responderUserId: uid,
      responderName: profile?.full_name || user?.user_metadata?.full_name,
    });
    if (res.success) {
      toast.success(`🎉 Berhasil bergabung dalam tim "${req.karyaTitle}"!`, { id: toastId });
      setPendingCollabRequests((prev) => prev.filter((r) => r.id !== req.id));
      window.dispatchEvent(new Event("tazkia_badges_updated"));
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      toast.error(res.error || "Gagal merespons kolaborasi", { id: toastId });
    }
  };

  const handleRejectCollab = async (req: CollabRequest) => {
    const uid = profile?.user_id || user?.id;
    if (!uid) return;
    const toastId = toast.loading("Menolak kolaborasi...");
    const res = await respondCollabRequest({
      requestId: req.id,
      karyaId: req.karyaId,
      action: "reject",
      responderUserId: uid,
      responderName: profile?.full_name || user?.user_metadata?.full_name,
    });
    if (res.success) {
      toast.success("Undangan kolaborasi ditolak.", { id: toastId });
      setPendingCollabRequests((prev) => prev.filter((r) => r.id !== req.id));
    } else {
      toast.error(res.error || "Gagal merespons kolaborasi", { id: toastId });
    }
  };

  // Saved skin & featured badges from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSkin = localStorage.getItem("tazkia_profile_skin");
      if (savedSkin) setActiveSkinId(savedSkin);

      try {
        const savedBadges =
          (profile.user_id ? localStorage.getItem(`tazkia_featured_badges_${profile.user_id}`) : null) ||
          (profile.id ? localStorage.getItem(`tazkia_featured_badges_${profile.id}`) : null) ||
          (user?.id ? localStorage.getItem(`tazkia_featured_badges_${user.id}`) : null) ||
          localStorage.getItem("tazkia_featured_badges");
        if (savedBadges) {
          const parsed = JSON.parse(savedBadges);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const validBadges = parsed.filter((id: number) =>
              PENGHARGAAN_CATALOG.some((b) => b.id === id)
            );
            if (validBadges.length > 0) {
              setFeaturedBadgeIds(validBadges.slice(0, 5));
              return;
            }
          }
        }
      } catch {}

      if (studentBadgeIds && studentBadgeIds.length > 0) {
        setFeaturedBadgeIds(studentBadgeIds.slice(0, 5));
      }
    }
  }, [profile.id, profile.user_id, user?.id, studentBadgeIds]);

  const saveFeaturedBadges = (ids: number[]) => {
    if (typeof window !== "undefined") {
      const raw = JSON.stringify(ids);
      localStorage.setItem("tazkia_featured_badges", raw);
      if (profile.id) localStorage.setItem(`tazkia_featured_badges_${profile.id}`, raw);
      if (profile.user_id) localStorage.setItem(`tazkia_featured_badges_${profile.user_id}`, raw);
      if (user?.id) localStorage.setItem(`tazkia_featured_badges_${user.id}`, raw);
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("tazkia_featured_badges_updated"));
    }
  };

  const handleToggleFeaturedBadge = (badgeId: number) => {
    const badge = PENGHARGAAN_CATALOG.find((b) => b.id === badgeId);
    const badgeName = badge ? badge.name : `Badge #${badgeId}`;

    if (featuredBadgeIds.includes(badgeId)) {
      if (featuredBadgeIds.length <= 1) {
        toast.error("Minimal harus ada 1 lencana yang dipajang di kartu.");
        return;
      }
      const next = featuredBadgeIds.filter((id) => id !== badgeId);
      setFeaturedBadgeIds(next);
      saveFeaturedBadges(next);
      if (badgeToSwap?.id === badgeId) setBadgeToSwap(null);
      toast.success(`Lencana "${badgeName}" telah dilepas dari kartu.`);
    } else {
      if (featuredBadgeIds.length >= 5) {
        if (badge) {
          setBadgeToSwap(badge);
          toast(
            `Rak penuh (5/5). Klik salah satu slot (#1 - #5) di atas untuk digantikan dengan "${badge.name}"!`,
            { duration: 4000 }
          );
        }
        return;
      }
      const next = [...featuredBadgeIds, badgeId];
      setFeaturedBadgeIds(next);
      saveFeaturedBadges(next);
      toast.success(`Lencana "${badgeName}" berhasil dipajang di kartu!`);
    }
  };

  const handleReplaceSlot = (slotIndex: number, newBadgeId: number) => {
    const oldBadgeId = featuredBadgeIds[slotIndex];
    const oldBadge = PENGHARGAAN_CATALOG.find((b) => b.id === oldBadgeId);
    const newBadge = PENGHARGAAN_CATALOG.find((b) => b.id === newBadgeId);
    const next = [...featuredBadgeIds];
    next[slotIndex] = newBadgeId;
    setFeaturedBadgeIds(next);
    saveFeaturedBadges(next);
    setBadgeToSwap(null);
    toast.success(
      `"${newBadge?.name || ""}" berhasil menggantikan "${oldBadge?.name || ""}" di Slot #${slotIndex + 1}!`
    );
  };

  const handleRemoveSlot = (index: number) => {
    if (featuredBadgeIds.length <= 1) {
      toast.error("Minimal harus ada 1 lencana yang dipajang di kartu.");
      return;
    }
    const removedId = featuredBadgeIds[index];
    const badge = PENGHARGAAN_CATALOG.find((b) => b.id === removedId);
    const next = featuredBadgeIds.filter((_, i) => i !== index);
    setFeaturedBadgeIds(next);
    saveFeaturedBadges(next);
    if (badgeToSwap?.id === removedId) setBadgeToSwap(null);
    toast.success(`Lencana (${badge?.name || ""}) telah dilepas dari kartu.`);
  };

  const activeSkin = useMemo(() => {
    const skin = getSkinById(activeSkinId);
    const skinDef = getSkinDefinition(skin.id);
    if (!isSkinUnlocked(skinDef, studentBadgeIds)) {
      return getSkinById("classic");
    }
    return skin;
  }, [activeSkinId, studentBadgeIds]);

  const handleApplySkin = (skinId: string) => {
    const skinDef = getSkinDefinition(skinId);
    if (!isSkinUnlocked(skinDef, studentBadgeIds)) {
      toast.error(
        "Tema eksklusif ini masih terkunci. Anda dapat menggunakannya setelah menerima lencana kehormatan terkait."
      );
      return;
    }
    setActiveSkinId(skinId);
    if (typeof window !== "undefined") {
      localStorage.setItem("tazkia_profile_skin", skinId);
    }
  };

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/student/${profile.id || profile.user_id}`
      : "";

  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category).filter(Boolean));
    return ["Semua", ...Array.from(cats)] as string[];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "Semua") return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [projects, activeCategory]);

  const validSkills = useMemo(() => {
    return (profile.skills ?? []).filter((s) => Boolean(s && typeof s === "string" && s.trim()));
  }, [profile.skills]);

  return {
    activeCategory,
    setActiveCategory,
    showShareModal,
    setShowShareModal,
    showSkinModal,
    setShowSkinModal,
    activeSkinId,
    selectedBadge,
    setSelectedBadge,
    claimableGrants,
    evaluatedProjects,
    studentUserId,
    studentBadgeIds,
    activeBadgeTab,
    setActiveBadgeTab,
    displayedBadges,
    featuredBadgeIds,
    isCustomizingShelf,
    setIsCustomizingShelf,
    badgeToSwap,
    setBadgeToSwap,
    newlyUnlockedBadgeIds,
    markBadgeAsSeen,
    markAllAsSeen,
    handleClaimBadge,
    handleClaimAll,
    pendingCollabRequests,
    handleAcceptCollab,
    handleRejectCollab,
    handleToggleFeaturedBadge,
    handleReplaceSlot,
    handleRemoveSlot,
    activeSkin,
    handleApplySkin,
    shareUrl,
    categories,
    filteredProjects,
    validSkills,
  };
}

