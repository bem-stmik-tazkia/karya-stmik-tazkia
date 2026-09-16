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

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`profile_draft_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch (e) {}
    }
  }, [userId]);

  // Auto-save to localStorage with debounce
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    setIsSaving(true);
    const handler = setTimeout(() => {
      localStorage.setItem(`profile_draft_${userId}`, JSON.stringify(formData));
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
      toast.error("Mohon isi Program Studi dan Angkatan.");
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
      localStorage.removeItem(`profile_draft_${userId}`);
      toast.success("Profil berhasil dilengkapi!");
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal memperbarui profil.");
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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="relative w-full max-w-md bg-card border-4 border-border rounded-3xl shadow-[8px_8px_0px_var(--color-border)] p-6 md:p-8 z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 border-2 border-secondary/30 flex items-center justify-center text-secondary">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase text-foreground">
                Lengkapi Profil
              </h2>
              <p className="text-xs font-bold text-muted-foreground">
                Mari buat profilmu lebih profesional!
              </p>
            </div>
          </div>
          
          <div className="mt-4 mb-6 p-3 bg-primary/10 border-2 border-primary/20 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-primary-shadow">
              Program Studi dan Angkatan perlu diisi agar portofoliomu dapat ditemukan dengan mudah oleh mahasiswa lain.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative">
            <div>
              <label className="block text-xs font-black text-foreground uppercase mb-1.5">
                Program Studi <span className="text-primary">*</span>
              </label>
              <select
                value={formData.prodi}
                onChange={(e) => setFormData(prev => ({ ...prev, prodi: e.target.value }))}
                className="w-full h-12 px-4 rounded-xl border-2 border-border bg-muted/50 text-sm font-bold text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="" disabled>Pilih Program Studi...</option>
                {PRODI_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-foreground uppercase mb-1.5">
                Tahun Angkatan <span className="text-primary">*</span>
              </label>
              <input
                type="number"
                min="2010"
                max={new Date().getFullYear()}
                value={formData.angkatan}
                onChange={(e) => setFormData(prev => ({ ...prev, angkatan: e.target.value }))}
                placeholder="Contoh: 2023"
                className="w-full h-12 px-4 rounded-xl border-2 border-border bg-muted/50 text-sm font-bold text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Sticker Badge Indicator */}
            <div className="h-6 flex items-center justify-end">
              <AnimatePresence>
                {isSaving ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase"
                  >
                    <Loader2 className="w-3 h-3 animate-spin" /> Menyimpan draf...
                  </motion.div>
                ) : showDraftBadge ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -5 }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-white border-2 border-secondary-shadow shadow-[2px_2px_0px_var(--color-secondary-shadow)] text-[10px] font-black uppercase rotate-2 origin-bottom-right"
                  >
                    <Check className="w-3 h-3" /> Draft tersimpan
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl border-2 border-border bg-card text-foreground font-black text-xs uppercase hover:bg-muted transition-all active:translate-y-1"
              >
                Isi Nanti
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.prodi || !formData.angkatan}
                className="flex-[2] py-3.5 rounded-xl border-2 border-primary-shadow bg-primary text-primary-foreground font-black text-xs uppercase shadow-[4px_4px_0px_var(--color-primary-shadow)] hover:shadow-[2px_2px_0px_var(--color-primary-shadow)] hover:translate-y-0.5 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
