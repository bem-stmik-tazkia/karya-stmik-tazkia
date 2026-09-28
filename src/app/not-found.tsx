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

// Animated 404 number
function AnimatedNumber() {
  const [wobble, setWobble] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setWobble(true);
      setTimeout(() => setWobble(false), 600);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      animate={wobble ? { rotate: [-3, 3, -2, 2, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-150" />

      <div className="relative flex items-center gap-2 sm:gap-4">
        {/* 4 */}
        <motion.div
          className="w-24 h-24 sm:w-32 sm:h-32 bg-primary text-primary-foreground rounded-3xl border-4 border-border shadow-[6px_6px_0px_0px_var(--color-border)] flex items-center justify-center"
          initial={{ y: -80, opacity: 0, rotate: -15 }}
          animate={{ y: 0, opacity: 1, rotate: -8 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          whileHover={{ scale: 1.05, rotate: -5, transition: { duration: 0.2 } }}
        >
          <span className="text-5xl sm:text-7xl font-black">4</span>
        </motion.div>

        {/* Crying emoji in the middle */}
        <motion.div
          className="w-20 h-20 sm:w-28 sm:h-28 bg-accent text-accent-foreground rounded-full border-4 border-border shadow-[6px_6px_0px_0px_var(--color-border)] flex items-center justify-center z-10"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
          whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
        >
          <motion.span
            className="text-4xl sm:text-5xl"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            😵
          </motion.span>
        </motion.div>

        {/* 4 */}
        <motion.div
          className="w-24 h-24 sm:w-32 sm:h-32 bg-secondary text-secondary-foreground rounded-3xl border-4 border-border shadow-[6px_6px_0px_0px_var(--color-border)] flex items-center justify-center"
          initial={{ y: 80, opacity: 0, rotate: 15 }}
          animate={{ y: 0, opacity: 1, rotate: 8 }}
          transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
          whileHover={{ scale: 1.05, rotate: 5, transition: { duration: 0.2 } }}
        >
          <span className="text-5xl sm:text-7xl font-black">4</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-16 bg-background relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      <FloatingParticles />

      <motion.div
        className="relative z-10 w-full max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 404 Number block */}
        <div className="flex justify-center mb-8">
          <AnimatedNumber />
        </div>

        {/* Text content card */}
        <motion.div
          className="bg-card border-4 border-border rounded-[2rem] p-8 sm:p-10 text-center shadow-[8px_8px_0px_0px_var(--color-border)] relative overflow-hidden"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
        >
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-secondary rounded-t-[2rem]" />

          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/30 rounded-full mb-5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.45, type: "spring" }}
          >
            <span className="text-xs font-black text-primary uppercase tracking-wider">Halaman Tidak Ditemukan</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-black text-foreground uppercase tracking-tight mb-3">
            Nyasar, Bos? 🗺️
          </h1>

          <p className="text-muted-foreground font-bold mb-2 max-w-md mx-auto leading-relaxed">
            Halaman yang kamu cari sepertinya tidak ada di peta kami, atau mungkin sudah dihapus.
          </p>
          <p className="text-sm text-muted-foreground/70 font-medium mb-8">
            Coba kembali ke beranda atau jelajahi karya mahasiswa kami.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/"
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 bg-primary text-primary-foreground font-black uppercase text-sm border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:shadow-[2px_2px_0px_0px_var(--color-border)] hover:translate-y-0.5 rounded-2xl transition-all"
              >
                <Home className="w-4 h-4" />
                Balik ke Beranda
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/explore"
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 bg-secondary text-secondary-foreground font-black uppercase text-sm border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:shadow-[2px_2px_0px_0px_var(--color-border)] hover:translate-y-0.5 rounded-2xl transition-all"
              >
                <Compass className="w-4 h-4" />
                Explore Karya
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 bg-muted text-foreground font-black uppercase text-sm border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:shadow-[2px_2px_0px_0px_var(--color-border)] hover:translate-y-0.5 rounded-2xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Helpful links */}
        <motion.div
          className="mt-6 flex items-center justify-center gap-2 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-xs text-muted-foreground font-bold">Mau ke mana?</span>
          {[
            { label: "Feed", href: "/feed" },
            { label: "Submit Karya", href: "/submit" },
            { label: "Profil", href: "/dashboard" },
            { label: "Tentang", href: "/about" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-black text-primary hover:underline underline-offset-4 decoration-2 decoration-primary/40 transition-all"
            >
              {item.label}
            </Link>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
