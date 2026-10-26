"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LayoutGrid } from "lucide-react";
import type { Karya } from "@/types/karya";
import { FloatingHeroCards } from "./FloatingHeroCards";

export interface HeroStatItem {
  id: string;
  tag: string;
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  tagColor: string;
  cardBg: string;
  borderColor: string;
  valueColor: string;
}

interface HomeHeroSectionProps {
  heroStats: HeroStatItem[];
  marqueeStats: HeroStatItem[];
  karyaList: Karya[];
}

export const HomeHeroSection: React.FC<HomeHeroSectionProps> = ({
  heroStats,
  marqueeStats,
  karyaList,
}) => {
  const router = useRouter();

  return (
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

        {/* Mobile: Smooth Moving Stats Marquee Ticker */}
        <div className="sm:hidden relative w-[calc(100%+2rem)] -mx-4 overflow-hidden py-2 select-none my-2.5">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 dark:from-[#0B1F4A] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 dark:from-[#0B1F4A] to-transparent z-10" />

          <div className="flex w-max animate-stats-marquee hover:[animation-play-state:paused] active:[animation-play-state:paused] gap-3 items-center px-4">
            {marqueeStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={`mobile-stat-${idx}`}
                  className={`inline-flex items-center gap-3 px-3.5 py-2.5 rounded-2xl ${stat.cardBg} border ${stat.borderColor} shadow-xs backdrop-blur-xs shrink-0 select-none`}
                >
                  <div className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4 stroke-[2.3]" />
                  </div>

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

        {/* Desktop: Premium Stat Highlights */}
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
  );
};

