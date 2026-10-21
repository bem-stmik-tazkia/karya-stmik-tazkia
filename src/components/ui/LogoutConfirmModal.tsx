"use client";

import { LogOut, X } from "lucide-react";

interface LogoutConfirmModalProps {
  open: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutConfirmModal({ open, loading, onConfirm, onCancel }: LogoutConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      />
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl p-6 sm:p-7 max-w-sm w-full shadow-2xl z-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-200">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <LogOut className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-foreground mb-1.5">
          Keluar dari Akun?
        </h3>
        <p className="text-muted-foreground text-xs mb-6 leading-relaxed font-normal">
          Kamu akan keluar dari sesi ini. Kamu bisa masuk kembali kapan saja menggunakan akun Google kamu.
        </p>

        <div className="flex w-full gap-2.5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-foreground bg-muted border border-border hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-primary hover:bg-[#ea580c] transition-all shadow-xs hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            {loading ? "Keluar..." : "Ya, Keluar"}
          </button>
        </div>
      </div>
    </div>
  );
}
