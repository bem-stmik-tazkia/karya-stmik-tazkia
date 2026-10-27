"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import {
  PenghargaanBadge,
  getBadgeMissionProgress,
} from "@/data/penghargaanCatalog";
import { TazkiaAchievementHexBadge } from "@/components/penghargaan/TazkiaAchievementBadge";
import type { StudentCardData } from "./types";

interface StudentCardFrontBadgesProps {
  data: StudentCardData;
  featuredBadges: PenghargaanBadge[];
  unlockedBadgeIds: number[];
  isSkeleton?: boolean;
  isFlipped?: boolean;
  onOpenBadgeDetails: (badge: PenghargaanBadge) => void;
  onOpenLemari: () => void;
}

const getArrowPosition = (index: number, total: number = 5) => {
  if (total <= 1) return "50%";
  const percent = (index / (total - 1)) * 100;
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

export const StudentCardFrontBadges: React.FC<StudentCardFrontBadgesProps> = ({
  data,
  featuredBadges,
  unlockedBadgeIds,
  isSkeleton = false,
  isFlipped = false,
  onOpenBadgeDetails,
  onOpenLemari,
}) => {
  const [hoveredBadgeIdx, setHoveredBadgeIdx] = useState<number | null>(null);

  const hoveredBadge =
    hoveredBadgeIdx !== null && featuredBadges[hoveredBadgeIdx]
      ? featuredBadges[hoveredBadgeIdx]
      : null;

  return (
    <div className="border-t pt-2.5 border-slate-100 dark:border-slate-800">
      {/* Title */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onOpenLemari();
          setHoveredBadgeIdx(null);
        }}
        className="flex items-center text-[11px] font-bold tracking-wider uppercase mb-2 cursor-pointer hover:text-orange-500 transition-colors group/penghargaan"
        title="Klik untuk buka Lemari Penghargaan"
      >
        <span className="text-slate-500 dark:text-slate-400 group-hover/penghargaan:text-orange-500 transition-colors">
          PENGHARGAAN
        </span>
      </div>

      {/* Row of 5 Badges */}
      <div
        className="relative mb-3.5"
        onMouseLeave={() => setHoveredBadgeIdx(null)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Tooltip */}
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
            <div className="pointer-events-none absolute bottom-full mb-2 left-0 right-0 w-full p-2.5 rounded-xl bg-slate-950/95 text-white shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-slate-700/80 backdrop-blur-md text-left select-none z-[80] animate-in fade-in duration-150">
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

              {/* Pointer Arrow */}
              <div
                className="absolute -bottom-1 w-2 h-2 bg-slate-950 rotate-45 border-r border-b border-slate-700/80 -translate-x-1/2"
                style={{
                  left: getArrowPosition(hoveredBadgeIdx, 5),
                }}
              />
            </div>
          );
        })()}

        {/* 5 Badges Slots */}
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
                      onOpenBadgeDetails(badge);
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
    </div>
  );
};

