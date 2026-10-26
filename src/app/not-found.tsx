"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  Compass,
  ArrowLeft,
  Search,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

export default function NotFound() {
  const [clickCount, setClickCount] = useState(0);

  const openSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-command-palette"));
    }
  };

  const handleCenterClick = () => {
    setClickCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 sm:py-16 bg-background relative overflow-hidden selection:bg-[#FF8A2B]/20 selection:text-[#FF8A2B]">
      {/* ── Background: Subtle Dot Grid & Ambient Aurora Glow ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-dot-grid opacity-30 text-slate-400 dark:text-slate-700 [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_90%)]" />

        {/* Floating Glowing Orbs with Breathing Animation */}
        <motion.div
          className="absolute -top-20 -left-20 w-[420px] sm:w-[550px] h-[420px] sm:h-[550px] bg-gradient-to-tr from-[#1E3A8A]/25 via-blue-500/10 to-transparent rounded-full blur-[110px] dark:from-[#1E3A8A]/40"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 -right-20 w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] bg-gradient-to-bl from-[#FF8A2B]/20 via-amber-500/10 to-transparent rounded-full blur-[120px] dark:from-[#FF8A2B]/25"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* ── Animated 404 Interactive Cluster ── */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-4 md:gap-6 mb-7 sm:mb-9 select-none">
          {/* Left '4' - Smooth floating animation */}
          <motion.div
            className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl bg-card/90 dark:bg-[#0E2554]/90 border border-border/80 dark:border-[#1E3E82] shadow-xl shadow-slate-900/5 dark:shadow-black/40 flex items-center justify-center cursor-pointer group"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.08, rotate: -4 }}
            whileTap={{ scale: 0.94 }}
          >
            <span className="font-heading font-black text-3xl sm:text-5xl md:text-6xl text-foreground group-hover:text-[#FF8A2B] transition-colors">
              4
            </span>
          </motion.div>

          {/* Center Compass / Radar Beacon */}
          <div className="relative">
            {/* Pulsing Radar Wave */}
            <motion.div
              className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-[#FF8A2B]/40 dark:border-[#FF8A2B]/50 pointer-events-none"
              animate={{
                scale: [1, 1.35],
                opacity: [0.75, 0],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />

            <motion.div
              onClick={handleCenterClick}
              className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl bg-[#FF8A2B]/10 dark:bg-[#FF8A2B]/15 border border-[#FF8A2B]/35 dark:border-[#FF8A2B]/40 shadow-xl shadow-orange-500/15 flex items-center justify-center text-[#FF8A2B] cursor-pointer"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9, rotate: -15 }}
              title="Klik saya!"
            >
              {/* Rotating Compass Needle */}
              <motion.div
                animate={{
                  rotate: [0, 45, -35, 20, -10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Compass className="w-8 h-8 sm:w-11 sm:h-11 md:w-13 md:h-13" />
              </motion.div>
            </motion.div>
          </div>

          {/* Right '4' - Smooth floating animation (offset) */}
          <motion.div
            className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl bg-card/90 dark:bg-[#0E2554]/90 border border-border/80 dark:border-[#1E3E82] shadow-xl shadow-slate-900/5 dark:shadow-black/40 flex items-center justify-center cursor-pointer group"
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 4.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            whileHover={{ scale: 1.08, rotate: 4 }}
            whileTap={{ scale: 0.94 }}
          >
            <span className="font-heading font-black text-3xl sm:text-5xl md:text-6xl text-foreground group-hover:text-[#FF8A2B] transition-colors">
              4
            </span>
          </motion.div>
        </div>

        {clickCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mb-4 px-3 py-1 rounded-full bg-[#FF8A2B]/15 border border-[#FF8A2B]/30 text-xs font-semibold text-[#FF8A2B] flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 animate-spin" />
            <span>
              {clickCount < 3
                ? "Kompas sedang memindai koordinat galeri..."
                : clickCount < 7
                ? "Halaman tidak ditemukan. Silakan gunakan tombol navigasi di bawah."
                : "Ayo kembali ke halaman utama untuk melihat karya mahasiswa."}
            </span>
          </motion.div>
        )}

        {/* ── Main Glass Card ── */}
        <div className="w-full bg-card/95 dark:bg-[#0E2554]/95 backdrop-blur-xl border border-border/80 dark:border-[#1E3E82] rounded-3xl p-6 sm:p-9 text-center shadow-2xl shadow-slate-900/5 dark:shadow-black/40 relative overflow-hidden">
          {/* Tazkia Gradient Line */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FF8A2B] via-amber-400 to-[#1E3A8A]" />

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8A2B]/10 border border-[#FF8A2B]/20 text-[#FF8A2B] text-xs font-semibold mb-4">
            <span>Status 404 • Halaman Tidak Ditemukan</span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight mb-3">
            Halaman Tidak Ditemukan
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground font-normal mb-6 max-w-md mx-auto leading-relaxed">
            Halaman atau tautan portofolio yang Anda cari mungkin telah dipindahkan, diubah jalurnya, atau belum dipublikasikan.
          </p>

          {/* Interactive Search Trigger Box */}
          <div className="mb-6 max-w-md mx-auto">
            <button
              onClick={openSearch}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-muted/60 dark:bg-[#132E6B]/60 border border-border/80 dark:border-[#1E3E82] text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:border-[#FF8A2B]/50 transition-all group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-[#FF8A2B] group-hover:scale-110 transition-transform" />
                <span>Cari karya, mahasiswa, atau riset...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-card border border-border text-[10px] font-mono text-muted-foreground shadow-2xs">
                Ctrl + K
              </kbd>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FF8A2B] hover:bg-[#ea580c] text-white font-bold text-sm shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Link>

            <Link
              href="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-card dark:bg-[#132E6B] border border-border dark:border-[#1E3E82] text-foreground font-semibold text-sm shadow-2xs hover:bg-muted/70 dark:hover:bg-[#16367e] hover:border-[#FF8A2B]/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Compass className="w-4 h-4 text-[#FF8A2B]" />
              <span>Jelajahi Galeri</span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-[#132E6B]/60 font-medium text-sm transition-all duration-150 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          </div>
        </div>

        {/* ── Quick Directory Links ── */}
        <div className="mt-7 w-full max-w-lg px-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 text-xs text-muted-foreground text-center">
          <span className="font-semibold text-foreground/80 shrink-0">Tautan Cepat:</span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: "Galeri Karya", href: "/explore" },
              { label: "Direktori Mahasiswa", href: "/student" },
              { label: "Kirim Karya", href: "/submit" },
              { label: "Tentang Platform", href: "/about" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-2.5 py-1 rounded-lg bg-muted/40 dark:bg-[#102454]/60 border border-border/60 dark:border-[#1E3E82]/60 font-medium text-foreground hover:text-[#FF8A2B] hover:border-[#FF8A2B]/40 transition-all"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
