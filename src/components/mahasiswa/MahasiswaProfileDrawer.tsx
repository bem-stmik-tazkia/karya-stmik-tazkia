"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  MailX,
  Globe,
  ExternalLink,
  Folder,
  GraduationCap,
  Eye,
  Heart,
  ArrowRight,
  Share2,
  Check,
  Lock,
  Info,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { Student } from "@/types/student";
import { type Karya, KARYA_CATEGORIES } from "@/types/karya";
import { BouncyButton } from "@/components/ui/BouncyButton";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { ProjectCoverPlaceholder } from "@/components/ui/ProjectCoverPlaceholder";
import { getTechTagColor } from "@/utils/techTagColor";
import { PREDEFINED_SKILLS } from "@/utils/skillOptions";
import {
  PENGHARGAAN_CATALOG,
  calculateStudentEarnedBadges,
  type PenghargaanBadge,
} from "@/data/penghargaanCatalog";
import { TazkiaAchievementHexBadge } from "@/components/penghargaan/TazkiaAchievementBadge";
import ShareProfileModal from "@/components/mahasiswa/ShareProfileModal";
import SkinPreviewModal from "@/components/mahasiswa/SkinPreviewModal";
import toast from "react-hot-toast";

function getCategoryLabel(category?: string): string {
  if (!category) return "";
  const found = KARYA_CATEGORIES.find(
    (c) =>
      c.value.toLowerCase() === category.toLowerCase() ||
      c.label.toLowerCase() === category.toLowerCase()
  );
  return found ? found.label : category;
}

function getCategoryBadgeClass(category?: string): string {
  const cat = (category || "").toLowerCase();
  if (cat === "research" || cat.includes("riset") || cat.includes("jurnal")) {
    return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-600";
  }
  if (cat === "technology" || cat.includes("web")) {
    return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600";
  }
  if (cat === "programming" || cat.includes("mobile") || cat.includes("apps")) {
    return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600";
  }
  if (cat === "iot") {
    return "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600";
  }
  if (cat === "multimedia" || cat.includes("desain")) {
    return "bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-600";
  }
  return "bg-primary/10 text-primary border-primary/20";
}

interface MahasiswaProfileDrawerProps {
  student: Student | null;
  projects: Karya[];
  onClose: () => void;
}

