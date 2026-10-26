"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  MailX,
  Globe,
  GraduationCap,
  ArrowRight,
  Share2,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import type { Student } from "@/types/student";
import type { Karya } from "@/types/karya";
import { getTechTagColor } from "@/utils/techTagColor";
import { calculateStudentEarnedBadges } from "@/data/penghargaanCatalog";
import { getClaimedExclusiveBadgeIds } from "@/lib/badgeService";
import ShareProfileModal from "@/components/mahasiswa/modals/ShareProfileModal";
import { MahasiswaDrawerBadges } from "./MahasiswaDrawerBadges";
import { MahasiswaDrawerProjects } from "./MahasiswaDrawerProjects";

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
  const [showShareModal, setShowShareModal] = useState(false);

  // Keyboard shortcut ESC untuk menutup drawer
  useEffect(() => {
    if (!student) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [student, onClose]);

  if (!student) return null;

  const statusLabel = student.statusBadge || "Open for Collab";
  const studentEmail = (student.contactEmail || "").trim();
  const hasEmail = Boolean(studentEmail && studentEmail.includes("@"));

  const studentSkills = Array.from(
    new Set(student.skills || [])
  ).filter((s) => Boolean(s && typeof s === "string" && s.trim()));

  const studentBadgeIds = calculateStudentEarnedBadges({
    userId: student.userId || student.id,
    projects: projects || [],
    angkatan: student.angkatan,
    skills: student.skills,
    bio: student.bio,
    statusBadge: student.rawStatusBadge || student.statusBadge,
    cardSkin: student.cardSkin,
    unlockedBadgeIds: (student as any).unlockedBadgeIds || (student as any).unlocked_badge_ids,
    claimedBadgeIds: getClaimedExclusiveBadgeIds(student.userId, student.id),
  });

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
              className="fixed inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-card border-l border-border h-full shadow-2xl overflow-y-auto flex flex-col z-10"
            >
              {/* Header Banner */}
              <div className="relative h-32 sm:h-40 bg-gradient-to-r from-[#0B1F4A] via-[#102D70] to-[#0B1F4A] p-4 sm:p-5 shrink-0 flex items-start justify-between overflow-hidden border-b-4 border-[#FF8A2B]">
                <div className="relative z-10 flex flex-wrap items-center gap-1.5 sm:gap-2 pr-2">
                  <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase bg-white/15 text-white backdrop-blur-sm border border-white/10 shadow-xs">
                    ANGKATAN {student.angkatan}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/10 shadow-xs">
                    <span
                      className="w-2 h-2 rounded-full g-pulse bg-[#FF8A2B]"
                      aria-hidden="true"
                    />
                    <span>{statusLabel}</span>
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="relative z-10 p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/15 text-white transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
                  aria-label="Tutup Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-4 sm:p-6 pt-0 flex-1 space-y-5 sm:space-y-6">
                {/* Avatar */}
                <div className="relative -mt-10 sm:-mt-14 mb-2">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#FF8A2B] to-[#FFA84A] p-1 shadow-xl shadow-orange-500/25 flex items-center justify-center shrink-0">
                    <div className="w-full h-full rounded-full border-3 sm:border-4 border-card bg-[#FF8A2B] text-white flex items-center justify-center overflow-hidden relative">
                      {student.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={student.avatarUrl}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl sm:text-3xl font-extrabold font-serif">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name & Lihat Profil Lengkap Action Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground break-words leading-tight">
                      {student.name}
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mt-1">
                      <GraduationCap className="w-4 h-4 text-[#FF8A2B] shrink-0" />
                      <span className="truncate">{student.prodi}</span>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto shrink-0 mt-1 sm:mt-0">
                    <Link
                      href={`/student/${student.id}`}
                      onClick={onClose}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs sm:text-sm shadow-xs hover:opacity-95 active:scale-95 transition-all"
                    >
                      <span>Lihat Profil Lengkap</span>
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </Link>
                  </div>
                </div>

                {/* Social & Contact Circular Icon Buttons */}
                <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 pt-0.5">
                  {/* Email Button */}
                  {hasEmail ? (
                    <a
                      href={`mailto:${studentEmail}`}
                      title={`Kirim Email (${studentEmail})`}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-[#FF8A2B] text-slate-700 hover:text-white border border-slate-200/90 dark:bg-white/10 dark:text-slate-200 dark:border-white/10 dark:hover:bg-[#FF8A2B] dark:hover:text-[#1A0F05] flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110 active:scale-95 cursor-pointer"
                      aria-label="Kirim Email"
                    >
                      <Mail className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toast.error("Gmail mahasiswa ini belum ditambahkan ke profil.")}
                      title="Gmail belum ditambahkan"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100/60 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/15 text-slate-400 dark:text-slate-500 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                      aria-label="Gmail belum ditambahkan"
                    >
                      <MailX className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>
                  )}

                  {/* Instagram */}
                  {student.socials?.instagram && (
                    <a
                      href={student.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Kunjungi Instagram"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-[#E4405F] text-slate-700 hover:text-white border border-slate-200/90 dark:bg-white/10 dark:text-slate-200 dark:border-white/10 dark:hover:bg-[#E4405F] dark:hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110 active:scale-95 cursor-pointer"
                      aria-label="Instagram"
                    >
                      <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
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
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-[#FF8A2B] text-slate-700 hover:text-white border border-slate-200/90 dark:bg-white/10 dark:text-slate-200 dark:border-white/10 dark:hover:bg-[#FF8A2B] dark:hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110 active:scale-95 cursor-pointer"
                      aria-label="Portofolio / Website"
                    >
                      <Globe className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </a>
                  )}

                  {/* Share Button */}
                  <button
                    type="button"
                    onClick={handleShare}
                    title="Bagikan Profil & QR Code"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FF8A2B] hover:bg-[#ea580c] text-white flex items-center justify-center transition-all duration-200 shadow-sm shadow-orange-500/25 hover:scale-110 active:scale-95 cursor-pointer ml-auto"
                    aria-label="Bagikan Profil dan QR Code"
                  >
                    <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </button>
                </div>

                {/* Badge & Prestasi Showcase (Hanya Lencana yang Tampil di Rak Kartu) */}
                <MahasiswaDrawerBadges
                  student={student}
                  studentBadgeIds={studentBadgeIds}
                  projects={projects}
                  onClose={onClose}
                />

                {/* Bio Section */}
                <div className="bg-card p-3.5 sm:p-4 rounded-xl border border-border shadow-xs">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 sm:mb-2">Tentang Mahasiswa</h3>
                  <p className="text-xs sm:text-sm font-normal text-foreground leading-relaxed">
                    {student.bio || "Mahasiswa kreatif STMIK Tazkia yang siap berkarya & berkolaborasi."}
                  </p>
                </div>

                {/* Skills Section */}
                {studentSkills.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Keahlian ({studentSkills.length})
                    </h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {studentSkills.map((skill, i) => {
                        const colorClass = getTechTagColor(skill);
                        return (
                          <span
                            key={`${skill}-${i}`}
                            className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium border transition-all shadow-2xs hover:scale-105 ${colorClass}`}
                          >
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Student's Projects Showcase */}
                <MahasiswaDrawerProjects
                  projects={projects}
                  onClose={onClose}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Profile Modal */}
      {showShareModal && student && (
        <ShareProfileModal
          studentName={student.name}
          shareUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/student/${student.id}`}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
}
