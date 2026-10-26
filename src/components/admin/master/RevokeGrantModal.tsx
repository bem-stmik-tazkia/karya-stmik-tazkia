"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Crown, Award } from "lucide-react";
import type { GrantToRevokeState } from "./types";
import { getExclusiveRewardByBadgeId } from "@/data/exclusiveRewardsCatalog";

interface RevokeGrantModalProps {
  grantToRevoke: GrantToRevokeState | null;
  revokeReason: string;
  setRevokeReason: (val: string) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function RevokeGrantModal({
  grantToRevoke,
  revokeReason,
  setRevokeReason,
  isSubmitting,
  onClose,
  onConfirm,
}: RevokeGrantModalProps) {
  return (
    <AnimatePresence>
      {grantToRevoke && (() => {
        const reward = grantToRevoke.badgeId ? getExclusiveRewardByBadgeId(grantToRevoke.badgeId) : undefined;
        const isSkin =
          !!reward?.skinId ||
          grantToRevoke.badgeId === 101 ||
          (grantToRevoke.badgeName || "").toLowerCase().includes("skin");
        const itemName = reward?.name || grantToRevoke.badgeName;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isSubmitting) onClose();
              }}
              className="fixed inset-0 bg-background/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative bg-card border border-border rounded-2xl p-5 sm:p-7 max-w-md w-full shadow-2xl z-10 text-center space-y-4 max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto overscroll-contain"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
                {isSkin ? <Crown className="w-6 h-6 text-rose-500" /> : <Award className="w-6 h-6 text-rose-500" />}
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {isSkin ? `Tarik Hak Akses ${itemName}?` : `Tarik Kembali ${itemName}?`}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                  Apakah Anda yakin ingin menarik kembali hak akses{" "}
                  <strong className="text-foreground font-bold">{itemName}</strong>{" "}
                  dari <strong className="text-foreground font-bold">{grantToRevoke.recipientName}</strong>?
                </p>
                <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11.5px] text-amber-800 dark:text-amber-200 text-left leading-relaxed">
                  {isSkin
                    ? "Hak akses skin kartu ini akan dinonaktifkan dari profil mahasiswa. Tampilan kartu mahasiswa akan otomatis kembali ke tema classic."
                    : "Lencana ini akan langsung ditarik dari rak profil mahasiswa."}
                </div>
              </div>

              {/* Form Pesan / Alasan Penarikan */}
              <div className="text-left space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Catatan Pengelola / Alasan Penarikan</span>
                  <span className="text-[10px] text-muted-foreground font-normal">(opsional)</span>
                </label>
                <textarea
                  rows={2}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Contoh: Masa bakti telah berakhir, terima kasih atas dedikasi dan kontribusinya..."
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 resize-none transition-all"
                />
                <p className="text-[10px] text-muted-foreground">
                  Pesan ini akan langsung terkirim ke lonceng notifikasi mahasiswa sebagai pemberitahuan resmi yang ramah.
                </p>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs bg-card border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {isSubmitting
                      ? "Sedang Menarik..."
                      : isSkin
                      ? "Ya, Tarik Hak Akses"
                      : "Ya, Tarik Lencana"}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        );
      })()}
    </AnimatePresence>
  );
}
