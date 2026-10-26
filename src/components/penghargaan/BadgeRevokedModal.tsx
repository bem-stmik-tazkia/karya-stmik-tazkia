"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, ShieldAlert, ArrowRight, Ban, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { TazkiaAchievementHexBadge } from "@/components/penghargaan/TazkiaAchievementBadge";
import { PENGHARGAAN_CATALOG, getBadgeById } from "@/data/penghargaanCatalog";
import { EXCLUSIVE_REWARDS_CATALOG } from "@/data/exclusiveRewardsCatalog";

export interface RevokeModalDetail {
  id?: string;
  title?: string;
  message?: string;
  badgeId?: string | number | null;
  rewardName?: string;
  note?: string;
}

export function BadgeRevokedModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [detail, setDetail] = useState<RevokeModalDetail | null>(null);

  // 1. Listen to custom event to open revoke modal
  useEffect(() => {
    const handleOpen = (e: any) => {
      const data = e?.detail as RevokeModalDetail;
      if (data) {
        setDetail(data);
        setIsOpen(true);
      }
    };

    window.addEventListener("tazkia_open_revoke_modal", handleOpen);
    return () => {
      window.removeEventListener("tazkia_open_revoke_modal", handleOpen);
    };
  }, []);

  // 2. Check for unread 'badge_revoked' notification on mount
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    async function checkRevocation() {
      try {
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user!.id)
          .eq("type", "badge_revoked")
          .eq("is_read", false)
          .order("created_at", { ascending: false })
          .limit(1);

        if (isMounted && data && data.length > 0) {
          const latestNotif = data[0];
          const sessionKey = `tazkia_revoke_seen_${latestNotif.id}`;
          if (sessionStorage.getItem(sessionKey) !== "true") {
            setDetail({
              id: latestNotif.id,
              title: latestNotif.title,
              message: latestNotif.message,
              badgeId: latestNotif.karya_id,
            });
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.warn("Could not check revocation notifications:", err);
      }
    }

    checkRevocation();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // 3. Realtime listener for incoming 'badge_revoked' notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("user-revocations-" + user.id)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const newNotif = payload.new as any;
          if (newNotif && newNotif.type === "badge_revoked") {
            try {
              const { getExclusiveBadgeGrants } = await import("@/lib/badgeService");
              await getExclusiveBadgeGrants();
            } catch {}
            window.dispatchEvent(new Event("tazkia_badges_updated"));
            window.dispatchEvent(new Event("tazkia_skin_updated"));
            window.dispatchEvent(new Event("tazkia_profile_skin_updated"));
            setDetail({
              id: newNotif.id,
              title: newNotif.title,
              message: newNotif.message,
              badgeId: newNotif.karya_id,
            });
            setIsOpen(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleClose = async () => {
    if (detail?.id && user) {
      try {
        sessionStorage.setItem(`tazkia_revoke_seen_${detail.id}`, "true");
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", detail.id);
        window.dispatchEvent(new Event("tazkia_badges_updated"));
      } catch {}
    }
    setIsOpen(false);
  };

  if (!isOpen || !detail) return null;

  // Extract reward name & clean note from message if available
  const rewardName =
    detail.rewardName ||
    detail.title?.replace(/^Pemberitahuan Penarikan (Tema|Lencana):\s*/i, "") ||
    "Penghargaan Kampus";

  let cleanNote = detail.note;
  if (!cleanNote && detail.message) {
    const noteMatch = detail.message.match(/Catatan Pengelola:\s*["“](.*?)["”]/i);
    if (noteMatch) {
      cleanNote = noteMatch[1];
    }
  }

  // Identifikasi apakah yang ditarik adalah skin atau lencana
  const matchedReward = EXCLUSIVE_REWARDS_CATALOG.find(
    (r) =>
      (detail.badgeId && String(r.badgeId) === String(detail.badgeId)) ||
      (rewardName && r.name.toLowerCase().includes(rewardName.toLowerCase())) ||
      (rewardName && rewardName.toLowerCase().includes(r.name.toLowerCase()))
  );

  const isSkin =
    matchedReward?.category === "skin" ||
    String(detail.badgeId) === "101" ||
    (rewardName || "").toLowerCase().includes("skin") ||
    (rewardName || "").toLowerCase().includes("tema") ||
    (detail.title || "").toLowerCase().includes("tema");

  const badgeObj =
    (matchedReward ? getBadgeById(matchedReward.badgeId) : null) ||
    (detail.badgeId ? getBadgeById(Number(detail.badgeId)) : null) ||
    PENGHARGAAN_CATALOG.find(
      (b) =>
        rewardName.toLowerCase().includes(b.name.toLowerCase()) ||
        b.name.toLowerCase().includes(rewardName.toLowerCase())
    );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card border border-rose-500/30 shadow-[0_20px_60px_rgba(244,63,94,0.18)] p-6 z-10 text-foreground"
          role="dialog"
          aria-modal="true"
        >
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 bg-rose-500/15 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />

          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            title="Tutup dialog"
            aria-label="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Badge */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-inner mb-4">
              <RotateCcw className="w-7 h-7 stroke-[2.5]" />
            </div>

            {/* Tag */}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Pemberitahuan Penarikan Resmi</span>
            </span>

            {/* Title */}
            <h3 className="text-lg font-black tracking-tight text-foreground sm:text-xl">
              Penghargaan Ditarik Kembali
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Hak akses atau lencana kehormatan kampus telah dinonaktifkan
            </p>

            {/* Visual Preview Container */}
            {isSkin ? (
              <div className="w-full mt-4 p-3 rounded-2xl bg-muted/40 border border-border/80 flex flex-col gap-2.5 text-left">
                <div
                  className="relative h-24 sm:h-28 rounded-xl overflow-hidden border border-amber-500/40 shadow-inner flex flex-col justify-between p-3"
                  style={{
                    background: "linear-gradient(135deg, #071936 0%, #132a56 50%, #2e1f10 100%)",
                  }}
                >
                  <div className="absolute -right-6 -top-6 w-28 h-28 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1.2px,transparent_1.2px)] [background-size:12px_12px] pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs border border-amber-200">
                      BEM EKSEKUTIF &apos;26
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-950/70 border border-amber-400/40 text-amber-300">
                      Mythic 3D
                    </span>
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-white text-xs font-bold tracking-wide">
                      {matchedReward?.name || rewardName}
                    </span>
                    <span className="text-amber-500/25 font-black text-3xl font-mono select-none">
                      2026
                    </span>
                  </div>

                  {/* Overlaid Revoke Badge */}
                  <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[1px] flex items-center justify-center z-20">
                    <div className="px-3 py-1 rounded-full bg-rose-500/95 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-white/20">
                      <Ban className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Akses Tema Dinonaktifkan</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs px-0.5 pt-0.5">
                  <div className="min-w-0 pr-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Tema Skin Kartu:
                    </div>
                    <div className="text-sm font-black text-foreground truncate mt-0.5">
                      {matchedReward?.name || rewardName}
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    Kembali ke Classic
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full mt-4 p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center gap-3.5 text-left">
                <div className="relative shrink-0">
                  {badgeObj ? (
                    <div className="relative flex items-center justify-center">
                      <div className="opacity-60 grayscale contrast-125">
                        <TazkiaAchievementHexBadge
                          badge={badgeObj}
                          size="md"
                          locked={false}
                          animated={false}
                          showTooltip={false}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md border-2 border-white">
                          <Ban className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-inner">
                      <Award className="w-7 h-7 stroke-[2]" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Lencana Kehormatan:
                  </div>
                  <div className="text-sm font-black text-foreground truncate mt-0.5">
                    {badgeObj?.name || rewardName}
                  </div>
                  {badgeObj?.tierLabel && (
                    <div className="inline-block mt-1 text-[9.5px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      {badgeObj.tierLabel}
                    </div>
                  )}
                  <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-1 flex items-center gap-1">
                    <Ban className="w-3 h-3" />
                    <span>Dilepas dari rak profil</span>
                  </div>
                </div>
              </div>
            )}

            {/* Note / Reason from Admin */}
            {cleanNote && (
              <div className="w-full mt-3 p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 mb-1">
                  Catatan Pengelola Kampus:
                </div>
                <p className="text-xs text-foreground italic leading-relaxed">
                  &ldquo;{cleanNote}&rdquo;
                </p>
              </div>
            )}

            {/* System Explanation */}
            <p className="text-[11.5px] text-muted-foreground leading-relaxed mt-4 text-center">
              Lencana kehormatan atau tema kartu ini telah ditarik kembali oleh pengelola STMIK Tazkia sesuai hasil evaluasi berkala atau masa kepengurusan. Rak kartu profil Anda telah otomatis disesuaikan.
            </p>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleClose}
              className="w-full mt-5 py-3 px-4 rounded-xl font-bold text-xs bg-foreground hover:bg-foreground/90 text-background flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>Saya Mengerti</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default BadgeRevokedModal;
