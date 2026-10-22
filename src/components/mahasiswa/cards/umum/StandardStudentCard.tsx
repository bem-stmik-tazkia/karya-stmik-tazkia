"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  Mail,
  RotateCw,
  ExternalLink,
  Globe,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "../SocialIcons";
import { PENGHARGAAN_CATALOG, PenghargaanBadge } from "@/data/penghargaanCatalog";
import { TazkiaAchievementHexBadge } from "@/components/penghargaan/TazkiaAchievementBadge";

export interface StudentCardData {
  name: string;
  initials?: string;
  angkatan?: string | number;
  statusIcon?: string;
  status?: string;
  major?: string;
  skills?: string[];
  bio?: string;
  roleTitle?: string;
  serial?: string;
  avatarUrl?: string | null;
  socials?: {
    website?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
  };
  contactEmail?: string;
  featuredBadgeIds?: number[];
  unlockedBadgeIds?: number[];
  badges?: Array<{ id: string; label: string; icon?: string }>;
}

export interface StandardStudentCardProps {
  data?: StudentCardData;
  primaryColor?: string;
  secondaryColor?: string;
  enableTilt?: boolean;
  isSkeleton?: boolean;
  onContactClick?: () => void;
  onProfileClick?: () => void;
  onTriggerUnlock?: () => void;
  onFilterAngkatan?: (ang: any) => void;
  onFilterStatus?: (st: string) => void;
  onFilterSkill?: (sk: string) => void;
}

const DEFAULT_FEATURED_IDS = [9, 4, 7, 10, 14];
const VISIBLE_COUNT = 4;

