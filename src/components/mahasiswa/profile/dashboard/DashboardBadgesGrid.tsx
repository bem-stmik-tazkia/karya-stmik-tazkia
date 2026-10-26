"use client";

import React from "react";
import { Lock, Check, Award, Pin } from "lucide-react";
import { PENGHARGAAN_CATALOG, type PenghargaanBadge } from "@/data/penghargaanCatalog";
import { TazkiaAchievementHexBadge } from "@/components/penghargaan/TazkiaAchievementBadge";
import type { ExclusiveBadgeGrant } from "@/lib/badgeService";

interface DashboardBadgesGridProps {
  displayedBadges: PenghargaanBadge[];
  studentBadgeIds: number[];
  featuredBadgeIds: number[];
  claimableGrants: ExclusiveBadgeGrant[];
  newlyUnlockedBadgeIds: number[];
  isOwnProfile: boolean;
  isCustomizingShelf: boolean;
  activeBadgeTab: "umum" | "terbatas";
  onTabChange: (tab: "umum" | "terbatas") => void;
  onSelectBadge: (badge: PenghargaanBadge) => void;
  onToggleFeatured: (badgeId: number) => void;
  onClaimBadge: (badgeId: number) => void;
  onMarkBadgeSeen: (badgeId: number) => void;
}

export function DashboardBadgesGrid({
  displayedBadges,
  studentBadgeIds,
  featuredBadgeIds,
  claimableGrants,
  newlyUnlockedBadgeIds,
  isOwnProfile,
  isCustomizingShelf,
  activeBadgeTab,
  onTabChange,
  onSelectBadge,
  onToggleFeatured,
  onClaimBadge,
  onMarkBadgeSeen,
}: DashboardBadgesGridProps) {
  return (
    <div>
      {/* ── Tabs Filter Kategori (Umum & Terbatas) ── */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => onTabChange("umum")}
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
          onClick={() => onTabChange("terbatas")}
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
          const isNewUnlock =
            isOwnProfile && newlyUnlockedBadgeIds.includes(badge.id) && !isClaimable;
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
                if (isClaimable) {
                  onClaimBadge(badge.id);
                } else if (isCustomizingShelf) {
                  if (isOwned) {
                    onToggleFeatured(badge.id);
                  }
                } else {
                  if (isNewUnlock) {
                    onMarkBadgeSeen(badge.id);
                  }
                  onSelectBadge(badge);
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
                    <Award className="w-2.5 h-2.5" />
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
              <span
                className={`text-[8.5px] sm:text-[9px] font-mono font-bold uppercase mt-0.5 ${tierColor}`}
              >
                {badge.tierLabel}
              </span>

              {/* Status tag */}
              {isClaimable ? (
                <span className="text-[8.5px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tight mt-0.5 animate-pulse">
                  Klaim
                </span>
              ) : isNewUnlock ? (
                <span className="text-[8.5px] font-bold text-primary uppercase tracking-tight mt-0.5 animate-pulse">
                  Baru
                </span>
              ) : isOwned ? (
                <span className="text-[8.5px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight mt-0.5">
                  Diraih
                </span>
              ) : (
                <span className="text-[8.5px] font-medium text-muted-foreground uppercase tracking-tight mt-0.5">
                  Terkunci
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

