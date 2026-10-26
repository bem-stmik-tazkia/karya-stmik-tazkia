"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, X, Info } from "lucide-react";
import type { MahasiswaProfile } from "@/types/karya";
import {
  type PenghargaanBadge,
  getBadgeMissionProgress,
} from "@/data/penghargaanCatalog";
import { TazkiaAchievementHexBadge } from "@/components/penghargaan/TazkiaAchievementBadge";

interface StudentBadgeDetailModalProps {
  selectedBadge: PenghargaanBadge | null;
  studentBadgeIds: number[];
  studentUserId?: string | null;
  evaluatedProjects: any[];
  mahasiswa: MahasiswaProfile | null;
  activeSkinId: string;
  onClose: () => void;
}

export default function StudentBadgeDetailModal({
  selectedBadge,
  studentBadgeIds,
  studentUserId,
  evaluatedProjects,
  mahasiswa,
  activeSkinId,
  onClose,
}: StudentBadgeDetailModalProps) {
  return (
    <AnimatePresence>
      {selectedBadge && (() => {
        const isSelectedUnlocked = studentBadgeIds.includes(selectedBadge.id);
        const selectedProgress = getBadgeMissionProgress(selectedBadge.id, {
          userId: studentUserId,
          projects: evaluatedProjects,
          angkatan: mahasiswa?.angkatan,
          skills: mahasiswa?.skills,
          bio: mahasiswa?.bio,
          statusBadge: mahasiswa?.status_badge,
          cardSkin: activeSkinId,
          unlockedBadgeIds: studentBadgeIds,
        });

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 flex min-h-full items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={`relative z-10 w-full max-w-sm max-h-[90vh] overflow-y-auto my-auto rounded-3xl border bg-card p-5 sm:p-6 shadow-2xl text-center ${
                isSelectedUnlocked
                  ? "border-emerald-500/40 ring-1 ring-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.15)]"
                  : "border-border"
              }`}
            >
              {/* Close Button Top Right */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Big Glowing Medallion with custom vector artwork */}
              <div className="relative mx-auto my-2 py-1 flex items-center justify-center">
                <TazkiaAchievementHexBadge
                  badge={selectedBadge}
                  size="md"
                  locked={!isSelectedUnlocked}
                  animated={isSelectedUnlocked}
                />
              </div>

              {/* Status Pill */}
              <div className="mt-1 mb-2.5">
                {isSelectedUnlocked ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>MISI TERBUKA &amp; DIRAIH (PERMANEN)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Masih Terkunci</span>
                  </span>
                )}
              </div>

              {/* Title & Tier */}
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight mb-0.5">
                {selectedBadge.name}
              </h3>
              <p className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-3">
                PENGHARGAAN TINGKAT {selectedBadge.tierLabel}
              </p>

              {/* Description Box with Real Mission & Philosophy */}
              <div
                className={`border rounded-2xl p-3.5 text-xs text-foreground/90 leading-relaxed mb-4 text-left space-y-2.5 ${
                  isSelectedUnlocked
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : "bg-muted/40 border-border/80"
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                    Misi / Syarat Buka
                  </span>
                  <p className="mt-0.5 font-medium leading-relaxed">
                    {selectedProgress.requirementText}
                  </p>
                </div>

                {/* Real Mission Progress */}
                <div className="pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                    <span className="font-bold text-foreground uppercase tracking-wider">
                      Progres Misi
                    </span>
                    <span
                      className={
                        isSelectedUnlocked
                          ? "text-emerald-600 dark:text-emerald-400 font-bold"
                          : "text-amber-500 font-extrabold"
                      }
                    >
                      {selectedProgress.progressText} ({selectedProgress.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isSelectedUnlocked
                          ? "bg-gradient-to-r from-emerald-500 to-green-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                          : "bg-gradient-to-r from-amber-500 to-orange-400"
                      }`}
                      style={{ width: `${selectedProgress.percentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    {selectedProgress.remainingText}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Makna &amp; Filosofi
                  </span>
                  <p className="mt-0.5 text-muted-foreground text-[11.5px] italic">
                    &ldquo;{selectedBadge.philosophy}&rdquo;
                  </p>
                </div>

                {!isSelectedUnlocked && (
                  <div className="mt-2 pt-2 border-t border-border/60 text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>
                      Publikasikan karya atau terus tingkatkan portofolio untuk membuka penghargaan ini!
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-95 transition-opacity cursor-pointer shadow-xs"
              >
                Mengerti
              </button>
            </motion.div>
          </div>
        );
      })()}
    </AnimatePresence>
  );
}

