"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Karya, MahasiswaProfile } from "@/types/karya";
import {
  ArrowRight,
  Heart,
  Eye,
  LayoutGrid,
  Users,
  MessageSquare,
  Sparkles,
  ExternalLink,
  UploadCloud,
  RotateCcw,
  ShieldCheck,
  Rocket,
  GraduationCap,
  BadgeCheck,
} from "lucide-react";
import { formatNumber, toggleKaryaLike, getLikedKaryaIds } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/utils/identity";
import { FloatingHeroCards } from "./FloatingHeroCards";
import { ProjectCoverPlaceholder } from "@/components/ui/ProjectCoverPlaceholder";
import { CuratorMedalBadge } from "./CuratorMedalBadge";

interface HomePageClientProps {
  featuredKarya: Karya[];
  totalKarya: number;
  totalMahasiswa: number;
  sampleProfiles?: MahasiswaProfile[];
}

export default function HomePageClient({
  featuredKarya,
  totalKarya,
  totalMahasiswa,
  sampleProfiles = [],
}: HomePageClientProps) {
  const router = useRouter();
  const [karyaList, setKaryaList] = useState<Karya[]>(featuredKarya);
  const [likedKarya, setLikedKarya] = useState<Record<string, boolean>>({});
  const [isLiking, setIsLiking] = useState<Record<string, boolean>>({});
  const [animToggle, setAnimToggle] = useState<boolean>(false);
  const [animKey, setAnimKey] = useState<number>(0);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);

  const handleReplayAnim = () => {
    setIsReplaying(true);
    setAnimKey((prev) => prev + 1);
    setAnimToggle((prev) => !prev);
    setTimeout(() => setIsReplaying(false), 700);
  };

  useEffect(() => {
    setKaryaList(featuredKarya);
  }, [featuredKarya]);

  // Sync likes with localStorage and database
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialLiked: Record<string, boolean> = {};
    featuredKarya.forEach((k) => {
      if (localStorage.getItem(`liked_${k.id}`) === "true") {
        initialLiked[k.id] = true;
      }
    });
    setLikedKarya(initialLiked);

    const syncLikes = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;
        const deviceId = getDeviceId();

        const ids = await getLikedKaryaIds(deviceId, userId);
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
        // Safe catch
      }
    };
    syncLikes();
  }, [featuredKarya]);

  const toggleLike = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLiking[id]) return;
    setIsLiking((prev) => ({ ...prev, [id]: true }));

    const wasLiked = !!likedKarya[id];
    const newLiked = !wasLiked;

    setLikedKarya((prev) => ({ ...prev, [id]: newLiked }));
    setKaryaList((prev) =>
      prev.map((k) =>
        k.id === id
          ? { ...k, likes: Math.max(0, (k.likes ?? 0) + (newLiked ? 1 : -1)) }
          : k
      )
    );

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      const deviceId = getDeviceId();

      const actionToTake = newLiked ? "like" : "unlike";
      const isNowLiked = await toggleKaryaLike(id, deviceId, userId, actionToTake);

      setLikedKarya((prev) => ({ ...prev, [id]: isNowLiked }));
      if (isNowLiked === wasLiked) {
        setKaryaList((prev) =>
          prev.map((k) =>
            k.id === id
              ? { ...k, likes: Math.max(0, (k.likes ?? 0) + (wasLiked ? 1 : -1)) }
              : k
          )
        );
      }

      if (isNowLiked) {
        localStorage.setItem(`liked_${id}`, "true");
      } else {
        localStorage.removeItem(`liked_${id}`);
      }
    } catch (err) {
      console.error(err);
      setLikedKarya((prev) => ({ ...prev, [id]: wasLiked }));
      setKaryaList((prev) =>
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

  const getTag = (category: string) => {
    if (category === "Technology") return "WEBSITE";
    if (category === "Programming") return "MOBILE";
    if (category === "Multimedia") return "DESAIN";
    if (category === "IoT") return "IOT";
    if (category === "Research") return "RISET / JURNAL";
    return category?.toUpperCase() || "WEBSITE";
  };

  const getTagColor = (category: string) => {
    if (category === "Technology") return "text-[#FF8A2B]";
    if (category === "Programming") return "text-[#60A5FA]";
    if (category === "Multimedia") return "text-[#FB923C]";
    if (category === "IoT") return "text-[#38BDF8]";
    if (category === "Research") return "text-[#A78BFA]";
    return "text-[#FF8A2B]";
  };

  // Curated 3 best works for curator showcase
  const top3Karya = useMemo(() => {
    if (!karyaList || karyaList.length === 0) return [];
    return [...karyaList]
      .sort((a, b) => {
        const scoreA = (a.likes || 0) * 3 + (a.views || 0);
        const scoreB = (b.likes || 0) * 3 + (b.views || 0);
        return scoreB - scoreA;
      })
      .slice(0, 3);
  }, [karyaList]);

  // Olympic podium arrangement: 2 (Silver), 1 (Gold, Champion), 3 (Bronze)
  const podium = useMemo(() => {
    if (top3Karya.length === 0) return [];
    const r1 = top3Karya[0];
    const r2 = top3Karya[1] || top3Karya[0];
    const r3 = top3Karya[2] || top3Karya[1] || top3Karya[0];

    return [
      {
        karya: r2,
        rank: 2 as const,
        coverClass: "h-[105px] xs:h-[125px] sm:h-[160px] md:h-[190px]",
        orderClass: "order-1",
        borderClass: "border-slate-200 dark:border-[#22304A] shadow-xs sm:shadow-md dark:shadow-none",
      },
      {
        karya: r1,
        rank: 1 as const,
        coverClass: "h-[125px] xs:h-[145px] sm:h-[190px] md:h-[230px]",
        orderClass: "order-2",
        borderClass: "border-[#FF8A2B] shadow-md sm:shadow-xl shadow-orange-500/20 ring-1 sm:ring-2 ring-[#FF8A2B]/40",
      },
      {
        karya: r3,
        rank: 3 as const,
        coverClass: "h-[105px] xs:h-[125px] sm:h-[140px] md:h-[160px]",
        orderClass: "order-3",
        borderClass: "border-slate-200 dark:border-[#22304A] shadow-xs sm:shadow-md dark:shadow-none",
      },
    ];
  }, [top3Karya]);

  const heroStats = useMemo(
    () => [
      {
        id: "karya",
        tag: "SHOWCASE",
        value: totalKarya > 0 ? `${totalKarya}+` : "12+",
        label: "Karya Terpublikasi",
        icon: Rocket,
        iconBg: "bg-gradient-to-br from-[#FF8A2B] to-[#EA580C] text-white shadow-md shadow-orange-500/35 ring-2 ring-orange-500/20",
        tagColor: "text-[#EA580C] dark:text-[#FF8A2B] bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20",
        cardBg: "bg-gradient-to-br from-orange-50/80 via-white to-white dark:from-[#112248] dark:via-[#0E1D3F] dark:to-[#0B1F4A]",
        borderColor: "border-orange-200/90 dark:border-orange-500/30",
        valueColor: "text-slate-900 dark:text-white",
      },
      {
        id: "mahasiswa",
        tag: "TALENTA",
        value: totalMahasiswa > 0 ? `${totalMahasiswa}+` : "24+",
        label: "Mahasiswa Terdaftar",
        icon: GraduationCap,
        iconBg: "bg-gradient-to-br from-[#1E3A8A] to-[#0F224A] dark:from-[#2563EB] dark:to-[#1D4ED8] text-white shadow-md shadow-blue-900/35 ring-2 ring-blue-500/20",
        tagColor: "text-[#1E3A8A] dark:text-[#60A5FA] bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20",
        cardBg: "bg-gradient-to-br from-blue-50/80 via-white to-white dark:from-[#0E2044] dark:via-[#0E1D3F] dark:to-[#0B1F4A]",
        borderColor: "border-blue-200/90 dark:border-blue-500/30",
        valueColor: "text-slate-900 dark:text-white",
      },
      {
        id: "verified",
        tag: "KURASI BEM",
        value: "100%",
        label: "Karya Terverifikasi",
        icon: BadgeCheck,
        iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/35 ring-2 ring-emerald-500/20",
        tagColor: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20",
        cardBg: "bg-gradient-to-br from-emerald-50/80 via-white to-white dark:from-[#0B252C] dark:via-[#0E1D3F] dark:to-[#0B1F4A]",
        borderColor: "border-emerald-200/90 dark:border-emerald-500/30",
        valueColor: "text-emerald-600 dark:text-emerald-400",
      },
    ],
    [totalKarya, totalMahasiswa]
  );

  const marqueeStats = useMemo(
    () => [...heroStats, ...heroStats, ...heroStats, ...heroStats],
    [heroStats]
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1F4A] text-slate-900 dark:text-[#F2F5FA] font-sans box-border selection:bg-[#FF8A2B] selection:text-white dark:selection:text-[#0B1F4A] transition-colors overflow-x-hidden">
      {/* ── 1. HERO SECTION (Refined Navy & Orange Brand Identity) ── */}
      <section
        id="top"
        className="max-w-[1200px] mx-auto pt-8 pb-10 sm:pt-16 sm:pb-16 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10 lg:gap-14"
      >
        {/* Left Column */}
        <div className="flex-1 min-w-0 w-full text-center lg:text-left">
          {/* Heading */}
          <h1 className="font-heading font-extrabold text-[28px] xs:text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] leading-[1.15] sm:leading-[1.12] tracking-[-0.02em] text-slate-900 dark:text-[#F2F5FA] mb-4 sm:mb-5">
            Galeri Karya &amp; Portofolio <br className="hidden sm:inline" />
            <span className="text-[#FF8A2B]">Mahasiswa STMIK Tazkia</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600 dark:text-[#94A9C9] mb-7 sm:mb-8 max-w-[520px] mx-auto lg:mx-0">
            Dokumentasi dan pameran karya mahasiswa STMIK Tazkia — mulai dari website, aplikasi mobile, sistem IoT, riset / jurnal, hingga desain &amp; lainnya.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-3.5 mb-8 sm:mb-10 w-full sm:w-auto">
            <a
              href="#terbaik"
              className="kt-btn inline-flex items-center justify-center gap-2.5 min-h-[48px] sm:min-h-[50px] px-6 sm:px-7 rounded-xl bg-[#FF8A2B] text-white dark:text-[#0B1F4A] font-bold text-sm sm:text-base hover:bg-[#ea580c] shadow-lg shadow-orange-500/25 active:translate-y-0 w-full sm:w-auto text-center"
            >
              <span>Lihat Karya Pilihan</span>
              <ArrowRight className="w-4 h-4 stroke-[2.4]" />
            </a>

            <Link
              href="/explore"
              className="kt-btn inline-flex items-center justify-center gap-2.5 min-h-[48px] sm:min-h-[50px] px-6 rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] text-white border border-[#1E3A8A] dark:bg-[#0E1D3F] dark:border-[#204285] dark:text-[#E0EAFF] dark:hover:bg-[#132854] font-semibold text-sm sm:text-base active:translate-y-0 shadow-md shadow-blue-900/20 dark:shadow-sm group w-full sm:w-auto text-center"
            >
              <LayoutGrid className="w-4 h-4 text-[#93C5FD]" />
              <span>Buka Galeri Karya</span>
            </Link>
          </div>

          {/* ── Mobile: Smooth Moving Stats Marquee Ticker (Ngejejer Bergerak ke Samping) ── */}
          <div className="sm:hidden relative w-[calc(100%+2rem)] -mx-4 overflow-hidden py-2 select-none my-2.5">
            {/* Edge fade gradients */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 dark:from-[#0B1F4A] to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 dark:from-[#0B1F4A] to-transparent z-10" />

            {/* Marquee Track (Smooth Continuous Horizontal Motion) */}
            <div className="flex w-max animate-stats-marquee hover:[animation-play-state:paused] active:[animation-play-state:paused] gap-3 items-center px-4">
              {marqueeStats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={`mobile-stat-${idx}`}
                    className={`inline-flex items-center gap-3 px-3.5 py-2.5 rounded-2xl ${stat.cardBg} border ${stat.borderColor} shadow-xs backdrop-blur-xs shrink-0 select-none`}
                  >
                    {/* Gradient Icon Badge */}
                    <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4 stroke-[2.3]" />
                    </div>

                    {/* Content */}
                    <div className="text-left pr-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-heading font-black text-lg leading-none ${stat.valueColor}`}>
                          {stat.value}
                        </span>
                        <span className={`text-[8.5px] font-extrabold tracking-wider uppercase px-1.5 py-0.5 rounded ${stat.tagColor}`}>
                          {stat.tag}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 leading-tight whitespace-nowrap">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Desktop: Premium Stat Highlights ── */}
          <div className="hidden sm:flex sm:flex-wrap items-center justify-center lg:justify-start gap-5 lg:gap-7 pt-2 text-left">
            {heroStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <React.Fragment key={`desktop-stat-${stat.id}`}>
                  {idx > 0 && (
                    <div className="w-px h-10 bg-slate-300/80 dark:bg-[#1D3A73]" />
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-heading font-black text-2xl lg:text-3xl leading-none ${stat.valueColor}`}>
                          {stat.value}
                        </span>
                        <span className={`text-[9px] font-extrabold tracking-wider uppercase px-1.5 py-0.5 rounded ${stat.tagColor}`}>
                          {stat.tag}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-[#94A9C9] font-medium mt-1 leading-tight whitespace-nowrap">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right Column: Hero Category Showcase Card */}
        <div className="flex-1 min-w-0 w-full max-w-[500px] flex justify-center lg:justify-end">
          <FloatingHeroCards
            karyaList={karyaList}
            onSelectCategory={(cat) => {
              router.push(`/explore?category=${encodeURIComponent(cat)}`);
            }}
          />
        </div>
      </section>

      {/* ── 2. KARYA TERBAIK SECTION (#terbaik / Tiga karya pilihan kurator) ── */}
      {podium.length > 0 && (
        <section
          id="terbaik"
          className="max-w-[1200px] mx-auto pt-10 pb-12 sm:pt-16 px-2.5 xs:px-4 sm:px-6 lg:px-8 box-border border-t border-slate-200 dark:border-[#1D3A73]/70"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <div className="font-mono text-xs sm:text-[13px] font-bold tracking-wider text-[#FF8A2B] uppercase">
                KARYA TERBAIK
              </div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-[40px] tracking-[-0.02em] text-slate-900 dark:text-[#F2F5FA] mt-1.5 sm:mt-2 leading-tight">
                Tiga karya pilihan kurator
              </h2>
            </div>

            <button
              type="button"
              onClick={handleReplayAnim}
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 rounded-xl border border-slate-200 dark:border-[#33456A] bg-white dark:bg-[#121B2E] text-slate-700 dark:text-[#F2F5FA] hover:border-[#1E3A8A] hover:text-[#1E3A8A] dark:hover:border-[#FF8A2B] dark:hover:text-[#FF8A2B] text-sm font-semibold transition-all cursor-pointer w-full sm:w-auto shadow-xs active:scale-95 group text-center"
              title="Putar ulang animasi lencana kurator"
            >
              <RotateCcw
                className={`w-4 h-4 text-[#FF8A2B] transition-transform duration-700 ${
                  isReplaying ? "-rotate-180" : "group-hover:-rotate-45"
                }`}
              />
              <span>Putar ulang animasi</span>
            </button>
          </div>

          {/* Podium Layout: Always 3 in a row side-by-side (jejerin), scaled on mobile */}
          <div
            key={`podium-wrapper-${animKey}`}
            className="flex flex-row items-end gap-1.5 xs:gap-2.5 sm:gap-4 md:gap-5"
          >
            {podium.map((p, idx) => {
              const isSaved = !!likedKarya[p.karya.id];
              const tag = getTag(p.karya.category);

              return (
                <article
                  key={`curator-${p.rank}-${p.karya.id}-${animKey}`}
                  className={`kt-cardx relative flex-1 min-w-0 bg-white dark:bg-[#121B2E] ${p.borderClass} rounded-[14px] xs:rounded-[18px] sm:rounded-[22px] p-2 xs:p-2.5 sm:p-3 md:p-[14px] flex flex-col gap-1.5 sm:gap-3.5 box-border group ${p.orderClass}`}
                >
                  {/* Cover Box with dynamic podium height & scaled CuratorMedalBadge */}
                  <div
                    className={`relative rounded-[10px] sm:rounded-[14px] bg-slate-100 dark:bg-[#1B2B4B] overflow-hidden transition-all duration-300 w-full ${p.coverClass}`}
                  >
                    {p.karya.image_url ? (
                      <Image
                        src={p.karya.image_url}
                        alt={p.karya.title}
                        fill
                        sizes="(max-width: 768px) 33vw, 33vw"
                        className="object-cover rounded-[10px] sm:rounded-[14px] group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <ProjectCoverPlaceholder
                        id={p.karya.id}
                        title={p.karya.title}
                        category={p.karya.category}
                      />
                    )}

                    {/* Medal Rosette Ribbon Badge (scaled dynamically) */}
                    <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-20 pointer-events-none">
                      <CuratorMedalBadge
                        key={`badge-${p.rank}-${animKey}`}
                        rank={p.rank}
                        animToggle={animToggle}
                        animKey={animKey}
                        delayIndex={idx}
                        size="clamp(9px, 2.2vw, 15px)"
                      />
                    </div>

                    {/* Tactile Hover Pill ('Lihat detail') - Hidden on mobile, visible on desktop */}
                    <Link
                      href={`/project/${p.karya.id}`}
                      className="kt-go hidden md:inline-flex absolute right-3 bottom-3 px-3.5 py-1.5 rounded-full bg-[#FF8A2B] text-[#1A0F05] text-[13px] font-bold shadow-md hover:bg-[#ea580c] transition-colors z-20"
                    >
                      Lihat detail
                    </Link>
                  </div>

                  {/* Details */}
                  <div className="px-0.5 sm:px-1 flex-1 flex flex-col min-w-0">
                    <div className="text-[8px] xs:text-[9px] sm:text-xs font-mono font-bold tracking-wider text-[#FF8A2B] uppercase truncate">
                      <span className="sm:hidden">#{p.rank} • {tag.split(" ")[0]}</span>
                      <span className="hidden sm:inline">TERBAIK {p.rank} / {tag}</span>
                    </div>

                    <Link href={`/project/${p.karya.id}`}>
                      <h3 className="font-heading font-bold text-[11px] xs:text-xs sm:text-base md:text-[20px] text-slate-900 dark:text-[#F2F5FA] leading-tight my-0.5 sm:my-1.5 line-clamp-2 h-[28px] xs:h-[32px] sm:h-[44px] md:h-auto hover:text-[#1E3A8A] dark:hover:text-[#FF8A2B] transition-colors">
                        {p.karya.title}
                      </h3>
                    </Link>

                    {/* Author & Stats in a clean single row */}
                    <div className="flex items-center justify-between gap-1 mt-auto pt-1 sm:pt-2 text-slate-500 dark:text-[#8FA5C8]">
                      {/* Author */}
                      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
                        <div className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full bg-[#1E3A8A] text-white dark:bg-[#1A2D52] dark:text-[#E0EAFF] flex items-center justify-center font-bold text-[8px] sm:text-xs shrink-0 overflow-hidden shadow-xs">
                          {p.karya.team?.[0]?.avatar ? (
                            <Image
                              src={p.karya.team[0].avatar}
                              alt={p.karya.team[0].name || "Mahasiswa"}
                              width={24}
                              height={24}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span>
                              {(p.karya.team?.[0]?.name || "M").charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <span className="text-[9px] xs:text-[10px] sm:text-xs text-slate-700 dark:text-[#CBD5E1] truncate font-semibold">
                          {p.karya.team?.[0]?.name?.split(" ")?.[0] || "Mahasiswa"}
                        </span>
                      </div>

                      {/* Views & Likes */}
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0 font-mono text-[8px] xs:text-[9px] sm:text-xs">
                        <span className="inline-flex items-center gap-0.5" title={`${p.karya.views || 0} dilihat`}>
                          <Eye className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#1E3A8A] dark:text-[#60A5FA]" />
                          <span>{formatNumber(p.karya.views || 0)}</span>
                        </span>
                        <span className="inline-flex items-center gap-0.5" title={`${p.karya.likes || 0} disukai`}>
                          <Heart className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${isSaved ? "text-[#FF8A2B] fill-[#FF8A2B]" : "text-[#FF8A2B]/70"}`} />
                          <span>{formatNumber(p.karya.likes || 0)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="flex items-center justify-between px-0.5 pt-1 sm:pt-2.5 border-t border-slate-100 dark:border-[#22304A]">
                    <Link
                      href={`/project/${p.karya.id}`}
                      className="w-full text-[10px] xs:text-[11px] sm:text-sm font-bold text-[#1E3A8A] dark:text-[#F2F5FA] hover:text-[#FF8A2B] inline-flex items-center justify-between min-h-[22px] sm:min-h-[36px] transition-colors group/link"
                    >
                      <span className="truncate">Buka</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 dark:text-[#8FA5C8] group-hover/link:text-[#FF8A2B] group-hover/link:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Explore Full Directory CTA */}
          <div className="flex justify-center mt-10 sm:mt-12 px-2">
            <Link
              href="/explore"
              className="kt-btn inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 min-h-[50px] w-full sm:w-auto rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] text-white border border-[#1E3A8A] dark:bg-[#0E1D3F] dark:border-[#204285] dark:text-[#E0EAFF] font-semibold text-sm transition-all shadow-md shadow-blue-900/20 dark:shadow-sm group text-center"
            >
              <span>Jelajahi Semua Karya di Galeri</span>
              <ArrowRight className="w-4 h-4 text-[#FF8A2B] transition-transform group-hover:translate-x-1 shrink-0" />
            </Link>
          </div>
        </section>
      )}

      {/* ── 3. FEATURES SECTION ("Lebih dari sekadar galeri." / #fitur) ── */}
      <section
        id="fitur"
        className="max-w-[1200px] mx-auto py-10 sm:py-14 px-4 sm:px-6 lg:px-8 box-border"
      >
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-[40px] tracking-[-0.02em] text-slate-900 dark:text-[#F2F5FA] mb-6 sm:mb-8 max-w-[640px] leading-tight">
          Lebih dari sekadar galeri.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* Card 1: Portofolio Rapi */}
          <div className="kt-card bg-white dark:bg-[#0E1D3F] border border-slate-200/90 dark:border-[#1D3A73] rounded-[22px] p-6 sm:p-7 box-border shadow-md shadow-slate-900/5 dark:shadow-none">
            <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] border border-[#1E3A8A] dark:bg-[#132854] dark:border-[#1E3E7A] text-[#FF8A2B] flex items-center justify-center mb-5 shadow-sm">
              <LayoutGrid className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="font-heading font-bold text-xl sm:text-[22px] text-slate-900 dark:text-[#F2F5FA] mb-2">
              Portofolio rapi
            </h3>
            <p className="text-slate-600 dark:text-[#94A9C9] text-sm sm:text-[15px] leading-relaxed m-0">
              Setiap karya punya halaman tersendiri lengkap dengan tech stack,
              tautan repositori GitHub, dan demo interaktif langsung.
            </p>
          </div>

          {/* Card 2: Direktori Talenta */}
          <div
            id="mahasiswa"
            className="kt-card bg-white dark:bg-[#0E1D3F] border border-slate-200/90 dark:border-[#1D3A73] rounded-[22px] p-6 sm:p-7 box-border shadow-md shadow-slate-900/5 dark:shadow-none"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] border border-[#1E3A8A] dark:bg-[#132854] dark:border-[#1E3E7A] text-[#93C5FD] flex items-center justify-center mb-5 shadow-sm">
              <Users className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="font-heading font-bold text-xl sm:text-[22px] text-slate-900 dark:text-[#F2F5FA] mb-2">
              Direktori mahasiswa
            </h3>
            <p className="text-slate-600 dark:text-[#94A9C9] text-sm sm:text-[15px] leading-relaxed m-0">
              Jelajahi profil mahasiswa, keahlian teknis, dan portofolio proyek yang telah diselesaikan.
            </p>
          </div>

          {/* Card 3: Karya Terverifikasi */}
          <div className="kt-card bg-white dark:bg-[#0E1D3F] border border-slate-200/90 dark:border-[#1D3A73] rounded-[22px] p-6 sm:p-7 box-border shadow-md shadow-slate-900/5 dark:shadow-none">
            <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] border border-[#1E3A8A] dark:bg-[#132854] dark:border-[#1E3E7A] text-[#FF8A2B] flex items-center justify-center mb-5 shadow-sm">
              <BadgeCheck className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="font-heading font-bold text-xl sm:text-[22px] text-slate-900 dark:text-[#F2F5FA] mb-2">
              Karya terverifikasi
            </h3>
            <p className="text-slate-600 dark:text-[#94A9C9] text-sm sm:text-[15px] leading-relaxed m-0">
              Setiap proyek ditinjau oleh kampus untuk memastikan keaslian, kelayakan fungsi, dan kualitas karya.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. CTA SECTION ("Punya karya yang layak dilihat?" / #tentang) ── */}
      <section
        id="tentang"
        className="max-w-[1200px] mx-auto pt-4 sm:pt-6 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 box-border"
      >
        <div
          className="rounded-[22px] sm:rounded-[28px] p-6 sm:p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8 bg-[#1E3A8A] dark:bg-[#FF8A2B] text-white dark:text-[#1A0F05] shadow-[0_8px_0_#0F224A] sm:shadow-[0_10px_0_#0F224A] dark:shadow-[0_8px_0_#B35A12] sm:dark:shadow-[0_10px_0_#B35A12] transition-all"
        >
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-[40px] leading-[1.1] tracking-[-0.02em] text-white dark:text-[#1A0F05] mb-2 sm:mb-2.5">
              Punya karya yang layak dilihat?
            </h2>
            <p className="text-blue-100 dark:text-[#1A0F05]/90 text-sm sm:text-base md:text-[17px] leading-relaxed m-0 font-medium">
              Unggah proyekmu dan biarkan kampus mengenal kemampuanmu.
            </p>
          </div>

          <Link
            href="/submit"
            className="kt-btn inline-flex items-center justify-center gap-2.5 min-h-[52px] sm:min-h-[56px] w-full md:w-auto px-7 sm:px-8 rounded-[14px] bg-[#FF8A2B] hover:bg-[#ea580c] text-white dark:bg-[#0B1F4A] dark:hover:bg-[#122A5E] dark:text-white font-bold text-base transition-all shrink-0 active:translate-y-0 shadow-lg shadow-orange-500/25 dark:shadow-none text-center"
          >
            <span>Unggah karya</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 19V5"></path>
              <path d="m6 11 6-6 6 6"></path>
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
