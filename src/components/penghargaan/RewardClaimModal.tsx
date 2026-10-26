"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import {
  getBadgeById,
  type PenghargaanBadge,
} from "@/data/penghargaanCatalog";
import {
  getSkinDefinition,
  type SkinDefinition,
} from "@/components/cards";
import { TazkiaAchievementHexBadge } from "./TazkiaAchievementBadge";
import { claimExclusiveBadge } from "@/lib/badgeService";

export interface RewardItem {
  id: string;
  type: "badge" | "skin";
  badge?: PenghargaanBadge;
  skin?: SkinDefinition;
  title: string;
  subtitle?: string;
  tierLabel?: string;
  note?: string;
  grantId?: string;
  badgeId?: number;
  skinId?: string;
}

export function RewardClaimModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<RewardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isApplyingSkin, setIsApplyingSkin] = useState(false);

  const markBadgesSeen = useCallback(
    (badgeIds: number[]) => {
      if (!user?.id || badgeIds.length === 0) return;
      try {
        const seenKey = `tazkia_seen_badges_${user.id}`;
        const raw = localStorage.getItem(seenKey);
        const seen: number[] = raw ? JSON.parse(raw) : [];
        const merged = Array.from(new Set([...seen, ...badgeIds]));
        localStorage.setItem(seenKey, JSON.stringify(merged));
        localStorage.removeItem("tazkia_has_unopened_badge");
        window.dispatchEvent(new Event("tazkia_badges_updated"));
      } catch (err) {
        console.warn("Could not mark badges seen:", err);
      }
    },
    [user?.id]
  );

  // Listen to open event
  useEffect(() => {
    const handleOpenModal = (e: Event) => {
      const customEvent = e as CustomEvent<{
        badgeIds?: number[];
        skinId?: string;
        grant?: {
          id: string;
          badgeId: number;
          badgeName: string;
          note?: string;
        };
        note?: string;
      }>;

      const detail = customEvent.detail || {};
      const newItems: RewardItem[] = [];

      // 1. If skin is granted or specified
      if (detail.skinId || detail.grant?.badgeId === 15) {
        const targetSkinId = detail.skinId || "bem2026";
        const skinDef = getSkinDefinition(targetSkinId);
        const bemBadge = getBadgeById(15);

        newItems.push({
          id: `skin_${targetSkinId}`,
          type: "skin",
          skin: skinDef,
          badge: bemBadge,
          title: skinDef.name || "Skin Kartu BEM Tazkia 2026",
          subtitle: "Tema Kartu 3D Eksklusif & Lencana Kehormatan",
          tierLabel: "MYTHIC · HAK AKSES RESMI",
          note: detail.note || detail.grant?.note,
          grantId: detail.grant?.id,
          badgeId: 15,
          skinId: targetSkinId,
        });
      }

      // 2. If explicit badge grant without skin
      if (detail.grant && detail.grant.badgeId !== 15) {
        const b = getBadgeById(detail.grant.badgeId);
        if (b) {
          newItems.push({
            id: `badge_grant_${b.id}`,
            type: "badge",
            badge: b,
            title: b.name,
            subtitle: `Penghargaan Tingkat ${b.tierLabel}`,
            tierLabel: b.tierLabel,
            note: detail.grant.note || detail.note,
            grantId: detail.grant.id,
            badgeId: b.id,
          });
        }
      }

      // 3. If list of unlocked badge IDs (e.g. from floating notification)
      if (detail.badgeIds && detail.badgeIds.length > 0) {
        detail.badgeIds.forEach((bId) => {
          // If already included via skin/grant above, avoid duplicate
          if (newItems.some((it) => it.badgeId === bId)) return;

          const b = getBadgeById(bId);
          if (b) {
            newItems.push({
              id: `badge_${b.id}`,
              type: "badge",
              badge: b,
              title: b.name,
              subtitle: `Lencana ${b.tierLabel} Berhasil Diraih`,
              tierLabel: b.tierLabel,
              badgeId: b.id,
            });
          }
        });
      }

      if (newItems.length > 0) {
        setItems(newItems);
        setCurrentIndex(0);
        setIsOpen(true);
      }
    };

    window.addEventListener("tazkia_open_reward_modal", handleOpenModal);
    return () => {
      window.removeEventListener("tazkia_open_reward_modal", handleOpenModal);
    };
  }, []);

  const handleClose = () => {
    // Mark all badges in modal as seen
    const allBadgeIds = items
      .map((it) => it.badgeId)
      .filter((id): id is number => typeof id === "number");
    markBadgesSeen(allBadgeIds);
    setIsOpen(false);
  };

  const currentItem = items[currentIndex];

  const handleApplySkin = async () => {
    if (!currentItem?.skinId || !user) return;
    setIsApplyingSkin(true);
    const toastId = toast.loading("Memasang tema kartu ke profil...");
    try {
      const skinId = currentItem.skinId;

      if (typeof window !== "undefined") {
        localStorage.setItem("tazkia_profile_skin", skinId);
        localStorage.setItem(`tazkia_profile_skin_${user.id}`, skinId);
      }

      await supabase
        .from("mahasiswa_profiles")
        .update({ card_skin: skinId })
        .eq("user_id", user.id);

      if (currentItem.grantId && currentItem.badgeId) {
        await claimExclusiveBadge(currentItem.badgeId, user.id, currentItem.grantId);
      }

      window.dispatchEvent(new Event("tazkia_skin_updated"));
      window.dispatchEvent(new Event("tazkia_badges_updated"));

      toast.success("Tema Skin Kartu BEM 2026 kini aktif di profil Anda!", {
        id: toastId,
      });

      if (currentIndex < items.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        handleClose();
      }
    } catch {
      toast.error("Gagal memasang tema kartu. Silakan coba kembali.", { id: toastId });
    } finally {
      setIsApplyingSkin(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!isOpen || !currentItem) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop with Ambient Glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 360, damping: 26 }}
          className="relative w-full max-w-[430px] rounded-3xl bg-card border border-border/80 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden z-10 text-center flex flex-col my-auto"
        >
          {/* Subtle Golden/Blue Top Ambient Lighting */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-40 bg-gradient-to-b from-amber-500/25 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-20 cursor-pointer"
            title="Tutup overlay"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="pt-6 px-6 pb-2 relative z-10">
            {/* Step Counter if Multiple */}
            {items.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mb-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold border border-primary/20">
                  Penghargaan {currentIndex + 1} dari {items.length}
                </span>
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentItem.tierLabel || "Selamat! Hadiah Diraih"}</span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight leading-snug">
              {currentItem.title}
            </h3>

            {currentItem.subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {currentItem.subtitle}
              </p>
            )}
          </div>

          {/* Center Visual Item Display */}
          <div className="px-6 py-4 flex flex-col items-center justify-center relative z-10">
            {/* ─── CASE 1: SKIN KARTU 3D PREVIEW (UNLOCKED) ─── */}
            {currentItem.type === "skin" && (
              <div className="w-full space-y-3">
                {/* Mini Card Preview with Golden Unlocked Theme */}
                <div className="relative w-full rounded-2xl border-2 border-amber-500/80 bg-gradient-to-b from-slate-900 to-[#071936] p-4 text-white shadow-[0_12px_30px_rgba(245,158,11,0.25)] overflow-hidden">
                  {/* Subtle matrix pattern */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

                  {/* Top Header Row */}
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9.5px] font-mono font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span>EDISI BEM 2026</span>
                    </span>

                    {/* Unlocked status badge */}
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-[10px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Hak Akses Terbuka</span>
                    </span>
                  </div>

                  {/* Header Banner Graphic */}
                  <div className="h-16 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 relative flex items-center px-4 overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-[radial-gradient(#00000020_1px,transparent_1px)] [background-size:8px_8px]" />
                    <div className="relative z-10">
                      <div className="text-[10px] font-black uppercase text-slate-950 tracking-wider">
                        Skin Kartu 3D
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate">
                        BEM STMIK Tazkia 2026
                      </div>
                    </div>
                  </div>

                  {/* Avatar Ring & Info */}
                  <div className="flex items-center gap-3 mt-3 relative z-10">
                    <div className="w-10 h-10 rounded-full border-2 border-amber-400 bg-slate-900 shadow-md flex items-center justify-center font-black text-amber-400 text-xs shrink-0">
                      26
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-100 truncate">
                        Tema Emas &amp; Glow 3D Aktif
                      </div>
                      <div className="text-[10.5px] text-slate-400 truncate">
                        Siap dipasang di direktori dan portofolio kartu
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accompanying Hex Badge */}
                {currentItem.badge && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left text-xs">
                    <div className="shrink-0">
                      <TazkiaAchievementHexBadge
                        badge={currentItem.badge}
                        size="sm"
                        locked={false}
                        animated={true}
                        showTooltip={false}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-foreground text-xs truncate">
                        + Lencana Kehormatan: {currentItem.badge.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {currentItem.badge.mission}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── CASE 2: BADGE / MEDALI PREVIEW ─── */}
            {currentItem.type === "badge" && currentItem.badge && (
              <div className="flex flex-col items-center space-y-3 w-full">
                {/* 3D Hex Badge with Radiant Spotlight */}
                <div className="relative p-4 flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
                  <TazkiaAchievementHexBadge
                    badge={currentItem.badge}
                    size="lg"
                    locked={false}
                    animated={true}
                    showTooltip={false}
                  />
                </div>

                {/* Mission & Philosophy Box */}
                <div className="w-full p-3 rounded-2xl bg-muted/50 border border-border text-left space-y-1.5 text-xs">
                  <div>
                    <span className="font-bold text-foreground text-xs">Misi Tercapai: </span>
                    <span className="text-muted-foreground leading-relaxed">
                      {currentItem.badge.mission}
                    </span>
                  </div>
                  {currentItem.badge.philosophy && (
                    <div className="pt-1 border-t border-border/60">
                      <span className="text-muted-foreground italic text-[11px] leading-relaxed">
                        &ldquo;{currentItem.badge.philosophy}&rdquo;
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Note from Admin / Pengelola if exists */}
            {currentItem.note && (
              <div className="w-full mt-3 p-3 rounded-xl bg-primary/5 border border-primary/20 text-left text-xs space-y-1">
                <span className="font-bold text-primary text-[11px] block">
                  Pesan Pengelola Kampus:
                </span>
                <p className="text-muted-foreground italic text-xs leading-relaxed">
                  &ldquo;{currentItem.note}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer / Action Buttons */}
          <div className="p-6 pt-2 pb-6 border-t border-border bg-muted/20 relative z-10 flex flex-col gap-2">
            {/* If Skin: Direct Apply Button */}
            {currentItem.type === "skin" && (
              <button
                type="button"
                onClick={handleApplySkin}
                disabled={isApplyingSkin}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm hover:brightness-105 transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  {isApplyingSkin ? "Sedang Memasang..." : "Gunakan Tema Kartu Ini Sekarang"}
                </span>
              </button>
            )}

            {/* Navigation / Next or Finish Buttons */}
            <div className="flex items-center gap-2">
              {items.length > 1 && currentIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  currentItem.type === "skin"
                    ? "bg-card hover:bg-muted border border-border text-foreground"
                    : "bg-primary hover:bg-primary/90 text-white shadow-xs"
                }`}
              >
                <span>
                  {currentIndex < items.length - 1
                    ? "Penghargaan Berikutnya"
                    : currentItem.type === "skin"
                    ? "Simpan ke Lemari Tema"
                    : "Pajang di Galeri Profil"}
                </span>
                {currentIndex < items.length - 1 ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default RewardClaimModal;