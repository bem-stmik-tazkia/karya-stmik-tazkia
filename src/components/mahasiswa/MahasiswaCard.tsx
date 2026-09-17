"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Folder, ChevronRight, MessageSquare, Users } from "lucide-react";
import { Student } from "@/lib/feedData";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { getSkillColor } from "@/utils/skillColor";
import { PREDEFINED_SKILLS } from "@/utils/skillOptions";

export interface MahasiswaCardProps {
  student: Student;
  projectCount: number;
  onSelect: (student: Student) => void;
  searchQuery?: string;
  onMessageClick?: (student: Student) => void;
  isFollowing?: boolean;
  onFollowClick?: (e: React.MouseEvent) => void;
}

export default function MahasiswaCard({
  student,
  projectCount,
  onSelect,
  searchQuery = "",
  onMessageClick,
  isFollowing = false,
  onFollowClick,
}: MahasiswaCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => onSelect(student)}
      className="card-3d overflow-hidden flex flex-col justify-between h-full bg-card group cursor-pointer"
    >
      {/* ── Banner Primary dengan Dot Pattern + Shimmer ── */}
      <div className="relative h-20 sm:h-28 w-full bg-primary overflow-hidden p-3 border-b-4 border-border">
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
          <StickerBadge variant="warning" className="text-[10px] px-2 py-0.5 shrink-0">
            Angkatan {student.angkatan}
          </StickerBadge>
          {student.statusBadge && (
            <span className="px-2.5 py-1 rounded-xl bg-secondary text-white text-[10px] font-bold border-2 border-border shrink-0 truncate">
              {student.statusBadge}
            </span>
          )}
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="px-4 pb-4 pt-0 relative flex-1 flex flex-col">

        {/* Avatar and Email button */}
        <div className="relative -mt-6 sm:-mt-8 mb-3 flex justify-between items-end">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl p-0.5 bg-card overflow-hidden border-4 border-border shadow-[2px_2px_0px_var(--color-border)] group-hover:border-primary transition-all duration-300 shrink-0">
            {student.avatarUrl && !imgError ? (
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="w-full h-full object-cover rounded-xl"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-secondary text-white flex items-center justify-center text-2xl font-black rounded-xl">
                {student.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="block" onClick={(e) => e.stopPropagation()}>
            <a
              href={`mailto:${student.contactEmail}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-card border-2 border-border hover:bg-primary hover:text-primary-foreground transition-all shadow-[2px_2px_0px_var(--color-border)] text-foreground"
              title="Kirim Email"
            >
              <Mail className="w-3 h-3" />
              <span>Email</span>
            </a>
          </div>
        </div>

        {/* Name, Prodi */}
        <div className="mb-2">
          <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
            {student.name}
          </h3>
          <p className="text-xs font-semibold text-muted-foreground mt-0.5 line-clamp-1">
            {student.prodi}
          </p>
        </div>

        {/* Skills */}
        {student.skills && student.skills.filter(s => PREDEFINED_SKILLS.includes(s)).length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mb-3">
            {(() => {
              let displaySkills = student.skills.filter(s => PREDEFINED_SKILLS.includes(s));
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
                  <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold max-w-[150px] truncate ${getSkillColor(displaySkills[0])}`}>
                    {displaySkills[0]}
                  </span>
                  {displaySkills.length > 1 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-muted border border-border text-[10px] font-bold text-muted-foreground">
                      +{displaySkills.length - 1}
                    </span>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Bio */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3 flex-1">
          {student.bio || "Mahasiswa kreatif STMIK Tazkia."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3" onClick={(e) => e.stopPropagation()}>
          {onFollowClick && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFollowClick(e); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 flex-1 justify-center rounded-xl text-[10px] font-bold border-2 transition-all shadow-[2px_2px_0px_var(--color-border)] ${
                isFollowing 
                  ? "bg-transparent border-border text-muted-foreground hover:bg-rose-500 hover:text-white hover:border-rose-500" 
                  : "bg-primary border-border text-primary-foreground hover:bg-primary/90"
              }`}
              title={isFollowing ? "Unfollow" : "Ikuti"}
            >
              <Users className="w-3 h-3" />
              <span>{isFollowing ? "Unfollow" : "Ikuti"}</span>
            </button>
          )}
          {onMessageClick && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMessageClick(student); }}
              className="flex items-center gap-1.5 px-3 py-1.5 flex-1 justify-center rounded-xl text-[10px] font-bold bg-secondary border-2 border-border text-secondary-foreground hover:bg-secondary/80 transition-all shadow-[2px_2px_0px_var(--color-border)]"
              title="Kirim Pesan"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Pesan</span>
            </button>
          )}
        </div>

        {/* Stats: Followers & Following */}
        <div className="flex items-center gap-3 mb-4 pt-1 border-t-2 border-border border-dashed">
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <Users className="w-3.5 h-3.5 text-secondary" />
            <span className="text-foreground">{student.followersCount || 0}</span>
            <span className="text-muted-foreground">Pengikut</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <span className="text-foreground">{student.followingCount || 0}</span>
            <span className="text-muted-foreground">Mengikuti</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t-2 border-border flex items-center justify-between mt-0 gap-1">
          <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground shrink-0">
            <Folder className="w-[13px] h-[13px] text-secondary shrink-0" />
            <span>{projectCount} Projek</span>
          </div>
          <span className="flex items-center gap-0.5 text-xs font-black text-primary group-hover:translate-x-1 transition-transform uppercase shrink-0">
            <span>Lihat</span> Portofolio
            <ChevronRight className="w-[14px] h-[14px] shrink-0" />
          </span>
        </div>
      </div>
    </div>
  );
}
