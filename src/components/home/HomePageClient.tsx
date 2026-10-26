"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Karya, MahasiswaProfile } from "@/types/karya";
import { BadgeCheck, GraduationCap, Rocket } from "lucide-react";
import { toggleKaryaLike, getLikedKaryaIds } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/utils/identity";
import { HomeHeroSection, HeroStatItem } from "./HomeHeroSection";
import { HomeCuratorSpotlight, PodiumItem } from "./HomeCuratorSpotlight";
import { HomeFeaturesSection } from "./HomeFeaturesSection";
import { HomeUploadCta } from "./HomeUploadCta";

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
  const [karyaList, setKaryaList] = useState<Karya[]>(featuredKarya);
  const [likedKarya, setLikedKarya] = useState<Record<string, boolean>>({});
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

  const getTag = (category: string) => {
    if (category === "Technology") return "WEBSITE";
    if (category === "Programming") return "MOBILE";
    if (category === "Multimedia") return "DESAIN";
    if (category === "IoT") return "IOT";
    if (category === "Research") return "RISET / JURNAL";
    return category?.toUpperCase() || "WEBSITE";
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
  const podium = useMemo<PodiumItem[]>(() => {
    if (top3Karya.length === 0) return [];
    const r1 = top3Karya[0];
    const r2 = top3Karya[1] || top3Karya[0];
    const r3 = top3Karya[2] || top3Karya[1] || top3Karya[0];

    return [
      {
        karya: r2,
        rank: 2,
        coverClass: "h-[105px] xs:h-[125px] sm:h-[160px] md:h-[190px]",
        orderClass: "order-1",
        borderClass: "border-slate-200 dark:border-[#22304A] shadow-xs sm:shadow-md dark:shadow-none",
      },
      {
        karya: r1,
        rank: 1,
        coverClass: "h-[125px] xs:h-[145px] sm:h-[190px] md:h-[230px]",
        orderClass: "order-2",
        borderClass: "border-[#FF8A2B] shadow-md sm:shadow-xl shadow-orange-500/20 ring-1 sm:ring-2 ring-[#FF8A2B]/40",
      },
      {
        karya: r3,
        rank: 3,
        coverClass: "h-[105px] xs:h-[125px] sm:h-[140px] md:h-[160px]",
        orderClass: "order-3",
        borderClass: "border-slate-200 dark:border-[#22304A] shadow-xs sm:shadow-md dark:shadow-none",
      },
    ];
  }, [top3Karya]);

  const heroStats = useMemo<HeroStatItem[]>(
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
      {/* 1. HERO SECTION */}
      <HomeHeroSection
        heroStats={heroStats}
        marqueeStats={marqueeStats}
        karyaList={karyaList}
      />

      {/* 2. KARYA TERBAIK SECTION */}
      <HomeCuratorSpotlight
        podium={podium}
        likedKarya={likedKarya}
        animKey={animKey}
        animToggle={animToggle}
        isReplaying={isReplaying}
        onReplayAnim={handleReplayAnim}
        getTag={getTag}
      />

      {/* 3. FEATURES SECTION */}
      <HomeFeaturesSection />

      {/* 4. CTA SECTION */}
      <HomeUploadCta />
    </div>
  );
}
