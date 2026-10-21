"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getMahasiswaById, getMahasiswaProjects, formatNumber, toggleKaryaLike, getLikedKaryaIds } from "@/lib/data";
import { getDeviceId } from "@/utils/identity";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import type { MahasiswaProfile, MahasiswaProject, Karya } from "@/types/karya";
import { KARYA_CATEGORIES } from "@/types/karya";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  Code,
  Mail,
  GraduationCap,
  Folder,
  Eye,
  Heart,
  Loader2,
  Share2,
  Award,
  Edit,
  CreditCard,
  X,
  Check,
  Lock,
  Info,
} from "lucide-react";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PREDEFINED_SKILLS } from "@/utils/skillOptions";
import { normalizeStatusBadge } from "@/app/student/page";
import { getTechTagColor } from "@/utils/techTagColor";
import {
  PENGHARGAAN_CATALOG,
  calculateStudentEarnedBadges,
  type PenghargaanBadge,
} from "@/data/penghargaanCatalog";
import { TazkiaAchievementHexBadge } from "@/components/penghargaan/TazkiaAchievementBadge";
import ShareProfileModal from "@/components/mahasiswa/ShareProfileModal";
import SkinPreviewModal from "@/components/mahasiswa/SkinPreviewModal";
import { getSkinById } from "@/utils/skinConfig";
import TechStackTags from "@/components/ui/TechStackTags";
import { ProjectCoverPlaceholder } from "@/components/ui/ProjectCoverPlaceholder";

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

  const [skinVersion, setSkinVersion] = useState(0);
  const activeSkin = useMemo(() => getSkinById(activeSkinId), [activeSkinId, skinVersion]);

  const handleApplySkin = (skinId: string) => {
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
      window.dispatchEvent(new CustomEvent("tazkia_profile_skin_updated", { detail: { skinId, studentId: mahasiswa?.id } }));
      window.dispatchEvent(new Event("storage"));
    }
  };

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/student/${resolvedParams.id}`
      : "";

  const [isLiking, setIsLiking] = useState<Record<string, boolean>>({});

  const toggleLike = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLiking[id]) return;
    
    setIsLiking(prev => ({ ...prev, [id]: true }));
    const wasLiked = likedKarya[id];
    setLikedKarya((prev) => ({ ...prev, [id]: !wasLiked }));
    setProjects((prev) => prev.map(k => k.id === id ? { ...k, likes: Math.max(0, (k.likes ?? 0) + (wasLiked ? -1 : 1)) } : k));
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      const deviceId = getDeviceId();
      
      const actionToTake = wasLiked ? 'unlike' : 'like';
      const isNowLiked = await toggleKaryaLike(id, deviceId, userId, actionToTake);
      setLikedKarya((prev) => ({ ...prev, [id]: isNowLiked }));
      if (isNowLiked) {
        localStorage.setItem(`liked_${id}`, 'true');
      } else {
        localStorage.removeItem(`liked_${id}`);
      }
    } catch (err) {
      console.error(err);
      setLikedKarya((prev) => ({ ...prev, [id]: wasLiked }));
      setProjects((prev) => prev.map(k => k.id === id ? { ...k, likes: Math.max(0, (k.likes ?? 0) + (wasLiked ? 1 : -1)) } : k));
    } finally {
      setIsLiking(prev => ({ ...prev, [id]: false }));
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

  // Reset page when filter changes
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  // Only show categories that have at least 1 project
  const availableCategories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category));
    return KARYA_CATEGORIES.filter((c) => c.value === "All" || cats.has(c.value));
  }, [projects]);

  // Badges & Achievements
  const studentSkills = useMemo(() => {
    return Array.from(new Set(mahasiswa?.skills || [])).filter(
      (s) => Boolean(s) && PREDEFINED_SKILLS.includes(s)
    );
  }, [mahasiswa?.skills]);

  const studentBadgeIds = useMemo(() => {
    return PENGHARGAAN_CATALOG.map((b) => b.id);
  }, []);

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

      // Inisialisasi status like dari localStorage dan server
      const initialLiked: Record<string, boolean> = {};
      projs.forEach(k => {
        if (localStorage.getItem(`liked_${k.id}`) === 'true') {
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
      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
          } else {
            router.push("/student");
          }
        }}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 hover:-translate-x-0.5 transition-all mb-8 shadow-xs group cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Kembali</span>
      </button>

      {/* Student Header */}
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
              <span className="absolute left-12 bottom-3 w-1.5 h-1.5 rounded-full bg-amber-300 float-sparkle-1" />
              <span className="absolute left-1/2 top-6 w-2 h-2 rounded-full bg-yellow-200 float-sparkle-2" />
              <span className="absolute right-20 bottom-4 w-1.5 h-1.5 rounded-full bg-orange-300 float-sparkle-3" />
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
            {mahasiswa.angkatan && (
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-white/15 text-white backdrop-blur-sm border border-white/10 shadow-xs">
                ANGKATAN {mahasiswa.angkatan}
              </span>
            )}
            {mahasiswa.status_badge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/10 shadow-xs">
                <span
                  className="w-2 h-2 rounded-full shrink-0 g-pulse"
                  style={{ backgroundColor: activeSkin.statusDotColor }}
                  aria-hidden="true"
                />
                <span>{normalizeStatusBadge(mahasiswa.status_badge)}</span>
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
                  {mahasiswa.avatar_url ? (
                    <img
                      src={mahasiswa.avatar_url}
                      alt={mahasiswa.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#FF8A2B] text-white flex items-center justify-center text-4xl sm:text-5xl font-extrabold uppercase font-serif">
                      {mahasiswa.full_name.charAt(0)}
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
                  {mahasiswa.full_name}
                </h1>
              </div>

              {/* Prodi */}
              {mahasiswa.prodi && (
                <div className="flex items-center justify-center md:justify-start gap-1.5 text-sm sm:text-base text-primary font-semibold mb-4">
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span>{mahasiswa.prodi}</span>
                </div>
              )}

            <p className="text-xs sm:text-sm text-muted-foreground font-normal max-w-2xl mb-6 leading-relaxed">
              {mahasiswa.bio || "Mahasiswa kreatif STMIK Tazkia."}
            </p>

            {/* Skills (Warna-warni sesuai getTechTagColor) */}
            {(mahasiswa.skills ?? []).filter((s) => Boolean(s) && PREDEFINED_SKILLS.includes(s)).length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5 sm:gap-2 mb-6 max-w-xl mx-auto md:mx-0">
                {(mahasiswa.skills ?? []).filter((s) => Boolean(s) && PREDEFINED_SKILLS.includes(s)).map((skill, i) => {
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

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              {isOwnProfile ? (
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-[#ea580c] shadow-xs hover:shadow-md hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profil</span>
                </Link>
              ) : (
                <a
                  href={`mailto:${mahasiswa.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs sm:text-sm font-semibold hover:border-primary/40 hover:bg-muted/60 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-xs"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  <span>Kirim Email</span>
                </a>
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
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs sm:text-sm font-semibold hover:border-primary/40 hover:bg-muted hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan</span>
              </button>

              <div className="flex gap-1.5 ml-0 sm:ml-1">
                {mahasiswa.website_url && (
                  <a
                    href={mahasiswa.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF8A2B] hover:bg-[#FF8A2B] hover:text-white hover:border-[#FF8A2B] transition-all shadow-xs"
                    aria-label="Portfolio / Website"
                    title="Website / Portofolio"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {mahasiswa.linkedin_url && (
                  <a
                    href={mahasiswa.linkedin_url}
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
                )}
                {mahasiswa.github_url && (
                  <a
                    href={mahasiswa.github_url}
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
                )}
                {mahasiswa.instagram_url && (
                  <a
                    href={mahasiswa.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-xs"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </motion.div>

      {/* ── BADGE & PRESTASI / ACHIEVEMENT SECTION ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-4 sm:p-8 mb-10 shadow-xs"
      >
        <div className="mb-5 sm:mb-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
              <h2 className="text-sm sm:text-lg font-bold tracking-tight text-foreground font-mono uppercase whitespace-nowrap">
                Penghargaan &amp; Prestasi
              </h2>
            </div>
            <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0 whitespace-nowrap">
              {studentBadgeIds.length} / {PENGHARGAAN_CATALOG.length} Diraih
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Penghargaan pencapaian dan rekam jejak prestasi mahasiswa di galeri platform STMIK Tazkia.
          </p>
        </div>

        {/* Badges Shelf - 14 Clean Medallions */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5 sm:gap-3.5">
          {PENGHARGAAN_CATALOG.map((badge) => {
            const isOwned = studentBadgeIds.includes(badge.id);
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

            return (
              <button
                type="button"
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`group relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-center select-none ${
                  isOwned
                    ? "border-border bg-card hover:bg-muted/60 hover:border-primary/50 hover:shadow-md hover:-translate-y-1 active:translate-y-0"
                    : "border-dashed border-border/70 bg-muted/20 opacity-70 hover:opacity-100 hover:border-slate-400 dark:hover:border-slate-600 hover:-translate-y-0.5 active:translate-y-0"
                }`}
                title={`Klik untuk melihat detail penghargaan ${badge.name}`}
              >
                {/* Hexagon Medallion with custom vector artwork */}
                <div className="relative mb-2 flex items-center justify-center">
                  <TazkiaAchievementHexBadge
                    badge={badge}
                    size="sm"
                    locked={!isOwned}
                    animated={isOwned}
                  />

                  {/* Corner Status Dot */}
                  <span
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border shadow-xs z-20 ${
                      isOwned
                        ? "bg-emerald-500 text-white border-card"
                        : "bg-slate-400 text-white border-card"
                    }`}
                  >
                    {isOwned ? (
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    ) : (
                      <Lock className="w-2.5 h-2.5 text-white" />
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
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Student Projects */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              Portofolio Karya
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Folder className="w-5 h-5 text-primary" />
              <span>Karya oleh {mahasiswa.full_name.split(" ")[0]}</span>
              <span className="text-sm text-muted-foreground font-normal">({projects.length})</span>
            </h2>
          </div>
        </div>

        {/* Category Filter */}
        {availableCategories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {availableCategories.map((cat) => (
              <button
                type="button"
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeCategory === cat.value
                    ? "bg-primary text-white shadow-xs font-semibold"
                    : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {filteredProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProjects.map((project, index) => {
                const catLabel = KARYA_CATEGORIES.find((c) => c.value === project.category)?.label ?? project.category;
                const isLiked = likedKarya[project.id] ?? false;
                const likesCount = project.likes ?? 0;
                const authorName = project.team?.[0]?.name || mahasiswa.full_name;
                const authorInitial = authorName.replace("[", "").charAt(0).toUpperCase();
                const authorAvatar = project.team?.[0]?.avatar || mahasiswa.avatar_url;
                const extraTeamCount = Math.max(0, (project.team?.length ?? 0) - 1);

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className="h-full"
                  >
                    <article className="kt-cardx relative rounded-[20px] border border-border bg-card overflow-hidden flex flex-col h-full group shadow-xs hover:border-[#FF8A2B]">
                      {/* Cover Area with Hover Pill */}
                      <div className="aspect-[16/10] w-full overflow-hidden relative bg-muted group/cover">
                        <Link
                          href={`/project/${project.id}`}
                          className="block w-full h-full"
                        >
                          {project.image_url ? (
                            <img
                              src={project.image_url}
                              alt={project.title}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                          ) : (
                            <ProjectCoverPlaceholder
                              id={project.id}
                              title={project.title}
                              category={project.category}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                        </Link>

                        {/* Category Badge on top-left of cover */}
                        <span className="absolute top-3.5 left-3.5 z-10 px-3 py-1 rounded-full bg-card/90 backdrop-blur-md border border-border/70 text-foreground text-xs font-semibold shadow-xs">
                          {catLabel}
                        </span>

                        {/* Hover Slide-up 'Lihat detail' pill badge on bottom-right of cover */}
                        <Link
                          href={`/project/${project.id}`}
                          className="kt-go hidden md:inline-flex absolute right-3.5 bottom-3.5 z-20 px-4 py-1.5 rounded-full bg-[#FF8A2B] text-[#1A0F05] text-xs sm:text-sm font-bold shadow-md hover:bg-[#ea580c] transition-colors"
                        >
                          Lihat detail
                        </Link>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                        <div>
                          <Link
                            href={`/project/${project.id}`}
                            className="block group/title"
                          >
                            <h3 className="font-heading font-bold text-lg sm:text-xl text-foreground group-hover/title:text-[#FF8A2B] transition-colors line-clamp-1 mb-2">
                              {project.title}
                            </h3>
                          </Link>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4 font-normal">
                            {project.description}
                          </p>

                          {/* Colorful Tech Stack & Tool Chips */}
                          <TechStackTags
                            techs={project.tech_stack ?? []}
                            maxVisible={3}
                            className="mb-4"
                          />
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3.5 border-t border-border flex items-center justify-between mt-auto">
                          {/* Author with initial circle avatar */}
                          <div className="flex items-center gap-2.5 min-w-0 max-w-[55%]">
                            <div className="w-[30px] h-[30px] rounded-full bg-[#FF8A2B] text-[#1A0F05] flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs overflow-hidden">
                              {authorAvatar ? (
                                <img
                                  src={authorAvatar}
                                  alt={authorName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                authorInitial
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                              {authorName}
                            </span>
                            {extraTeamCount > 0 && (
                              <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded-md font-semibold text-muted-foreground shrink-0">
                                +{extraTeamCount}
                              </span>
                            )}
                          </div>

                          {/* Views & Like Button in Pill style */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                              <Eye className="w-3.5 h-3.5" />
                              <span className="tabular-nums">
                                {formatNumber(project.views ?? 0)}
                              </span>
                            </span>

                            <button
                              type="button"
                              onClick={(e) => toggleLike(e, project.id)}
                              aria-label="Sukai karya"
                              className={`inline-flex items-center gap-1.5 min-h-[34px] px-3 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                                isLiked
                                  ? "border-[#FF8A2B] bg-[#FF8A2B]/15 text-[#FF8A2B]"
                                  : "border-border bg-card text-muted-foreground hover:border-[#FF8A2B]/50 hover:text-foreground"
                              }`}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                                  isLiked
                                    ? "fill-[#FF8A2B] text-[#FF8A2B]"
                                    : "text-muted-foreground"
                                }`}
                              />
                              <span className="font-mono tabular-nums">
                                {likesCount}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-card border border-border text-xs font-medium disabled:opacity-40 hover:bg-muted transition-all shadow-xs"
                >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg border text-xs font-medium transition-all ${
                    currentPage === page
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-card border-border text-foreground hover:bg-muted shadow-xs"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-card border border-border text-xs font-medium text-foreground disabled:opacity-40 hover:bg-muted shadow-xs transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          </>
        ) : (
          <div className="text-center py-16 bg-card border border-border rounded-2xl shadow-xs">
            <p className="text-sm font-medium text-muted-foreground">
              Belum ada karya yang diunggah oleh mahasiswa ini.
            </p>
          </div>
        )}
      </div>

      {/* Share Profile Modal */}
      {showShareModal && mahasiswa && (
        <ShareProfileModal
          studentName={mahasiswa.full_name}
          shareUrl={shareUrl}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Skin Preview Modal */}
      {showSkinModal && mahasiswa && (
        <SkinPreviewModal
          studentName={mahasiswa.full_name}
          prodi={mahasiswa.prodi}
          angkatan={mahasiswa.angkatan}
          avatarUrl={mahasiswa.avatar_url}
          bio={mahasiswa.bio}
          statusBadge={mahasiswa.status_badge}
          activeSkinId={activeSkin.id}
          studentId={mahasiswa.id || mahasiswa.user_id}
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative z-10 w-full max-w-sm max-h-[90vh] overflow-y-auto my-auto rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-2xl text-center"
            >
              {/* Close Button Top Right */}
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Big Glowing Medallion with custom vector artwork */}
              <div className="relative mx-auto my-2 py-1 flex items-center justify-center">
                <TazkiaAchievementHexBadge
                  badge={selectedBadge}
                  size="md"
                  locked={!studentBadgeIds.includes(selectedBadge.id)}
                  animated={studentBadgeIds.includes(selectedBadge.id)}
                />
              </div>

              {/* Status Pill */}
              <div className="mt-1 mb-2.5">
                {studentBadgeIds.includes(selectedBadge.id) ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Sudah Diraih</span>
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

              {/* Description Box with Mission & Philosophy */}
              <div className="bg-muted/40 border border-border/80 rounded-2xl p-3.5 text-xs text-foreground/90 leading-relaxed mb-4 text-left space-y-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">Misi / Syarat Buka</span>
                  <p className="mt-0.5 font-medium">{selectedBadge.mission}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Makna & Filosofi</span>
                  <p className="mt-0.5 text-muted-foreground text-[11.5px]">{selectedBadge.philosophy}</p>
                </div>
                {!studentBadgeIds.includes(selectedBadge.id) && (
                  <div className="mt-2 pt-2 border-t border-border/60 text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Publikasikan karya atau terus tingkatkan portofolio untuk membuka penghargaan ini!</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-95 transition-opacity cursor-pointer shadow-sm"
              >
                Mengerti
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
