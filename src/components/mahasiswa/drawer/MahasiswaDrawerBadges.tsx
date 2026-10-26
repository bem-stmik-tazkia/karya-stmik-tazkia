"use client";

import React, { useState } from "react";
import { Check, Lock, Info } from "lucide-react";
import { PENGHARGAAN_CATALOG, getBadgeMissionProgress } from "@/data/penghargaanCatalog";
import { TazkiaAchievementHexBadge } from "@/components/penghargaan/TazkiaAchievementBadge";
import type { Student } from "@/types/student";
import type { Karya } from "@/types/karya";

interface MahasiswaDrawerBadgesProps {
  student: Student;
  studentBadgeIds: number[];
  projects: Karya[];
}

export const MahasiswaDrawerBadges: React.FC<MahasiswaDrawerBadgesProps> = ({
  student,
  studentBadgeIds,
  projects,
}) => {
  const [selectedBadgeDetail, setSelectedBadgeDetail] = useState<number | null>(null);

  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-xs space-y-3.5">
      <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
              Penghargaan &amp; Prestasi
            </h3>
            {studentBadgeIds.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>{studentBadgeIds.length} Diraih</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Penghargaan pencapaian dan rekam jejak prestasi mahasiswa ({studentBadgeIds.length} dari {PENGHARGAAN_CATALOG.length} penghargaan diraih).
          </p>
        </div>
      </div>

      {/* Grid Semua Badge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1.5 pb-2 scrollbar-thin">
        {PENGHARGAAN_CATALOG.map((badge) => {
          const isOwned = studentBadgeIds.includes(badge.id);
          const isExpanded = selectedBadgeDetail === badge.id;
          const isTerbatas = badge.group === "terbatas" || badge.tier === "khusus";
          const isEmas = badge.tier === "emas";
          const isPerak = badge.tier === "perak";
          const tierColor = isTerbatas
            ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-orange-400 border-orange-500/40"
            : isEmas
            ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border-yellow-400/40 font-bold"
            : isPerak
            ? "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30 font-bold"
            : "bg-amber-800/20 text-amber-700 dark:text-amber-500 border-amber-700/30 font-bold";

          const missionProgress = getBadgeMissionProgress(badge.id, {
            projects: projects || [],
            angkatan: student.angkatan,
            skills: student.skills,
            bio: student.bio,
            statusBadge: student.rawStatusBadge || student.statusBadge,
            cardSkin: student.cardSkin,
            unlockedBadgeIds: studentBadgeIds,
          });

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadgeDetail(isExpanded ? null : badge.id)}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all duration-200 cursor-pointer shadow-2xs ${
                isOwned
                  ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                  : "border-dashed border-border/80 bg-muted/10 opacity-75 hover:opacity-100 hover:border-slate-400 dark:hover:border-slate-600"
              } ${isExpanded ? "ring-2 ring-primary/40" : ""}`}
            >
              <div className="shrink-0 mt-0.5 relative">
                <TazkiaAchievementHexBadge
                  badge={badge}
                  size="xs"
                  locked={!isOwned}
                  animated={isOwned}
                  showTooltip={false}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0 pr-1">
                    <h4 className="text-xs font-bold text-foreground leading-snug">
                      {badge.name}
                    </h4>
                    <span
                      className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${tierColor}`}
                    >
                      {badge.tierLabel}
                    </span>
                  </div>
                  {isOwned ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>Diraih</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-500/15 text-slate-500 dark:text-slate-400 border border-slate-500/30 shrink-0">
                      <Lock className="w-3 h-3" />
                      <span>Terkunci</span>
                    </span>
                  )}
                </div>

                {/* Requirement text */}
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  {missionProgress.requirementText}
                </p>

                {/* Mission Progress Bar */}
                <div className="mt-2 pt-1.5 border-t border-border/50">
                  <div className="flex items-center justify-between text-[9.5px] mb-1 font-mono">
                    <span className="text-muted-foreground font-semibold">Progres Misi</span>
                    <span
                      className={
                        isOwned
                          ? "text-emerald-600 dark:text-emerald-400 font-bold"
                          : "text-amber-600 dark:text-amber-400 font-bold"
                      }
                    >
                      {missionProgress.progressText} ({missionProgress.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOwned
                          ? "bg-gradient-to-r from-emerald-500 to-green-500"
                          : "bg-gradient-to-r from-amber-500 to-orange-400"
                      }`}
                      style={{ width: `${missionProgress.percentage}%` }}
                    />
                  </div>
                  <p className="text-[9.5px] text-muted-foreground italic">
                    {missionProgress.remainingText}
                  </p>
                </div>

                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-border/60 text-[10px] space-y-1">
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Filosofi:</strong> {badge.philosophy}
                    </p>
                    {!isOwned ? (
                      <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Info className="w-3 h-3 shrink-0" />
                        <span>Penuhi misi di atas untuk membuka penghargaan ini.</span>
                      </p>
                    ) : (
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3 shrink-0" />
                        <span>Misi telah selesai dan penghargaan ini telah berhasil diraih!</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