export default function MahasiswaProfileDrawer({
  student,
  projects,
  onClose,
}: MahasiswaProfileDrawerProps) {
  const [selectedBadgeDetail, setSelectedBadgeDetail] = useState<number | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSkinModal, setShowSkinModal] = useState(false);

  if (!student) return null;

  const statusLabel = student.statusBadge || "Open for Collab";
  const dotConfig: Record<string, { color: string; pulse: boolean }> = {
    "Open for Collab": { color: "#FF8A2B", pulse: true },
    "Siap Freelance": { color: "#10B981", pulse: false },
    "Mencari Magang": { color: "#38BDF8", pulse: false },
    "Fokus Belajar": { color: "#A78BFA", pulse: false },
    "Bekerja Full-time": { color: "#34D399", pulse: false },
    "Punya Ide Startup": { color: "#FBBF24", pulse: false },
    "Mencari Mentor": { color: "#C084FC", pulse: false },
  };
  const currentDot = dotConfig[statusLabel] || {
    color: "#FF8A2B",
    pulse: statusLabel === "Open for Collab",
  };

  const studentEmail = (student.contactEmail || "").trim();
  const hasEmail = Boolean(studentEmail && studentEmail.includes("@"));

  const studentSkills = Array.from(
    new Set(student.skills || [])
  ).filter((s) => Boolean(s) && PREDEFINED_SKILLS.includes(s));

  const studentBadgeIds = PENGHARGAAN_CATALOG.map((b) => b.id);

  const displayedBadges = PENGHARGAAN_CATALOG;


  const handleShare = () => {
    setShowShareModal(true);
  };

  return (
    <>
      <AnimatePresence>
        {student && (
          <div key="drawer-container" className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-card border-l border-border h-full shadow-2xl overflow-y-auto flex flex-col z-10"
            >
              {/* Header Banner (Solid Navy matching Tazkia Design System) */}
              <div
                className="relative h-36 sm:h-44 bg-gradient-to-r from-[#0B1F4A] via-[#102D70] to-[#0B1F4A] p-5 shrink-0 flex items-start justify-between overflow-hidden border-b-4 border-[#FF8A2B]"
              >
                <div className="relative z-10 flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-white/15 text-white backdrop-blur-sm border border-white/10 shadow-xs">
                    ANGKATAN {student.angkatan}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/10 shadow-xs">
                    <span
                      className="w-2 h-2 rounded-full g-pulse bg-[#FF8A2B]"
                      aria-hidden="true"
                    />
                    <span>{statusLabel}</span>
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="relative z-10 p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/15 text-white transition-all shadow-xs active:scale-95 cursor-pointer"
                  aria-label="Tutup Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 pt-0 flex-1 space-y-6">
                {/* Avatar (Static with Orange Ring) */}
                <div className="relative -mt-14 mb-2">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#FF8A2B] to-[#FFA84A] p-1 shadow-xl shadow-orange-500/25 flex items-center justify-center shrink-0">
                    <div className="w-full h-full rounded-full border-3 sm:border-4 border-card bg-[#FF8A2B] text-white flex items-center justify-center overflow-hidden relative">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-extrabold font-serif">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name & Lihat Profil Lengkap Action Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold font-heading text-foreground">{student.name}</h2>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mt-1">
                      <GraduationCap className="w-4 h-4 text-[#FF8A2B] shrink-0" />
                      <span>{student.prodi}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setShowSkinModal(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs shadow-xs hover:border-[#FF8A2B]/50 active:scale-95 transition-all cursor-pointer shrink-0"
                      title="Ganti Tema & Desain Kartu"
                    >
                      <Palette className="w-3.5 h-3.5 text-[#FF8A2B]" />
                      <span>Tema Kartu</span>
                    </button>
                    <Link
                      href={`/student/${student.id}`}
                      onClick={onClose}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs hover:opacity-95 active:scale-95 transition-all shrink-0"
                    >
                      <span>Lihat Profil Lengkap</span>
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </Link>
                  </div>
                </div>

                {/* Social & Contact Circular Icon Buttons */}
                <div className="flex items-center flex-wrap gap-2.5 pt-1">
                  {/* Email Button */}
                  {hasEmail ? (
                    <a
                      href={`mailto:${studentEmail}`}
                      title={`Kirim Email (${studentEmail})`}
                      className="w-10 h-10 rounded-full bg-slate-100 hover:bg-[#FF8A2B] text-slate-700 hover:text-white border border-slate-200/90 dark:bg-white/10 dark:text-slate-200 dark:border-white/10 dark:hover:bg-[#FF8A2B] dark:hover:text-[#1A0F05] flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110 active:scale-95 cursor-pointer"
                      aria-label="Kirim Email"
                    >
                      <Mail className="w-4.5 h-4.5" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toast.error("Gmail mahasiswa ini belum ditambahkan ke profil.")}
                      title="Gmail belum ditambahkan"
                      className="w-10 h-10 rounded-full bg-slate-100/60 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/15 text-slate-400 dark:text-slate-500 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                      aria-label="Gmail belum ditambahkan"
                    >
                      <MailX className="w-4.5 h-4.5" />
                    </button>
                  )}

                  {/* GitHub */}
                  {student.socials?.github && (
                    <a
                      href={student.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Kunjungi GitHub"
                      className="w-10 h-10 rounded-full bg-slate-100 hover:bg-[#24292e] text-slate-700 hover:text-white border border-slate-200/90 dark:bg-white/10 dark:text-slate-200 dark:border-white/10 dark:hover:bg-white dark:hover:text-[#24292e] flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110 active:scale-95 cursor-pointer"
                      aria-label="GitHub"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </a>
                  )}

                  {/* LinkedIn */}
                  {student.socials?.linkedin && (
                    <a
                      href={student.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Kunjungi LinkedIn"
                      className="w-10 h-10 rounded-full bg-slate-100 hover:bg-[#0077B5] text-slate-700 hover:text-white border border-slate-200/90 dark:bg-white/10 dark:text-slate-200 dark:border-white/10 dark:hover:bg-[#0077B5] dark:hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110 active:scale-95 cursor-pointer"
                      aria-label="LinkedIn"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  )}

                  {/* Instagram */}
                  {student.socials?.instagram && (
                    <a
                      href={student.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Kunjungi Instagram"
                      className="w-10 h-10 rounded-full bg-slate-100 hover:bg-[#E4405F] text-slate-700 hover:text-white border border-slate-200/90 dark:bg-white/10 dark:text-slate-200 dark:border-white/10 dark:hover:bg-[#E4405F] dark:hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110 active:scale-95 cursor-pointer"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  )}

                  {/* Portfolio / Website */}
                  {(student.socials?.website || student.socials?.portfolio) && (
                    <a
                      href={student.socials.website || student.socials.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Kunjungi Portofolio / Website"
                      className="w-10 h-10 rounded-full bg-slate-100 hover:bg-[#FF8A2B] text-slate-700 hover:text-white border border-slate-200/90 dark:bg-white/10 dark:text-slate-200 dark:border-white/10 dark:hover:bg-[#FF8A2B] dark:hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110 active:scale-95 cursor-pointer"
                      aria-label="Portofolio / Website"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}

                  {/* Share Button (Barcode / QR Code & Link) */}
                  <button
                    type="button"
                    onClick={handleShare}
                    title="Bagikan Profil & QR Code"
                    className="w-10 h-10 rounded-full bg-[#FF8A2B] hover:bg-[#ea580c] text-white flex items-center justify-center transition-all duration-200 shadow-sm shadow-orange-500/25 hover:scale-110 active:scale-95 cursor-pointer ml-auto"
                    aria-label="Bagikan Profil dan QR Code"
                  >
                    <Share2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Badge & Prestasi Showcase (Bisa Lihat Semuanya) */}
                <div className="bg-card p-4 rounded-xl border border-border shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-border">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                          Penghargaan &amp; Prestasi
                        </h3>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {studentBadgeIds.length} / {PENGHARGAAN_CATALOG.length} Diraih
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Penghargaan pencapaian dan rekam jejak prestasi mahasiswa.
                      </p>
                    </div>
                  </div>

                  {/* Grid Semua Badge (Scrollable) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1.5 pb-2 scrollbar-thin">
                    {displayedBadges.map((badge) => {
                      const isOwned = studentBadgeIds.includes(badge.id);
                      const isExpanded = selectedBadgeDetail === badge.id;
                      const isTerbatas = badge.group === "terbatas" || badge.tier === "khusus";
                      const isEmas = badge.tier === "emas";
                      const isPerak = badge.tier === "perak";
                      const tierColor = isTerbatas
                        ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-orange-400 border-orange-500/40"
                        : isEmas
                        ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border-yellow-400/40 font-bold"
                        : isPerak
                        ? "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30 font-bold"
                        : "bg-amber-800/20 text-amber-700 dark:text-amber-500 border-amber-700/30 font-bold";

                      return (
                        <div
                          key={badge.id}
                          onClick={() => setSelectedBadgeDetail(isExpanded ? null : badge.id)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all duration-200 cursor-pointer shadow-2xs ${
                            isOwned
                              ? "border-border bg-muted/30 hover:bg-muted/60 hover:border-[#FF8A2B]/40"
                              : "border-dashed border-border/80 bg-muted/10 opacity-75 hover:opacity-100 hover:border-slate-400 dark:hover:border-slate-600"
                          } ${isExpanded ? "ring-2 ring-[#FF8A2B]/40" : ""}`}
                        >
                          <div className="shrink-0 mt-0.5">
                            <TazkiaAchievementHexBadge
                              badge={badge}
                              size="xs"
                              locked={!isOwned}
                              animated={isOwned}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="min-w-0 pr-1">
                                <h4 className="text-xs font-bold text-foreground leading-snug">
                                  {badge.name}
                                </h4>
                                <span
                                  className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${tierColor}`}
                                >
                                  {badge.tierLabel}
                                </span>
                              </div>
                              {isOwned ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Diraih</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-500/15 text-slate-500 dark:text-slate-400 border border-slate-500/30 shrink-0">
                                  <Lock className="w-3 h-3" />
                                  <span>Terkunci</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                              {badge.mission}
                            </p>
                            {isExpanded && (
                              <div className="mt-1.5 pt-1.5 border-t border-border/60 text-[10px] space-y-1">
                                <p className="text-muted-foreground">
                                  <strong className="text-foreground">Filosofi:</strong> {badge.philosophy}
                                </p>
                                {!isOwned && (
                                  <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <Info className="w-3 h-3 shrink-0" />
                                    <span>Syarat Membuka: Penuhi misi di atas untuk membuka penghargaan ini.</span>
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bio Section */}
                <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tentang Mahasiswa</h3>
                  <p className="text-sm font-normal text-foreground leading-relaxed">
                    {student.bio || "Mahasiswa kreatif STMIK Tazkia yang siap berkarya & berkolaborasi."}
                  </p>
                </div>

                {/* Skills Section (Warna-warni sesuai getTechTagColor) */}
                {studentSkills.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Keahlian ({studentSkills.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {studentSkills.map((skill, i) => {
                        const colorClass = getTechTagColor(skill);
                        return (
                          <span
                            key={`${skill}-${i}`}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all shadow-2xs hover:scale-105 ${colorClass}`}
                          >
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Student's Projects Showcase */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Folder className="w-4 h-4 text-primary" /> Karya ({projects.length})
                    </h3>
                  </div>

                  {projects.length > 0 ? (
                    <div className="space-y-3">
                      {projects.map((proj) => (
                        <Link
                          href={`/project/${proj.id}`}
                          onClick={onClose}
                          key={proj.id}
                          className="block bg-card p-3.5 rounded-xl border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 flex gap-3.5 group items-center shadow-xs"
                        >
                          {proj.image_url ? (
                            <img
                              src={proj.image_url}
                              alt={proj.title}
                              className="w-18 h-18 object-cover rounded-lg border border-border shrink-0"
                            />
                          ) : (
                            <div className="w-18 h-18 rounded-lg border border-border shrink-0 bg-muted overflow-hidden">
                              <ProjectCoverPlaceholder id={proj.id} title={proj.title} category={proj.category} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs ${getCategoryBadgeClass(proj.category)}`}>
                                {getCategoryLabel(proj.category)}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {proj.title}
                            </h4>
                            <p className="text-xs font-normal text-muted-foreground line-clamp-1 mt-0.5">
                              {proj.description}
                            </p>
                            {proj.tech_stack && proj.tech_stack.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {proj.tech_stack.slice(0, 4).map((tech, idx) => {
                                  const colorClass = getTechTagColor(tech);
                                  return (
                                    <span
                                      key={`${tech}-${idx}`}
                                      className={`text-[9.5px] font-medium px-2 py-0.5 rounded-full border transition-all shadow-2xs ${colorClass}`}
                                    >
                                      {tech}
                                    </span>
                                  );
                                })}
                                {proj.tech_stack.length > 4 && (
                                  <span
                                    title={proj.tech_stack.slice(4).join(", ")}
                                    className="text-[9.5px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-mono shadow-2xs"
                                  >
                                    +{proj.tech_stack.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-[10px] font-medium text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-muted-foreground" /> {proj.views ?? 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3 text-red-500" /> {proj.likes ?? 0}
                              </span>
                              <span
                                className="ml-auto flex items-center gap-0.5 text-primary font-semibold group-hover:underline"
                              >
                                Detail <ExternalLink className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-muted/50 rounded-xl border border-dashed border-border">
                      <p className="text-xs font-normal text-muted-foreground">Belum ada karya yang diunggah.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Profile Modal with Barcode / QR Code */}
      {showShareModal && student && (
        <ShareProfileModal
          studentName={student.name}
          shareUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/student/${student.id}`}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Skin Preview Modal for applying card skins directly */}
      {showSkinModal && student && (
        <SkinPreviewModal
          studentName={student.name}
          prodi={student.prodi}
          angkatan={student.angkatan}
          avatarUrl={student.avatarUrl}
          bio={student.bio}
          statusBadge={student.statusBadge}
          studentId={student.id || student.userId}
          onApplySkin={() => {
            window.dispatchEvent(new Event("tazkia_profile_skin_updated"));
          }}
          onClose={() => setShowSkinModal(false)}
        />
      )}
    </>
  );
}
