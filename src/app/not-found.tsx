import React from "react";
import Link from "next/link";
import { FiMap, FiArrowLeft, FiHome } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-background">
      <div className="card-3d bg-card border-4 border-border rounded-[2rem] p-8 sm:p-12 max-w-lg w-full text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="w-24 h-24 bg-primary text-primary-foreground rounded-3xl border-4 border-border shadow-[6px_6px_0px_0px_var(--color-border)] mx-auto flex items-center justify-center mb-6 -rotate-6">
            <span className="text-4xl font-black">404</span>
          </div>
          
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight mb-3">
            Nyasar, Bos?
          </h1>
          
          <p className="text-muted-foreground font-bold mb-8">
            Halaman yang kamu cari sepertinya tidak ada di peta kami, atau mungkin sudah dihapus.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-black uppercase text-sm border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-border)] rounded-xl transition-all"
            >
              <FiHome size={18} /> Balik ke Beranda
            </Link>
            <Link
              href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-secondary text-secondary-foreground font-black uppercase text-sm border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-border)] rounded-xl transition-all"
            >
              <FiMap size={18} /> Explore Karya
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
