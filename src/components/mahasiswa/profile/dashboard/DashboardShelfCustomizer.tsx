"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Check, ArrowLeftRight, X, Info } from "lucide-react";
import { PENGHARGAAN_CATALOG, type PenghargaanBadge } from "@/data/penghargaanCatalog";
import { TazkiaAchievementHexBadge } from "@/components/penghargaan/TazkiaAchievementBadge";

interface DashboardShelfCustomizerProps {
  isCustomizingShelf: boolean;
  featuredBadgeIds: number[];
  badgeToSwap: PenghargaanBadge | null;
  onClose: () => void;
  onCancelSwap: () => void;
  onReplaceSlot: (slotIndex: number, newBadgeId: number) => void;
  onRemoveSlot: (slotIndex: number) => void;
}

export function DashboardShelfCustomizer({
  isCustomizingShelf,
  featuredBadgeIds,
  badgeToSwap,
  onClose,
  onCancelSwap,
  onReplaceSlot,
  onRemoveSlot,
}: DashboardShelfCustomizerProps) {
  return (
    <AnimatePresence>
      {isCustomizingShelf && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="bg-gradient-to-b from-primary/5 via-card to-card border-2 border-primary/40 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border/80">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <h3 className="text-xs sm:text-sm font-bold text-foreground font-mono uppercase">
                    Rak Sorotan Kartu Profil ({featuredBadgeIds.length} / 5 Slot Terisi)
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Kelima badge ini dipajang di rak depan kartu mahasiswa Anda. Klik badge di bawah
                  untuk memasang atau melepas.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-white text-[11px] font-semibold hover:bg-[#ea580c] transition-all cursor-pointer shadow-2xs"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Selesai</span>
                </button>
              </div>
            </div>

            {/* Mode Tukar / Ganti Slot saat Rak Penuh */}
            {badgeToSwap && (
              <div className="mb-3 p-2.5 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <ArrowLeftRight className="w-4 h-4 shrink-0" />
                  <span>
                    Gantikan slot mana dengan <strong>&ldquo;{badgeToSwap.name}&rdquo;</strong>? Klik
                    salah satu slot (#1 - #5) di bawah:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onCancelSwap}
                  className="px-2 py-0.5 rounded-md bg-card border border-border text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                >
                  Batal
                </button>
              </div>
            )}

            {/* 5 Slots Display */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-xl mx-auto py-1">
              {[0, 1, 2, 3, 4].map((slotIndex) => {
                const badgeId = featuredBadgeIds[slotIndex];
                const badge = badgeId ? PENGHARGAAN_CATALOG.find((b) => b.id === badgeId) : null;
                const isSwapTarget = Boolean(badgeToSwap);

                return (
                  <div
                    key={slotIndex}
                    onClick={() => {
                      if (badgeToSwap) {
                        onReplaceSlot(slotIndex, badgeToSwap.id);
                      }
                    }}
                    className={`relative flex flex-col items-center justify-between p-2 rounded-xl border text-center transition-all ${
                      isSwapTarget
                        ? "bg-primary/5 border-primary ring-2 ring-primary/40 shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                        : badge
                        ? "bg-card border-primary/40 shadow-xs"
                        : "border-dashed border-border bg-muted/20"
                    }`}
                  >
                    <div className="w-full flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                        #{slotIndex + 1}
                      </span>
                      {badge && !badgeToSwap && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveSlot(slotIndex);
                          }}
                          className="w-4 h-4 rounded-full bg-muted hover:bg-rose-500 hover:text-white flex items-center justify-center text-muted-foreground text-[10px] transition-colors cursor-pointer"
                          title="Lepas dari slot ini"
                          aria-label="Lepas badge"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    {badge ? (
                      <>
                        <div className="relative my-1 flex items-center justify-center">
                          <TazkiaAchievementHexBadge
                            badge={badge}
                            size="xs"
                            locked={false}
                            animated={true}
                            showTooltip={false}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-foreground truncate w-full mt-1">
                          {badge.name}
                        </span>
                        {isSwapTarget && (
                          <span className="text-[9px] font-bold text-primary mt-1 font-mono uppercase bg-primary/10 px-1.5 py-0.5 rounded">
                            Ganti
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="py-3 flex flex-col items-center justify-center text-muted-foreground/40">
                        <span className="text-lg font-light leading-none">+</span>
                        <span className="text-[9px] font-mono mt-0.5">
                          {isSwapTarget ? "Pilih" : "Kosong"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center">
              <Info className="w-3.5 h-3.5 text-primary shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Tips:</span> Klik badge di katalog
                bawah untuk langsung memasang atau melepas dari rak kartu.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

