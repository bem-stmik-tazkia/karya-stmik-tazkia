"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, Check, Lock } from "lucide-react";
import {
  PENGHARGAAN_CATALOG,
  type PenghargaanBadge,
} from "@/data/penghargaanCatalog";
import { TazkiaAchievementHexBadge } from "@/components/penghargaan/TazkiaAchievementBadge";

interface StudentBadgesSectionProps {
  studentBadgeIds: number[];
  newlyUnlockedBadgeIds: number[];
  isOwnProfile: boolean;
  onSelectBadge: (badge: PenghargaanBadge) => void;
  onMarkBadgeAsSeen: (badgeId: number) => void;
  onMarkAllAsSeen: () => void;
}

export default function StudentBadgesSection({
  studentBadgeIds,
  newlyUnlockedBadgeIds,
  isOwnProfile,
  onSelectBadge,
  onMarkBadgeAsSeen,
  onMarkAllAsSeen,
}: StudentBadgesSectionProps) {
  return (
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
          <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0 whitespace-nowrap">
            {studentBadgeIds.length} / {PENGHARGAAN_CATALOG.length} Diraih
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
          Penghargaan pencapaian dan rekam jejak prestasi mahasiswa di galeri platform STMIK Tazkia.
        </p>
      </div>

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
                Selamat! Portofolio karya Anda telah membuka penghargaan baru. Badge bertanda merah di bawah siap dipajang di galeri Anda.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={onMarkAllAsSeen}
              className="px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              Tandai Sudah Dilihat
            </button>
          </div>
        </div>
      )}

      {/* Badges Shelf - 16 Clean Medallions */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5 sm:gap-3.5">
        {PENGHARGAAN_CATALOG.map((badge) => {
          const isOwned = studentBadgeIds.includes(badge.id);
          const isNewUnlock = isOwnProfile && newlyUnlockedBadgeIds.includes(badge.id);
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
              onClick={() => {
                if (isNewUnlock) {
                  onMarkBadgeAsSeen(badge.id);
                }
                onSelectBadge(badge);
              }}
              className={`group relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-center select-none ${
                isNewUnlock
                  ? "border-red-500 bg-red-500/10 ring-2 ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:-translate-y-1 active:translate-y-0"
                  : isOwned
                  ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:shadow-sm hover:-translate-y-1 active:translate-y-0"
                  : "border-dashed border-border/70 bg-muted/20 opacity-70 hover:opacity-100 hover:border-slate-400 dark:hover:border-slate-600 hover:-translate-y-0.5 active:translate-y-0"
              }`}
              title={
                isNewUnlock
                  ? `[BARU TERBUKA] Klik untuk melihat detail & tandai sudah dilihat: ${badge.name}`
                  : `Klik untuk melihat detail penghargaan ${badge.name}`
              }
            >
              {/* Red notification dot in corner ONLY if newly unlocked in own profile */}
              {isNewUnlock && (
                <span className="absolute -top-1 -right-1 z-30 flex h-3 w-3 pointer-events-none">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-card shadow-xs" />
                </span>
              )}

              {/* Hexagon Medallion with custom vector artwork */}
              <div className="relative mb-2 flex items-center justify-center">
                <TazkiaAchievementHexBadge
                  badge={badge}
                  size="sm"
                  locked={!isOwned}
                  animated={isOwned}
                  showTooltip={false}
                />

                {/* Corner Status Dot */}
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border shadow-xs z-20 ${
                    isNewUnlock
                      ? "bg-red-500 text-white border-card animate-pulse"
                      : isOwned
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

              {/* Status tag */}
              {isNewUnlock ? (
                <span className="text-[8px] font-black text-red-500 dark:text-red-400 uppercase tracking-tighter mt-0.5 animate-pulse">
                  🔴 Terbuka
                </span>
              ) : isOwned ? (
                <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter mt-0.5">
                  ✓ Diraih
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

