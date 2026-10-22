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
import {
  PENGHARGAAN_CATALOG,
  PenghargaanBadge,
  getBadgeMissionProgress,
} from "@/data/penghargaanCatalog";
import { TazkiaAchievementHexBadge } from "@/components/penghargaan/TazkiaAchievementBadge";

export interface StudentCardData {
  name: string;
  initials?: string;
  angkatan?: string | number;
  statusIcon?: string;
  status?: string;
  major?: string;
  projectCount?: number;
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
  projects?: any[];
  cardSkin?: string;
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
  // Visual customization slots from skin
  outerBorderClassName?: string;
  cardBodyClassName?: string;
  nameClassName?: string;
  holoOverlay?: React.ReactNode;
  watermarkElement?: React.ReactNode;
  bannerOverlay?: React.ReactNode;
  floatingPill?: React.ReactNode;
  avatarDecoration?: React.ReactNode;
  dividerClassName?: string;
  primaryButtonClassName?: string;
  secondaryButtonClassName?: string;
  backOverlay?: React.ReactNode;
  backContainerClassName?: string;
  backHeaderTitle?: React.ReactNode;
}

const DEFAULT_FEATURED_IDS = [9, 4, 7, 10, 14];
const VISIBLE_COUNT = 4;

const getArrowPosition = (index: number, total: number = 5) => {
  if (total <= 1) return "50%";
  const percent = (index / (total - 1)) * 100;
  // Offset to center pointer directly over each 32px badge slot
  const pixelOffset = 18 - (36 * index) / (total - 1);
  if (Math.abs(pixelOffset) < 0.01) {
    return `${percent}%`;
  }
  if (pixelOffset > 0) {
    return `calc(${percent}% + ${pixelOffset.toFixed(1)}px)`;
  }
  return `calc(${percent}% - ${Math.abs(pixelOffset).toFixed(1)}px)`;
};

const getBadgeTierTagStyle = (badge: PenghargaanBadge) => {
  const isSpecial = badge.tier === "khusus" || badge.group === "terbatas";
  const isGold = badge.tier === "emas";
  const isSilver = badge.tier === "perak";

  if (isSpecial) {
    return "bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-red-500/20 text-orange-300 border-orange-400/80 shadow-[0_0_10px_rgba(249,115,22,0.3)]";
  }
  if (isGold) {
    return "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-400/80 shadow-[0_0_10px_rgba(245,158,11,0.3)]";
  }
  if (isSilver) {
    return "bg-sky-500/20 text-sky-300 border-sky-400/80 shadow-[0_0_10px_rgba(56,189,248,0.25)]";
  }
  return "bg-amber-900/30 text-amber-300 border-amber-600/80";
};

