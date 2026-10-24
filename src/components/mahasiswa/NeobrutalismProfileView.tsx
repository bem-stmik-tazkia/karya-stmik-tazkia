"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  GraduationCap,
  Folder,
  Share2,
  Edit,
  Award,
  CreditCard,
  X,
  Check,
  Pin,
  Layers,
  ArrowLeftRight,
  SlidersHorizontal,
  Lock,
  Info,
  Gift,
  Sparkles,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { FiInstagram } from "react-icons/fi";
import { PREDEFINED_SKILLS } from "@/utils/skillOptions";
import { normalizeStatusBadge } from "@/app/student/page";
import { getTechTagColor } from "@/utils/techTagColor";
import {
  PENGHARGAAN_CATALOG,
  calculateStudentEarnedBadges,
  getBadgeMissionProgress,
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
import { TazkiaAchievementHexBadge } from "@/components/penghargaan/TazkiaAchievementBadge";
import ShareProfileModal from "@/components/mahasiswa/ShareProfileModal";
import SkinPreviewModal from "@/components/mahasiswa/SkinPreviewModal";
import { getSkinById } from "@/utils/skinConfig";
import { NeobrutalismProjectCard, ProjectData } from "./NeobrutalismProjectCard";
import { KARYA_CATEGORIES } from "@/types/karya";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

export interface ProfileViewData {
  id?: string;
  user_id?: string;
  full_name: string;
  email?: string;
  contact_email?: string;
  prodi?: string;
  angkatan?: number | string;
  avatar_url?: string;
  bio?: string;
  skills?: string[] | null;
  status_badge?: string;
  github_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  website_url?: string;
  followers_count?: number;
  following_count?: number;
}

interface NeobrutalismProfileViewProps {
  profile: ProfileViewData;
  projects: ProjectData[];
  posts?: unknown[];
  isOwnProfile?: boolean;
}

export function NeobrutalismProfileView({
  profile,
  projects,
  isOwnProfile = false,
}: NeobrutalismProfileViewProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState("Semua");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSkinModal, setShowSkinModal] = useState(false);
  const [activeSkinId, setActiveSkinId] = useState<string>("classic");
  const [selectedBadge, setSelectedBadge] = useState<PenghargaanBadge | null>(null);

  // Lencana Eksklusif: Yang sudah diklaim dan yang siap diklaim dari Admin
  const [claimedExclusiveBadgeIds, setClaimedExclusiveBadgeIds] = useState<number[]>([]);
  const [claimableGrants, setClaimableGrants] = useState<ExclusiveBadgeGrant[]>([]);

  const refreshGrantsAndClaims = React.useCallback(async () => {
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

  React.useEffect(() => {
    refreshGrantsAndClaims();
    window.addEventListener("tazkia_badges_updated", refreshGrantsAndClaims);
    return () => window.removeEventListener("tazkia_badges_updated", refreshGrantsAndClaims);
  }, [refreshGrantsAndClaims]);

  // Top 3 Karya Pilihan Kurator Kampus (Podium Beranda / Explore)
  const [topCuratorProjectIds, setTopCuratorProjectIds] = useState<string[]>([]);

  React.useEffect(() => {
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
      const liveDemoUrl = p.live_url || p.demo_url || (p as any).liveUrl || (p as any).demoUrl || "";
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

  // Evaluasi Penghargaan Mahasiswa berdasarkan karya, angkatan, skill riil & klaim eksklusif
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
  }, [studentUserId, evaluatedProjects, profile?.angkatan, profile?.skills, profile?.bio, profile?.status_badge, activeSkinId, claimedExclusiveBadgeIds, (profile as any)?.unlockedBadgeIds, (profile as any)?.unlocked_badge_ids]);

  // Filter Kategori Badge: "umum" (13) vs "terbatas" (1)
  const [activeBadgeTab, setActiveBadgeTab] = useState<"umum" | "terbatas">("umum");
  const displayedBadges = useMemo(() => {
    return PENGHARGAAN_CATALOG.filter((b) => b.group === activeBadgeTab);
  }, [activeBadgeTab]);

  // Shelf Badge Management (Maksimal 5 badge sorotan kartu)
  const [featuredBadgeIds, setFeaturedBadgeIds] = useState<number[]>([]);
  const [isCustomizingShelf, setIsCustomizingShelf] = useState<boolean>(false);
  const [badgeToSwap, setBadgeToSwap] = useState<PenghargaanBadge | null>(null);

  // Notifikasi Penghargaan Baru Terbuka untuk Profil Pribadi (Seen / Unread tracking)
  const [seenBadgeIds, setSeenBadgeIds] = useState<number[]>([]);
  const [hasLoadedSeenBadges, setHasLoadedSeenBadges] = useState(false);

  const seenKey = useMemo(() => {
    return `tazkia_seen_badges_${profile?.user_id || profile?.id || user?.id || "default"}`;
  }, [profile?.user_id, profile?.id, user?.id]);

  React.useEffect(() => {
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

  // Penghargaan yang baru terbuka (belum dilihat pengguna di profil pribadinya)
  const newlyUnlockedBadgeIds = useMemo(() => {
    if (!isOwnProfile || !hasLoadedSeenBadges) return [];
    return studentBadgeIds.filter((id: number) => !seenBadgeIds.includes(id));
  }, [isOwnProfile, hasLoadedSeenBadges, studentBadgeIds, seenBadgeIds]);

  // Tandai badge yang sudah dilihat
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

  // User mengklaim lencana eksklusif yang dikirim admin
  const handleClaimBadge = async (badgeId: number) => {
    const grant = claimableGrants.find((g) => g.badgeId === badgeId);
    const uid = profile?.user_id || profile?.id || user?.id || "default";
    const success = await claimExclusiveBadge(badgeId, uid, grant?.id);
    if (success) {
      toast.success(`🎉 Lencana ${PENGHARGAAN_CATALOG.find(b => b.id === badgeId)?.name || ""} berhasil Anda klaim!`);
      markBadgeAsSeen(badgeId);
      await refreshGrantsAndClaims();
    }
  };

  const handleClaimAll = async () => {
    const uid = profile?.user_id || profile?.id || user?.id || "default";
    for (const grant of claimableGrants) {
      await claimExclusiveBadge(grant.badgeId, uid, grant.id);
      markBadgeAsSeen(grant.badgeId);
    }
    toast.success("🎉 Semua lencana eksklusif berhasil diklaim dan aktif di profil Anda!");
    await refreshGrantsAndClaims();
  };

  // Permintaan Kolaborasi Tim untuk Akun Ini
  const [pendingCollabRequests, setPendingCollabRequests] = useState<CollabRequest[]>([]);

  const refreshCollabRequests = React.useCallback(async () => {
    if (!isOwnProfile) return;
    const uid = profile?.user_id || user?.id;
    if (uid) {
      const reqs = await getPendingCollabRequestsForUser(uid);
      setPendingCollabRequests(reqs);
    }
  }, [isOwnProfile, profile?.user_id, user?.id]);

  React.useEffect(() => {
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

  // Auto-clear notifikasi menu bottom saat user sudah berada di halaman profil
  React.useEffect(() => {
    if (isOwnProfile && typeof window !== "undefined") {
      const timer = setTimeout(() => {
        if (claimableGrants.length === 0) {
          localStorage.setItem("tazkia_has_unopened_badge", "false");
          window.dispatchEvent(new Event("tazkia_badges_viewed"));
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOwnProfile, claimableGrants.length]);

  // Load saved skin & featured badges from localStorage on mount
  React.useEffect(() => {
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
      } catch {
        // ignore
      }

      // Default: Otomatis isi rak dengan badge yang dimiliki mahasiswa berdasarkan peringkat prestisius (Terbatas & Emas terlebih dahulu)
      if (studentBadgeIds && studentBadgeIds.length > 0) {
        const getPrestigeScore = (badgeId: number) => {
          const b = PENGHARGAAN_CATALOG.find((x) => x.id === badgeId);
          if (!b) return 0;
          if (b.group === "terbatas" || b.tier === "khusus") return 100;
          if (b.tier === "emas") return 50;
          if (b.tier === "perak") return 20;
          return 10;
        };
        const sortedOwned = [...studentBadgeIds].sort(
          (a, b) => getPrestigeScore(b) - getPrestigeScore(a)
        );
        setFeaturedBadgeIds(sortedOwned.slice(0, 5));
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
        toast.error("Minimal harus ada 1 badge yang disorot di kartu.");
        return;
      }
      const next = featuredBadgeIds.filter((id) => id !== badgeId);
      setFeaturedBadgeIds(next);
      saveFeaturedBadges(next);
      if (badgeToSwap?.id === badgeId) setBadgeToSwap(null);
      toast.success(`"${badgeName}" dilepas dari rak kartu.`);
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
      toast.success(`"${badgeName}" berhasil dipasang di slot #${next.length} kartu!`);
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
      toast.error("Minimal harus ada 1 badge yang disorot di kartu.");
      return;
    }
    const removedId = featuredBadgeIds[index];
    const badge = PENGHARGAAN_CATALOG.find((b) => b.id === removedId);
    const next = featuredBadgeIds.filter((_, i) => i !== index);
    setFeaturedBadgeIds(next);
    saveFeaturedBadges(next);
    if (badgeToSwap?.id === removedId) setBadgeToSwap(null);
    toast.success(`Slot #${index + 1} (${badge?.name || ""}) dilepas dari rak kartu.`);
  };

  const [skinVersion, setSkinVersion] = useState(0);
  const activeSkin = useMemo(() => getSkinById(activeSkinId), [activeSkinId, skinVersion]);

  const handleApplySkin = (skinId: string) => {
    setActiveSkinId(skinId);
    setSkinVersion((v) => v + 1);
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

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 pb-24 sm:pb-28 max-w-6xl">
      {/* ── STUDENT HEADER CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card border border-border rounded-2xl mb-10 relative overflow-hidden shadow-xs"
      >
        {/* Solid Header Banner with Signature Accent Border */}
        <div
          className="relative h-28 sm:h-36 px-6 sm:px-8 pt-5 flex items-start justify-between overflow-hidden border-b-4 transition-all duration-300"
          style={{
            background: activeSkin.headerGradient,
            borderBottomColor: activeSkin.headerBorderColor,
          }}
        >
          {/* 1. BEM 2026 HEADER ANIMATION */}
          {activeSkin.id === "bem2026" && (
            <>
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#f59e0b_1.2px,transparent_1.2px)] [background-size:14px_14px] animate-pulse pointer-events-none" />
              <div className="absolute -right-8 -top-10 w-52 h-52 bg-gradient-to-bl from-amber-400/35 via-orange-500/20 to-transparent rounded-full blur-xl animate-pulse pointer-events-none" />
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-200/25 to-transparent -skew-x-12 bem-shimmer-sweep pointer-events-none" />
            </>
          )}

          {/* 2. RISTEK BLUE V2.0 (QUANTUM CYBER ARCHITECT) */}
          {activeSkin.id === "ristekA" && (
            <>
              <div className="absolute inset-0 opacity-35 bg-[linear-gradient(to_right,#00f0ff_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:16px_16px] cyber-grid-pan pointer-events-none" />
              <div className="absolute left-1/4 -bottom-10 w-48 h-48 bg-[#00f0ff]/30 rounded-full blur-2xl animate-pulse pointer-events-none" />
              <div className="absolute -right-6 -top-8 w-48 h-40 bg-blue-500/35 rounded-full blur-2xl animate-pulse pointer-events-none" />
              <div className="absolute right-12 bottom-0 w-28 h-28 bg-orange-500/25 rounded-full blur-xl pointer-events-none" />
              <div className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-[#00f0ff]/35 to-transparent -skew-x-12 cyber-laser-scan pointer-events-none" />
              <svg className="absolute inset-0 w-full h-full opacity-85 pointer-events-none" viewBox="0 0 600 130" preserveAspectRatio="none" fill="none">
                <path d="M140 105 H280 L315 74 H455 L495 45 H595" stroke="#0369a1" strokeWidth="1.5" />
                <path d="M140 105 H280 L315 74 H455 L495 45 H595" stroke="#00f0ff" strokeWidth="2.5" strokeDasharray="28 140" className="pcb-packet-flow" />
                <path d="M190 116 H340 L375 88 H540" stroke="#1e3a8a" strokeWidth="1.2" />
                <path d="M190 116 H340 L375 88 H540" stroke="#f97316" strokeWidth="2" strokeDasharray="18 150" className="pcb-packet-flow-reverse" />
                <circle cx="280" cy="105" r="3" fill="#00f0ff" />
                <circle cx="315" cy="74" r="3.5" fill="#38bdf8" className="animate-ping" />
                <circle cx="315" cy="74" r="2.5" fill="#ffffff" />
                <circle cx="455" cy="74" r="3" fill="#00f0ff" />
                <circle cx="495" cy="45" r="4" fill="#f97316" />
              </svg>
              <span className="absolute left-32 bottom-2.5 text-[8px] font-mono font-bold text-cyan-300/75 float-sparkle-1 select-none pointer-events-none">0101</span>
              <span className="absolute right-32 top-11 text-[8px] font-mono font-bold text-sky-300/80 float-sparkle-2 select-none pointer-events-none">&lt;BLD/&gt;</span>
              <span className="absolute right-8 bottom-5 text-[7px] font-mono font-bold text-orange-300/85 float-sparkle-3 select-none pointer-events-none">SYS.26</span>
            </>
          )}

          {/* 3. RISTEK BLUE V2.0 ULTRA (MECHA SAPPHIRE OVERDRIVE) */}
          {activeSkin.id === "ristekB" && (
            <>
              <div className="absolute inset-0 opacity-35 bg-[radial-gradient(#00f0ff_1.5px,transparent_1.5px),radial-gradient(#3b82f6_1.5px,#020617_1.5px)] [background-size:18px_18px] [background-position:0_0,9px_9px] cyber-grid-pan pointer-events-none" />
              <div className="absolute inset-0 opacity-25 bg-[linear-gradient(to_right,#00f0ff_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:20px_20px] cyber-grid-pan pointer-events-none" />
              <div className="absolute -right-10 -bottom-14 w-48 h-48 rounded-full border-2 border-dashed border-cyan-400/40 spin-slow pointer-events-none" />
              <div className="absolute -right-4 -bottom-8 w-36 h-36 rounded-full border border-sky-300/35 spin-reverse-slow pointer-events-none" />
              <div className="absolute inset-x-10 -bottom-10 h-28 bg-gradient-to-r from-blue-600/45 via-[#00f0ff]/45 to-orange-500/35 blur-2xl animate-pulse pointer-events-none" />
              <div className="absolute inset-0 w-2/3 h-full bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent -skew-x-12 bem-shimmer-sweep pointer-events-none" />
              <svg className="absolute inset-0 w-full h-full opacity-90 pointer-events-none" viewBox="0 0 600 130" preserveAspectRatio="none" fill="none">
                <path d="M135 96 L230 96 L265 68 L410 68 L445 92 L580 92" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M135 96 L230 96 L265 68 L410 68 L445 92 L580 92" stroke="#00f0ff" strokeWidth="2.8" strokeDasharray="32 140" className="pcb-packet-flow" />
                <g transform="translate(340, 68)">
                  <circle cx="0" cy="0" r="9" stroke="#00f0ff" strokeWidth="1.3" strokeOpacity="0.65" />
                  <circle cx="0" cy="0" r="3" fill="#f97316" />
                </g>
              </svg>
              <div className="absolute bottom-0 inset-x-0 h-[5px] opacity-95 bg-[repeating-linear-gradient(90deg,#00f0ff,#00f0ff_12px,#020617_12px,#020617_20px,#f97316_20px,#f97316_26px,#020617_26px,#020617_34px)] forge-stripe-slide pointer-events-none" />
            </>
          )}
          <div className="relative z-10 flex flex-wrap items-center justify-center sm:justify-start w-full gap-2">
            {profile.angkatan && (
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-white/15 text-white backdrop-blur-sm border border-white/10 shadow-xs">
                ANGKATAN {profile.angkatan}
              </span>
            )}
            {profile.status_badge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/10 shadow-xs">
                <span
                  className="w-2 h-2 rounded-full shrink-0 g-pulse"
                  style={{ backgroundColor: activeSkin.statusDotColor }}
                  aria-hidden="true"
                />
                <span>{normalizeStatusBadge(profile.status_badge)}</span>
              </span>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-8 pb-8 pt-0 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
            {/* Circular Avatar with Static Skin Ring */}
            <div className="relative -mt-14 sm:-mt-18 shrink-0">
              <div
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1.5 shadow-xl shadow-orange-500/25 flex items-center justify-center transition-all duration-300"
                style={{ background: activeSkin.avatarRingStyle }}
              >
                <div className="w-full h-full rounded-full border-4 border-card bg-slate-900 text-white flex items-center justify-center overflow-hidden relative">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#FF8A2B] text-white flex items-center justify-center text-4xl sm:text-5xl font-extrabold uppercase font-serif">
                      {profile.full_name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1 w-full pt-2 sm:pt-4">
              {/* Name */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-1.5">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground break-words">
                  {profile.full_name}
                </h1>
              </div>

              {/* Prodi */}
              {profile.prodi && (
                <div className="flex items-center justify-center md:justify-start gap-1.5 text-sm sm:text-base text-primary font-semibold mb-4">
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span>{profile.prodi}</span>
                </div>
              )}

            {/* Bio */}
            <p className="text-xs sm:text-sm text-muted-foreground font-normal max-w-2xl mb-6 leading-relaxed">
              {profile.bio || "Mahasiswa kreatif STMIK Tazkia."}
            </p>

            {/* Skills (Colorful with getTechTagColor) */}
            {validSkills.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5 sm:gap-2 mb-6 max-w-xl mx-auto md:mx-0">
                {validSkills.map((skill, i) => {
                  const colorClass = getTechTagColor(skill);
                  return (
                    <span
                      key={`${skill}-${i}`}
                      className={`inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium border transition-all shadow-2xs hover:scale-105 cursor-default ${colorClass}`}
                    >
                      {skill}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              {isOwnProfile && (
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-[#ea580c] shadow-xs hover:shadow-md hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profil</span>
                </Link>
              )}

              {/* Tombol Tema Kartu (Skin Card) */}
              <button
                type="button"
                onClick={() => setShowSkinModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs sm:text-sm font-semibold hover:border-primary/40 hover:bg-muted hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-xs cursor-pointer"
                title="Preview Tema Kartu"
              >
                <CreditCard className="w-4 h-4 text-primary" />
                <span>Tema Kartu</span>
              </button>

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs sm:text-sm font-semibold hover:bg-muted hover:border-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-xs cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan</span>
              </button>

              {/* 4 Social Icons: Website, LinkedIn, GitHub, Instagram */}
              <div className="flex gap-1.5 ml-0 sm:ml-1">
                {/* Website / Portfolio */}
                {profile.website_url ? (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF8A2B] hover:bg-[#FF8A2B] hover:text-white hover:border-[#FF8A2B] transition-all shadow-xs"
                    aria-label="Portfolio / Website"
                    title="Website / Portofolio"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                ) : (
                  <span
                    className="w-9 h-9 rounded-lg border border-border/80 bg-muted/60 flex items-center justify-center text-muted-foreground/70 cursor-not-allowed shadow-2xs"
                    title="Website / Portofolio belum ditautkan"
                    aria-label="Website belum ditautkan"
                  >
                    <Globe className="w-4 h-4" />
                  </span>
                )}

                {/* LinkedIn */}
                {profile.linkedin_url ? (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-lg bg-[#0a66c2]/10 border border-[#0a66c2]/20 flex items-center justify-center text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white transition-all shadow-xs"
                    aria-label="LinkedIn"
                    title="LinkedIn"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                ) : (
                  <span
                    className="w-9 h-9 rounded-lg border border-border/80 bg-muted/60 flex items-center justify-center text-muted-foreground/70 cursor-not-allowed shadow-2xs"
                    title="LinkedIn belum ditautkan"
                    aria-label="LinkedIn belum ditautkan"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </span>
                )}

                {/* GitHub */}
                {profile.github_url ? (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-lg bg-slate-900/10 border border-slate-900/20 dark:bg-white/10 dark:border-white/20 flex items-center justify-center text-slate-800 dark:text-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 dark:hover:bg-white dark:hover:text-slate-900 dark:hover:border-white transition-all shadow-xs"
                    aria-label="GitHub"
                    title="GitHub"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                  </a>
                ) : (
                  <span
                    className="w-9 h-9 rounded-lg border border-border/80 bg-muted/60 flex items-center justify-center text-muted-foreground/70 cursor-not-allowed shadow-2xs"
                    title="GitHub belum ditautkan"
                    aria-label="GitHub belum ditautkan"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                  </span>
                )}

                {/* Instagram */}
                {profile.instagram_url ? (
                  <a
                    href={profile.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-[#E4405F] hover:text-white hover:border-[#E4405F] transition-all shadow-xs"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <FiInstagram className="w-4 h-4" />
                  </a>
                ) : (
                  <span
                    className="w-9 h-9 rounded-lg border border-border/80 bg-muted/60 flex items-center justify-center text-muted-foreground/70 cursor-not-allowed shadow-2xs"
                    title="Instagram belum ditautkan"
                    aria-label="Instagram belum ditautkan"
                  >
                    <FiInstagram className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

      {/* ── BADGE & PRESTASI (ACHIEVEMENT) SECTION ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-4 sm:p-8 mb-10 relative overflow-hidden shadow-xs"
      >
        <div className="mb-5 sm:mb-6 pb-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
              <h2 className="text-sm sm:text-lg font-bold tracking-tight text-foreground font-mono uppercase whitespace-nowrap">
                Penghargaan &amp; Prestasi
              </h2>
              {isOwnProfile && newlyUnlockedBadgeIds.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>{newlyUnlockedBadgeIds.length} Baru Terbuka</span>
                </span>
              ) : studentBadgeIds.length > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>{studentBadgeIds.length} Diraih</span>
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0 whitespace-nowrap">
                {studentBadgeIds.length} / {PENGHARGAAN_CATALOG.length} Diraih
              </span>
              <button
                type="button"
                onClick={() => setIsCustomizingShelf((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                  isCustomizingShelf
                    ? "bg-primary text-white border border-primary shadow-xs"
                    : "bg-muted hover:bg-primary/10 text-foreground hover:text-primary border border-border hover:border-primary/30"
                }`}
                title="Atur badge yang disorot di rak kartu mahasiswa"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>
                  {isCustomizingShelf
                    ? "Selesai Mengatur"
                    : `Atur Sorotan Kartu (${featuredBadgeIds.length}/5)`}
                </span>
              </button>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Penghargaan pencapaian dan rekam jejak prestasi mahasiswa di galeri platform STMIK Tazkia.
          </p>
        </div>

        {/* Banner Undangan Kolaborasi Tim yang Dikirim Rekan Mahasiswa */}
        {isOwnProfile && pendingCollabRequests.length > 0 && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-primary/10 border-2 border-blue-500/50 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
                <Users className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-foreground">
                    Undangan Kolaborasi Tim Projek!
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                    {pendingCollabRequests.length} Undangan Baru
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  <strong>{pendingCollabRequests[0].inviterName}</strong> mengundang Anda bergabung ke projek <em>&ldquo;{pendingCollabRequests[0].karyaTitle}&rdquo;</em> sebagai <strong>{pendingCollabRequests[0].role || "Anggota Tim"}</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleAcceptCollab(pendingCollabRequests[0])}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Terima Kolaborasi</span>
              </button>
              <button
                type="button"
                onClick={() => handleRejectCollab(pendingCollabRequests[0])}
                className="px-3.5 py-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-rose-500 hover:border-rose-500/40 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Tolak</span>
              </button>
            </div>
          </div>
        )}

        {/* Banner Klaim Lencana Eksklusif yang Dikirim Admin */}
        {isOwnProfile && claimableGrants.length > 0 && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-primary/10 border-2 border-amber-500/50 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25">
                <Gift className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-foreground">
                    Hadiah Lencana Eksklusif dari Admin!
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                    {claimableGrants.length} Siap Diklaim
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Admin STMIK Tazkia telah mengirimkan lencana kehormatan eksklusif ke akun Anda ({claimableGrants.map(g => g.badgeName).join(", ")}). Klik tombol untuk mengklaim!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleClaimAll}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Klaim Lencana Sekarang</span>
              </button>
            </div>
          </div>
        )}

        {/* Notifikasi Banner Khusus Profil Pribadi jika ada penghargaan baru */}
        {isOwnProfile && newlyUnlockedBadgeIds.length > 0 && (
          <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-500/15 via-orange-500/10 to-amber-500/10 border-2 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/30">
                <Award className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-foreground">
                    Penghargaan Baru Terbuka!
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                    +{newlyUnlockedBadgeIds.length} Baru
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Selamat! Portofolio karya Anda telah membuka penghargaan baru. Badge bertanda merah di bawah siap dipajang di rak kartu Anda.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={markAllAsSeen}
                className="px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
              >
                Tandai Sudah Dilihat
              </button>
            </div>
          </div>
        )}

        {/* Panel Kustomisasi Rak Sorotan Kartu Profil */}
        <AnimatePresence>
          {isCustomizingShelf && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-to-b from-primary/5 via-card to-card border-2 border-primary/40 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      <h3 className="text-xs sm:text-sm font-bold text-foreground font-mono uppercase">
                        Rak Sorotan Kartu Profil ({featuredBadgeIds.length} / 5 Slot Terisi)
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Kelima badge ini dipajang di rak depan kartu mahasiswa Anda. Klik badge di bawah untuk memasang atau melepas.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomizingShelf(false);
                        setBadgeToSwap(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-white text-[11px] font-semibold hover:bg-[#ea580c] transition-all cursor-pointer shadow-2xs"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Selesai</span>
                    </button>
                  </div>
                </div>

                {/* Mode Tukar / Ganti Slot saat Rak Penuh */}
                {badgeToSwap && (
                  <div className="mb-3 p-2.5 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <ArrowLeftRight className="w-4 h-4 shrink-0" />
                      <span>
                        Gantikan slot mana dengan <strong>"{badgeToSwap.name}"</strong>? Klik salah satu slot (#1 - #5) di bawah:
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBadgeToSwap(null)}
                      className="px-2 py-0.5 rounded-md bg-card border border-border text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                    >
                      Batal
                    </button>
                  </div>
                )}

                {/* 5 Slots Display */}
                <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-xl mx-auto py-1">
                  {[0, 1, 2, 3, 4].map((slotIndex) => {
                    const badgeId = featuredBadgeIds[slotIndex];
                    const badge = badgeId ? PENGHARGAAN_CATALOG.find((b) => b.id === badgeId) : null;
                    const isSwapTarget = Boolean(badgeToSwap);

                    return (
                      <div
                        key={slotIndex}
                        onClick={() => {
                          if (badgeToSwap) {
                            handleReplaceSlot(slotIndex, badgeToSwap.id);
                          }
                        }}
                        className={`relative flex flex-col items-center justify-between p-2 rounded-xl border text-center transition-all ${
                          isSwapTarget
                            ? "bg-primary/5 border-primary ring-2 ring-primary/40 shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                            : badge
                            ? "bg-card border-primary/40 shadow-xs"
                            : "border-dashed border-border bg-muted/20"
                        }`}
                      >
                        <div className="w-full flex items-center justify-between mb-1">
                          <span className="text-[9px] font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                            #{slotIndex + 1}
                          </span>
                          {badge && !badgeToSwap && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSlot(slotIndex);
                              }}
                              className="w-4 h-4 rounded-full bg-muted hover:bg-rose-500 hover:text-white flex items-center justify-center text-muted-foreground text-[10px] transition-colors cursor-pointer"
                              title="Lepas dari slot ini"
                              aria-label="Lepas badge"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        {badge ? (
                          <>
                            <div className="relative my-1 flex items-center justify-center">
                              <TazkiaAchievementHexBadge
                                badge={badge}
                                size="xs"
                                locked={false}
                                animated={true}
                                showTooltip={false}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-foreground truncate w-full mt-1">
                              {badge.name}
                            </span>
                            {isSwapTarget && (
                              <span className="text-[9px] font-bold text-primary mt-1 font-mono uppercase bg-primary/10 px-1.5 py-0.5 rounded">
                                Ganti
                              </span>
                            )}
                          </>
                        ) : (
                          <div className="py-3 flex flex-col items-center justify-center text-muted-foreground/40">
                            <span className="text-lg font-light leading-none">+</span>
                            <span className="text-[9px] font-mono mt-0.5">
                              {isSwapTarget ? "Pilih" : "Kosong"}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center">
                  <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">Tips:</span> Klik badge di katalog bawah untuk langsung memasang atau melepas dari rak kartu.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tabs Filter Kategori (Umum & Terbatas) ── */}
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              setActiveBadgeTab("umum");
              setBadgeToSwap(null);
            }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeBadgeTab === "umum"
                ? "bg-primary text-white shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <span>Umum</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeBadgeTab === "umum"
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {PENGHARGAAN_CATALOG.filter((b) => b.group === "umum").length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveBadgeTab("terbatas");
              setBadgeToSwap(null);
            }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeBadgeTab === "terbatas"
                ? "bg-primary text-white shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <span>Terbatas</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeBadgeTab === "terbatas"
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {PENGHARGAAN_CATALOG.filter((b) => b.group === "terbatas").length}
            </span>
          </button>
        </div>

        {/* Badges Grid - Filtered by active tab */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5 sm:gap-3.5">
          {displayedBadges.map((badge) => {
            const isOwned = studentBadgeIds.includes(badge.id);
            const isClaimable = isOwnProfile && claimableGrants.some((g) => g.badgeId === badge.id);
            const isNewUnlock = isOwnProfile && newlyUnlockedBadgeIds.includes(badge.id) && !isClaimable;
            const isTerbatas = badge.group === "terbatas" || badge.tier === "khusus";
            const isEmas = badge.tier === "emas";
            const isPerak = badge.tier === "perak";
            const tierColor = isTerbatas
              ? "text-orange-500 font-black"
              : isEmas
              ? "text-yellow-600 dark:text-yellow-400 font-bold"
              : isPerak
              ? "text-slate-600 dark:text-slate-300 font-semibold"
              : "text-amber-800 dark:text-amber-600 font-semibold";

            const featuredIndex = featuredBadgeIds.indexOf(badge.id);
            const isFeatured = featuredIndex !== -1;

            return (
              <button
                type="button"
                key={badge.id}
                onClick={() => {
                  if (isCustomizingShelf) {
                    if (isOwned) {
                      handleToggleFeaturedBadge(badge.id);
                    } else if (isClaimable) {
                      handleClaimBadge(badge.id);
                    }
                  } else {
                    if (isNewUnlock) {
                      markBadgeAsSeen(badge.id);
                    }
                    setSelectedBadge(badge);
                  }
                }}
                className={`group relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-center select-none ${
                  isFeatured
                    ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-xs hover:-translate-y-1 active:translate-y-0"
                    : isClaimable
                    ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:-translate-y-1 active:translate-y-0 animate-pulse"
                    : isNewUnlock
                    ? "border-red-500 bg-red-500/10 ring-2 ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:-translate-y-1 active:translate-y-0"
                    : isOwned
                    ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:shadow-sm hover:-translate-y-1 active:translate-y-0"
                    : "border-dashed border-border/70 bg-muted/20 opacity-70 hover:opacity-100 hover:border-slate-400 dark:hover:border-slate-600 hover:-translate-y-0.5 active:translate-y-0"
                }`}
                title={
                  isClaimable
                    ? `[KLIK UNTUK KLAIM] Lencana Eksklusif "${badge.name}" dikirim oleh Admin!`
                    : isCustomizingShelf
                    ? isFeatured
                      ? `Klik untuk melepas "${badge.name}" dari rak kartu`
                      : `Klik untuk memasang "${badge.name}" ke rak kartu`
                    : isNewUnlock
                    ? `[BARU TERBUKA] Klik untuk melihat detail & tandai sudah dilihat: ${badge.name}`
                    : `Klik untuk melihat detail penghargaan ${badge.name}`
                }
              >
                {/* Notification indicator dot in corner */}
                {isClaimable ? (
                  <span className="absolute -top-1 -right-1 z-30 flex h-3 w-3 pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-card shadow-xs" />
                  </span>
                ) : isNewUnlock && !isFeatured ? (
                  <span className="absolute -top-1 -right-1 z-30 flex h-3 w-3 pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-card shadow-xs" />
                  </span>
                ) : null}

                {/* Featured Slot Indicator */}
                {isFeatured && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-primary text-white shadow-xs z-30 whitespace-nowrap flex items-center gap-1">
                    <Pin className="w-2.5 h-2.5" />
                    <span>Slot {featuredIndex + 1}</span>
                  </span>
                )}

                {/* Hexagon Medallion with custom vector artwork */}
                <div className="relative mb-2 flex items-center justify-center">
                  <TazkiaAchievementHexBadge
                    badge={badge}
                    size="sm"
                    locked={!isOwned && !isClaimable}
                    animated={isOwned || isClaimable}
                    showTooltip={false}
                  />

                  {/* Corner Status Dot */}
                  <span
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border shadow-xs z-20 ${
                      isFeatured
                        ? "bg-primary text-white border-card"
                        : isClaimable
                        ? "bg-amber-500 text-white border-card animate-bounce shadow-xs"
                        : isNewUnlock
                        ? "bg-red-500 text-white border-card animate-pulse"
                        : isOwned
                        ? "bg-emerald-500 text-white border-card"
                        : "bg-slate-400 text-white border-card"
                    }`}
                  >
                    {isFeatured ? (
                      <Pin className="w-2.5 h-2.5" />
                    ) : isClaimable ? (
                      <Gift className="w-2.5 h-2.5" />
                    ) : isOwned ? (
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    ) : (
                      <Lock className="w-2.5 h-2.5" />
                    )}
                  </span>
                </div>

                {/* Badge Title */}
                <span className="text-[11px] sm:text-xs font-bold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                  {badge.name}
                </span>

                {/* Tier Label */}
                <span className={`text-[8.5px] sm:text-[9px] font-mono font-bold uppercase mt-0.5 ${tierColor}`}>
                  {badge.tierLabel}
                </span>

                {/* Status tag */}
                {isClaimable ? (
                  <span className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tighter mt-0.5 flex items-center gap-0.5 animate-pulse">
                    <span>🎁 Klaim</span>
                  </span>
                ) : isNewUnlock ? (
                  <span className="text-[8px] font-black text-red-500 dark:text-red-400 uppercase tracking-tighter mt-0.5 animate-pulse">
                    🔴 Terbuka
                  </span>
                ) : isOwned ? (
                  <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter mt-0.5">
                    ✓ Diraih
                  </span>
                ) : (
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                    🔒 Terkunci
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── PROJECTS SECTION ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              Portofolio Karya
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Folder className="w-5 h-5 text-primary" />
              <span>{isOwnProfile ? "Karya Saya" : "Daftar Karya"}</span>
              <span className="text-sm text-muted-foreground font-normal">
                ({projects.length})
              </span>
            </h2>
          </div>
          {isOwnProfile && (
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-[#ea580c] shadow-xs hover:shadow-md hover:shadow-orange-500/20 transition-all self-start sm:self-auto"
            >
              Upload Karya Baru
            </Link>
          )}
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-xs font-semibold"
                    : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {KARYA_CATEGORIES.find((c) => c.value === cat)?.label || cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                >
                  <NeobrutalismProjectCard project={project} authorProfile={profile} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 border border-border border-dashed rounded-2xl">
            <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              Belum ada karya yang diunggah
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
              Mulai bagikan karya terbaikmu untuk membangun rekam jejak digital.
            </p>
            {isOwnProfile && (
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-[#ea580c] transition-all shadow-xs"
              >
                Upload Karya Pertama
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareProfileModal
          studentName={profile.full_name}
          shareUrl={shareUrl}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Skin Preview Modal */}
      {showSkinModal && (
        <SkinPreviewModal
          studentName={profile.full_name}
          prodi={profile.prodi}
          angkatan={profile.angkatan}
          avatarUrl={profile.avatar_url}
          bio={profile.bio}
          skills={validSkills}
          statusBadge={profile.status_badge}
          activeSkinId={activeSkinId}
          featuredBadgeIds={featuredBadgeIds}
          studentId={profile.id || profile.user_id}
          onApplySkin={handleApplySkin}
          onClose={() => setShowSkinModal(false)}
        />
      )}

      {/* Badge Detail Overlay Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 flex min-h-full items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={`relative z-10 w-full max-w-sm sm:max-w-md my-auto rounded-3xl border bg-card p-4 sm:p-6 shadow-2xl text-center max-h-[90vh] overflow-y-auto ${
                studentBadgeIds.includes(selectedBadge.id)
                  ? "border-emerald-500/40 ring-1 ring-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.15)]"
                  : "border-border"
              }`}
            >
              {/* Close Button Top Right */}
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="absolute top-3 right-3 p-1.5 sm:p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer z-30"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>

              {(() => {
                const isSelectedUnlocked = studentBadgeIds.includes(selectedBadge.id);
                const isClaimable =
                  isOwnProfile && claimableGrants.some((g) => g.badgeId === selectedBadge.id);
                const selectedProgress = getBadgeMissionProgress(selectedBadge.id, {
                  userId: studentUserId,
                  projects: evaluatedProjects,
                  angkatan: profile?.angkatan,
                  skills: profile?.skills || [],
                  bio: profile?.bio,
                  statusBadge: profile?.status_badge,
                  cardSkin: activeSkinId,
                  unlockedBadgeIds: studentBadgeIds,
                  claimedBadgeIds: claimedExclusiveBadgeIds,
                });

                return (
                  <>
                    {/* Glowing Medallion with custom vector artwork */}
                    <div className="relative mx-auto mt-2 mb-3 pt-2 flex items-center justify-center">
                      <TazkiaAchievementHexBadge
                        badge={selectedBadge}
                        size="md"
                        locked={!isSelectedUnlocked}
                        animated={isSelectedUnlocked}
                      />
                    </div>

                    {/* Status Pill */}
                    <div className="mt-1 mb-2.5">
                      {isSelectedUnlocked ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>MISI TERBUKA &amp; DIRAIH (PERMANEN)</span>
                        </span>
                      ) : isClaimable ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-xs animate-pulse">
                          <Gift className="w-3.5 h-3.5" />
                          <span>LENCANA EKSKLUSIF SIAP DIKLAIM</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Masih Terkunci</span>
                        </span>
                      )}
                    </div>

                    {/* Title & Tier */}
                    <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight mb-0.5">
                      {selectedBadge.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      PENGHARGAAN TINGKAT {selectedBadge.tierLabel}
                    </p>

                    {/* Description Box with Real Mission & Philosophy */}
                    <div
                      className={`border rounded-2xl p-3.5 text-xs text-foreground/90 leading-relaxed mb-4 text-left space-y-2.5 ${
                        isSelectedUnlocked
                          ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.12)]"
                          : isClaimable
                          ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                          : "bg-muted/40 border-border/80"
                      }`}
                    >
                      {isClaimable && (
                        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-start gap-2">
                          <Gift className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                          <span>
                            Lencana ini telah dikirimkan secara langsung oleh <strong>Admin STMIK Tazkia</strong> untuk akun Anda! Klik tombol klaim di bawah untuk mengaktifkannya di profil.
                          </span>
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                          Misi / Syarat Buka
                        </span>
                        <p className="mt-0.5 font-medium leading-relaxed">
                          {selectedProgress.requirementText}
                        </p>
                      </div>

                      {/* Real Mission Progress Bar */}
                      <div className="pt-2 border-t border-border/60">
                        <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                          <span className="font-bold text-foreground uppercase tracking-wider">
                            Progres Misi
                          </span>
                          <span
                            className={
                              isSelectedUnlocked
                                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                                : isClaimable
                                ? "text-amber-600 dark:text-amber-400 font-extrabold"
                                : "text-amber-500 font-extrabold"
                            }
                          >
                            {selectedProgress.progressText} ({selectedProgress.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-1">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isSelectedUnlocked
                                ? "bg-gradient-to-r from-emerald-500 to-green-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                : isClaimable
                                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                : "bg-gradient-to-r from-amber-500 to-orange-400"
                            }`}
                            style={{ width: `${selectedProgress.percentage}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">
                          {selectedProgress.remainingText}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Makna &amp; Filosofi
                        </span>
                        <p className="mt-0.5 text-muted-foreground text-[11.5px] italic">
                          &ldquo;{selectedBadge.philosophy}&rdquo;
                        </p>
                      </div>

                      {!isSelectedUnlocked && !isClaimable && (
                        <div className="mt-2 pt-2 border-t border-border/60 text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>Publikasikan karya atau terus tingkatkan portofolio untuk membuka penghargaan ini!</span>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              {/* Action Buttons: Klaim / Pasang / Lepas dari Rak & Tutup */}
              {isOwnProfile && claimableGrants.some((g) => g.badgeId === selectedBadge.id) ? (
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={async () => {
                      await handleClaimBadge(selectedBadge.id);
                      setSelectedBadge(null);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Gift className="w-4 h-4 animate-bounce" />
                    <span>Klaim Lencana Eksklusif Ini Sekarang!</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBadge(null)}
                    className="py-3 px-5 rounded-xl bg-card border border-border text-foreground font-semibold text-xs sm:text-sm hover:bg-muted transition-colors shadow-xs cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              ) : !studentBadgeIds.includes(selectedBadge.id) ? (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setSelectedBadge(null)}
                    className="w-full py-2.5 rounded-xl bg-muted text-foreground font-semibold text-xs sm:text-sm hover:bg-muted/80 transition-colors shadow-xs cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              ) : featuredBadgeIds.includes(selectedBadge.id) ? (
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleFeaturedBadge(selectedBadge.id);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Lepas dari Rak (Slot #{featuredBadgeIds.indexOf(selectedBadge.id) + 1})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBadge(null)}
                    className="py-2.5 px-6 rounded-xl bg-primary text-white font-semibold text-xs sm:text-sm hover:bg-[#ea580c] transition-colors shadow-xs cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              ) : featuredBadgeIds.length < 5 ? (
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleFeaturedBadge(selectedBadge.id);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-white hover:bg-[#ea580c] font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Pin className="w-4 h-4" />
                    <span>Pasang di Rak Kartu (Slot #{featuredBadgeIds.length + 1})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBadge(null)}
                    className="py-2.5 px-6 rounded-xl bg-card border border-border text-foreground font-semibold text-xs sm:text-sm hover:bg-muted transition-colors shadow-xs cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              ) : (
                /* Rak Sudah Penuh (5/5) -> Mahasiswa bisa langsung klik salah satu slot untuk menggantikannya */
                <div className="space-y-3">
                  <div className="bg-muted/40 border border-primary/20 rounded-xl p-3 text-left">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1">
                      <ArrowLeftRight className="w-4 h-4 text-primary shrink-0" />
                      <span>Rak Kartu Penuh (5/5) · Pilih Slot untuk Digantikan:</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2.5">
                      Pilih salah satu dari 5 badge di rak Anda saat ini untuk digantikan dengan <strong>{selectedBadge.name}</strong>:
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {featuredBadgeIds.map((id, sIdx) => {
                        const b = PENGHARGAAN_CATALOG.find((x) => x.id === id);
                        if (!b) return null;
                        return (
                          <button
                            type="button"
                            key={id}
                            onClick={() => handleReplaceSlot(sIdx, selectedBadge.id)}
                            className="flex flex-col items-center justify-between p-1.5 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-center group cursor-pointer shadow-2xs"
                            title={`Gantikan slot #${sIdx + 1} (${b.name})`}
                          >
                            <span className="text-[9px] font-mono font-bold text-muted-foreground group-hover:text-primary">
                              #{sIdx + 1}
                            </span>
                            <div className="my-1 scale-75 shrink-0 flex items-center justify-center">
                              <TazkiaAchievementHexBadge badge={b} size="xs" animated={false} />
                            </div>
                            <span className="text-[9px] font-bold text-primary group-hover:underline truncate w-full leading-tight">
                              Ganti
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedBadge(null)}
                    className="w-full py-2.5 rounded-xl bg-card border border-border text-foreground font-semibold text-xs sm:text-sm hover:bg-muted transition-colors shadow-xs cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
