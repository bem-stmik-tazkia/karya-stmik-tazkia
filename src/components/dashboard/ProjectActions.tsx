"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ExternalLink, Edit, Trash2, Info, XCircle, Cpu, Eye } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface ProjectActionsProps {
  projectId: string;
  isApproved: boolean;
  karyaObj?: any;
}

export function ProjectActions({ projectId, isApproved, karyaObj }: ProjectActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  const openConfirm = () => {
    setShowConfirm(true);
    setCountdown(5);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const closeConfirm = () => {
    setShowConfirm(false);
    setCountdown(5);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Sedang memproses pengajuan...");
    
    // Instead of hard delete, submit a request to delete
    const { error } = await supabase
      .from("karya")
      .update({
        pending_edits: { type: "delete" },
        ai_review_status: "pending_review"
      })
      .eq("id", projectId);

    setIsDeleting(false);
    closeConfirm();

    if (!error) {
      toast.success("Permintaan penghapusan karya berhasil dikirim ke admin.", { id: toastId });
      router.refresh();
    } else {
      toast.error("Mohon maaf, pengajuan penghapusan belum berhasil dikirim. Silakan coba kembali.", { id: toastId });
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-1.5">
        {karyaObj && (
          <button
            onClick={() => setShowInfo(true)}
            className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 border border-border hover:border-purple-300 transition-colors shadow-xs"
            title="Lihat Feedback & Detail"
          >
            <Info className="w-4 h-4" />
          </button>
        )}

        <Link
          href={`/dashboard/projects/${projectId}`}
          className="p-2 rounded-lg bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors shadow-xs"
          title="Preview Karya"
        >
          <Eye className="w-4 h-4" />
        </Link>

        <Link
          href={`/submit/form?id=${projectId}`}
          className="p-2 rounded-lg bg-card text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border hover:border-primary/30 transition-colors shadow-xs"
          title="Edit Karya"
        >
          <Edit className="w-4 h-4" />
        </Link>

        <button
          onClick={openConfirm}
          className="p-2 rounded-lg bg-card text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-border hover:border-red-200 transition-colors shadow-xs"
          title="Hapus Karya"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 16, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="relative bg-card border border-border rounded-2xl p-6 sm:p-7 max-w-sm w-full shadow-2xl z-10 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1.5">Hapus Karya?</h3>
              <p className="text-muted-foreground font-normal text-xs mb-3 leading-relaxed">
                Tindakan ini <span className="text-red-600 font-semibold">tidak bisa dibatalkan</span>. Karya akan dihapus secara permanen dari sistem.
              </p>
              {/* Countdown warning */}
              {countdown > 0 ? (
                <div className="w-full mb-5 px-3.5 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center justify-center gap-2">
                  <span className="text-red-600 dark:text-red-400 font-medium text-xs">Tombol aktif dalam</span>
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0">{countdown}</span>
                  <span className="text-red-600 dark:text-red-400 font-medium text-xs">detik</span>
                </div>
              ) : (
                <div className="w-full mb-5 px-3.5 py-2.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl">
                  <p className="text-orange-700 dark:text-orange-400 font-medium text-xs">⚠️ Peringatan telah dibaca. Tombol hapus sekarang aktif.</p>
                </div>
              )}
              <div className="flex w-full gap-2.5">
                <button
                  onClick={closeConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-foreground bg-muted border border-border hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting || countdown > 0}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-red-600 hover:bg-red-700 transition-all shadow-xs hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {isDeleting ? "Menghapus..." : countdown > 0 ? `Hapus (${countdown})` : "Ya, Hapus"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showInfo && karyaObj && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfo(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 16, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="relative bg-card border border-border rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl z-10"
            >
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                aria-label="Tutup"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-foreground mb-1 pr-8">{karyaObj.title}</h3>
              <p className="text-xs text-muted-foreground mb-5 line-clamp-2 font-normal">{karyaObj.description}</p>

              <div className="space-y-3.5">
                {/* Status final */}
                <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                  karyaObj.status === "approved"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                    : karyaObj.status === "rejected"
                    ? "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
                }`}>
                  <span className="text-2xl">
                    {karyaObj.status === "approved" ? "✅" : karyaObj.status === "rejected" ? "❌" : "⏳"}
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide">
                      {karyaObj.status === "approved"
                        ? "Karya Anda Disetujui & Sudah Publik!"
                        : karyaObj.status === "rejected"
                        ? "Karya Anda Ditolak"
                        : "Karya Anda Sedang Dalam Proses Review"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-normal">
                      {karyaObj.status === "approved"
                        ? "Karya Anda sudah bisa dilihat oleh publik di halaman Galeri."
                        : karyaObj.status === "rejected"
                        ? "Perbaiki karya Anda sesuai catatan di bawah, lalu kirim ulang."
                        : "Harap tunggu, tim kurator sedang memeriksa karya Anda."}
                    </p>
                  </div>
                </div>

                {/* Catatan penolakan — hanya ditampilkan kalau ada & ditolak */}
                {karyaObj.status === "rejected" && karyaObj.reject_reason && (
                  <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
                    <span className="text-xs font-semibold text-primary uppercase block mb-1">📋 Catatan / Alasan Penolakan:</span>
                    <p className="text-xs text-foreground/90 font-medium whitespace-pre-line leading-relaxed">{karyaObj.reject_reason}</p>
                  </div>
                )}

                {karyaObj.status === "rejected" && (
                  <p className="text-xs text-muted-foreground text-center font-normal">
                    Kamu bisa klik tombol ✏️ (Edit) untuk memperbaiki karya ini lalu kirim ulang.
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <button
                  onClick={() => setShowInfo(false)}
                  className="px-5 py-2 rounded-xl font-semibold text-xs text-foreground bg-muted border border-border hover:bg-muted/80 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
