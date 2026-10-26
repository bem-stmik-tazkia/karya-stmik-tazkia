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

      // Periksa apakah ini permintaan tertarget tunggal (Grant, Skin, atau Badge tertentu)
      const hasSingleGrant = Boolean(detail.grant);
      const isTargetedSkin =
        detail.skinId === "bem2026" ||
        detail.grant?.badgeId === 101 ||
        (detail.grant?.badgeName || "").toLowerCase().includes("skin") ||
        (detail.badgeIds?.length === 1 && detail.badgeIds[0] === 101);
      const isTargetedSingleBadge =
        Boolean(detail.badgeIds?.length === 1 && detail.badgeIds[0] !== 101 && !detail.skinId);

      // Ambil grants yang relevan
      let activeGrants: ExclusiveBadgeGrant[] = detail.claimableGrants || [];

      // ─── KASUS 1: TARGET TUNGGAL GRANT SPESIFIK ───
      if (hasSingleGrant && detail.grant) {
        const g = detail.grant;
        const isSkin =
          g.badgeId === 101 ||
          (g.badgeName || "").toLowerCase().includes("skin") ||
          detail.skinId === "bem2026";

        if (isSkin) {
          const skinDef = getSkinDefinition("bem2026");
          newItems.push({
            id: `skin_${g.id || "bem2026"}`,
            type: "skin",
            skin: skinDef,
            title: "BEM Tazkia 2026",
            subtitle: "Tema Kartu 3D Eksklusif",
            tierLabel: "HAK AKSES TEMA KARTU",
            note: g.note || detail.note,
            grantId: g.id,
            badgeId: 101,
            skinId: "bem2026",
            isClaimable: true,
          });
        } else {
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
        }
      }
      // ─── KASUS 2: TARGET TUNGGAL SKIN KARTU ───
      else if (isTargetedSkin && !isTargetedSingleBadge) {
        const skinDef = getSkinDefinition("bem2026");
        newItems.push({
          id: "skin_bem2026",
          type: "skin",
          skin: skinDef,
          title: "BEM Tazkia 2026",
          subtitle: "Tema Kartu 3D Eksklusif",
          tierLabel: "HAK AKSES TEMA KARTU",
          note: detail.note,
          badgeId: 101,
          skinId: "bem2026",
          isClaimable: true,
        });
      }
      // ─── KASUS 3: TARGET TUNGGAL LENCANA SPESIFIK ───
      else if (isTargetedSingleBadge) {
        const bId = detail.badgeIds![0];
        const b = getBadgeById(bId);
        if (b) {
          // Cari grant untuk note jika ada
          if (activeGrants.length === 0 && user?.id) {
            try {
              const allG = await getExclusiveBadgeGrants();
              activeGrants = getClaimableGrantsForUser(allG, {
                userId: user.id,
                email: user.email,
              });
            } catch {}
          }
          const matchingGrant = activeGrants.find((g) => g.badgeId === bId);
          const isActuallyClaimable = Boolean(matchingGrant) || b.group === "terbatas";

          newItems.push({
            id: `badge_${b.id}`,
            type: "badge",
            badge: b,
            title: b.name,
            subtitle:
              b.group === "terbatas"
                ? "Penghargaan Kehormatan Pengelola Kampus"
                : "Lencana Berhasil Diraih dari Portofolio",
            tierLabel: `TINGKAT ${b.tierLabel}`,
            note: matchingGrant?.note || detail.note,
            grantId: matchingGrant?.id,
            badgeId: b.id,
            isClaimable: isActuallyClaimable,
          });
        }
      }
      // ─── KASUS 4: KLAIM SEMUA / MULTIPLE NOTIFIKASI ───
      else {
        if (activeGrants.length === 0 && user?.id) {
          try {
            const allG = await getExclusiveBadgeGrants();
            activeGrants = getClaimableGrantsForUser(allG, {
              userId: user.id,
              email: user.email,
            });
          } catch {}
        }

        // 1. Skin grants
        const skinGrants = activeGrants.filter(
          (g) => g.badgeId === 101 || (g.badgeName || "").toLowerCase().includes("skin")
        );
        if (
          skinGrants.length > 0 ||
          detail.skinId === "bem2026" ||
          (detail.badgeIds && detail.badgeIds.includes(101))
        ) {
          const skinDef = getSkinDefinition("bem2026");
          const sg = skinGrants[0];
          newItems.push({
            id: "skin_bem2026",
            type: "skin",
            skin: skinDef,
            title: "BEM Tazkia 2026",
            subtitle: "Tema Kartu 3D Eksklusif",
            tierLabel: "HAK AKSES TEMA KARTU",
            note: sg?.note || detail.note,
            grantId: sg?.id,
            badgeId: 101,
            skinId: "bem2026",
            isClaimable: Boolean(sg),
          });
        }

        // 2. Lencana kehormatan eksklusif (bukan skin)
        activeGrants.forEach((g) => {
          if (g.badgeId === 101 || (g.badgeName || "").toLowerCase().includes("skin")) return;
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

        // 3. Portfolio badges
        if (detail.badgeIds && detail.badgeIds.length > 0) {
          detail.badgeIds.forEach((bId) => {
            if (bId === 101) return;
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

      // 1. Claim in badgeService (claims 101 & 'bem2026', NOT badge 15)
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

      // Kirim notifikasi ke Telegram bot
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "reward_claimed",
          rewardName: currentItem.title,
          category: "Skin Kartu Mahasiswa 3D",
          recipientName:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email ||
            "Mahasiswa",
        }),
      }).catch(() => {});

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

      // Kirim notifikasi ke Telegram bot
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "reward_claimed",
          rewardName: currentItem.title,
          category: "Lencana Kehormatan Kampus",
          recipientName:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email ||
            "Mahasiswa",
        }),
      }).catch(() => {});

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
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
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
          className="relative w-full max-w-[390px] max-h-[calc(100dvh-2rem)] sm:max-h-[90dvh] rounded-3xl bg-card border border-border shadow-2xl overflow-hidden z-10 text-center flex flex-col my-auto"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-40 bg-gradient-to-b from-amber-500/15 via-primary/10 to-transparent blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-3 right-3 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-20 cursor-pointer touch-manipulation"
            title="Tutup overlay"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="pt-5 sm:pt-6 px-5 sm:px-6 pb-2 relative z-10 shrink-0">
            {/* Step Counter if Multiple */}
            {items.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mb-2">
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

            <h3 className="text-base sm:text-xl font-extrabold text-foreground tracking-tight leading-snug">
              {currentItem.title}
            </h3>

            {currentItem.subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentItem.subtitle}
              </p>
            )}
          </div>

          {/* Center Visual Item Display */}
          <div className="px-4 sm:px-6 py-2 sm:py-3 flex flex-col items-center justify-start overflow-y-auto relative z-10 flex-1 overscroll-contain">
            {/* ─── CASE 1: SKIN KARTU 3D PREVIEW (Persis seperti thumbnail tema) ─── */}
            {currentItem.type === "skin" && (
              <div className="w-full flex justify-center py-1">
                {/* Mini Card Preview Container (Persis seperti lemari tema mahasiswa) */}
                <div className="w-full max-w-[270px] border-[1.5px] border-amber-500/40 bg-card rounded-[16px] p-2.5 shadow-sm text-left relative transition-all">
                  {/* Top right pill: Preview */}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold shadow-xs z-10 leading-none">
                    Preview
                  </span>

                  {/* Mini Card Header Graphic */}
                  <div
                    className="h-[62px] rounded-[10px] relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, #071936 0%, #132a56 50%, #2e1f10 100%)",
                    }}
                  >
                    {/* Mini Top-Right Tag */}
                    <span
                      className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[7.5px] font-mono font-black border backdrop-blur-xs"
                      style={{
                        backgroundColor: "rgba(245, 158, 11, 0.35)",
                        borderColor: "rgba(251, 191, 36, 0.7)",
                        color: "#fef08a",
                      }}
                    >
                      BEM &apos;26
                    </span>

                    {/* Bottom Accent Strip Line */}
                    <div
                      className="absolute left-0 right-0 bottom-0 h-[3px]"
                      style={{
                        background:
                          "linear-gradient(90deg, #f59e0b, #fde047, #f59e0b)",
                      }}
                    />

                    {/* Mini Avatar Ring */}
                    <div
                      className="absolute left-2.5 -bottom-2.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-amber-500"
                      style={{
                        boxShadow: "0 0 8px rgba(245, 158, 11, 0.5)",
                      }}
                    />
                  </div>

                  {/* Text & Metadata */}
                  <div className="mt-2.5 px-0.5">
                    <div className="font-bold text-xs text-foreground truncate">
                      BEM Tazkia 2026
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                      BEM &apos;26 · Mythic
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── CASE 2: BADGE / MEDALI PREVIEW (Hanya Lencana Kehormatan) ─── */}
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
          <div className="p-4 sm:p-6 pt-2 pb-4 sm:pb-6 border-t border-border bg-muted/20 relative z-10 flex flex-col gap-2 shrink-0">
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
                  {isProcessing ? "Mengklaim..." : "Gunakan Tema Kartu Ini Sekarang"}
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
                    : currentItem.type === "skin"
                    ? "Simpan ke Lemari Tema"
                    : "Pajang di Galeri Profil"}
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