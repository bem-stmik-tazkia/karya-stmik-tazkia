"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Check, ArrowRight, Award } from "lucide-react";
import {
  PENGHARGAAN_CATALOG,
  type PenghargaanBadge,
} from "@/data/penghargaanCatalog";
import { TazkiaAchievementHexBadge } from "@/components/penghargaan/TazkiaAchievementBadge";
import StudentBadgeDetailModal from "@/components/mahasiswa/profile/StudentBadgeDetailModal";
import type { Student } from "@/types/student";
import type { Karya } from "@/types/karya";

interface MahasiswaDrawerBadgesProps {
  student: Student;
  studentBadgeIds: number[];
  projects: Karya[];
  onClose?: () => void;
}

export const MahasiswaDrawerBadges: React.FC<MahasiswaDrawerBadgesProps> = ({
  student,
  studentBadgeIds,
  projects,
  onClose,
}) => {
  const [selectedBadgeModal, setSelectedBadgeModal] = useState<PenghargaanBadge | null>(null);
  const [savedFeaturedBadgeIds, setSavedFeaturedBadgeIds] = useState<number[] | null>(null);

  // 1. Baca pengaturan rak sorotan dari localStorage atau data student (sinkron dengan MahasiswaCard)
  useEffect(() => {
    try {
      const sid = student.id;
      const uid = student.userId;
      const saved =
        (uid ? localStorage.getItem(`tazkia_featured_badges_${uid}`) : null) ||
        (sid ? localStorage.getItem(`tazkia_featured_badges_${sid}`) : null);

      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((id: number) =>
            PENGHARGAAN_CATALOG.some((b) => b.id === id)
          );
          if (valid.length > 0) {
            setSavedFeaturedBadgeIds(valid.slice(0, 5));
            return;
          }
        }
      }

      if (student.featuredBadgeIds && student.featuredBadgeIds.length > 0) {
        setSavedFeaturedBadgeIds(student.featuredBadgeIds);
        return;
      }

      setSavedFeaturedBadgeIds(null);
    } catch {
      setSavedFeaturedBadgeIds(null);
    }
  }, [student.id, student.userId, student.featuredBadgeIds]);

  // Scoring prestisius untuk fallback rak lencana
  const getPrestigeScore = (badgeId: number) => {
    const b = PENGHARGAAN_CATALOG.find((x) => x.id === badgeId);
    if (!b) return 0;
    if (b.group === "terbatas" || b.tier === "khusus") return 100;
    if (b.tier === "emas") return 50;
    if (b.tier === "perak") return 20;
    return 10;
  };

  // 2. Filter hanya badge yang tampil di rak kartu (maksimal 5 badge yang benar-benar diraih)
  const featuredBadgeIds = useMemo(() => {
    const earnedSet = new Set(studentBadgeIds);
    let candidates: number[] = [];

    if (savedFeaturedBadgeIds && savedFeaturedBadgeIds.length > 0) {
      candidates = savedFeaturedBadgeIds;
    } else if (student.featuredBadgeIds && student.featuredBadgeIds.length > 0) {
      candidates = student.featuredBadgeIds;
    } else if ((student as any)?.featured_badge_ids?.length > 0) {
      candidates = (student as any).featured_badge_ids;
    }

    const validEarned = candidates.filter((id) => earnedSet.has(Number(id)));
    const sorted = [...studentBadgeIds].sort(
      (a, b) => getPrestigeScore(b) - getPrestigeScore(a)
    );

    if (validEarned.length > 0) {
      // Ambil badge pilihan custom, dan jika kurang dari 5 slot,
      // lengkapi sisa slot dari lencana yang telah diraih agar rak kartu tetap penuh
      const remaining = sorted.filter((id) => !validEarned.map(Number).includes(Number(id)));
      return [...validEarned, ...remaining].slice(0, 5);
    }

    if (sorted.length > 0) {
      return sorted.slice(0, 5);
    }

    return [];
  }, [
    savedFeaturedBadgeIds,
    student.featuredBadgeIds,
    (student as any)?.featured_badge_ids,
    studentBadgeIds,
  ]);

  const rakBadges = useMemo(() => {
    return featuredBadgeIds
      .map((id) => PENGHARGAAN_CATALOG.find((b) => b.id === id))
      .filter((b): b is PenghargaanBadge => Boolean(b));
  }, [featuredBadgeIds]);

  return (
    <>
      <div className="bg-card p-4 rounded-xl border border-border shadow-xs space-y-3.5">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-border">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#FF8A2B] shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                  Lencana di Rak Kartu
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                <span>{rakBadges.length} / 5 di Rak</span>
              </span>
              {studentBadgeIds.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>{studentBadgeIds.length} Total Diraih</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Lencana kehormatan &amp; prestasi yang tersemat pada rak kartu profil mahasiswa.
            </p>
          </div>
        </div>

        {/* Visual Rak Display (5 Slot Hexagon) */}
        <div className="bg-gradient-to-b from-muted/30 to-muted/10 p-3 sm:p-4 rounded-xl border border-border/80">
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-0.5">
            {Array.from({ length: 5 }).map((_, idx) => {
              const badge = rakBadges[idx];
              if (badge) {
                return (
                  <div
                    key={badge.id}
                    onClick={() => setSelectedBadgeModal(badge)}
                    className="group/slot flex-1 max-w-[58px] flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl bg-card border border-border hover:border-[#FF8A2B] hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-2xs relative"
                    title={`${badge.name} (${badge.tierLabel}) - Klik untuk rincian`}
                  >
                    <div className="w-8 h-9 sm:w-10 sm:h-11 flex items-center justify-center">
                      <TazkiaAchievementHexBadge
                        badge={badge}
                        size="xs"
                        locked={false}
                        animated={true}
                        showTooltip={false}
                      />
                    </div>
                    <span className="text-[9px] font-semibold text-muted-foreground group-hover/slot:text-foreground truncate w-full text-center mt-1 block">
                      {badge.name.split(" ")[0]}
                    </span>
                  </div>
                );
              }
              return (
                <div
                  key={`empty-${idx}`}
                  className="flex-1 max-w-[58px] flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl border border-dashed border-border/70 bg-muted/20 opacity-60"
                  title="Slot Rak Kosong"
                >
                  <div className="w-8 h-9 sm:w-10 sm:h-11 flex items-center justify-center font-mono text-xs text-muted-foreground/50">
                    +
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground/40 mt-1">
                    Kosong
                  </span>
                </div>
              );
            })}
          </div>

          {/* Rak Wooden/Metallic Rail Bar */}
          <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-border/20 via-[#FF8A2B]/40 to-border/20 mt-3 shadow-2xs" />
        </div>

        {/* Daftar Badge yang Terpasang di Rak */}
        {rakBadges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {rakBadges.map((badge) => {
              const isTerbatas = badge.group === "terbatas" || badge.tier === "khusus";
              const isEmas = badge.tier === "emas";
              const isPerak = badge.tier === "perak";
              const tierColor = isTerbatas
                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-orange-400 border-orange-500/40 font-bold"
                : isEmas
                ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border-yellow-400/40 font-bold"
                : isPerak
                ? "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30 font-bold"
                : "bg-amber-800/20 text-amber-700 dark:text-amber-500 border-amber-700/30 font-bold";

              return (
                <div
                  key={badge.id}
                  onClick={() => setSelectedBadgeModal(badge)}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all duration-200 cursor-pointer shadow-2xs group"
                >
                  <div className="shrink-0 mt-0.5">
                    <TazkiaAchievementHexBadge
                      badge={badge}
                      size="xs"
                      locked={false}
                      animated={true}
                      showTooltip={false}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-bold text-foreground leading-snug group-hover:text-[#FF8A2B] transition-colors truncate">
                        {badge.name}
                      </h4>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>Diraih</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span
                        className={`text-[8.5px] px-1.5 py-0.2 rounded uppercase border ${tierColor}`}
                      >
                        {badge.tierLabel}
                      </span>
                      {badge.symbolLabel && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {badge.symbolLabel}
                        </span>
                      )}
                    </div>

                    {badge.philosophy && (
                      <p className="text-[10px] text-muted-foreground italic line-clamp-1 mt-1">
                        &ldquo;{badge.philosophy}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-border text-center space-y-1 bg-muted/10">
            <p className="text-xs font-semibold text-foreground">Belum Ada Lencana di Rak</p>
            <p className="text-[11px] text-muted-foreground">
              Mahasiswa ini belum menyematkan lencana prestasi pada rak kartu profilnya.
            </p>
          </div>
        )}

        {/* Link Footer ke Lemari Lengkap */}
        <Link
          href={`/student/${student.id}`}
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground text-xs font-medium transition-all border border-border/60 group cursor-pointer"
        >
          <span className="text-[11px] font-medium">
            Lihat lemari seluruh ({PENGHARGAAN_CATALOG.length}) penghargaan di profil lengkap
          </span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>
      </div>

      {/* Modal Rincian Lencana */}
      <StudentBadgeDetailModal
        selectedBadge={selectedBadgeModal}
        studentBadgeIds={studentBadgeIds}
        studentUserId={student.userId || student.id}
        evaluatedProjects={projects}
        mahasiswa={{
          id: student.id,
          user_id: student.userId,
          full_name: student.name,
          angkatan: student.angkatan,
          prodi: student.prodi,
          bio: student.bio,
          skills: student.skills,
          status_badge: student.rawStatusBadge || student.statusBadge,
        } as any}
        activeSkinId={student.cardSkin || "classic"}
        onClose={() => setSelectedBadgeModal(null)}
      />
    </>
  );
};
