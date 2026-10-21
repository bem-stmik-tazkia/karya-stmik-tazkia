"use client";

import React, { useState, useRef } from "react";
import { Mail, RotateCw, ExternalLink } from "lucide-react";
import { GithubIcon, InstagramIcon } from "../SocialIcons";

export interface StudentCardData {
  name: string;
  initials?: string;
  angkatan?: string | number;
  statusIcon?: string;
  status?: string;
  major?: string;
  skills?: string[];
  bio?: string;
  roleTitle?: string;
  serial?: string;
  avatarUrl?: string | null;
}

interface StandardStudentCardProps {
  data?: StudentCardData;
  enableTilt?: boolean;
  onContactClick?: () => void;
  onProfileClick?: () => void;
  onTriggerUnlock?: () => void;
}

export const StandardStudentCard: React.FC<StandardStudentCardProps> = ({
  data = {
    name: "Muhammad Hafidz Alaziz",
    initials: "HA",
    angkatan: "ANGKATAN 2",
    statusIcon: "🚀",
    status: "Siap Freelance",
    major: "Teknik Informatika",
    skills: ["UI/UX Design", "Frontend Dev"],
    bio: "Saya adalah seseorang yang suka mengulik sesuatu yang membuat saya tertarik.",
    roleTitle: "Mahasiswa Aktif STMIK Tazkia",
    serial: "KTZ-2026-STD-001",
  },
  enableTilt = true,
  onContactClick,
  onProfileClick,
  onTriggerUnlock,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8.5;
    const rotateY = ((x - centerX) / centerX) * 8.5;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.018, 1.018, 1.018)`,
      transition: "transform 60ms ease-out",
    });

    setGlareStyle({
      opacity: 0.14,
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.65), transparent 60%)`,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 400ms ease-out",
    });
    setGlareStyle({ opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className="relative w-full max-w-[338px] mx-auto select-none"
    >
      {/* 3D Flip Container */}
      <div className="relative h-[525px] w-full [perspective:1200px]">
        <div
          className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* ================= FRONT OF CARD ================= */}
          <div
            onClick={onProfileClick}
            className={`absolute inset-0 w-full h-full rounded-[22px] [backface-visibility:hidden] p-[1px] bg-slate-200/90 dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300 ${
              onProfileClick ? "cursor-pointer" : ""
            }`}
          >
            <div className="relative w-full h-full rounded-[20px] overflow-hidden flex flex-col justify-between bg-white dark:bg-[#0b1325] text-slate-800 dark:text-slate-100">
              {/* Dynamic Mouse Glare */}
              <div
                className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 mix-blend-overlay"
                style={glareStyle}
              />

              {/* TOP SECTION: BANNER + AVATAR + INFO */}
              <div>
                {/* Header Banner - Biru Navy Asli STMIK Tazkia (#061d3a) */}
                <div className="relative h-[110px] w-full overflow-hidden bg-[#061d3a]">
                  {/* Radial dot grid */}
                  <div
                    className="absolute inset-0 opacity-25"
                    style={{
                      backgroundImage: "radial-gradient(circle at center, #ffffff 1.2px, transparent 1.2px)",
                      backgroundSize: "16px 16px",
                    }}
                  />

                  {/* Top Pills: Angkatan & Status (Jelas & Tidak Diblur saat tidak di-hover) */}
                  <div className="relative z-10 flex items-center justify-between px-4 pt-3.5">
                    {/* Angkatan */}
                    <span className="text-[11px] font-bold tracking-wide px-3 py-1 rounded-full bg-[#1b3252]/85 text-slate-200 border border-white/15 backdrop-blur-md shadow-xs">
                      {data.angkatan || "ANGKATAN 2"}
                    </span>

                    {/* Freelance / Status */}
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 bg-[#1b3252]/85 text-slate-100 border border-white/15 backdrop-blur-md shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span>{data.status || "Siap Freelance"}</span>
                    </span>
                  </div>
                </div>

                {/* Horizontal Divider Line (#f97316) */}
                <div className="relative">
                  <div className="h-[3px] w-full bg-[#f97316]" />
                </div>

                {/* Avatar & Social Row */}
                <div className="px-5 relative flex justify-between items-end -mt-10 mb-3">
                  <div className="relative">
                    <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow flex items-center justify-center">
                      {data.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.avatarUrl} alt={data.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-xl bg-orange-500 text-white">
                          {data.initials || "MH"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Buttons */}
                  <div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full flex items-center justify-center border transition bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
                      aria-label="GitHub"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full flex items-center justify-center border transition bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
                      aria-label="Instagram"
                    >
                      <InstagramIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Student Info: Name & Prodi */}
                <div className="px-5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-[16px] leading-snug tracking-tight text-[#0f172a] dark:text-white group-hover:text-orange-500 transition">
                      {data.name}
                    </h3>
                  </div>

                  <p className="text-xs flex items-center gap-1.5 mt-1 font-medium text-slate-500 dark:text-slate-400">
                    <span className="text-orange-500">🎓</span> {data.major || "Teknik Informatika"}
                  </p>

                  {/* Skill Pills: Jelas & Tidak Diblur saat tidak di-hover */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(data.skills && data.skills.length > 0
                      ? data.skills
                      : ["UI/UX Design", "Frontend Dev"]
                    ).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-200 dark:border-white/10 transition"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Deskripsi: Teks Jelas, Tidak Diblur saat tidak di-hover */}
                  <p className="text-xs mt-3 line-clamp-2 leading-relaxed text-slate-600 dark:text-slate-300">
                    {data.bio || "Saya adalah seseorang yang suka mengulik sesuatu yang membuat saya tertarik."}
                  </p>
                </div>
              </div>

              {/* BOTTOM SECTION: BADGE KOSONG (TEMPAT BADGE YG BELUM KEISI) + ACTION BUTTONS */}
              <div className="px-5 pb-5 pt-2 relative z-10">
                <div className="border-t pt-3 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase mb-2.5">
                    <span className="text-slate-500 dark:text-slate-400">BADGE</span>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px]">0 / 5</span>
                  </div>

                  {/* Row of 5 Empty Badge Slots (Tempat Badge Belum Keisi) */}
                  <div className="flex items-center gap-1.5 mb-4" onClick={(e) => e.stopPropagation()}>
                    {[0, 1, 2, 3, 4].map((slotIdx) => (
                      <button
                        key={slotIdx}
                        type="button"
                        onClick={onTriggerUnlock}
                        title="Tempat badge belum terisi"
                        className="w-9 h-9 rounded-full border border-dashed border-slate-300 dark:border-white/15 bg-slate-50/60 dark:bg-white/5 text-slate-400 dark:text-slate-500 flex items-center justify-center text-xs transition hover:scale-105 hover:border-orange-500 hover:text-orange-500 cursor-pointer"
                      >
                        +
                      </button>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={onContactClick}
                      className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#f97316] hover:bg-[#ea580c] flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Mail className="w-4 h-4" /> Hubungi
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFlipped(!isFlipped)}
                      title="Klik untuk membalik kartu"
                      className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition hover:rotate-90 cursor-pointer shadow-xs"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BACK OF CARD (KOSONGAN SESUAI PERMINTAAN USER) ================= */}
          <div className="absolute inset-0 w-full h-full rounded-[22px] [backface-visibility:hidden] [transform:rotateY(180deg)] p-[1px] bg-slate-200/90 dark:bg-slate-800 shadow-sm">
            <div className="relative w-full h-full rounded-[20px] overflow-hidden p-5 flex flex-col justify-between bg-gradient-to-b from-[#061d3a] via-[#091f3d] to-[#041226] text-white">
              {/* Subtle background ambient glow */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle at center, #ffffff 1.2px, transparent 1.2px)",
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Sisi Belakang Kosongan (Plain / Clean Background) */}
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                {/* Polosan & Kosongan */}
              </div>

              {/* Dua Button di Bawah di Preview: Balik Kartu & Lihat Profil */}
              <div className="relative z-10 flex items-center gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Balik Kartu</span>
                </button>
                <button
                  type="button"
                  onClick={onProfileClick}
                  className="flex-1 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
                >
                  <span>Lihat Profil</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardStudentCard;
