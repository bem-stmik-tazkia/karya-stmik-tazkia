"use client";

import React, { useState } from "react";
import { Award, Check, X } from "lucide-react";
import type { ExclusiveBadgeGrant } from "@/lib/badgeService";

interface DashboardClaimBannerProps {
  isOwnProfile: boolean;
  claimableGrants: ExclusiveBadgeGrant[];
  newlyUnlockedBadgeIds: number[];
  onClaimAll: () => void;
  onMarkAllSeen: () => void;
}

export function DashboardClaimBanner({
  isOwnProfile,
  claimableGrants,
  newlyUnlockedBadgeIds,
  onClaimAll,
  onMarkAllSeen,
}: DashboardClaimBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!isOwnProfile) return null;

  const firstGrant = claimableGrants[0];

  return (
    <>
      {/* Notifikasi Ringkas Pemberian Hak Lencana/Skin (Bisa ditutup) */}
      {claimableGrants.length > 0 && !dismissed && (
        <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                  Pesan Pengelola: {claimableGrants.map((g) => g.badgeName).join(", ")}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-primary/20 shrink-0">
                  {claimableGrants.length} Tersedia
                </span>
              </div>
              {firstGrant?.note ? (
                <p className="text-xs text-muted-foreground truncate italic mt-0.5">
                  &ldquo;{firstGrant.note}&rdquo;
                </p>
              ) : (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  Pengelola memberikan hak akses lencana ini untuk profil Anda.
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={onClaimAll}
              className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Klaim Lencana</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Tutup pemberitahuan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Notifikasi jika ada penghargaan baru dari misi karya */}
      {newlyUnlockedBadgeIds.length > 0 && (
        <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted border border-border text-foreground flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-foreground">
                  Penghargaan Baru Terbuka
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-primary/20">
                  +{newlyUnlockedBadgeIds.length} Baru
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Karya portofolio Anda telah membuka pencapaian baru di lemari penghargaan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={onMarkAllSeen}
              className="px-3.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border transition shadow-2xs cursor-pointer"
            >
              Tandai Sudah Dilihat
            </button>
          </div>
        </div>
      )}
    </>
  );
}
