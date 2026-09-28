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
    <div className="min-h-[100dvh] bg-background px-4 pt-16 pb-8 sm:flex sm:items-center sm:justify-center overflow-x-hidden overflow-y-auto relative">
      {/* Background */}
      <div className="absolute -top-60 -right-60 w-[700px] h-[700px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-60 -left-60 w-[700px] h-[700px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
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
        className="relative z-10 w-full max-w-xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 25 }}
      >
        {/* Header icon cluster */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Main gear */}
            <motion.div
              className="w-28 h-28 bg-primary text-primary-foreground rounded-[2rem] border-4 border-border shadow-[8px_8px_0px_0px_var(--color-border)] flex items-center justify-center"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                <Wrench className="w-14 h-14" />
              </motion.div>
            </motion.div>

            {/* Small floating badge */}
            <motion.div
              className="absolute -top-3 -right-3 w-10 h-10 bg-accent text-accent-foreground rounded-full border-3 border-border shadow-[3px_3px_0px_0px_var(--color-border)] flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            >
              <AlertTriangle className="w-5 h-5" />
            </motion.div>

            {/* Small clock badge */}
            <motion.div
              className="absolute -bottom-3 -left-3 w-10 h-10 bg-secondary text-secondary-foreground rounded-full border-3 border-border shadow-[3px_3px_0px_0px_var(--color-border)] flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
            >
              <Clock className="w-5 h-5" />
            </motion.div>
          </div>
        </div>

        {/* Main card */}
        <motion.div
          className="bg-card border-4 border-border rounded-[2rem] overflow-hidden shadow-[8px_8px_0px_0px_var(--color-border)]"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
        >
          {/* Gradient top bar */}
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary" />

          <div className="p-6 sm:p-10 text-center">
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/30 rounded-full mb-5"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Wrench className="w-4 h-4 text-primary" />
              <span className="text-xs font-black text-primary uppercase tracking-wider">
                Maintenance Mode
              </span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-black text-foreground uppercase tracking-tight mb-3">
              Sedang Ada Perbaikan 🔧
            </h1>

            <p className="text-muted-foreground font-bold mb-2 leading-relaxed max-w-md mx-auto">
              {loading
                ? "Memuat informasi..."
                : info?.message || "Kami sedang melakukan pemeliharaan sistem untuk meningkatkan performa."}
            </p>
            <p className="text-sm text-muted-foreground/70 font-medium mb-8">
              Terima kasih atas kesabaran kamu. Kami akan segera kembali! 🚀
            </p>

            {/* Estimated time text */}
            {!loading && info?.endTime && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">
                  Estimasi Selesai
                </p>
                <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)]">
                  <Clock className="w-5 h-5 text-secondary" />
                  <span className="text-lg font-black text-foreground uppercase tracking-tight">
                    Sekitar {info.endTime}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Estimated time text if no endTime */}
            {!loading && !info?.endTime && (
              <motion.div
                className="mb-8 p-4 rounded-2xl bg-muted border-2 border-border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-center gap-2 text-muted-foreground font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Durasi estimasi belum ditentukan</span>
                </div>
              </motion.div>
            )}

            {/* Progress bar animation */}
            <div className="mb-8">
              <div className="w-full h-3 bg-muted border-2 border-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ width: "60%" }}
                />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
                Sedang dalam proses pemeliharaan...
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                onClick={handleRefresh}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 bg-primary text-primary-foreground font-black uppercase text-sm border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:shadow-[2px_2px_0px_0px_var(--color-border)] hover:translate-y-0.5 rounded-2xl transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Halaman
              </motion.button>

              <motion.a
                href="https://bem.stmik.tazkia.ac.id"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 bg-muted text-foreground font-black uppercase text-[11px] sm:text-xs border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:shadow-[2px_2px_0px_0px_var(--color-border)] hover:translate-y-0.5 rounded-2xl transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                Sambil Nunggu, Cek Web BEM
              </motion.a>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-4 border-border bg-muted/50 px-8 py-4">
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-6 bg-primary rounded-full shadow-[1px_1px_0px_var(--color-primary-shadow)]" />
                <span className="font-black text-sm tracking-tight">
                  <span className="text-secondary">Karya</span>
                  <span className="text-primary"> Tazkia</span>
                </span>
              </div>
              <span className="text-muted-foreground/40 font-bold">—</span>
              <p className="text-xs font-bold text-muted-foreground">
                Galeri Portofolio Mahasiswa STMIK Tazkia
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact info */}
        <motion.p
          className="text-center text-xs font-bold text-muted-foreground mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Ada pertanyaan? Hubungi admin via{" "}
          <a
            href="https://wa.me/6285199562719"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-green-500 hover:text-green-400 hover:underline font-black transition-colors"
          >
            WhatsApp
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