export const StandardStudentCard: React.FC<StandardStudentCardProps> = ({
  data = {
    name: "Anisa Aulia",
    initials: "A",
    angkatan: "ANGKATAN 2",
    statusIcon: "🟠",
    status: "Open for Collab",
    major: "Sistem Informasi",
    skills: ["UI/UX Design", "Frontend Dev"],
    bio: "Mahasiswa kreatif STMIK Tazkia yang siap berkarya & berkolaborasi.",
    roleTitle: "Mahasiswa Aktif STMIK Tazkia",
    serial: "KTZ-2026-STD-001",
    featuredBadgeIds: DEFAULT_FEATURED_IDS,
  },
  primaryColor = "#FF8A2B",
  secondaryColor = "#0B1F4A",
  enableTilt = true,
  isSkeleton = false,
  onContactClick,
  onProfileClick,
  onTriggerUnlock,
  onFilterAngkatan,
  onFilterStatus,
  onFilterSkill,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState<"umum" | "terbatas">("umum");
  const [selectedBadgeId, setSelectedBadgeId] = useState<number>(1);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Unlocked badges (defaults to all 16 if not specified)
  const unlockedBadgeIds = useMemo(() => {
    if (data.unlockedBadgeIds && data.unlockedBadgeIds.length > 0) {
      return data.unlockedBadgeIds;
    }
    return PENGHARGAAN_CATALOG.map((b) => b.id);
  }, [data.unlockedBadgeIds]);

  // Featured 5 badges shown on the front of the card
  const featuredBadges: PenghargaanBadge[] = useMemo(() => {
    const ids =
      data.featuredBadgeIds && data.featuredBadgeIds.length > 0
        ? data.featuredBadgeIds
        : DEFAULT_FEATURED_IDS;
    return ids
      .map((id) => PENGHARGAAN_CATALOG.find((b) => b.id === id))
      .filter((b): b is PenghargaanBadge => Boolean(b))
      .slice(0, 5);
  }, [data.featuredBadgeIds]);

  // Filtered list of badges for active tab on the back
  const tabBadges = useMemo(() => {
    return PENGHARGAAN_CATALOG.filter((b) => b.group === activeTab);
  }, [activeTab]);

  // Selected badge details on back of card
  const selectedBadge: PenghargaanBadge = useMemo(() => {
    const found = PENGHARGAAN_CATALOG.find((b) => b.id === selectedBadgeId);
    return found || tabBadges[0] || PENGHARGAAN_CATALOG[0];
  }, [selectedBadgeId, tabBadges]);

  // Bounded carousel calculation (Mentok, no infinite looping)
  const maxIndex = Math.max(0, tabBadges.length - VISIBLE_COUNT);
  const safeCarouselIndex = Math.min(carouselIndex, maxIndex);

  const visibleCarouselBadges = useMemo(() => {
    if (tabBadges.length <= VISIBLE_COUNT) {
      return tabBadges;
    }
    return tabBadges.slice(safeCarouselIndex, safeCarouselIndex + VISIBLE_COUNT);
  }, [tabBadges, safeCarouselIndex]);

  const canGoPrev = safeCarouselIndex > 0;
  const canGoNext = safeCarouselIndex < maxIndex;

  const handlePrevBadge = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canGoPrev) {
      setCarouselIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNextBadge = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canGoNext) {
      setCarouselIndex((prev) => Math.min(maxIndex, prev + 1));
    }
  };

  const handleTabChange = (tab: "umum" | "terbatas") => {
    setActiveTab(tab);
    setCarouselIndex(0);
    const first = PENGHARGAAN_CATALOG.find((b) => b.group === tab);
    if (first) {
      setSelectedBadgeId(first.id);
    }
  };

  const handleSelectBadge = (badge: PenghargaanBadge) => {
    setSelectedBadgeId(badge.id);
    if (badge.group !== activeTab) {
      setActiveTab(badge.group);
      const groupBadges = PENGHARGAAN_CATALOG.filter((b) => b.group === badge.group);
      const idx = groupBadges.findIndex((b) => b.id === badge.id);
      const newMax = Math.max(0, groupBadges.length - VISIBLE_COUNT);
      setCarouselIndex(Math.min(Math.max(0, idx - 1), newMax));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8.5;
    const rotateY = ((x - centerX) / centerX) * 8.5;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.018, 1.018, 1.018)`,
      transition: "transform 60ms ease-out",
    });

    setGlareStyle({
      opacity: 0.14,
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.65), transparent 60%)`,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "none",
      transition: "transform 350ms ease-out",
    });
    setGlareStyle({ opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "optimizeLegibility",
        ...tiltStyle,
      }}
      className="relative w-full max-w-[338px] mx-auto select-none antialiased"
    >
      {/* 3D Flip Container */}
      <div className="relative h-[515px] w-full [perspective:1200px]">
        <div
          className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* ================= FRONT OF CARD ================= */}
          <div
            onClick={!isFlipped ? onProfileClick : undefined}
            className={`absolute inset-0 w-full h-full rounded-[22px] [backface-visibility:hidden] [transform:translateZ(0)] antialiased p-[1px] bg-slate-200/90 dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300 ${
              isFlipped
                ? "pointer-events-none opacity-0 invisible z-0"
                : "pointer-events-auto opacity-100 visible z-10"
            } ${onProfileClick && !isFlipped ? "cursor-pointer" : ""}`}
          >
            <div className="relative w-full h-full rounded-[20px] overflow-hidden flex flex-col justify-between bg-white dark:bg-[#0b1325] text-slate-800 dark:text-slate-100">
              {/* Dynamic Mouse Glare */}
              <div
                className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 mix-blend-overlay"
                style={glareStyle}
              />

              {/* TOP SECTION: BANNER + AVATAR + INFO */}
              <div>
                {/* Header Banner - Biru Navy Asli STMIK Tazkia (#0B1F4A ke #16347A) */}
                <div
                  className="relative h-[110px] w-full overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${secondaryColor}, #16347A)`,
                  }}
                >
                  {/* Diagonal Gloss Sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none -skew-x-12" />

                  {/* Top Pills: Angkatan & Status */}
                  <div className="relative z-10 flex items-center justify-between px-4 pt-3.5">
                    {/* Angkatan */}
                    {isSkeleton ? (
                      <span className="w-16 h-5 rounded-full bg-[#1b3252]/85 border border-white/15 backdrop-blur-md shadow-xs inline-block" />
                    ) : (
                      <span
                        onClick={(e) => {
                          if (onFilterAngkatan) {
                            e.stopPropagation();
                            onFilterAngkatan(data.angkatan);
                          }
                        }}
                        className={`text-[11px] font-bold tracking-wide px-3 py-1 rounded-full bg-[#1b3252]/85 text-slate-200 border border-white/15 backdrop-blur-md shadow-xs ${
                          onFilterAngkatan
                            ? "hover:border-orange-400 hover:text-white cursor-pointer transition"
                            : ""
                        }`}
                      >
                        {data.angkatan || "ANGKATAN 2"}
                      </span>
                    )}

                    {/* Status Pill */}
                    {isSkeleton ? (
                      <span className="h-5 px-2.5 rounded-full flex items-center gap-1.5 bg-[#1b3252]/85 border border-white/15 backdrop-blur-md shadow-xs">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: primaryColor,
                            boxShadow: `0 0 6px ${primaryColor}`,
                          }}
                        />
                        <span className="w-14 h-2 rounded-full bg-white/20 inline-block" />
                      </span>
                    ) : (
                      <span
                        onClick={(e) => {
                          if (onFilterStatus && data.status) {
                            e.stopPropagation();
                            onFilterStatus(data.status);
                          }
                        }}
                        className={`text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 bg-[#1b3252]/85 text-slate-100 border border-white/15 backdrop-blur-md shadow-xs ${
                          onFilterStatus ? "hover:border-orange-400 cursor-pointer transition" : ""
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: primaryColor,
                            boxShadow: `0 0 6px ${primaryColor}`,
                          }}
                        />
                        <span>{data.status || "Open for Collab"}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Horizontal Divider Line */}
                <div className="relative">
                  <div
                    className="h-[3px] w-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>

                {/* Avatar & Social Row */}
                <div className="px-5 relative flex justify-between items-end -mt-10 mb-3">
                  {/* Avatar with Glow Ring */}
                  <div className="relative">
                    <div
                      className="relative w-[72px] h-[72px] rounded-full overflow-hidden border-4 border-white dark:border-slate-800 ring-4 bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all"
                      style={
                        {
                          boxShadow: `0 0 18px ${primaryColor}66`,
                          ["--tw-ring-color" as any]: primaryColor,
                        } as React.CSSProperties
                      }
                    >
                      {data.avatarUrl && !imgError ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={data.avatarUrl}
                          alt={data.name}
                          className="w-full h-full object-cover"
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center font-black text-2xl text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {data.initials || data.name.charAt(0).toUpperCase() || "A"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4 Social Buttons (Globe, GitHub, LinkedIn, Instagram) */}
                  <div className="flex items-center gap-1.5 pt-2" onClick={(e) => e.stopPropagation()}>
                    {/* Globe / Website */}
                    <button
                      type="button"
                      onClick={() => {
                        if (data.socials?.website) {
                          window.open(data.socials.website, "_blank");
                        }
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition ${
                        data.socials?.website
                          ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-orange-500 hover:text-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white cursor-pointer"
                          : "bg-slate-50/70 border-slate-200/80 text-slate-300 dark:bg-slate-800/60 dark:border-slate-700/60 dark:text-slate-600"
                      }`}
                      aria-label="Website"
                      title={data.socials?.website ? "Buka Website" : "Website belum ditautkan"}
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </button>

                    {/* GitHub */}
                    <button
                      type="button"
                      onClick={() => {
                        if (data.socials?.github) {
                          const url = data.socials.github.startsWith("http")
                            ? data.socials.github
                            : `https://github.com/${data.socials.github.replace(/^@/, "")}`;
                          window.open(url, "_blank");
                        }
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition ${
                        data.socials?.github
                          ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-orange-500 hover:text-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white cursor-pointer"
                          : "bg-slate-50/70 border-slate-200/80 text-slate-300 dark:bg-slate-800/60 dark:border-slate-700/60 dark:text-slate-600"
                      }`}
                      aria-label="GitHub"
                      title={data.socials?.github ? "Buka GitHub" : "GitHub belum ditautkan"}
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                    </button>

                    {/* LinkedIn */}
                    <button
                      type="button"
                      onClick={() => {
                        if (data.socials?.linkedin) {
                          const url = data.socials.linkedin.startsWith("http")
                            ? data.socials.linkedin
                            : `https://linkedin.com/in/${data.socials.linkedin.replace(/^@/, "")}`;
                          window.open(url, "_blank");
                        }
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition ${
                        data.socials?.linkedin
                          ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-orange-500 hover:text-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white cursor-pointer"
                          : "bg-slate-50/70 border-slate-200/80 text-slate-300 dark:bg-slate-800/60 dark:border-slate-700/60 dark:text-slate-600"
                      }`}
                      aria-label="LinkedIn"
                      title={data.socials?.linkedin ? "Buka LinkedIn" : "LinkedIn belum ditautkan"}
                    >
                      <LinkedinIcon className="w-3.5 h-3.5" />
                    </button>

                    {/* Instagram */}
                    <button
                      type="button"
                      onClick={() => {
                        if (data.socials?.instagram) {
                          const url = data.socials.instagram.startsWith("http")
                            ? data.socials.instagram
                            : `https://instagram.com/${data.socials.instagram.replace(/^@/, "")}`;
                          window.open(url, "_blank");
                        }
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition ${
                        data.socials?.instagram
                          ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-orange-500 hover:text-orange-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white cursor-pointer"
                          : "bg-slate-50/70 border-slate-200/80 text-slate-300 dark:bg-slate-800/60 dark:border-slate-700/60 dark:text-slate-600"
                      }`}
                      aria-label="Instagram"
                      title={data.socials?.instagram ? "Buka Instagram" : "Instagram belum ditautkan"}
                    >
                      <InstagramIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Student Info: Name & Prodi */}
                <div className="px-5">
                  {isSkeleton ? (
                    <div className="space-y-2 py-0.5">
                      {/* Name Skeleton Bar */}
                      <div className="h-4 w-40 rounded-md bg-slate-200 dark:bg-slate-700/80 animate-pulse my-0.5" />

                      {/* Major Skeleton Bar */}
                      <div className="h-3 w-28 rounded-md bg-slate-200/90 dark:bg-slate-700/70 animate-pulse mt-1" />

                      {/* Bio Skeleton Lines */}
                      <div className="space-y-1.5 pt-1">
                        <div className="h-2.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-700/60 animate-pulse" />
                        <div className="h-2.5 w-4/5 rounded-full bg-slate-200/80 dark:bg-slate-700/60 animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        <h3
                          className="font-bold text-[16px] leading-snug tracking-tight text-[#0f172a] dark:text-white group-hover:text-orange-500 transition line-clamp-1"
                          title={data.name}
                        >
                          {data.name}
                        </h3>
                      </div>

                      <p className="text-xs flex items-center gap-1.5 mt-1 font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
                        <span style={{ color: primaryColor }}>🎓</span> {data.major || "Sistem Informasi"}
                      </p>

                      {/* Deskripsi / Bio */}
                      <p className="text-xs mt-2.5 line-clamp-2 leading-relaxed text-slate-600 dark:text-slate-300">
                        {data.bio || "Mahasiswa kreatif STMIK Tazkia yang siap berkarya & berkolaborasi."}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* BOTTOM SECTION: PENGHARGAAN (5 HEX BADGES) + ACTION BUTTONS */}
              <div className="px-5 pb-4 pt-2 relative z-10">
                <div className="border-t pt-2.5 border-slate-100 dark:border-slate-800">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(true);
                    }}
                    className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase mb-2 cursor-pointer hover:text-orange-500 transition-colors"
                    title="Klik untuk buka Lemari Penghargaan"
                  >
                    <span className="text-slate-500 dark:text-slate-400 hover:text-orange-500">
                      PENGHARGAAN
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono">
                      {unlockedBadgeIds.length} / 16
                    </span>
                  </div>

                  {/* Row of 5 Real Hexagonal Achievement Badges */}
                  <div
                    className="flex items-center justify-between gap-1 mb-3.5 px-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {featuredBadges.map((badge, idx) => {
                      const tooltipAlign =
                        featuredBadges.length >= 4
                          ? idx <= 1
                            ? "left"
                            : idx >= featuredBadges.length - 2
                            ? "right"
                            : "center"
                          : idx === 0
                          ? "left"
                          : idx === featuredBadges.length - 1
                          ? "right"
                          : "center";

                      return (
                        <div
                          key={badge.id || idx}
                          onClick={() => {
                            handleSelectBadge(badge);
                            setIsFlipped(true);
                          }}
                          className="cursor-pointer flex items-center justify-center relative"
                        >
                          <TazkiaAchievementHexBadge
                            badge={badge}
                            size="xs"
                            locked={false}
                            animated={true}
                            tooltipAlign={tooltipAlign}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons: Hubungi & Balik Kartu */}
                  <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onContactClick) {
                          onContactClick();
                        } else if (data.contactEmail) {
                          window.location.href = `mailto:${data.contactEmail}`;
                        } else if (onProfileClick) {
                          onProfileClick();
                        }
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer hover:brightness-110"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Mail className="w-4 h-4" /> Hubungi
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(true);
                      }}
                      title="Klik untuk membalik kartu (Buka Lemari Penghargaan)"
                      className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition hover:rotate-90 cursor-pointer shadow-xs"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BACK OF CARD: PENGHARGAAN SHOWCASE INTERAKTIF ================= */}
          <div
            className={`absolute inset-0 w-full h-full rounded-[22px] [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(0)] antialiased p-[1px] bg-slate-200/90 dark:bg-slate-800 shadow-sm transition-all duration-300 ${
              isFlipped
                ? "pointer-events-auto opacity-100 visible z-20"
                : "pointer-events-none opacity-0 invisible z-0"
            }`}
          >
            <div
              className="relative w-full h-full rounded-[20px] overflow-hidden p-4 sm:p-5 flex flex-col justify-between text-white"
              style={{
                background: `linear-gradient(to bottom, ${secondaryColor}, #0E2558, #071533)`,
              }}
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  {/* Top Header: Title, Student Name & Close (X) */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span
                        className="text-[10.5px] font-bold tracking-wider uppercase block"
                        style={{ color: primaryColor }}
                      >
                        PENGHARGAAN • {unlockedBadgeIds.length} / 16
                      </span>
                      <h4 className="text-sm sm:text-[15px] font-extrabold text-white tracking-tight leading-snug mt-0.5 truncate max-w-[210px]">
                        {isSkeleton ? (
                          <span className="inline-block h-3.5 w-32 rounded bg-white/20 animate-pulse align-middle" />
                        ) : (
                          data.name
                        )}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(false);
                      }}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                      title="Kembali ke depan"
                      aria-label="Tutup"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Tabs: Umum (13) & Terbatas (3) */}
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTabChange("umum");
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition cursor-pointer ${
                        activeTab === "umum"
                          ? "text-white shadow-xs"
                          : "bg-white/10 text-slate-300 hover:bg-white/15"
                      }`}
                      style={activeTab === "umum" ? { backgroundColor: primaryColor } : undefined}
                    >
                      Umum ({PENGHARGAAN_CATALOG.filter((b) => b.group === "umum").length})
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTabChange("terbatas");
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition cursor-pointer ${
                        activeTab === "terbatas"
                          ? "text-white shadow-xs"
                          : "bg-white/10 text-slate-300 hover:bg-white/15"
                      }`}
                      style={activeTab === "terbatas" ? { backgroundColor: primaryColor } : undefined}
                    >
                      Terbatas ({PENGHARGAAN_CATALOG.filter((b) => b.group === "terbatas").length})
                    </button>
                  </div>

                  {/* Carousel of Badges with Arrow Buttons (Bounded / Mentok) */}
                  <div className="flex items-center justify-between gap-1 mb-2.5 px-0.5">
                    <button
                      type="button"
                      onClick={handlePrevBadge}
                      disabled={!canGoPrev}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition shrink-0 ${
                        canGoPrev
                          ? "bg-white/10 hover:bg-white/20 text-white cursor-pointer active:scale-90"
                          : "bg-white/5 text-white/20 cursor-not-allowed"
                      }`}
                      aria-label="Sebelumnya"
                      title={canGoPrev ? "Geser ke kiri" : "Sudah paling awal"}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex-1 flex items-center justify-center gap-2 overflow-hidden py-1">
                      {visibleCarouselBadges.map((b) => {
                        const isSelected = b.id === selectedBadge.id;
                        return (
                          <div
                            key={b.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBadgeId(b.id);
                            }}
                            className={`relative p-1 rounded-full transition-all cursor-pointer ${
                              isSelected
                                ? "ring-2 scale-110 z-10"
                                : "opacity-75 hover:opacity-100 hover:scale-105"
                            }`}
                            style={
                              isSelected
                                ? ({
                                    "--tw-ring-color": primaryColor,
                                    boxShadow: `0 0 14px ${primaryColor}99`,
                                  } as React.CSSProperties)
                                : undefined
                            }
                          >
                            <TazkiaAchievementHexBadge
                              badge={b}
                              size="xs"
                              locked={!unlockedBadgeIds.includes(b.id)}
                              animated={isSelected}
                              showTooltip={false}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleNextBadge}
                      disabled={!canGoNext}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition shrink-0 ${
                        canGoNext
                          ? "bg-white/10 hover:bg-white/20 text-white cursor-pointer active:scale-90"
                          : "bg-white/5 text-white/20 cursor-not-allowed"
                      }`}
                      aria-label="Berikutnya"
                      title={canGoNext ? "Geser ke kanan" : "Sudah paling akhir (mentok)"}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Selected Badge Detail Box */}
                  <div className="rounded-2xl border border-white/10 bg-[#08172e]/90 p-3.5 text-left">
                    {/* Title + Tier */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h5 className="font-extrabold text-white text-[14.5px] tracking-tight truncate">
                        {selectedBadge.name}
                      </h5>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider bg-amber-500/10 border-amber-500/80 text-amber-400 shrink-0">
                        {selectedBadge.group === "terbatas" ? "TERBATAS" : selectedBadge.tierLabel}
                      </span>
                    </div>

                    {/* Simbol */}
                    <p
                      className="text-[11px] font-bold mb-2 leading-snug"
                      style={{ color: primaryColor }}
                    >
                      Simbol: {selectedBadge.symbolLabel}
                    </p>

                    {/* Misi / Syarat Buka */}
                    <div className="mb-2">
                      <span
                        className="text-[8.5px] font-black uppercase tracking-wider block"
                        style={{ color: primaryColor }}
                      >
                        MISI / SYARAT BUKA
                      </span>
                      <p className="text-[11px] text-slate-200 leading-snug mt-0.5">
                        {selectedBadge.mission}
                      </p>
                    </div>

                    {/* Makna & Filosofi */}
                    <div className="mb-2">
                      <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-400 block">
                        MAKNA &amp; FILOSOFI
                      </span>
                      <p className="text-[10.5px] italic text-slate-300 leading-snug mt-0.5">
                        &ldquo;{selectedBadge.philosophy}&rdquo;
                      </p>
                    </div>

                    {/* Footer Status */}
                    <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Penghargaan Diraih</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        #{selectedBadge.id} dari 16
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Separator & Action Buttons: Balik Kartu & Lihat Profil */}
                <div className="pt-2">
                  <div className="h-px w-full bg-white/10 mb-2.5" />
                  <div className="relative z-10 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(false);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                    >
                      <RotateCw className="w-3.5 h-3.5 shrink-0" />
                      <span>Balik Kartu</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onProfileClick) onProfileClick();
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-md hover:brightness-110"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span>Lihat Profil</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardStudentCard;
