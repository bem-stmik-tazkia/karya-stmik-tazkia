"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Clock,
  RefreshCw,
  ArrowRight,
  Globe,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Logo } from "@/components/ui/Logo";

interface MaintenanceInfo {
  active: boolean;
  message: string;
  endTime: string | null;
}

const FUN_STATUS_MESSAGES = [
  "Tim teknis kampus sedang melakukan pemeliharaan sistem",
  "Semua portofolio dan data karya Anda tersimpan dengan aman",
  "Server sedang dioptimasi untuk performa yang lebih stabil",
  "Sedang mengecek kestabilan basis data kampus",
  "Terima kasih atas kesabaran Anda, proses sedang berlangsung",
];

export default function MaintenancePage() {
  const [info, setInfo] = useState<MaintenanceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const [toolClickCount, setToolClickCount] = useState(0);

  // ── Konami Code: ↑↑↓↓←→ Enter ──────────────────────────────────────────
  const KONAMI = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Enter",
  ];
  const konamiRef = useRef<string[]>([]);
  const [konamiUnlocked, setKonamiUnlocked] = useState(false);

  const triggerBypass = async () => {
    try {
      const res = await fetch("/api/maintenance/bypass", { method: "POST" });
      if (res.ok) {
        setKonamiUnlocked(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch {
      // Safe catch
    }
  };

  useEffect(() => {
    const handleKey = async (e: KeyboardEvent) => {
      konamiRef.current = [...konamiRef.current, e.key].slice(-KONAMI.length);
      if (konamiRef.current.join(",") === KONAMI.join(",")) {
        konamiRef.current = [];
        triggerBypass();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    fetch("/api/maintenance")
      .then((r) => r.json())
      .then((data) => {
        setInfo(data);
        setLoading(false);
      })
      .catch(() => {
        setInfo({
          active: true,
          message:
            "Kami sedang melakukan pemeliharaan sistem. Layanan akan segera aktif kembali.",
          endTime: null,
        });
        setLoading(false);
      });
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshNotice("Memeriksa status koneksi server...");

    try {
      const res = await fetch("/api/maintenance?t=" + Date.now());
      const data = await res.json();
      if (!data.active) {
        setRefreshNotice("Sistem sudah online! Mengalihkan...");
        setTimeout(() => {
          window.location.href = "/";
        }, 800);
        return;
      } else {
        setInfo(data);
        setTimeout(() => {
          setIsRefreshing(false);
          setRefreshNotice("Server masih dalam pemeliharaan. Terima kasih telah menunggu!");
          setTimeout(() => setRefreshNotice(null), 3500);
        }, 900);
      }
    } catch {
      setTimeout(() => {
        window.location.reload();
      }, 600);
    }
  };

  const handleToolClick = () => {
    setToolClickCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between relative overflow-x-hidden selection:bg-[#FF8A2B]/20 selection:text-[#FF8A2B]">
      {/* ── Background: Subtle Dot Grid & Ambient Aurora Glow ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-dot-grid opacity-30 text-slate-400 dark:text-slate-700 [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_90%)]" />

        {/* Breathing Ambient Aurora (Navy & Electric Orange) */}
        <motion.div
          className="absolute -top-32 -left-32 w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] bg-gradient-to-tr from-[#1E3A8A]/25 via-blue-500/10 to-transparent rounded-full blur-[110px] dark:from-[#1E3A8A]/40"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 -right-32 w-[400px] sm:w-[550px] h-[400px] sm:h-[550px] bg-gradient-to-bl from-[#FF8A2B]/20 via-amber-500/10 to-transparent rounded-full blur-[120px] dark:from-[#FF8A2B]/25"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* ── Top Header Bar (100% Mobile Responsive) ── */}
      <header className="relative z-20 w-full border-b border-border/70 dark:border-[#1E3E82]/70 bg-background/80 dark:bg-[#0B1F4A]/80 backdrop-blur-md">
        <div className="container mx-auto px-3 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <Logo size="sm" showSlogan sloganClassName="hidden sm:block" />

          {/* Right Status Badge & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-500/10 dark:bg-orange-500/10 border border-amber-500/25 dark:border-orange-500/25 text-[11px] sm:text-xs font-semibold text-amber-600 dark:text-orange-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 dark:bg-orange-400" />
              </span>
              <span className="hidden xs:inline">Pemeliharaan Sistem</span>
              <span className="xs:hidden">Maintenance</span>
            </div>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main Maintenance Content ── */}
      <main className="relative z-10 container mx-auto px-3 sm:px-6 py-8 sm:py-14 flex-1 flex flex-col items-center justify-center">
        <motion.div
          className="w-full max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {/* Animated Interactive Emblem */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Radar pulse wave */}
              <motion.div
                className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-[#FF8A2B]/40 dark:border-[#FF8A2B]/50 pointer-events-none"
                animate={{
                  scale: [1, 1.4],
                  opacity: [0.7, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />

              {/* Clickable Tool Emblem */}
              <motion.div
                onClick={handleToolClick}
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-[#FF8A2B]/10 dark:bg-[#FF8A2B]/15 border border-[#FF8A2B]/35 dark:border-[#FF8A2B]/45 flex items-center justify-center text-[#FF8A2B] shadow-lg shadow-orange-500/10 cursor-pointer select-none"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.88, rotate: -30 }}
                title="Klik untuk cek status!"
              >
                {/* Mechanical repair rocking animation */}
                <motion.div
                  animate={{
                    rotate: [0, -18, 0, 16, 0],
                  }}
                  transition={{
                    duration: 4.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Wrench className="w-8 h-8 sm:w-10 sm:h-10" />
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Interactive Tool Click Toast */}
          <AnimatePresence>
            {toolClickCount > 0 && (
              <motion.div
                key={toolClickCount}
                initial={{ opacity: 0, y: -6, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-4 text-center"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8A2B]/15 border border-[#FF8A2B]/30 text-xs font-semibold text-[#FF8A2B] shadow-2xs">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{FUN_STATUS_MESSAGES[(toolClickCount - 1) % FUN_STATUS_MESSAGES.length]}</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main Glass Card ── */}
          <div className="bg-card/95 dark:bg-[#0E2554]/95 backdrop-blur-xl border border-border/80 dark:border-[#1E3E82] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/5 dark:shadow-black/40 relative">
            {/* Signature Tazkia Dual Gradient Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#FF8A2B] via-amber-400 to-[#1E3A8A]" />

            <div className="p-5 sm:p-8 text-center">
              {/* Status Tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted dark:bg-[#132E6B] border border-border dark:border-[#1E3E82] text-xs font-medium text-muted-foreground mb-3.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Mode Pemeliharaan Aktif</span>
              </div>

              {/* Main Heading */}
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight mb-3">
                Sistem Sedang Diperbarui
              </h1>

              {/* Dynamic Message directly from Admin / Database */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-muted/40 dark:bg-[#102454]/70 border border-border/70 dark:border-[#1E3E82]/70 text-foreground text-sm sm:text-base leading-relaxed mb-5">
                {loading ? (
                  <span className="text-muted-foreground text-xs sm:text-sm">
                    Menghubungkan ke sistem...
                  </span>
                ) : (
                  <p className="font-normal text-slate-700 dark:text-slate-200">
                    {info?.message ||
                      "Kami sedang melakukan pemeliharaan sistem. Layanan akan segera aktif kembali."}
                  </p>
                )}
              </div>

              {/* Dynamic Estimated Time (Only if set by Admin) */}
              {!loading && info?.endTime && (
                <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-amber-500/10 dark:bg-orange-500/15 border border-amber-500/25 dark:border-orange-500/25 text-amber-700 dark:text-orange-300 text-xs sm:text-sm font-medium mb-5">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-orange-400 shrink-0" />
                  <span>
                    Estimasi Selesai:{" "}
                    <strong className="font-bold text-foreground">
                      {info.endTime}
                    </strong>
                  </span>
                </div>
              )}

              {/* Reassurance Notice */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Seluruh data karya &amp; akun portofolio mahasiswa tetap aman.</span>
              </div>

              {/* Live Connection Feedback Notice */}
              <AnimatePresence>
                {refreshNotice && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <p className="text-xs font-semibold text-[#FF8A2B] bg-[#FF8A2B]/10 border border-[#FF8A2B]/20 py-2 px-3 rounded-lg">
                      {refreshNotice}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Action Buttons ── */}
              <div className="border-t border-border/80 dark:border-[#1E3E82]/80 pt-5 sm:pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF8A2B] hover:bg-[#ea580c] text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-75"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                    <span>{isRefreshing ? "Memeriksa..." : "Muat Ulang Halaman"}</span>
                  </button>

                  <a
                    href="https://bem.stmik.tazkia.ac.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-card dark:bg-[#132E6B] border border-border dark:border-[#1E3E82] text-foreground font-semibold text-sm rounded-xl shadow-2xs hover:bg-muted/70 dark:hover:bg-[#16367e] hover:border-[#FF8A2B]/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
                  >
                    <Globe className="w-4 h-4 text-[#FF8A2B]" />
                    <span>Website BEM Tazkia</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#FF8A2B] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Meta Bar */}
            <div className="border-t border-border/80 dark:border-[#1E3E82]/80 bg-muted/40 dark:bg-[#0B1B3D] px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <span className="text-[11px] sm:text-xs text-muted-foreground">
                Pusat Data STMIK Tazkia • Bogor
              </span>
              <a
                href="https://wa.me/6285199562719"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#FF8A2B] hover:underline font-semibold"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Hubungi WhatsApp Admin</span>
              </a>
            </div>
          </div>
        </motion.div>
      </main>

      {/* ── Official Footer ── */}
      <footer className="relative z-20 border-t border-border/70 dark:border-[#1E3E82]/70 bg-background/80 dark:bg-[#0B1F4A]/80 backdrop-blur-md py-3.5 sm:py-4 text-center">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 justify-center flex-wrap">
            <span className="font-semibold text-foreground">Karya Tazkia</span>
            <span>—</span>
            <span>
              Dikelola oleh{" "}
              <strong className="text-foreground font-semibold">
                Departemen RISTEK BEM STMIK Tazkia
              </strong>
            </span>
          </div>
          <div>
            <span>&copy; {new Date().getFullYear()} STMIK Tazkia</span>
          </div>
        </div>
      </footer>

      {/* ── KONAMI UNLOCK OVERLAY ── */}
      <AnimatePresence>
        {konamiUnlocked && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B1F4A]/95 backdrop-blur-md text-white p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-16 h-16 rounded-2xl bg-[#FF8A2B]/20 border border-[#FF8A2B]/40 flex items-center justify-center text-3xl mb-4"
            >
              🔓
            </motion.div>
            <h2 className="text-2xl font-heading font-extrabold text-white tracking-tight mb-1">
              Akses Bypass Diberikan
            </h2>
            <p className="text-[#94A9C9] text-sm text-center mb-5">
              Mengalihkan Anda langsung ke aplikasi...
            </p>
            <div className="w-48 h-1.5 bg-[#132E6B] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#FF8A2B] rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
