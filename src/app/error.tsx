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
      <div className="card-3d bg-card border-4 border-border rounded-[2rem] p-8 sm:p-12 max-w-lg w-full text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-2xl border-4 border-red-500 shadow-[4px_4px_0px_0px_#ef4444] mx-auto flex items-center justify-center mb-6">
            <FiAlertTriangle size={40} strokeWidth={2.5} />
          </div>
          
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight mb-3">
            Ups! Terjadi Kesalahan
          </h1>
          
          <p className="text-muted-foreground font-bold mb-8">
            Koneksi terputus atau terjadi kesalahan pada sistem kami. Jangan panik, mari coba lagi!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-black uppercase text-sm border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-border)] rounded-xl transition-all"
            >
              <FiRefreshCcw size={18} /> Coba Lagi
            </button>
            <a
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-card text-foreground font-black uppercase text-sm border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:bg-muted hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-border)] rounded-xl transition-all"
            >
              <FiHome size={18} /> Beranda
            </a>
          </div>
          
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 text-left bg-muted p-4 rounded-xl border-2 border-border/50 overflow-auto max-h-32 text-xs font-mono text-muted-foreground">
              {error.message || "Unknown error"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
