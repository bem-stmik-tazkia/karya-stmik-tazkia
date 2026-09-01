"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Folder, ChevronRight } from "lucide-react";
import { Student } from "@/lib/feedData";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { getSkillColor } from "@/utils/skillColor";

export interface MahasiswaCardProps {
  student: Student;
  projectCount: number;
  onSelect: (student: Student) => void;
  searchQuery?: string;
}

export default function MahasiswaCard({
  student,
  projectCount,
  onSelect,
  searchQuery = "",
}: MahasiswaCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => onSelect(student)}
      className="card-3d overflow-hidden flex flex-col justify-between h-full bg-card group cursor-pointer"
    >
      {/* ── Banner Primary dengan Dot Pattern + Shimmer ── */}
      <div className="relative h-14 sm:h-28 w-full bg-primary overflow-hidden p-1.5 sm:p-3 border-b-2 sm:border-b-4 border-border">
        {/* Animated dot grid */}
        <motion.div
          animate={{ x: [0, -20], y: [0, -20] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-[150%] h-[150%] opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Shimmer sweep */}
        <motion.div
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
          className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        {/* Angkatan + Status badges (Keduanya di Banner atas) */}
        <div className="relative z-10 flex items-center justify-between gap-1 w-full">
          <StickerBadge variant="warning" className="text-[7.5px] sm:text-[10px] px-1 sm:px-2 py-0.5 shrink-0">
            Angkatan {student.angkatan}
          </StickerBadge>
          {student.statusBadge && (
            <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-xl bg-secondary text-white text-[7.5px] sm:text-[10px] font-bold border sm:border-2 border-border shrink-0 truncate max-w-[90px] sm:max-w-none">
              {student.statusBadge}
            </span>
          )}
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="px-2.5 sm:px-4 pb-2.5 sm:pb-4 pt-0 relative flex-1 flex flex-col">

        {/* Avatar + Email button */}
        <div className="relative -mt-4 sm:-mt-8 mb-1 sm:mb-3 flex items-end justify-between">
          {/* Avatar */}
          <div className="relative w-9 h-9 sm:w-16 sm:h-16 rounded-lg sm:rounded-2xl p-0.5 bg-card overflow-hidden border-2 sm:border-4 border-border shadow-[2px_2px_0px_var(--color-border)] group-hover:border-primary transition-all duration-300 shrink-0">
            {student.avatarUrl && !imgError ? (
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="w-full h-full object-cover rounded-[5px] sm:rounded-xl"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-secondary text-white flex items-center justify-center text-base sm:text-2xl font-black rounded-[5px] sm:rounded-xl">
                {student.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Email button — desktop only */}
          <a
            href={`mailto:${student.contactEmail}`}
            onClick={(e) => e.stopPropagation()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-muted border-2 border-border hover:bg-primary hover:text-primary-foreground transition-all shadow-[2px_2px_0px_var(--color-border)]"
          >
            <Mail className="w-3 h-3 text-secondary" />
            <span>Email</span>
          </a>
        </div>

        {/* Name & Prodi */}
        <div className="mb-1 sm:mb-2">
          <h3 className="text-xs sm:text-base font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
            {student.name}
          </h3>
          <p className="text-[9px] sm:text-xs font-semibold text-muted-foreground mt-0.5 line-clamp-1">
            {student.prodi}
          </p>
        </div>

        {/* Skills */}
        {student.skills && student.skills.length > 0 && (
          <div className="flex items-center gap-1 mb-1 sm:mb-3">
            {(() => {
              let displaySkills = [...student.skills];
              if (searchQuery.trim() !== "") {
                const query = searchQuery.toLowerCase();
                const matchIdx = displaySkills.findIndex((s) => s.toLowerCase().includes(query));
                if (matchIdx > 0) {
                  const matched = displaySkills.splice(matchIdx, 1)[0];
                  displaySkills.unshift(matched);
                }
              }
              return (
                <>
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border text-[8px] sm:text-[10px] font-bold max-w-[85px] sm:max-w-[150px] truncate ${getSkillColor(displaySkills[0])}`}>
                    {displaySkills[0]}
                  </span>
                  {displaySkills.length > 1 && (
                    <span className="px-1 py-0.5 rounded-md bg-muted border border-border text-[8px] sm:text-[10px] font-bold text-muted-foreground">
                      +{displaySkills.length - 1}
                    </span>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Bio — desktop only */}
        <p className="hidden sm:block text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4 flex-1">
          {student.bio || "Mahasiswa kreatif STMIK Tazkia."}
        </p>

        {/* Mobile spacer */}
        <div className="flex-1 sm:hidden" />

        {/* Footer */}
        <div className="pt-1.5 sm:pt-3 border-t sm:border-t-2 border-border flex items-center justify-between mt-1 sm:mt-0 gap-1">
          <div className="flex items-center gap-0.5 sm:gap-1 text-[8.5px] sm:text-xs font-bold text-muted-foreground shrink-0">
            <Folder className="w-2.5 h-2.5 sm:w-[13px] sm:h-[13px] text-secondary shrink-0" />
            <span>{projectCount} Projek</span>
          </div>
          <span className="flex items-center gap-0.5 text-[8.5px] sm:text-xs font-black text-primary group-hover:translate-x-1 transition-transform uppercase shrink-0">
            <span className="hidden sm:inline">Lihat</span> Portofolio
            <ChevronRight className="w-2.5 h-2.5 sm:w-[14px] sm:h-[14px] shrink-0" />
          </span>
        </div>
      </div>
    </div>
  );
}
