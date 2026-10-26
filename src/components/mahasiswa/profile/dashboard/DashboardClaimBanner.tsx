"use client";

import React from "react";
import { Award, Check, CreditCard } from "lucide-react";
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
  if (!isOwnProfile) return null;

  return (
    <>
      {/* Banner Klaim Lencana Eksklusif yang Dikirim Admin */}
      {claimableGrants.length > 0 && (
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-primary/10 border-2 border-amber-500/50 shadow-md flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-foreground">
                    Lencana Kehormatan Mahasiswa
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    {claimableGrants.length} Tersedia
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pengelola STMIK Tazkia memberikan rekomendasi lencana kehormatan untuk Anda (
                  {claimableGrants.map((g) => g.badgeName).join(", ")}).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={onClaimAll}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Klaim Lencana</span>
              </button>
            </div>
          </div>

          {/* Pesan Khusus dan Hak Istimewa Skin */}
          <div className="space-y-1.5 pt-1 border-t border-amber-500/20">
            {claimableGrants
              .filter((g) => g.note)
              .map((g, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-card/80 border border-amber-500/25 text-xs text-foreground flex items-start gap-2"
                >
                  <span className="text-sm shrink-0 mt-0.5">💬</span>
                  <div>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      Pesan Pengelola ({g.badgeName}):{" "}
                    </span>
                    <span className="italic text-muted-foreground">&ldquo;{g.note}&rdquo;</span>
                  </div>
                </div>
              ))}

            {claimableGrants.some((g) => g.badgeId === 15) && (
              <div className="px-2.5 py-1.5 rounded-lg bg-orange-500/10 text-orange-700 dark:text-orange-300 text-xs font-semibold flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>
                  Hak Akses: Membuka tema Skin Kartu BEM Tazkia 2026 di Lemari Skin Kartu Anda.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifikasi Banner jika ada penghargaan baru terbuka */}
      {newlyUnlockedBadgeIds.length > 0 && (
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
                Selamat! Portofolio karya Anda telah membuka penghargaan baru. Badge bertanda merah
                di bawah siap dipajang di rak kartu Anda.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={onMarkAllSeen}
              className="px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              Tandai Sudah Dilihat
            </button>
          </div>
        </div>
      )}
    </>
  );
}

