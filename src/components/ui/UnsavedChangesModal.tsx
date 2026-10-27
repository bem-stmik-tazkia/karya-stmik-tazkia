"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface UnsavedChangesModalProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
  title?: string;
  description?: string;
  stayText?: string;
  leaveText?: string;
}

export function UnsavedChangesModal({
  open,
  onStay,
  onLeave,
  title = "Perubahan Belum Disimpan",
  description = "Ada perubahan yang belum kamu simpan. Jika meninggalkan halaman ini sekarang, semua perubahan yang kamu buat akan hilang.",
  stayText = "Tetap Lanjut Edit",
  leaveText = "Tinggalkan Halaman",
}: UnsavedChangesModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onStay}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Modal Card */}
      <div className="relative bg-card border border-border rounded-2xl p-6 sm:p-7 max-w-sm w-full shadow-2xl z-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-200">
        {/* Close button */}
        <button
          onClick={onStay}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-foreground mb-1.5 tracking-tight">
          {title}
        </h3>
        <p className="text-muted-foreground text-xs mb-6 leading-relaxed font-normal">
          {description}
        </p>

        <div className="flex w-full gap-2.5">
          <button
            type="button"
            onClick={onStay}
            className="flex-1 py-2.5 px-3.5 rounded-xl font-semibold text-xs text-foreground bg-muted border border-border hover:bg-muted/80 transition-colors cursor-pointer"
          >
            {stayText}
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="flex-1 py-2.5 px-3.5 rounded-xl font-semibold text-xs text-white bg-rose-600 hover:bg-rose-700 shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            {leaveText}
          </button>
        </div>
      </div>
    </div>
  );
}

