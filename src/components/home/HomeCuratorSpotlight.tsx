"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, Heart, RotateCcw } from "lucide-react";
import type { Karya } from "@/types/karya";
import { formatNumber } from "@/lib/data";
import { ProjectCoverPlaceholder } from "@/components/ui/ProjectCoverPlaceholder";
import { CuratorMedalBadge } from "./CuratorMedalBadge";

export interface PodiumItem {
  karya: Karya;
  rank: 1 | 2 | 3;
  coverClass: string;
  orderClass: string;
  borderClass: string;
}

interface HomeCuratorSpotlightProps {
  podium: PodiumItem[];
  likedKarya: Record<string, boolean>;
  animKey: number;
  animToggle: boolean;
  isReplaying: boolean;
  onReplayAnim: () => void;
  getTag: (category: string) => string;
}

export const HomeCuratorSpotlight: React.FC<HomeCuratorSpotlightProps> = ({
  podium,
  likedKarya,
  animKey,
  animToggle,
  isReplaying,
  onReplayAnim,
  getTag,
}) => {
  if (podium.length === 0) return null;

  return (
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
          onClick={onReplayAnim}
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

      {/* Podium Layout */}
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
              {/* Cover Box */}
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

                {/* Medal Rosette Ribbon Badge */}
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

                {/* Tactile Hover Pill */}
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

                {/* Author & Stats */}
                <div className="flex items-center justify-between gap-1 mt-auto pt-1 sm:pt-2 text-slate-500 dark:text-[#8FA5C8]">
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
  );
};

