"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Clock, RefreshCw, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";

interface MaintenanceInfo {
  active: boolean;
  message: string;
  endTime: string | null;
}

// Countdown removed by request, using static duration string instead.



function FloatingBubbles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const bubbles = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        width: Math.random() * 40 + 10,
        height: Math.random() * 40 + 10,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        borderColor:
          i % 3 === 0
            ? "var(--primary)"
            : i % 3 === 1
              ? "var(--secondary)"
              : "var(--accent)",
        animateX: Math.random() * 30 - 15,
        duration: Math.random() * 5 + 5,
        delay: Math.random() * 3,
      })),
    []
  );

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            width: b.width,
            height: b.height,
            left: b.left,
            top: b.top,
            borderColor: b.borderColor,
            opacity: 0.08,
          }}
          animate={{
            y: [0, -60, 0],
            x: [0, b.animateX, 0],
            opacity: [0.05, 0.15, 0.05],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function MaintenancePage() {
  const [info, setInfo] = useState<MaintenanceInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Konami Code: ↑↑↓↓←→ Enter ──────────────────────────────────────────
  const KONAMI = [
    "ArrowUp", "ArrowUp",
    "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight",
    "Enter",
  ];
  const konamiRef = React.useRef<string[]>([]);
  const [konamiUnlocked, setKonamiUnlocked] = useState(false);

  useEffect(() => {
    const handleKey = async (e: KeyboardEvent) => {
      konamiRef.current = [...konamiRef.current, e.key].slice(-KONAMI.length);
      if (konamiRef.current.join(",") === KONAMI.join(",")) {
        konamiRef.current = [];
        // Panggil API untuk set bypass cookie (secret hanya ada di server)
        const res = await fetch("/api/maintenance/bypass", { method: "POST" });
        if (res.ok) {
          setKonamiUnlocked(true);
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          message: "Kami sedang melakukan pemeliharaan sistem.",
          endTime: null,
        });
        setLoading(false);
      });
  }, []);

  const handleRefresh = () => window.location.reload();

  return (
    <div className="min-h-[100dvh] bg-background px-4 pt-16 pb-8 sm:flex sm:items-center sm:justify-center relative">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-60 -right-60 w-[700px] h-[700px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-60 -left-60 w-[700px] h-[700px] bg-secondary/5 rounded-full blur-3xl" />
      </div>
      <FloatingBubbles />


      {/* ── KONAMI UNLOCK OVERLAY ─────────────────────────────────────── */}
      {konamiUnlocked && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="text-8xl mb-6"
          >
            🔓
          </motion.div>
          <motion.h2
            className="text-3xl font-black text-foreground uppercase tracking-tight mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Akses Diberikan! 🎉
          </motion.h2>
          <motion.p
            className="text-muted-foreground font-bold text-sm"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            Mengalihkan ke beranda...
          </motion.p>
          <motion.div className="mt-6 w-48 h-2 bg-muted border-2 border-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.8, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      )}

      <motion.div
        className="relative z-10 w-full max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 220, damping: 22 }}
      >
        {/* Header icon cluster */}
        <div className="flex justify-center mb-7">
          <div className="relative">
            {/* Main icon */}
            <motion.div
              className="w-20 h-20 bg-primary/10 text-primary rounded-2xl border border-primary/20 shadow-md shadow-orange-500/10 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
              >
                <Wrench className="w-10 h-10" />
              </motion.div>
            </motion.div>

            {/* Small floating badge */}
            <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/30 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>

            {/* Small clock badge */}
            <div className="absolute -bottom-2 -left-2 w-7 h-7 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/30 flex items-center justify-center shadow-xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Main card */}
        <motion.div
          className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/20"
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
        >
          {/* Subtle gradient top bar */}
          <div className="h-1 bg-gradient-to-r from-primary via-amber-500 to-orange-600" />

          <div className="p-6 sm:p-8 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-4">
              <Wrench className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">
                Mode Pemeliharaan
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-2.5">
              Sistem Sedang Diperbarui
            </h1>

            <p className="text-sm text-muted-foreground font-normal mb-2 leading-relaxed max-w-sm mx-auto">
              {loading
                ? "Memuat informasi status..."
                : info?.message || "Kami sedang melakukan peningkatan performa dan pemeliharaan sistem berkala."}
            </p>
            <p className="text-xs text-muted-foreground/80 font-normal mb-6">
              Terima kasih atas kesabaran Anda. Layanan akan segera aktif kembali.
            </p>

            {/* Estimated time text */}
            {!loading && info?.endTime && (
              <div className="mb-6">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Estimasi Selesai
                </p>
                <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-muted/60 border border-border">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    Sekitar {info.endTime}
                  </span>
                </div>
              </div>
            )}

            {/* Estimated time text if no endTime */}
            {!loading && !info?.endTime && (
              <div className="mb-6 p-3 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Durasi estimasi belum ditentukan</span>
                </div>
              </div>
            )}

            {/* Progress bar animation */}
            <div className="mb-6">
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ width: "50%" }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-medium mt-2">
                Pembaruan sedang berjalan secara otomatis
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 border-t border-border pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleRefresh}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs hover:bg-[#ea580c] hover:shadow-md hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Muat Ulang Halaman</span>
                </button>

                <a
                  href="https://bem.stmik.tazkia.ac.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground font-semibold text-xs sm:text-sm rounded-xl shadow-2xs hover:bg-muted/70 hover:border-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <span>Website BEM Tazkia</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-muted/30 px-6 py-3.5">
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <span className="font-bold text-xs tracking-tight">
                  <span className="text-foreground">Karya</span>
                  <span className="text-primary"> Tazkia</span>
                </span>
              </div>
              <span className="text-muted-foreground/40 text-xs">—</span>
              <p className="text-[11px] text-muted-foreground">
                Galeri Portofolio Mahasiswa STMIK Tazkia
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact info */}
        <p className="text-center text-xs text-muted-foreground mt-5">
          Ada kendala darurat? Hubungi kami via{" "}
          <a
            href="https://wa.me/6285199562719"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-semibold transition-colors"
          >
            WhatsApp Admin
          </a>
        </p>
      </motion.div>
    </div>
  );
}
