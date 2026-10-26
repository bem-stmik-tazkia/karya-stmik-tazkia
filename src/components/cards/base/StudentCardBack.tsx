"use client";

import React, { useMemo } from "react";
import {
  RotateCw,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import {
  PENGHARGAAN_CATALOG,
  PenghargaanBadge,
  getBadgeMissionProgress,
} from "@/data/penghargaanCatalog";
import { TazkiaAchievementHexBadge } from "@/components/penghargaan/TazkiaAchievementBadge";
import type { StudentCardData } from "./types";

const VISIBLE_COUNT = 4;

interface StudentCardBackProps {
  data: StudentCardData;
  primaryColor: string;
  secondaryColor: string;
  isSkeleton?: boolean;
  isFlipped?: boolean;
  unlockedBadgeIds: number[];
  activeTab: "umum" | "terbatas";
  selectedBadgeId: number;
  carouselIndex: number;
  onTabChange: (tab: "umum" | "terbatas") => void;
  onSelectBadge: (badge: PenghargaanBadge) => void;
  onPrevBadge: (e: React.MouseEvent) => void;
  onNextBadge: (e: React.MouseEvent) => void;
  onFlipToFront: () => void;
  onProfileClick?: () => void;
  outerBorderClassName?: string;
  nameClassName?: string;
  holoOverlay?: React.ReactNode;
  backOverlay?: React.ReactNode;
  backContainerClassName?: string;
  backHeaderTitle?: React.ReactNode;
  primaryButtonClassName?: string;
  secondaryButtonClassName?: string;
}

export const StudentCardBack: React.FC<StudentCardBackProps> = ({
  data,
  primaryColor,
  secondaryColor,
  isSkeleton = false,
  isFlipped = false,
  unlockedBadgeIds,
  activeTab,
  selectedBadgeId,
  carouselIndex,
  onTabChange,
  onSelectBadge,
  onPrevBadge,
  onNextBadge,
  onFlipToFront,
  onProfileClick,
  outerBorderClassName,
  nameClassName,
  holoOverlay,
  backOverlay,
  backContainerClassName,
  backHeaderTitle,
  primaryButtonClassName,
  secondaryButtonClassName,
}) => {
  const tabBadges = useMemo(() => {
    return PENGHARGAAN_CATALOG.filter((b) => b.group === activeTab);
  }, [activeTab]);

  const selectedBadge: PenghargaanBadge = useMemo(() => {
    const found = PENGHARGAAN_CATALOG.find((b) => b.id === selectedBadgeId);
    return found || tabBadges[0] || PENGHARGAAN_CATALOG[0];
  }, [selectedBadgeId, tabBadges]);

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

  const umumUnlockedCount = useMemo(
    () =>
      PENGHARGAAN_CATALOG.filter(
        (b) => b.group === "umum" && unlockedBadgeIds.includes(b.id)
      ).length,
    [unlockedBadgeIds]
  );

  const terbatasUnlockedCount = useMemo(
    () =>
      PENGHARGAAN_CATALOG.filter(
        (b) => b.group === "terbatas" && unlockedBadgeIds.includes(b.id)
      ).length,
    [unlockedBadgeIds]
  );

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
                <h4
                  className={`text-[13.5px] sm:text-[14.5px] font-extrabold tracking-tight leading-snug truncate ${
                    nameClassName || "text-white"
                  }`}
                >
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
                  onFlipToFront();
                }}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-90 shrink-0"
                title="Kembali ke depan"
                aria-label="Tutup"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tabs: Umum & Terbatas */}
            <div className="p-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-1 mb-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabChange("umum");
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
                  onTabChange("terbatas");
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

            {/* Carousel of Badges with Glass Arrow Buttons */}
            <div className="flex items-center justify-between gap-1 mb-2 px-0.5">
              <button
                type="button"
                onClick={onPrevBadge}
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
                        onSelectBadge(b);
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
                onClick={onNextBadge}
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

            {/* Selected Badge Detail Box */}
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
          </div>

          {/* Bottom Action Buttons: Balik Kartu & Lihat Profil */}
          <div className="pt-2">
            <div className="h-px w-full bg-white/10 mb-2" />
            <div className="relative z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFlipToFront();
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
  );
};

