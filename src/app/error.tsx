"use client";

import React, { useEffect } from "react";
import Link from "next/navigation";
import { FiAlertTriangle, FiRefreshCcw, FiHome } from "react-icons/fi";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-background">
      <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 max-w-lg w-full text-center relative overflow-hidden shadow-lg shadow-black/5 dark:shadow-black/20">
        {/* Subtle top indicator bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500" />
        
        {/* Decorative background glows */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 mx-auto flex items-center justify-center mb-6 shadow-sm">
            <FiAlertTriangle size={32} strokeWidth={2} />
          </div>
          
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight mb-2.5">
            Terjadi Kesalahan Sistem
          </h1>
          
          <p className="text-sm text-muted-foreground font-normal mb-8 leading-relaxed max-w-sm mx-auto">
            Koneksi terputus atau terjadi gangguan sementara pada sistem. Silakan muat ulang halaman atau kembali ke beranda.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold text-sm rounded-xl shadow-xs hover:bg-[#ea580c] hover:shadow-md hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <FiRefreshCcw size={16} /> Coba Lagi
            </button>
            <a
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border text-foreground font-semibold text-sm rounded-xl shadow-2xs hover:bg-muted/70 hover:border-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <FiHome size={16} /> Beranda
            </a>
          </div>
          
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 text-left bg-muted/60 p-4 rounded-xl border border-border/70 overflow-auto max-h-32 text-xs font-mono text-muted-foreground">
              {error.message || "Unknown error"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