export const StandardStudentCard: React.FC<StandardStudentCardProps> = ({
  data = {
    name: "Anisa Aulia",
    initials: "A",
    angkatan: "ANGKATAN 2",
    statusIcon: "🚀",
    status: "Open for Collab",
    major: "Sistem Informasi",
    skills: [],
    bio: undefined,
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
  outerBorderClassName,
  cardBodyClassName,
  nameClassName,
  holoOverlay,
  watermarkElement,
  bannerOverlay,
  floatingPill,
  avatarDecoration,
  dividerClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  backOverlay,
  backContainerClassName,
  backHeaderTitle,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState<"umum" | "terbatas">("umum");
  const [selectedBadgeId, setSelectedBadgeId] = useState<number>(1);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [hoveredBadgeIdx, setHoveredBadgeIdx] = useState<number | null>(null);

  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Unlocked badges (defaults to student's unlocked badges or empty if isSkeleton)
  const unlockedBadgeIds = useMemo(() => {
    if (isSkeleton) return [];
    if (data.unlockedBadgeIds !== undefined) {
      return data.unlockedBadgeIds;
    }
    return data.featuredBadgeIds || [];
  }, [data.unlockedBadgeIds, data.featuredBadgeIds, isSkeleton]);

  // Featured 5 badges shown on the front of the card (empty if isSkeleton)
  const featuredBadges: PenghargaanBadge[] = useMemo(() => {
    if (isSkeleton) return [];
    const ids =
      data.featuredBadgeIds !== undefined
        ? data.featuredBadgeIds
        : unlockedBadgeIds.slice(0, 5);
    return ids
      .map((id) => PENGHARGAAN_CATALOG.find((b) => b.id === id))
      .filter((b): b is PenghargaanBadge => Boolean(b))
      .slice(0, 5);
  }, [data.featuredBadgeIds, unlockedBadgeIds, isSkeleton]);

  const hoveredBadge =
    hoveredBadgeIdx !== null && featuredBadges[hoveredBadgeIdx]
      ? featuredBadges[hoveredBadgeIdx]
      : null;

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

    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`,
      transition: "transform 80ms ease-out",
    });

    setGlareStyle({
      opacity: 1,
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.08), transparent 60%)`,
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
        ...tiltStyle,
      }}
      className="relative w-full max-w-[338px] mx-auto select-none subpixel-antialiased will-change-transform"
    >
      {/* 3D Flip Container */}
      <div className="relative h-[480px] w-full [perspective:1200px]">
        <div
          className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* ================= FRONT OF CARD ================= */}
          <div
            onClick={!isFlipped ? onProfileClick : undefined}
            className={`absolute inset-0 w-full h-full rounded-[22px] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] subpixel-antialiased ${
              outerBorderClassName || "p-[1px] bg-slate-200/90 dark:bg-slate-800"
            } shadow-sm hover:shadow-md transition-shadow duration-300 ${
              isFlipped ? "pointer-events-none" : "pointer-events-auto"
            } ${onProfileClick && !isFlipped ? "cursor-pointer" : ""}`}
          >
            <div className={`relative w-full h-full rounded-[20px] overflow-hidden flex flex-col justify-between ${cardBodyClassName || "bg-white dark:bg-[#0b1325] text-slate-800 dark:text-slate-100"}`}>
              {/* Dynamic Mouse Glare - Smooth gradient without mix-blend-mode to preserve text sharpness */}
              <div
                className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-[20px]"
                style={glareStyle}
              />

              {/* Holographic foil overlay */}
              {holoOverlay}

              {/* Watermark Slot (e.g. 2026 watermark) */}
              {watermarkElement}

              {/* TOP SECTION: BANNER + AVATAR + INFO */}
              <div>
                {/* Header Banner - Biru Navy Asli STMIK Tazkia (Seamless, Tanpa Garis Potongan) */}
                <div
                  className="relative h-[110px] w-full overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${secondaryColor} 0%, #0E2558 50%, #16347A 100%)`,
                  }}
                >
                  {/* Smooth Ambient Light or Custom Banner Overlay */}
                  {bannerOverlay || (
                    <>
                      <div
                        className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
                        style={{
                          background: "radial-gradient(circle, rgba(56,189,248,0.22) 0%, transparent 70%)",
                        }}
                      />
                      <div
                        className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full pointer-events-none"
                        style={{
                          background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
                        }}
                      />
                    </>
                  )}

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
                        className={`text-[11px] font-bold tracking-wide px-3 py-1 rounded-full bg-[#1b3252]/85 text-slate-200 border border-white/15 backdrop-blur-md shadow-xs shrink-0 ${
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
                      (() => {
                        const statusStr = data.status || "Open for Collab";
                        const emojiMatch = statusStr.match(/^(\p{Emoji}|\p{Extended_Pictographic})/u);
                        const iconToDisplay = (data.statusIcon && data.statusIcon !== "🟠")
                          ? data.statusIcon
                          : (emojiMatch ? emojiMatch[0] : null);
                        const textToDisplay = statusStr.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s]+/u, "").trim() || statusStr;

                        return (
                          <span
                            onClick={(e) => {
                              if (onFilterStatus && data.status) {
                                e.stopPropagation();
                                onFilterStatus(data.status);
                              }
                            }}
                            className={`text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 bg-[#1b3252]/85 text-slate-100 border border-white/15 backdrop-blur-md shadow-xs max-w-[60%] min-w-0 ${
                              onFilterStatus ? "hover:border-orange-400 cursor-pointer transition" : ""
                            }`}
                          >
                            {iconToDisplay ? (
                              <span className="shrink-0 text-[12px] leading-none">{iconToDisplay}</span>
                            ) : (
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{
                                  backgroundColor: primaryColor,
                                  boxShadow: `0 0 6px ${primaryColor}`,
                                }}
                              />
                            )}
                            <span className="truncate">{textToDisplay}</span>
                          </span>
                        );
                      })()
                    )}
                  </div>
                </div>

                {/* Horizontal Divider Line */}
                <div className="relative">
                  <div
                    className={dividerClassName || "h-[3px] w-full"}
                    style={dividerClassName ? undefined : { backgroundColor: primaryColor }}
                  />
                  {floatingPill}
                </div>

                {/* Avatar & Social Row */}
                <div className="px-5 relative flex justify-between items-end -mt-10 mb-3">
                  {/* Avatar with Glow Ring */}
                  <div className="relative">
                    {avatarDecoration}
                    <div
                      className="relative w-[72px] h-[72px] rounded-full overflow-hidden border-[3px] border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all"
                      style={{
                        outline: `3px solid ${primaryColor}`,
                        outlineOffset: "1px",
                        boxShadow: `0 0 18px ${primaryColor}66`,
                      }}
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
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-200 ${
                        data.socials?.website
                          ? "bg-sky-500/20 border-sky-400/50 text-sky-400 hover:bg-sky-500/35 hover:border-sky-300 hover:scale-110 shadow-[0_0_10px_rgba(56,189,248,0.35)] cursor-pointer"
                          : "bg-slate-500/10 border-slate-500/20 text-slate-400/40 dark:bg-slate-800/40 dark:border-slate-700/50 dark:text-slate-600"
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
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-200 ${
                        data.socials?.github
                          ? "bg-white/20 border-white/50 text-white hover:bg-white/30 hover:border-white hover:scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)] cursor-pointer"
                          : "bg-slate-500/10 border-slate-500/20 text-slate-400/40 dark:bg-slate-800/40 dark:border-slate-700/50 dark:text-slate-600"
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
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-200 ${
                        data.socials?.linkedin
                          ? "bg-blue-500/20 border-blue-400/50 text-blue-400 hover:bg-blue-500/35 hover:border-blue-300 hover:scale-110 shadow-[0_0_10px_rgba(59,130,246,0.35)] cursor-pointer"
                          : "bg-slate-500/10 border-slate-500/20 text-slate-400/40 dark:bg-slate-800/40 dark:border-slate-700/50 dark:text-slate-600"
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
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-200 ${
                        data.socials?.instagram
                          ? "bg-pink-500/20 border-pink-400/50 text-pink-400 hover:bg-pink-500/35 hover:border-pink-300 hover:scale-110 shadow-[0_0_10px_rgba(244,63,94,0.35)] cursor-pointer"
                          : "bg-slate-500/10 border-slate-500/20 text-slate-400/40 dark:bg-slate-800/40 dark:border-slate-700/50 dark:text-slate-600"
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
                        <div className="h-2.5 w-5/6 rounded-full bg-slate-200/80 dark:bg-slate-700/60 animate-pulse" />
                      </div>

                      {/* Skills Skeleton */}
                      <div className="flex items-center gap-1.5 pt-2">
                        <div className="h-4 w-16 rounded-full bg-slate-200/80 dark:bg-slate-700/60 animate-pulse" />
                        <div className="h-4 w-20 rounded-full bg-slate-200/80 dark:bg-slate-700/60 animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        <h3
                          className={nameClassName || "font-bold text-[16px] leading-snug tracking-tight text-[#0f172a] dark:text-white group-hover:text-orange-500 transition line-clamp-1"}
                          title={data.name}
                        >
                          {data.name}
                        </h3>
                      </div>

                      <p className="text-xs flex items-center gap-1.5 mt-1 font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
                        <span style={{ color: primaryColor }}>🎓</span>
                        <span>{data.major || "—"}</span>
                      </p>

                      {/* Deskripsi / Bio */}
                      {data.bio ? (
                        <p
                          className="text-xs mt-2 line-clamp-3 leading-relaxed text-slate-600 dark:text-slate-300"
                          title={data.bio}
                        >
                          {data.bio}
                        </p>
                      ) : (
                        <p className="text-xs mt-2 italic text-slate-400 dark:text-slate-500 line-clamp-2">
                          Belum mengisi bio.
                        </p>
                      )}

                      {/* Keahlian & Minat (Skill Pills) */}
                      {data.skills && data.skills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          {data.skills.slice(0, 3).map((skill, idx) => {
                            // Warna pill bergilir sesuai primaryColor (aksen skin)
                            const pillColors = [
                              { bg: `${primaryColor}18`, border: `${primaryColor}55`, text: primaryColor },
                              { bg: "rgba(56,189,248,0.10)", border: "rgba(56,189,248,0.40)", text: "#0ea5e9" },
                              { bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.35)", text: "#a855f7" },
                            ];
                            const c = pillColors[idx % pillColors.length];
                            return (
                              <span
                                key={idx}
                                onClick={(e) => {
                                  if (onFilterSkill) {
                                    e.stopPropagation();
                                    onFilterSkill(skill);
                                  }
                                }}
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                                  onFilterSkill
                                    ? "cursor-pointer hover:brightness-110 active:scale-95"
                                    : ""
                                }`}
                                style={{
                                  backgroundColor: c.bg,
                                  borderColor: c.border,
                                  color: c.text,
                                }}
                              >
                                {skill}
                              </span>
                            );
                          })}
                          {data.skills.length > 3 && (
                            <span className="text-[9.5px] font-medium text-slate-400 dark:text-slate-500">
                              +{data.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
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
                      setHoveredBadgeIdx(null);
                    }}
                    className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase mb-2 cursor-pointer hover:text-orange-500 transition-colors group/penghargaan"
                    title="Klik untuk buka Lemari Penghargaan"
                  >
                    <span className="text-slate-500 dark:text-slate-400 group-hover/penghargaan:text-orange-500 transition-colors">
                      PENGHARGAAN
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono">
                      {isSkeleton ? "0 / 16" : `${unlockedBadgeIds.length} / 16`}
                    </span>
                  </div>

                  {/* Row of 5 Real Hexagonal Achievement Badges */}
                  <div
                    className="relative mb-3.5"
                    onMouseLeave={() => setHoveredBadgeIdx(null)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Floating Unified Tooltip - 100% Responsive, Guaranteed Inside Card Bounds */}
                    {!isFlipped && hoveredBadge && hoveredBadgeIdx !== null && (() => {
                      const hoveredProgress = getBadgeMissionProgress(hoveredBadge.id, {
                        projects: data.projects || [],
                        angkatan: data.angkatan,
                        skills: data.skills,
                        bio: data.bio,
                        statusBadge: data.status,
                        cardSkin: data.cardSkin,
                        unlockedBadgeIds,
                      });

                      return (
                        <div
                          className="pointer-events-none absolute bottom-full mb-2 left-0 right-0 w-full p-2.5 rounded-xl bg-slate-950/95 text-white shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-slate-700/80 backdrop-blur-md text-left select-none z-[80] animate-in fade-in duration-150"
                        >
                          {/* Header Tag */}
                          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1 mb-1.5">
                            <span
                              className={`px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider rounded border ${getBadgeTierTagStyle(
                                hoveredBadge
                              )}`}
                            >
                              {hoveredBadge.group === "terbatas" ? "TERBATAS" : hoveredBadge.tierLabel}
                            </span>
                            {hoveredProgress.isUnlocked ? (
                              <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-emerald-400">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                <span>Diraih</span>
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                                Terkunci
                              </span>
                            )}
                          </div>

                          {/* Badge Name */}
                          <h4 className="text-xs font-bold text-white tracking-tight leading-snug mb-0.5">
                            {hoveredBadge.name}
                          </h4>

                          {/* Symbol */}
                          {hoveredBadge.symbolLabel && (
                            <p className="text-[10px] font-semibold text-amber-400 mb-1 leading-tight">
                              Simbol: {hoveredBadge.symbolLabel}
                            </p>
                          )}

                          {/* Mission Requirement */}
                          <p className="text-[10px] text-slate-300 leading-relaxed font-sans mb-1.5">
                            {hoveredProgress.requirementText}
                          </p>

                          {/* Click hint footer */}
                          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[8.5px] text-slate-400 font-medium">
                            <span
                              className={`font-semibold flex items-center gap-1 ${
                                hoveredProgress.isUnlocked ? "text-emerald-400" : "text-slate-400"
                              }`}
                            >
                              {hoveredProgress.isUnlocked ? "✓ Misi Selesai" : "🔒 Belum Diraih"}
                            </span>
                            <span className="text-slate-400">Klik rincian &rarr;</span>
                          </div>

                          {/* Pointer Arrow pointing to hovered badge */}
                          <div
                            className="absolute -bottom-1 w-2 h-2 bg-slate-950 rotate-45 border-r border-b border-slate-700/80 -translate-x-1/2"
                            style={{
                              left: getArrowPosition(hoveredBadgeIdx, 5),
                            }}
                          />
                        </div>
                      );
                    })()}

                    <div className="flex items-center justify-between gap-1 px-0.5">
                      {featuredBadges.length > 0 ? (
                        <>
                          {featuredBadges.map((badge, idx) => {
                            const isBadgeUnlocked = unlockedBadgeIds.includes(badge.id);
                            return (
                              <div
                                key={badge.id || idx}
                                onMouseEnter={() => setHoveredBadgeIdx(idx)}
                                onClick={() => {
                                  handleSelectBadge(badge);
                                  setIsFlipped(true);
                                  setHoveredBadgeIdx(null);
                                }}
                                className="cursor-pointer flex items-center justify-center relative transition-transform hover:scale-105"
                              >
                                <TazkiaAchievementHexBadge
                                  badge={badge}
                                  size="xs"
                                  locked={!isBadgeUnlocked}
                                  animated={isBadgeUnlocked}
                                  showTooltip={false}
                                />
                              </div>
                            );
                          })}
                          {Array.from({ length: Math.max(0, 5 - featuredBadges.length) }).map((_, i) => (
                            <div
                              key={`empty-${i}`}
                              className="w-8 h-9 rounded-md border border-dashed border-slate-300 dark:border-slate-700/80 bg-slate-100/50 dark:bg-slate-800/40 flex items-center justify-center text-xs text-slate-300 dark:text-slate-600 select-none font-mono"
                              title="Slot Penghargaan Kosong"
                            >
                              +
                            </div>
                          ))}
                        </>
                      ) : (
                        [0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-8 h-9 rounded-md border border-dashed border-slate-300 dark:border-slate-700/80 bg-slate-100/50 dark:bg-slate-800/40 flex items-center justify-center text-xs text-slate-300 dark:text-slate-600 select-none font-mono"
                            title="Slot Penghargaan Kosong"
                          >
                            +
                          </div>
                        ))
                      )}
                    </div>
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
                      className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer hover:brightness-110 ${
                        primaryButtonClassName || ""
                      }`}
                      style={primaryButtonClassName ? undefined : { backgroundColor: primaryColor }}
                    >
                      <Mail className="w-4 h-4" /> Hubungi
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(true);
                        setHoveredBadgeIdx(null);
                      }}
                      title="Klik untuk membalik kartu (Buka Lemari Penghargaan)"
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition hover:rotate-90 cursor-pointer shadow-xs ${
                        secondaryButtonClassName || "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
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
            className={`absolute inset-0 w-full h-full rounded-[22px] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)] subpixel-antialiased ${
              outerBorderClassName || "p-[1px] bg-slate-200/90 dark:bg-slate-800"
            } shadow-sm transition-shadow duration-300 ${
              isFlipped ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            <div
              className={`relative w-full h-full rounded-[20px] overflow-hidden p-3.5 sm:p-4 flex flex-col justify-between text-white ${
                backContainerClassName || ""
              }`}
              style={
                backContainerClassName
                  ? undefined
                  : {
                      background: `linear-gradient(160deg, ${secondaryColor} 0%, #061126 50%, #030814 100%)`,
                    }
              }
            >
              {/* Holo Foil on back */}
              {holoOverlay}

              {/* Dynamic ambient background glow */}
              <div
                className="absolute -top-14 -right-14 w-44 h-44 rounded-full pointer-events-none opacity-20 blur-2xl"
                style={{
                  background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
                }}
              />
              <div
                className="absolute -bottom-14 -left-14 w-40 h-40 rounded-full pointer-events-none opacity-15 blur-2xl"
                style={{
                  background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
                }}
              />
              {/* Subtle ambient micro-mesh */}
              <div
                className="absolute inset-0 opacity-[0.035] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
                  backgroundSize: "14px 14px",
                }}
              />
              {backOverlay}

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  {/* Top Header: Title, Student Name & Close (X) */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
                          style={{
                            backgroundColor: primaryColor,
                            boxShadow: `0 0 8px ${primaryColor}`,
                          }}
                        />
                        <span
                          className="text-[10px] font-black tracking-wider uppercase"
                          style={{ color: primaryColor }}
                        >
                          {backHeaderTitle || "LEMARI PENGHARGAAN"}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-white/10 text-slate-200 border border-white/10 shrink-0">
                          {unlockedBadgeIds.length}/16
                        </span>
                      </div>
                      <h4 className={`text-[13.5px] sm:text-[14.5px] font-extrabold tracking-tight leading-snug truncate ${nameClassName || "text-white"}`}>
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
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-90 shrink-0"
                      title="Kembali ke depan"
                      aria-label="Tutup"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Tabs: Umum (13) & Terbatas (3) - Sleek Segmented Capsule */}
                  {(() => {
                    const umumUnlockedCount = PENGHARGAAN_CATALOG.filter(
                      (b) => b.group === "umum" && unlockedBadgeIds.includes(b.id)
                    ).length;
                    const terbatasUnlockedCount = PENGHARGAAN_CATALOG.filter(
                      (b) => b.group === "terbatas" && unlockedBadgeIds.includes(b.id)
                    ).length;

                    return (
                      <div className="p-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-1 mb-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTabChange("umum");
                          }}
                          className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            activeTab === "umum"
                              ? "text-white shadow-md font-extrabold"
                              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                          }`}
                          style={
                            activeTab === "umum"
                              ? {
                                  backgroundColor: primaryColor,
                                  boxShadow: `0 2px 10px -2px ${primaryColor}88`,
                                }
                              : undefined
                          }
                        >
                          <span>Umum</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[8.5px] font-mono font-bold ${
                              activeTab === "umum"
                                ? "bg-black/30 text-white"
                                : "bg-white/10 text-slate-400"
                            }`}
                          >
                            {umumUnlockedCount}/{PENGHARGAAN_CATALOG.filter((b) => b.group === "umum").length}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTabChange("terbatas");
                          }}
                          className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            activeTab === "terbatas"
                              ? "text-white shadow-md font-extrabold"
                              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                          }`}
                          style={
                            activeTab === "terbatas"
                              ? {
                                  backgroundColor: primaryColor,
                                  boxShadow: `0 2px 10px -2px ${primaryColor}88`,
                                }
                              : undefined
                          }
                        >
                          <span>Terbatas</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[8.5px] font-mono font-bold ${
                              activeTab === "terbatas"
                                ? "bg-black/30 text-white"
                                : "bg-white/10 text-slate-400"
                            }`}
                          >
                            {terbatasUnlockedCount}/{PENGHARGAAN_CATALOG.filter((b) => b.group === "terbatas").length}
                          </span>
                        </button>
                      </div>
                    );
                  })()}

                  {/* Carousel of Badges with Glass Arrow Buttons */}
                  <div className="flex items-center justify-between gap-1 mb-2 px-0.5">
                    <button
                      type="button"
                      onClick={handlePrevBadge}
                      disabled={!canGoPrev}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition shrink-0 ${
                        canGoPrev
                          ? "bg-white/10 hover:bg-white/20 border border-white/15 text-white cursor-pointer active:scale-90"
                          : "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                      }`}
                      aria-label="Sebelumnya"
                      title={canGoPrev ? "Geser ke kiri" : "Sudah paling awal"}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex-1 flex items-center justify-center gap-2 py-1 relative">
                      {visibleCarouselBadges.map((b) => {
                        const isSelected = b.id === selectedBadge.id;
                        const isUnlocked = unlockedBadgeIds.includes(b.id);
                        return (
                          <div
                            key={b.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBadgeId(b.id);
                            }}
                            className={`relative p-0.5 rounded-xl transition-all cursor-pointer ${
                              isSelected
                                ? "scale-110 z-10"
                                : "opacity-75 hover:opacity-100 hover:scale-105"
                            }`}
                          >
                            {isSelected && (
                              <div
                                className="absolute -inset-1 rounded-xl blur-xs pointer-events-none"
                                style={{
                                  backgroundColor: `${primaryColor}40`,
                                  border: `1.5px solid ${primaryColor}`,
                                }}
                              />
                            )}
                            <TazkiaAchievementHexBadge
                              badge={b}
                              size="xs"
                              locked={!isUnlocked}
                              animated={isUnlocked}
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
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition shrink-0 ${
                        canGoNext
                          ? "bg-white/10 hover:bg-white/20 border border-white/15 text-white cursor-pointer active:scale-90"
                          : "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                      }`}
                      aria-label="Berikutnya"
                      title={canGoNext ? "Geser ke kanan" : "Sudah paling akhir (mentok)"}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Selected Badge Detail Box with Upgraded Glass Aesthetics */}
                  {(() => {
                    const isSelectedUnlocked = unlockedBadgeIds.includes(selectedBadge.id);
                    const selectedProgress = getBadgeMissionProgress(selectedBadge.id, {
                      projects: data.projects || [],
                      angkatan: data.angkatan,
                      skills: data.skills,
                      bio: data.bio,
                      statusBadge: data.status,
                      cardSkin: data.cardSkin,
                      unlockedBadgeIds,
                    });

                    return (
                      <div
                        className={`rounded-2xl border p-2.5 sm:p-3 text-left transition-all ${
                          isSelectedUnlocked
                            ? "border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 via-slate-950/80 to-slate-950/90 ring-1 ring-emerald-500/30 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.22)]"
                            : "border-white/15 bg-gradient-to-b from-slate-900/80 via-slate-950/85 to-slate-950/95 ring-1 ring-white/5 shadow-md"
                        }`}
                      >
                        {/* Title + Status Tag */}
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h5 className="font-extrabold text-white text-[13.5px] tracking-tight truncate">
                            {selectedBadge.name}
                          </h5>
                          {isSelectedUnlocked ? (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 flex items-center gap-1 shrink-0 shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                              <span>DIRAIH</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider bg-slate-500/20 border-slate-500/40 text-slate-300 shrink-0">
                              🔒 TERKUNCI
                            </span>
                          )}
                        </div>

                        {/* Simbol Row */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 border border-white/10"
                            style={{ color: primaryColor }}
                          >
                            Simbol: {selectedBadge.symbolLabel}
                          </span>
                        </div>

                        {/* Misi / Syarat Buka Box */}
                        <div className="mb-1.5 p-2 rounded-xl bg-white/[0.04] border border-white/10">
                          <span
                            className="text-[8.5px] font-black uppercase tracking-wider block"
                            style={{ color: primaryColor }}
                          >
                            MISI / SYARAT BUKA
                          </span>
                          <p className="text-[10.5px] text-slate-200 leading-snug mt-0.5">
                            {selectedProgress.requirementText}
                          </p>
                        </div>

                        {/* Makna & Filosofi */}
                        <div className="mb-1.5 pl-2 py-0.5 border-l-2 border-amber-400/50 bg-black/20 rounded-r-lg">
                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">
                            MAKNA &amp; FILOSOFI
                          </span>
                          <p className="text-[10px] italic text-slate-300 leading-relaxed mt-0.5 line-clamp-2">
                            &ldquo;{selectedBadge.philosophy}&rdquo;
                          </p>
                        </div>

                        {/* Footer Status */}
                        <div className="pt-1.5 border-t border-white/10 flex items-center justify-between">
                          {isSkeleton || !isSelectedUnlocked ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                              <span>{isSkeleton ? "Mode Preview" : "Belum Diraih (Penuhi Misi di Atas)"}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Misi Selesai • Diraih</span>
                            </span>
                          )}
                          <span className="text-[9.5px] font-mono text-slate-400">
                            #{selectedBadge.id} dari 16
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Bottom Action Buttons: Balik Kartu & Lihat Profil */}
                <div className="pt-2">
                  <div className="h-px w-full bg-white/10 mb-2" />
                  <div className="relative z-10 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(false);
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs ${
                        secondaryButtonClassName || "border-white/20 bg-white/10 hover:bg-white/20 text-white"
                      }`}
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
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-md hover:brightness-110 ${
                        primaryButtonClassName || "text-white"
                      }`}
                      style={
                        primaryButtonClassName
                          ? undefined
                          : {
                              backgroundColor: primaryColor,
                              boxShadow: `0 4px 14px -2px ${primaryColor}77`,
                            }
                      }
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
