"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiZap,
  FiLoader,
} from "react-icons/fi";
import type { AiStatusResult } from "@/app/api/ai-status/route";

// ── Format USD ──
const fmtUSD = (v: number | null) => {
  if (v === null) return "?";
  if (v === 0) return "$0.00";
  return `$${v.toFixed(4)}`;
};

export default function AiStatusWidget() {
  const [status, setStatus] = useState<AiStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/ai-status", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AiStatusResult = await res.json();
      setStatus(data);
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e.message || "Gagal mengambil status AI");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Fetch saat mount + auto-refresh tiap 60 detik
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60_000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // ── Derive UI values ──
  const or = status?.openrouter;
  const gem = status?.gemini;
  const db = status?.db;

  // Persentase sisa kredit OpenRouter
  const orPct =
    or?.credits_remaining !== null &&
    or?.credits_limit !== null &&
    or?.credits_limit !== undefined &&
    or?.credits_limit > 0 &&
    or?.credits_remaining !== undefined
      ? Math.max(0, Math.min(100, (or.credits_remaining / or.credits_limit) * 100))
      : null;

  // Warna bar
  const barColor =
    orPct === null
      ? "bg-gray-400"
      : orPct <= 10
      ? "bg-red-500"
      : orPct <= 30
      ? "bg-amber-400"
      : "bg-green-500";

  const statusLabel =
    orPct === null
      ? { text: "Gratis / Tak Terbatas", color: "text-blue-500" }
      : orPct <= 10
      ? { text: "Hampir Habis!", color: "text-red-500" }
      : orPct <= 30
      ? { text: "Tersisa Sedikit", color: "text-amber-500" }
      : { text: "Aman", color: "text-green-500" };

  return (
    <div className="mb-6 rounded-3xl border-4 border-border bg-card shadow-[6px_6px_0px_var(--color-border)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b-4 border-border bg-muted/40">
        <div className="flex items-center gap-2">
          <FiZap className="text-primary w-4 h-4" />
          <span className="text-xs font-black uppercase text-foreground tracking-wider">
            Status AI Moderator
          </span>
          {loading && (
            <FiLoader className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-[10px] font-bold text-muted-foreground">
              Update:{" "}
              {lastRefresh.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          )}
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-1.5 rounded-lg border-2 border-border hover:bg-muted transition-colors disabled:opacity-40"
            title="Refresh status"
          >
            <FiRefreshCw
              className={`w-3.5 h-3.5 text-foreground ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-5 py-4 flex items-center gap-2 text-red-500 text-sm font-bold"
          >
            <FiAlertTriangle className="shrink-0" />
            Gagal mengambil status: {error}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-3 divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-border/40"
          >
            {/* ── Kolom 1: OpenRouter Saldo ── */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                OpenRouter Credits
              </p>

              {!status ? (
                <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              ) : or ? (
                <>
                  {/* Status badge */}
                  <div className="flex items-center gap-2 mb-2">
                    {or.available ? (
                      <FiCheckCircle className="text-green-500 w-4 h-4 shrink-0" />
                    ) : (
                      <FiXCircle className="text-red-500 w-4 h-4 shrink-0" />
                    )}
                    <span
                      className={`text-sm font-black ${
                        or.available ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {or.available ? "API Aktif" : "API Tidak Tersedia"}
                    </span>
                  </div>

                  {/* Kredit info */}
                  {or.is_free_tier || or.credits_limit === null ? (
                    <div className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl px-3 py-1.5">
                      🆓 Free Tier — Model gratis unlimited
                    </div>
                  ) : (
                    <>
                      {/* Progress bar */}
                      <div className="mb-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1">
                          <span>
                            Terpakai: {fmtUSD(or.credits_used)}
                          </span>
                          <span className={statusLabel.color}>
                            Sisa: {fmtUSD(or.credits_remaining)}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden border-2 border-border">
                          <motion.div
                            className={`h-full rounded-full ${barColor}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${orPct ?? 0}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold mt-0.5">
                          <span className={statusLabel.color}>
                            {statusLabel.text}
                          </span>
                          <span className="text-muted-foreground">
                            Limit: {fmtUSD(or.credits_limit)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-xs font-bold text-muted-foreground">
                  ⚠️ API Key tidak dikonfigurasi
                </p>
              )}
            </div>

            {/* ── Kolom 2: Gemini API ── */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
                Gemini API (Fallback)
              </p>

              {!status ? (
                <div className="h-8 w-28 bg-muted rounded animate-pulse" />
              ) : gem ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    {gem.available ? (
                      <FiCheckCircle className="text-green-500 w-4 h-4 shrink-0" />
                    ) : (
                      <FiXCircle className="text-red-500 w-4 h-4 shrink-0" />
                    )}
                    <span
                      className={`text-sm font-black ${
                        gem.available ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {gem.available ? "Aktif & Merespons" : "Tidak Merespons"}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg border-2 border-border w-fit">
                    Model: {gem.model}
                  </span>
                  {!gem.available && (
                    <p className="text-[10px] text-red-500 font-bold">
                      Kemungkinan rate limit atau API Key tidak valid
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs font-bold text-muted-foreground">
                  ⚠️ API Key tidak dikonfigurasi
                </p>
              )}
            </div>

            {/* ── Kolom 3: Antrian DB ── */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Antrian Review DB
              </p>

              {!status || !db ? (
                <div className="h-16 w-full bg-muted rounded animate-pulse" />
              ) : (
                <div className="flex gap-3">
                  {/* Pending */}
                  <div className="flex-1 rounded-xl border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 text-center">
                    <div className="text-xl font-black text-yellow-600">
                      {db.pending_count}
                    </div>
                    <div className="text-[9px] font-black uppercase text-yellow-700 dark:text-yellow-500">
                      Menunggu
                    </div>
                  </div>

                  {/* Processing */}
                  <div className="flex-1 rounded-xl border-2 border-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-center">
                    <div className="text-xl font-black text-blue-600">
                      {db.processing_count}
                    </div>
                    <div className="text-[9px] font-black uppercase text-blue-700 dark:text-blue-400">
                      Diproses
                    </div>
                  </div>

                  {/* Stuck */}
                  <div
                    className={`flex-1 rounded-xl border-2 px-3 py-2 text-center ${
                      db.stuck_count > 0
                        ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                        : "border-green-400 bg-green-50 dark:bg-green-900/20"
                    }`}
                  >
                    <div
                      className={`text-xl font-black flex items-center justify-center gap-1 ${
                        db.stuck_count > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {db.stuck_count > 0 ? (
                        <>
                          <FiClock className="w-4 h-4" />
                          {db.stuck_count}
                        </>
                      ) : (
                        "0"
                      )}
                    </div>
                    <div
                      className={`text-[9px] font-black uppercase ${
                        db.stuck_count > 0
                          ? "text-red-700 dark:text-red-400"
                          : "text-green-700 dark:text-green-400"
                      }`}
                    >
                      {db.stuck_count > 0 ? "⚠️ Macet" : "✓ Tidak Macet"}
                    </div>
                  </div>
                </div>
              )}

              {/* Warning jika ada yang macet */}
              {db && db.stuck_count > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-start gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 rounded-xl px-2 py-1.5"
                >
                  <FiAlertTriangle className="shrink-0 mt-px w-3.5 h-3.5" />
                  {db.stuck_count} karya macet &gt;10 menit. Coba trigger ulang
                  AI Worker dari server.
                </motion.div>
              )}

              {/* Info jika antrian panjang */}
              {db && db.pending_count > 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-start gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 rounded-xl px-2 py-1.5"
                >
                  <FiClock className="shrink-0 mt-px w-3.5 h-3.5" />
                  Antrian panjang ({db.pending_count} karya). AI Worker mungkin
                  perlu dipanggil ulang.
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
