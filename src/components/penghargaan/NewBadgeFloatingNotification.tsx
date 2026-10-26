"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, ArrowRight, Mail, CreditCard } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import {
  calculateStudentEarnedBadges,
  getBadgeById,
} from "@/data/penghargaanCatalog";
import { EXCLUSIVE_REWARDS_CATALOG } from "@/data/exclusiveRewardsCatalog";
import {
  getExclusiveBadgeGrants,
  getClaimableGrantsForUser,
  getClaimedExclusiveBadgeIds,
} from "@/lib/badgeService";
import { TazkiaAchievementHexBadge } from "./TazkiaAchievementBadge";

export function NewBadgeFloatingNotification() {
  const { user } = useAuth();
  const pathname = usePathname();

  const [newBadgeIds, setNewBadgeIds] = useState<number[]>([]);
  const [claimableGrantsState, setClaimableGrantsState] = useState<any[]>([]);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Jangan tampilkan jika:
  // 1. Belum login
  // 2. Berada di halaman auth/login, maintenance, atau admin portal
  const isExcludedPage =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/maintenance") ||
    pathname?.startsWith("/admin");

  useEffect(() => {
    // Reset dismissal jika user berpindah halaman atau login
    setIsDismissed(false);
  }, [pathname, user?.id]);

  useEffect(() => {
    if (!user || isExcludedPage) {
      setNewBadgeIds([]);
      return;
    }

    let isMounted = true;

    async function evaluateBadges() {
      try {
        const uid = user!.id;
        const seenKey = `tazkia_seen_badges_${uid}`;
        let seen: number[] = [];
        try {
          const raw = localStorage.getItem(seenKey);
          if (raw) seen = JSON.parse(raw);
        } catch {}

        // Cek apakah user telah mendismiss notifikasi sesi ini
        const dismissedSession = sessionStorage.getItem(`tazkia_badge_toast_dismissed_${uid}`);
        if (dismissedSession === "true") {
          setIsDismissed(true);
        }

        // Ambil profil user, karya user, serta daftar grant eksklusif
        const [grants, { data: profile }, { data: allApproved }, { data: myKarya }] = await Promise.all([
          getExclusiveBadgeGrants(),
          supabase.from("mahasiswa_profiles").select("*").eq("user_id", uid).maybeSingle(),
          supabase.from("karya").select("id, likes, views").eq("status", "approved"),
          supabase.from("karya").select("*").neq("status", "deleted").or(`user_id.eq.${uid},team.cs.[{"user_id":"${uid}"}]`),
        ]);

        if (!isMounted) return;

        const top3CuratorIds = new Set(
          (allApproved || [])
            .sort((a: any, b: any) => ((b.likes || 0) * 3 + (b.views || 0)) - ((a.likes || 0) * 3 + (a.views || 0)))
            .slice(0, 3)
            .map((k: any) => k.id)
        );

        const evaluatedProjects = (myKarya || []).map((k: any) => {
          const isCurator = top3CuratorIds.has(k.id);
          const liveDemoUrl = k.live_url || k.demo_url || "";
          return {
            ...k,
            likes: k.likes || 0,
            views: k.views || 0,
            likes_count: k.likes || 0,
            views_count: k.views || 0,
            live_url: liveDemoUrl,
            demo_url: liveDemoUrl,
            is_featured: isCurator,
            is_curator_spotlight: isCurator,
          };
        });

        // Ambil lencana eksklusif yang bisa diklaim
        const claimableGrants = getClaimableGrantsForUser(grants, {
          userId: uid,
          email: user?.email,
          studentId: profile?.id,
        });

        // Hitung earned badges
        const earned = calculateStudentEarnedBadges({
          userId: uid,
          projects: evaluatedProjects,
          angkatan: profile?.angkatan,
          skills: profile?.skills || [],
          bio: profile?.bio,
          statusBadge: profile?.status_badge,
          unlockedBadgeIds: (profile as any)?.unlockedBadgeIds || (profile as any)?.unlocked_badge_ids,
          claimedBadgeIds: getClaimedExclusiveBadgeIds(uid),
        });

        const unreadEarned = earned.filter((id) => !seen.includes(id));
        // Lencana/skin yang belum diklaim (claimable) selalu aktif & harus ditampilkan hingga diklaim
        const unreadClaimable = claimableGrants.map((g) => Number(g.badgeId));
        const allNewIds = Array.from(new Set([...unreadEarned, ...unreadClaimable]));

        if (isMounted) {
          setNewBadgeIds(allNewIds);
          setClaimableGrantsState(claimableGrants);
          if (allNewIds.length > 0) {
            localStorage.setItem("tazkia_has_unopened_badge", "true");
          }
        }
      } catch (err) {
        console.error("Gagal memeriksa notifikasi penghargaan baru:", err);
      }
    }

    evaluateBadges();

    const handleUpdate = () => evaluateBadges();
    window.addEventListener("tazkia_badges_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("tazkia_badges_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [user?.id, user?.email, isExcludedPage]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    if (user?.id) {
      sessionStorage.setItem(`tazkia_badge_toast_dismissed_${user.id}`, "true");
    }
  };

  const handleOpenInbox = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Buka Kotak Pesan di navbar atas
    window.dispatchEvent(new CustomEvent("tazkia_open_inbox"));
    // Tutup toast melayang agar tidak menumpuk saat kotak pesan terbuka
    setIsDismissed(true);
  };

  if (!user || isExcludedPage || isDismissed || newBadgeIds.length === 0) {
    return null;
  }

  const matchedExclusive = EXCLUSIVE_REWARDS_CATALOG.find(
    (r) => r.badgeId === newBadgeIds[0]
  );
  const badgeObj =
    getBadgeById(newBadgeIds[0]) ||
    (matchedExclusive ? getBadgeById(matchedExclusive.badgeId) : null);

  const isSkin =
    !badgeObj &&
    (matchedExclusive?.category === "skin" ||
      newBadgeIds[0] === 101 ||
      (matchedExclusive?.name || "").toLowerCase().includes("skin"));

  const badgeTitle =
    badgeObj?.name || matchedExclusive?.name || (isSkin ? "Skin BEM Tazkia 2026" : "Penghargaan Baru");
  const otherCount = newBadgeIds.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        onClick={handleOpenInbox}
        className="fixed z-50 bottom-[90px] sm:bottom-6 right-3 sm:right-6 max-w-[390px] w-[calc(100%-24px)] cursor-pointer group"
        role="alert"
        aria-live="polite"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1F4A]/98 via-[#0F265C]/98 to-[#132E6E]/98 dark:from-[#0B1F4A]/98 dark:via-[#0E204A]/98 dark:to-[#081533]/98 text-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] border-2 border-amber-400/60 ring-2 ring-amber-400/20 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_50px_rgba(245,158,11,0.25)] hover:border-amber-400">
          
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/20 blur-2xl group-hover:bg-amber-400/30 transition-all duration-500" />
          <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer"
            title="Tutup notifikasi"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            {/* Medallion Preview / Badge Icon */}
            <div className="relative shrink-0 pt-0.5">
              {badgeObj ? (
                <div className="relative flex items-center justify-center">
                  <TazkiaAchievementHexBadge
                    badge={badgeObj}
                    size="sm"
                    locked={false}
                    animated={true}
                    showTooltip={false}
                  />
                  {otherCount > 0 && (
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 border border-amber-300 shadow-sm animate-pulse">
                      +{otherCount}
                    </span>
                  )}
                </div>
              ) : isSkin ? (
                <div className="relative w-13 h-11 rounded-xl overflow-hidden bg-gradient-to-b from-[#071936] to-[#12284e] border-2 border-amber-400/80 shadow-md shadow-amber-500/25 flex flex-col justify-between p-1 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] font-black uppercase tracking-tighter bg-amber-400 text-slate-950 px-1 rounded-[2px] leading-tight">
                      BEM &apos;26
                    </span>
                    <span className="text-[6.5px] font-mono font-bold text-amber-300">
                      Mythic
                    </span>
                  </div>
                  {/* Bottom gold curve preview matching Screenshot 3 */}
                  <div className="relative flex items-center justify-between z-10 pt-0.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[7px] font-bold font-mono text-amber-300/80">3D</span>
                  </div>
                  <div className="absolute -bottom-1 -left-1 -right-1 h-2.5 bg-amber-400/30 rounded-t-full blur-[1px]" />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-orange-500/30">
                  <Trophy className="w-6 h-6 text-slate-950" />
                </div>
              )}
            </div>

            {/* Content Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  <span>{isSkin ? "Tema Skin Kartu Baru" : "Penghargaan Baru Diraih"}</span>
                </span>
              </div>

              <h4 className="text-[14px] font-extrabold text-white tracking-tight leading-snug truncate">
                {badgeTitle}
                {otherCount > 0 ? ` & ${otherCount} Lainnya` : ""}
              </h4>

              <p className="text-[11.5px] text-slate-300 leading-snug line-clamp-2 mt-0.5">
                {isSkin
                  ? "Kamu mendapatkan akses tema Skin Kartu 3D eksklusif! Klik untuk membuka Kotak Pesan & mengklaimnya."
                  : "Karyamu baru saja membuka penghargaan baru! Klik untuk membuka Kotak Pesan & mengklaimnya."}
              </p>
            </div>
          </div>

          {/* Action Footer Button */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 group-hover:underline flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>Buka di Kotak Pesan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {newBadgeIds.length} Tersedia
            </span>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default NewBadgeFloatingNotification;
