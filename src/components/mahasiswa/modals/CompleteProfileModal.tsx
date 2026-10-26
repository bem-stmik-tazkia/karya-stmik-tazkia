"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, AlertCircle, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface CompleteProfileModalProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PRODI_OPTIONS = [
  "S1 Informatika",
  "S1 Sistem Informasi",
  "S1 Bisnis Digital",
  "D3 Sistem Informasi",
  "Lainnya",
];

export default function CompleteProfileModal({ userId, onClose, onSuccess }: CompleteProfileModalProps) {
  const [formData, setFormData] = useState({ prodi: "", angkatan: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [showDraftBadge, setShowDraftBadge] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isInitialMount = useRef(true);

  // Load from sessionStorage on mount (survives refresh)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`profile_draft_${userId}`) || localStorage.getItem(`profile_draft_${userId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      }
      localStorage.removeItem(`profile_draft_${userId}`);
    } catch (e) {}
  }, [userId]);

  // Auto-save to sessionStorage with debounce
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    setIsSaving(true);
    const handler = setTimeout(() => {
      try {
        sessionStorage.setItem(`profile_draft_${userId}`, JSON.stringify(formData));
      } catch (e) {}
      setIsSaving(false);
      setShowDraftBadge(true);
      setTimeout(() => setShowDraftBadge(false), 2000);
    }, 800); // 800ms debounce

    return () => clearTimeout(handler);
  }, [formData, userId]);

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formData.prodi || formData.angkatan) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prodi || !formData.angkatan) {
      toast.error("Mohon pilih Program Studi dan Angkatan Anda.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("mahasiswa_profiles")
        .update({
          prodi: formData.prodi,
          angkatan: parseInt(formData.angkatan),
        })
        .eq("user_id", userId);

      if (error) throw error;
      
      // Hapus draft setelah berhasil
      try {
        sessionStorage.removeItem(`profile_draft_${userId}`);
        localStorage.removeItem(`profile_draft_${userId}`);
      } catch (e) {}
      toast.success("Profil Anda berhasil dilengkapi! Selamat berkarya! 🎉");
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error("Mohon maaf, profil belum berhasil disimpan. Silakan coba kembali sesaat lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 sm:p-7 z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Lengkapi Profil
              </h2>
              <p className="text-xs text-muted-foreground font-normal">
                Mari buat profilmu lebih lengkap dan profesional
              </p>
            </div>
          </div>
          
          <div className="mt-4 mb-5 p-3.5 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs font-normal text-muted-foreground leading-relaxed">
              Program Studi dan Angkatan perlu diisi agar portofoliomu dapat ditemukan dengan mudah oleh mahasiswa dan mitra industri.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Program Studi <span className="text-primary">*</span>
              </label>
              <select
                value={formData.prodi}
                onChange={(e) => setFormData(prev => ({ ...prev, prodi: e.target.value }))}
                className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="" disabled>Pilih Program Studi...</option>
                {PRODI_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Tahun Angkatan <span className="text-primary">*</span>
              </label>
              <input
                type="number"
                min="2010"
                max={new Date().getFullYear()}
                value={formData.angkatan}
                onChange={(e) => setFormData(prev => ({ ...prev, angkatan: e.target.value }))}
                placeholder="Contoh: 2023"
                className="w-full h-11 px-3.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Indicator */}
            <div className="h-5 flex items-center justify-end">
              <AnimatePresence>
                {isSaving ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"
                  >
                    <Loader2 className="w-3 h-3 animate-spin" /> Menyimpan draf...
                  </motion.div>
                ) : showDraftBadge ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-medium"
                  >
                    <Check className="w-3 h-3" /> Draft tersimpan
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.removeItem(`profile_draft_${userId}`);
                    localStorage.removeItem(`profile_draft_${userId}`);
                  } catch (e) {}
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted transition-all"
              >
                Isi Nanti
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.prodi || !formData.angkatan}
                className="flex-[2] py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-[#ea580c] shadow-xs hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                ) : (
                  "Simpan Profil"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
