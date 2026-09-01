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
    const toastId = toast.loading("Menghapus projek...");
    
    // Hard delete from database
    const { error } = await supabase
      .from("karya")
      .delete()
      .eq("id", projectId);

    setIsDeleting(false);
    closeConfirm();

    if (!error) {
      toast.success("Projek berhasil dihapus secara permanen.", { id: toastId });
      router.refresh();
    } else {
      toast.error("Gagal menghapus projek. Silakan coba lagi.", { id: toastId });
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        {karyaObj && (
          <button
            onClick={() => setShowInfo(true)}
            className="p-2.5 rounded-xl bg-purple-100 border-2 border-purple-600 shadow-[2px_2px_0px_#7e22ce] hover:-translate-y-0.5 active:translate-y-0 transition-all text-purple-700"
            title="Lihat Feedback & Detail"
          >
            <Info className="w-4 h-4" />
          </button>
        )}

        <Link
          href={`/dashboard/projects/${projectId}`}
          className="p-2.5 rounded-xl bg-card border-2 border-border shadow-[2px_2px_0px_var(--color-border)] hover:-translate-y-0.5 hover:bg-muted active:translate-y-0 transition-all text-foreground"
          title="Preview Projek"
        >
          <Eye className="w-4 h-4" />
        </Link>

        <Link
          href={`/submit/form?id=${projectId}`}
          className="p-2.5 rounded-xl bg-orange-100 border-2 border-orange-500 shadow-[2px_2px_0px_#f97316] hover:-translate-y-0.5 active:translate-y-0 transition-all text-orange-600"
          title="Edit Projek"
        >
          <Edit className="w-4 h-4" />
        </Link>

        <button
          onClick={openConfirm}
          className="p-2.5 rounded-xl bg-red-100 border-2 border-red-600 shadow-[2px_2px_0px_#dc2626] hover:-translate-y-0.5 active:translate-y-0 transition-all text-red-700"
          title="Hapus Projek"
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
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="relative bg-card border-4 border-border rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-[8px_8px_0px_0px_var(--color-border)] z-10 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-100 border-4 border-red-600 text-red-600 flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2 uppercase">Hapus Projek?</h3>
              <p className="text-muted-foreground font-bold text-xs sm:text-sm mb-2 leading-relaxed">
                Tindakan ini <span className="text-red-600 font-black">tidak bisa dibatalkan</span>. Projek akan dihapus secara permanen dari sistem.
              </p>
              {/* Countdown warning */}
              {countdown > 0 ? (
                <div className="w-full mb-5 px-4 py-3 bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-700 rounded-xl flex items-center justify-center gap-2">
                  <span className="text-red-600 dark:text-red-400 font-black text-sm">Baca dulu! Tombol aktif dalam</span>
                  <span className="w-8 h-8 rounded-full bg-red-600 text-white font-black text-sm flex items-center justify-center shrink-0">{countdown}</span>
                  <span className="text-red-600 dark:text-red-400 font-black text-sm">detik</span>
                </div>
              ) : (
                <div className="w-full mb-5 px-4 py-3 bg-orange-50 dark:bg-orange-950/40 border-2 border-orange-300 dark:border-orange-700 rounded-xl">
                  <p className="text-orange-700 dark:text-orange-400 font-black text-xs">⚠️ Kamu sudah membaca peringatan ini. Tombol hapus sekarang aktif.</p>
                </div>
              )}
              <div className="flex w-full gap-3">
                <button
                  onClick={closeConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 rounded-xl font-black text-sm text-foreground bg-muted border-2 border-border hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting || countdown > 0}
                  className="flex-1 py-3 px-4 rounded-xl font-black text-sm text-white bg-red-600 border-2 border-red-800 shadow-[3px_3px_0px_0px_#991b1b] hover:bg-red-700 hover:translate-y-0.5 active:translate-y-1 transition-all disabled:opacity-40 disabled:bg-red-300 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 flex items-center justify-center gap-2"
                >
                  {isDeleting ? "Menghapus..." : countdown > 0 ? `Hapus (${countdown})` : "Ya, Hapus Permanen"}
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
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="relative bg-card border-4 border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_var(--color-border)] z-10"
            >
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 p-2 bg-muted hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <h3 className="text-xl font-black text-foreground mb-1 uppercase pr-10">{karyaObj.title}</h3>
              <p className="text-xs font-bold text-muted-foreground mb-6 line-clamp-2">{karyaObj.description}</p>

              <div className="space-y-4">
                {/* Status final */}
                <div className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${
                  karyaObj.status === "approved"
                    ? "bg-green-50 border-green-200"
                    : karyaObj.status === "rejected"
                    ? "bg-red-50 border-red-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}>
                  <span className="text-2xl">
                    {karyaObj.status === "approved" ? "✅" : karyaObj.status === "rejected" ? "❌" : "⏳"}
                  </span>
                  <div>
                    <p className={`text-sm font-black uppercase ${
                      karyaObj.status === "approved" ? "text-green-700" :
                      karyaObj.status === "rejected" ? "text-red-700" : "text-yellow-700"
                    }`}>
                      {karyaObj.status === "approved"
                        ? "Karya Anda Disetujui & Sudah Publik!"
                        : karyaObj.status === "rejected"
                        ? "Karya Anda Ditolak"
                        : "Karya Anda Sedang Dalam Proses Review"}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground mt-0.5">
                      {karyaObj.status === "approved"
                        ? "Karya Anda sudah bisa dilihat oleh publik di halaman Galeri."
                        : karyaObj.status === "rejected"
                        ? "Perbaiki karya Anda sesuai catatan di bawah, lalu kirim ulang."
                        : "Harap tunggu, tim kami sedang memeriksa karya Anda."}
                    </p>
                  </div>
                </div>

                {/* Catatan penolakan — hanya ditampilkan kalau ada & ditolak */}
                {karyaObj.status === "rejected" && karyaObj.reject_reason && (
                  <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-2xl">
                    <span className="text-xs font-black text-orange-800 uppercase block mb-1">📋 Catatan / Alasan Penolakan:</span>
                    <p className="text-sm font-bold text-orange-700 whitespace-pre-line">{karyaObj.reject_reason}</p>
                  </div>
                )}

                {karyaObj.status === "rejected" && (
                  <p className="text-xs text-muted-foreground font-bold text-center">
                    Kamu bisa klik tombol ✏️ (Edit) untuk memperbaiki karya ini lalu kirim ulang.
                  </p>
                )}
              </div>

              <div className="mt-8 pt-4 border-t-2 border-border/50 text-center">
                <button
                  onClick={() => setShowInfo(false)}
                  className="px-6 py-2.5 rounded-xl font-black text-sm text-foreground bg-muted border-2 border-border hover:bg-muted/80 transition-colors"
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
