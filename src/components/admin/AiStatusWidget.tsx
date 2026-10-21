"use client";

import React, { useEffect, useState, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiZap,
  FiLoader,
  FiCpu,
} from "react-icons/fi";
import { getAiStatus, type AiStatusResult } from "@/app/actions/getAiStatus";

// ── Format USD ──
const fmtUSD = (v: number | null) => {
  if (v === null) return "?";
  if (v === 0) return "$0.00";
  return `$${v.toFixed(4)}`;
};

export default function AiStatusWidget() {
  const [status, setStatus] = useState<AiStatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchStatus = useCallback(() => {
    setError(null);
    startTransition(async () => {
      try {
        const data = await getAiStatus();
        setStatus(data);
        setLastRefresh(new Date());
      } catch (e: any) {
        setError(e.message || "Gagal mengambil status AI");
      }
    });
  }, []);

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

  const isLoading = isPending && !status;

  return (
    <div className="mb-6 rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs">
            <FiZap className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-heading font-extrabold uppercase text-foreground tracking-wider">
              Status AI Moderator
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Engine Siap
            </span>
          </div>
          {isPending && (
            <FiLoader className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">
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
            disabled={isPending}
            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-xs disabled:opacity-40"
            title="Refresh status AI"
          >
            <FiRefreshCw
              className={`w-3.5 h-3.5 ${isPending ? "animate-spin text-primary" : ""}`}
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
            className="px-5 py-4 flex items-center gap-2 text-rose-500 text-sm font-semibold"
          >
            <FiAlertTriangle className="shrink-0" />
            Gagal mengambil status: {error}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border"
          >
            {/* ── Kolom 1: OpenRouter Saldo ── */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5 tracking-wider">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                OpenRouter Credits
              </p>

              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-5 w-28 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-full bg-muted rounded animate-pulse" />
                </div>
              ) : or ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    {or.available ? (
                      <FiCheckCircle className="text-emerald-500 w-4 h-4 shrink-0" />
                    ) : (
                      <FiXCircle className="text-rose-500 w-4 h-4 shrink-0" />
                    )}
                    <span
                      className={`text-sm font-bold ${
                        or.available ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {or.available ? "API Aktif" : "API Tidak Tersedia"}
                    </span>
                  </div>

                  {or.is_free_tier || or.credits_limit === null ? (
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-1.5">
                      🆓 Free Tier — Model gratis unlimited
                    </div>
                  ) : (
                    <div className="mb-1.5">
                      <div className="flex justify-between text-[10px] font-semibold text-muted-foreground mb-1">
                        <span>Terpakai: {fmtUSD(or.credits_used)}</span>
                        <span className={statusLabel.color}>
                          Sisa: {fmtUSD(or.credits_remaining)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${barColor}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${orPct ?? 0}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-semibold mt-1">
                        <span className={statusLabel.color}>{statusLabel.text}</span>
                        <span className="text-muted-foreground">
                          Limit: {fmtUSD(or.credits_limit)}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/80">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <FiAlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Kunci API Belum Dikonfigurasi</p>
                    <p className="text-[10px] text-muted-foreground">Atur <code>OPENROUTER_API_KEY</code> di .env</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Kolom 2: Gemini API ── */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5 tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Gemini API (Fallback)
              </p>

              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-5 w-28 bg-muted rounded animate-pulse" />
                  <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                </div>
              ) : gem ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    {gem.available ? (
                      <FiCheckCircle className="text-emerald-500 w-4 h-4 shrink-0" />
                    ) : (
                      <FiXCircle className="text-rose-500 w-4 h-4 shrink-0" />
                    )}
                    <span
                      className={`text-sm font-bold ${
                        gem.available ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {gem.available ? "Aktif & Merespons" : "Tidak Merespons"}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg border border-border w-fit">
                    Model: {gem.model}
                  </span>
                  {!gem.available && (
                    <p className="text-[10px] text-rose-500 font-medium">
                      Rate limit atau API Key tidak valid
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/80">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <FiCpu className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Fallback Standby</p>
                    <p className="text-[10px] text-muted-foreground">Atur <code>GEMINI_API_KEY</code> di .env</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Kolom 3: Antrian DB ── */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5 tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Antrian Review DB
              </p>

              {isLoading || !db ? (
                <div className="h-16 w-full bg-muted rounded animate-pulse" />
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Pending */}
                    <div className="rounded-xl border border-border/80 bg-muted/30 p-2 text-center transition-all hover:bg-muted/50">
                      <div className="text-base font-heading font-extrabold text-amber-600 dark:text-amber-400 leading-none">
                        {db.pending_count}
                      </div>
                      <div className="text-[9px] font-bold uppercase text-muted-foreground mt-1 tracking-wider">
                        Menunggu
                      </div>
                    </div>
                    {/* Processing */}
                    <div className="rounded-xl border border-border/80 bg-muted/30 p-2 text-center transition-all hover:bg-muted/50">
                      <div className="text-base font-heading font-extrabold text-blue-600 dark:text-blue-400 leading-none">
                        {db.processing_count}
                      </div>
                      <div className="text-[9px] font-bold uppercase text-muted-foreground mt-1 tracking-wider">
                        Diproses
                      </div>
                    </div>
                    {/* Stuck */}
                    <div className="rounded-xl border border-border/80 bg-muted/30 p-2 text-center transition-all hover:bg-muted/50">
                      <div
                        className={`text-base font-heading font-extrabold leading-none ${
                          db.stuck_count > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {db.stuck_count > 0 ? db.stuck_count : "0"}
                      </div>
                      <div className="text-[9px] font-bold uppercase text-muted-foreground mt-1 tracking-wider">
                        {db.stuck_count > 0 ? "⚠️ Macet" : "✓ Normal"}
                      </div>
                    </div>
                  </div>

                  {/* Warning macet */}
                  {db.stuck_count > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-start gap-1.5 text-[10px] font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-2.5 py-1.5"
                    >
                      <FiAlertTriangle className="shrink-0 mt-px w-3.5 h-3.5" />
                      {db.stuck_count} karya macet &gt;10 menit. AI Worker perlu dipanggil ulang.
                    </motion.div>
                  )}

                  {/* Info antrian panjang */}
                  {db.pending_count > 5 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-start gap-1.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-2.5 py-1.5"
                    >
                      <FiClock className="shrink-0 mt-px w-3.5 h-3.5" />
                      Antrian panjang ({db.pending_count} karya). AI Worker mungkin perlu dipicu ulang.
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
