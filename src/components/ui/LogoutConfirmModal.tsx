"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X } from "lucide-react";

interface LogoutConfirmModalProps {
  open: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutConfirmModal({ open, loading, onConfirm, onCancel }: LogoutConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="relative bg-card border-4 border-border rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-[8px_8px_0px_0px_var(--color-border)] z-10 flex flex-col items-center text-center"
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/40 border-4 border-orange-500 text-orange-600 flex items-center justify-center mb-5">
              <LogOut className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-foreground mb-2 uppercase">
              Keluar dari Akun?
            </h3>
            <p className="text-muted-foreground font-bold text-sm mb-6 leading-relaxed">
              Kamu akan keluar dari sesi ini. Kamu bisa masuk kembali kapan saja menggunakan akun Google kamu.
            </p>

            <div className="flex w-full gap-3">
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl font-black text-sm text-foreground bg-muted border-2 border-border hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl font-black text-sm text-white bg-orange-500 border-2 border-orange-700 shadow-[3px_3px_0px_0px_#c2410c] hover:bg-orange-600 hover:translate-y-0.5 active:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {loading ? "Keluar..." : "Ya, Keluar"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
