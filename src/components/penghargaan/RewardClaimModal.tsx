"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  Mail,
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
import {
  claimExclusiveBadge,
  getExclusiveBadgeGrants,
  getClaimableGrantsForUser,
  type ExclusiveBadgeGrant,
} from "@/lib/badgeService";

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
  isClaimable?: boolean;
}

export function RewardClaimModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<RewardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

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
    const handleOpenModal = async (e: Event) => {
      const customEvent = e as CustomEvent<{
        badgeIds?: number[];
        skinId?: string;
        claimableGrants?: ExclusiveBadgeGrant[];
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

      // Fetch or use claimable grants for the active user
      let activeGrants: ExclusiveBadgeGrant[] = detail.claimableGrants || [];
      if (activeGrants.length === 0 && user?.id) {
        try {
          const allG = await getExclusiveBadgeGrants();
          activeGrants = getClaimableGrantsForUser(allG, {
            userId: user.id,
            email: user.email,
          });
        } catch {}
      }

      const bemGrant =
        activeGrants.find((g) => g.badgeId === 15) ||
        (detail.grant?.badgeId === 15 ? (detail.grant as ExclusiveBadgeGrant) : undefined);

      // 1. If BEM Skin (badge 15 or explicit skinId "bem2026")
      const includesBEM =
        detail.skinId === "bem2026" ||
        detail.grant?.badgeId === 15 ||
        Boolean(bemGrant) ||
        (detail.badgeIds && detail.badgeIds.includes(15));

      if (includesBEM) {
        const skinDef = getSkinDefinition("bem2026");
        const bemBadge = getBadgeById(15);
        const grantNote = bemGrant?.note || detail.note || detail.grant?.note;

        newItems.push({
          id: "skin_bem2026",
          type: "skin",
          skin: skinDef,
          badge: bemBadge,
          title: "Lencana Kehormatan & Skin BEM 2026",
          subtitle: "Pesan Resmi Apresiasi Fungsionaris BEM STMIK Tazkia",
          tierLabel: "HAK AKSES RESMI BEM",
          note: grantNote,
          grantId: bemGrant?.id,
          badgeId: 15,
          skinId: "bem2026",
          isClaimable: Boolean(bemGrant),
        });
      }

      // 2. Handle other claimable exclusive grants (e.g. badge 14 or 16)
      activeGrants.forEach((g) => {
        if (g.badgeId === 15) return; // already added above
        if (newItems.some((it) => it.badgeId === g.badgeId)) return;

        const b = getBadgeById(g.badgeId);
        if (b) {
          newItems.push({
            id: `exclusive_grant_${g.id}`,
            type: "badge",
            badge: b,
            title: b.name,
            subtitle: "Penghargaan Kehormatan Pengelola Kampus",
            tierLabel: `TINGKAT ${b.tierLabel}`,
            note: g.note || detail.note,
            grantId: g.id,
            badgeId: b.id,
            isClaimable: true,
          });
        }
      });

      // 3. Handle explicit grant passed in detail (if not badge 15)
      if (detail.grant && detail.grant.badgeId !== 15) {
        if (!newItems.some((it) => it.badgeId === detail.grant!.badgeId)) {
          const b = getBadgeById(detail.grant.badgeId);
          if (b) {
            newItems.push({
              id: `grant_${detail.grant.id}`,
              type: "badge",
              badge: b,
              title: b.name,
              subtitle: "Penghargaan Kehormatan Pengelola Kampus",
              tierLabel: `TINGKAT ${b.tierLabel}`,
              note: detail.grant.note || detail.note,
              grantId: detail.grant.id,
              badgeId: b.id,
              isClaimable: true,
            });
          }
        }
      }

      // 4. Handle remaining earned badges from portfolio (like Karya Perdana, etc.)
      if (detail.badgeIds && detail.badgeIds.length > 0) {
        detail.badgeIds.forEach((bId) => {
          if (newItems.some((it) => it.badgeId === bId)) return;

          const b = getBadgeById(bId);
          if (b) {
            newItems.push({
              id: `earned_badge_${b.id}`,
              type: "badge",
              badge: b,
              title: b.name,
              subtitle: "Lencana Berhasil Diraih dari Portofolio",
              tierLabel: `TINGKAT ${b.tierLabel}`,
              badgeId: b.id,
              isClaimable: false,
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
  }, [user]);

  const handleClose = () => {
    const allBadgeIds = items
      .map((it) => it.badgeId)
      .filter((id): id is number => typeof id === "number");
    markBadgesSeen(allBadgeIds);
    setIsOpen(false);
  };

  const currentItem = items[currentIndex];

  // Action: Klaim & pasang skin kartu sekarang
  const handleClaimAndApplySkin = async () => {
    if (!currentItem?.skinId || !user) return;
    setIsProcessing(true);
    const toastId = toast.loading("Mengklaim hak akses & memasang tema...");
    try {
      const skinId = currentItem.skinId;

      // 1. Claim in badgeService
      if (currentItem.badgeId) {
        await claimExclusiveBadge(currentItem.badgeId, user.id, currentItem.grantId);
      }

      // 2. Save active skin to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("tazkia_profile_skin", skinId);
        localStorage.setItem(`tazkia_profile_skin_${user.id}`, skinId);
      }

      // 3. Update profile in Supabase
      await supabase
        .from("mahasiswa_profiles")
        .update({ card_skin: skinId })
        .eq("user_id", user.id);

      // 4. Mark notifications of type 'badge_granted' as read
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("type", "badge_granted");

      // 5. Update local modal state so isClaimable becomes false
      setItems((prev) =>
        prev.map((it, idx) =>
          idx === currentIndex ? { ...it, isClaimable: false } : it
        )
      );

      // 6. Dispatch events
      window.dispatchEvent(new Event("tazkia_skin_updated"));
      window.dispatchEvent(new Event("tazkia_badges_updated"));

      toast.success("Tema Skin Kartu BEM 2026 berhasil diklaim & aktif di profil!", {
        id: toastId,
      });

      if (currentIndex < items.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        handleClose();
      }
    } catch {
      toast.error("Gagal memproses klaim tema. Silakan coba kembali.", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  // Action: Klaim lencana biasa
  const handleClaimBadgeOnly = async () => {
    if (!currentItem?.badgeId || !user) return;
    setIsProcessing(true);
    const toastId = toast.loading("Mengklaim lencana kehormatan...");
    try {
      await claimExclusiveBadge(currentItem.badgeId, user.id, currentItem.grantId);

      // Mark notifications as read
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("type", "badge_granted");

      setItems((prev) =>
        prev.map((it, idx) =>
          idx === currentIndex ? { ...it, isClaimable: false } : it
        )
      );

      window.dispatchEvent(new Event("tazkia_badges_updated"));
      toast.success(`Lencana "${currentItem.title}" berhasil diklaim!`, { id: toastId });

      if (currentIndex < items.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        handleClose();
      }
    } catch {
      toast.error("Gagal mengklaim lencana. Silakan coba kembali.", { id: toastId });
    } finally {
      setIsProcessing(false);
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
        {/* Backdrop */}
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
          className="relative w-full max-w-[420px] rounded-3xl bg-card border border-border shadow-2xl overflow-hidden z-10 text-center flex flex-col my-auto"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-40 bg-gradient-to-b from-amber-500/20 via-primary/10 to-transparent blur-3xl pointer-events-none" />

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

            {/* Clean Pill (No AI slop / No Sparkles) */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-[10.5px] font-mono font-bold tracking-wider mb-2">
              <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{currentItem.tierLabel || "PENGHARGAAN KAMPUS"}</span>
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
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

                  {/* Top Header Row */}
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9.5px] font-mono font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span>EDISI BEM 2026</span>
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-[10px] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{currentItem.isClaimable ? "Siap Diklaim" : "Hak Akses Aktif"}</span>
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
                        Tema Emas &amp; Glow 3D
                      </div>
                      <div className="text-[10.5px] text-slate-400 truncate">
                        Tampil di direktori mahasiswa &amp; profil
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

                <div className="w-full p-3 rounded-2xl bg-muted/50 border border-border text-left space-y-1.5 text-xs">
                  <div>
                    <span className="font-bold text-foreground text-xs">Misi: </span>
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

            {/* Note from Pengelola if exists */}
            {currentItem.note && (
              <div className="w-full mt-3 p-3 rounded-xl bg-primary/5 border border-primary/20 text-left text-xs space-y-1">
                <span className="font-bold text-foreground text-[11px] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Pesan Pengelola Kampus:</span>
                </span>
                <p className="text-muted-foreground italic text-xs leading-relaxed">
                  &ldquo;{currentItem.note}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer / Action Buttons */}
          <div className="p-6 pt-2 pb-6 border-t border-border bg-muted/20 relative z-10 flex flex-col gap-2">
            {/* If Skin & Claimable: Claim & Apply Button */}
            {currentItem.type === "skin" && currentItem.isClaimable && (
              <button
                type="button"
                onClick={handleClaimAndApplySkin}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm hover:brightness-105 transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  {isProcessing ? "Mengklaim..." : "Klaim & Gunakan Tema BEM Sekarang"}
                </span>
              </button>
            )}

            {/* If Badge & Claimable: Claim Badge Button */}
            {currentItem.type === "badge" && currentItem.isClaimable && (
              <button
                type="button"
                onClick={handleClaimBadgeOnly}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  {isProcessing ? "Mengklaim..." : "Klaim Lencana Ini Sekarang"}
                </span>
              </button>
            )}

            {/* If Skin Already Claimed: Apply Skin Button */}
            {currentItem.type === "skin" && !currentItem.isClaimable && (
              <button
                type="button"
                onClick={handleClaimAndApplySkin}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Crown className="w-4 h-4" />
                <span>Gunakan Tema BEM Ini</span>
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
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 bg-card hover:bg-muted border border-border text-foreground"
              >
                <span>
                  {currentIndex < items.length - 1
                    ? "Penghargaan Berikutnya"
                    : "Selesai & Tutup"}
                </span>
                {currentIndex < items.length - 1 ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
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