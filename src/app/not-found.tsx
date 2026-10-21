"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Compass, ArrowLeft, Sparkles } from "lucide-react";

// Floating particles for background — client-only to avoid SSR/hydration mismatch
function FloatingParticles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Pre-generate stable particle data once on the client
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        width: Math.random() * 8 + 4,
        height: Math.random() * 8 + 4,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        background: i % 2 === 0 ? "var(--primary)" : "var(--secondary)",
      })),
    []
  );

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.width,
            height: p.height,
            left: p.left,
            top: p.top,
            background: p.background,
            opacity: 0.15,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: Math.random() * 3 + 3,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Sleek 404 number display
function AnimatedNumber() {
  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-125 pointer-events-none" />

      <div className="relative flex items-center gap-3 sm:gap-5">
        {/* 4 */}
        <motion.div
          className="w-20 h-20 sm:w-28 sm:h-28 bg-card border border-border/80 shadow-md text-foreground rounded-2xl flex items-center justify-center"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          whileHover={{ scale: 1.05, y: -2 }}
        >
          <span className="text-4xl sm:text-6xl font-extrabold text-foreground">4</span>
        </motion.div>

        {/* Center icon / accent */}
        <motion.div
          className="w-18 h-18 sm:w-24 sm:h-24 bg-primary/10 border border-primary/30 text-primary rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/10"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
          whileHover={{ scale: 1.08 }}
        >
          <Sparkles className="w-9 h-9 sm:w-12 sm:h-12 text-primary" />
        </motion.div>

        {/* 4 */}
        <motion.div
          className="w-20 h-20 sm:w-28 sm:h-28 bg-card border border-border/80 shadow-md text-foreground rounded-2xl flex items-center justify-center"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.1 }}
          whileHover={{ scale: 1.05, y: -2 }}
        >
          <span className="text-4xl sm:text-6xl font-extrabold text-foreground">4</span>
        </motion.div>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-16 bg-background relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-primary/10 via-orange-500/5 to-transparent blur-3xl rounded-full pointer-events-none" />
      <FloatingParticles />

      <motion.div
        className="relative z-10 w-full max-w-xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* 404 Number visual */}
        <div className="flex justify-center mb-8">
          <AnimatedNumber />
        </div>

        {/* Content card */}
        <div className="bg-card border border-border rounded-2xl p-7 sm:p-10 text-center shadow-lg shadow-black/5 dark:shadow-black/20 backdrop-blur-xs relative overflow-hidden">
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-amber-500 to-primary/40" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            <span>Status 404</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-2.5">
            Halaman Tidak Ditemukan
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground font-normal mb-8 max-w-md mx-auto leading-relaxed">
            Halaman yang Anda tuju mungkin telah dipindahkan, dihapus, atau tautan yang Anda gunakan keliru.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-xs hover:bg-[#ea580c] hover:shadow-md hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Link>

            <Link
              href="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-semibold text-sm shadow-2xs hover:bg-muted/70 hover:border-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Compass className="w-4 h-4 text-primary" />
              <span>Jelajahi Karya</span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 font-medium text-sm transition-all duration-150"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          </div>
        </div>

        {/* Quick directory links */}
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap text-xs text-muted-foreground">
          <span className="font-medium">Tautan cepat:</span>
          {[
            { label: "Daftar Mahasiswa", href: "/student" },
            { label: "Galeri Karya", href: "/explore" },
            { label: "Kirim Karya", href: "/submit" },
            { label: "Tentang Kami", href: "/about" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-medium text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
