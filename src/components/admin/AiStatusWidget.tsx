"use client";

import React, { useEffect, useState, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiLoader,
  FiActivity,
  FiServer,
  FiChevronDown,
  FiChevronUp,
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
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchStatus = useCallback(() => {
    setError(null);
    startTransition(async () => {
      try {
        const data = await getAiStatus();
        setStatus(data);
        setLastRefresh(new Date());
      } catch (e: any) {
        setError(e.message || "Gagal mengambil status layanan");
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
      ? "bg-muted-foreground/40"
      : orPct <= 10
      ? "bg-rose-500"
      : orPct <= 30
      ? "bg-amber-400"
      : "bg-emerald-500";

  const statusLabel =
    orPct === null
      ? { text: "Gratis / Tak Terbatas", color: "text-blue-500 dark:text-blue-400" }
      : orPct <= 10
      ? { text: "Hampir Habis", color: "text-rose-500" }
      : orPct <= 30
      ? { text: "Tersisa Sedikit", color: "text-amber-500" }
      : { text: "Saldo Aman", color: "text-emerald-500 dark:text-emerald-400" };

  const isLoading = isPending && !status;
  const hasIssue = (db && db.stuck_count > 0) || (or && !or.available) || (gem && !gem.available);

  return (
    <div className="mb-6 rounded-2xl border border-border/80 bg-card shadow-xs transition-all overflow-hidden">
      {/* Friendly Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-5 py-3.5 gap-3 bg-muted/20 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs">
            <FiActivity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-heading font-extrabold text-foreground tracking-tight">
                Layanan Peninjauan Otomatis
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  hasIssue
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasIssue ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
                  }`}
                />
                {hasIssue ? "Perlu Perhatian" : "Sistem Siap"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Monitoring ketersediaan API dan antrean pengecekan karya
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {lastRefresh && (
            <span className="text-[11px] font-medium text-muted-foreground hidden md:inline">
              Pembaruan:{" "}
              {lastRefresh.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}

          <button
            type="button"
            onClick={fetchStatus}
            disabled={isPending}
            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-xs disabled:opacity-40 cursor-pointer"
            title="Refresh status layanan"
          >
            <FiRefreshCw
              className={`w-3.5 h-3.5 ${isPending ? "animate-spin text-primary" : ""}`}
            />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <span>{isExpanded ? "Ringkas" : "Lihat Detail"}</span>
            {isExpanded ? (
              <FiChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <FiChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Body Detail (Collapsible) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {error ? (
              <div className="px-5 py-4 flex items-center gap-2 text-rose-500 text-xs sm:text-sm font-semibold bg-rose-500/5">
                <FiAlertTriangle className="shrink-0" />
                <span>Gagal mengambil status layanan: {error}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border bg-muted/5">
                {/* ── Kolom 1: OpenRouter Saldo ── */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                      Layanan Utama (OpenRouter)
                    </p>
                  </div>

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
                          className={`text-xs sm:text-sm font-bold ${
                            or.available
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {or.available ? "Koneksi Terhubung" : "Tidak Tersedia"}
                        </span>
                      </div>

                      {or.is_free_tier || or.credits_limit === null ? (
                        <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-1.5">
                          Tingkat Gratis — Model tanpa batasan kredit
                        </div>
                      ) : (
                        <div className="mb-1">
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
                      <FiAlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">API Belum Dikonfigurasi</p>
                        <p className="text-[10px] text-muted-foreground">
                          Atur OPENROUTER_API_KEY di pengaturan lingkungan
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Kolom 2: Gemini API ── */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                      Layanan Cadangan (Gemini)
                    </p>
                  </div>

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
                          className={`text-xs sm:text-sm font-bold ${
                            gem.available
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {gem.available ? "Aktif & Siap Fallback" : "Tidak Merespons"}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg border border-border w-fit">
                        Model: {gem.model}
                      </span>
                      {!gem.available && (
                        <p className="text-[10px] text-rose-500 font-medium">
                          Batas pemanggilan tercapai atau API Key belum valid
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/80">
                      <FiServer className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">Cadangan Siap Sedia</p>
                        <p className="text-[10px] text-muted-foreground">
                          Atur GEMINI_API_KEY bila diperlukan
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Kolom 3: Antrian DB ── */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      Antrean Pengecekan
                    </p>
                  </div>

                  {isLoading || !db ? (
                    <div className="h-16 w-full bg-muted rounded animate-pulse" />
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Pending */}
                        <div className="rounded-xl border border-border/80 bg-card p-2 text-center transition-all">
                          <div className="text-base font-heading font-extrabold text-amber-600 dark:text-amber-400 leading-none">
                            {db.pending_count}
                          </div>
                          <div className="text-[9px] font-bold text-muted-foreground mt-1 tracking-wider uppercase">
                            Menunggu
                          </div>
                        </div>
                        {/* Processing */}
                        <div className="rounded-xl border border-border/80 bg-card p-2 text-center transition-all">
                          <div className="text-base font-heading font-extrabold text-blue-600 dark:text-blue-400 leading-none">
                            {db.processing_count}
                          </div>
                          <div className="text-[9px] font-bold text-muted-foreground mt-1 tracking-wider uppercase">
                            Diproses
                          </div>
                        </div>
                        {/* Stuck */}
                        <div className="rounded-xl border border-border/80 bg-card p-2 text-center transition-all">
                          <div
                            className={`text-base font-heading font-extrabold leading-none ${
                              db.stuck_count > 0
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {db.stuck_count > 0 ? db.stuck_count : "0"}
                          </div>
                          <div className="text-[9px] font-bold text-muted-foreground mt-1 tracking-wider uppercase">
                            {db.stuck_count > 0 ? "Tertahan" : "Lancar"}
                          </div>
                        </div>
                      </div>

                      {/* Warning bila tertahan */}
                      {db.stuck_count > 0 && (
                        <div className="mt-2 flex items-start gap-1.5 text-[10px] font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-2.5 py-1.5">
                          <FiAlertTriangle className="shrink-0 mt-px w-3.5 h-3.5" />
                          <span>{db.stuck_count} karya tertahan &gt;10 menit. Sistem perlu dipicu ulang.</span>
                        </div>
                      )}

                      {/* Info antrean banyak */}
                      {db.pending_count > 5 && (
                        <div className="mt-2 flex items-start gap-1.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-2.5 py-1.5">
                          <FiClock className="shrink-0 mt-px w-3.5 h-3.5" />
                          <span>Antrean sedang ramai ({db.pending_count} karya). Mohon tunggu beberapa saat.</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
