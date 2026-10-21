"use client";

import React, { useState, useRef } from "react";
import { Mail, RotateCw, ExternalLink } from "lucide-react";
import { GithubIcon, InstagramIcon } from "../SocialIcons";
import { StudentCardData } from "./StandardStudentCard";

interface CustomStudentCardProps {
  data?: StudentCardData;
  primaryColor?: string;
  secondaryColor?: string;
  enableTilt?: boolean;
  onContactClick?: () => void;
  onProfileClick?: () => void;
  onTriggerUnlock?: () => void;
}

export const CustomStudentCard: React.FC<CustomStudentCardProps> = ({
  data = {
    name: "Muhammad Hafidz Alaziz",
    initials: "HA",
    angkatan: "ANGKATAN 2",
    statusIcon: "🎨",
    status: "Custom Creator",
    major: "Informatika",
    skills: ["Fullstack Dev", "Creative Tech"],
    bio: "Kreator STMIK Tazkia dengan tema kartu eksklusif kustomisasi 2 warna.",
    roleTitle: "Kreator Karya Tazkia",
    serial: "KTZ-2026-CST-999",
  },
  primaryColor = "#38bdf8",
  secondaryColor = "#0f172a",
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
      opacity: 0.25,
      background: `radial-gradient(circle at ${x}px ${y}px, ${primaryColor}88, transparent 65%)`,
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
            className={`absolute inset-0 w-full h-full rounded-[22px] [backface-visibility:hidden] p-[2.5px] transition-colors ${
              onProfileClick ? "cursor-pointer" : ""
            }`}
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor}, ${primaryColor})`,
              boxShadow: `0 12px 30px -10px ${primaryColor}66`,
            }}
          >
            <div className="relative w-full h-full rounded-[19.5px] overflow-hidden flex flex-col justify-between bg-white dark:bg-[#0b1325] text-slate-800 dark:text-slate-100">
              {/* Dynamic Mouse Glare */}
              <div
                className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 mix-blend-overlay"
                style={glareStyle}
              />

              {/* TOP SECTION: BANNER + AVATAR + INFO */}
              <div>
                {/* Header Banner Custom */}
                <div
                  className="relative h-[110px] w-full overflow-hidden transition-colors"
                  style={{
                    background: `linear-gradient(135deg, ${secondaryColor} 0%, #061022 100%)`,
                  }}
                >
                  <div
                    className="absolute -right-8 -top-10 w-44 h-44 rounded-full blur-xl animate-pulse"
                    style={{ backgroundColor: `${primaryColor}40` }}
                  />
                  <div
                    className="absolute inset-0 w-1/2 h-full -skew-x-12 bem-shimmer-sweep pointer-events-none"
                    style={{
                      background: `linear-gradient(to right, transparent, ${primaryColor}25, transparent)`,
                    }}
                  />

                  {/* Header Pills: Angkatan & Status (Jelas & Tidak Diblur saat tidak di-hover) */}
                  <div className="relative z-10 flex items-center justify-between px-4 pt-3.5">
                    {/* Angkatan */}
                    <span
                      className="text-[11px] font-bold tracking-wide px-3 py-1 rounded-full backdrop-blur-md border shadow-xs"
                      style={{
                        backgroundColor: `${secondaryColor}cc`,
                        borderColor: `${primaryColor}45`,
                        color: "#ffffff",
                      }}
                    >
                      {data.angkatan || "ANGKATAN 2"}
                    </span>

                    {/* Status */}
                    <span
                      className="text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md border shadow-xs"
                      style={{
                        backgroundColor: `${secondaryColor}cc`,
                        borderColor: `${primaryColor}45`,
                        color: "#ffffff",
                      }}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: primaryColor }} />
                      <span>{data.status || "Custom Creator"}</span>
                    </span>
                  </div>
                </div>

                {/* Horizontal Divider Line */}
                <div
                  className="h-[3.5px] w-full shadow-xs"
                  style={{
                    background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor}, ${primaryColor})`,
                  }}
                />

                {/* Avatar & Social Row */}
                <div className="px-5 relative flex justify-between items-end -mt-10 mb-3">
                  <div className="relative">
                    <div
                      className="absolute -inset-1 rounded-full animate-spin [animation-duration:8s] opacity-90 blur-xs"
                      style={{
                        background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor}, ${primaryColor})`,
                      }}
                    />
                    <div
                      className="relative w-[72px] h-[72px] rounded-full overflow-hidden border-4 bg-slate-900 shadow-md flex items-center justify-center"
                      style={{ borderColor: "#ffffff" }}
                    >
                      {data.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.avatarUrl} alt={data.name} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center font-black text-xl text-white"
                          style={{
                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                          }}
                        >
                          {data.initials || "MH"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
                      aria-label="GitHub"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
                      aria-label="Instagram"
                    >
                      <InstagramIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Student Info: Name & Major */}
                <div className="px-5">
                  <h3 className="font-bold text-[16px] leading-snug tracking-tight text-[#0f172a] dark:text-white">
                    {data.name}
                  </h3>
                  <p className="text-xs flex items-center gap-1.5 mt-1 font-medium text-slate-500 dark:text-slate-400">
                    <span style={{ color: primaryColor }}>🎓</span> {data.major || "Teknik Informatika"}
                  </p>

                  {/* Skill Pills: Jelas & Tidak Diblur saat tidak di-hover */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(data.skills && data.skills.length > 0
                      ? data.skills
                      : ["Fullstack Dev", "Creative Tech"]
                    ).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border transition"
                        style={{
                          backgroundColor: `${primaryColor}18`,
                          borderColor: `${primaryColor}45`,
                          color: primaryColor,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Deskripsi: Teks Jelas, Tidak Diblur saat tidak di-hover */}
                  <p className="text-xs mt-3 line-clamp-2 leading-relaxed text-slate-600 dark:text-slate-300">
                    {data.bio || "Kreator STMIK Tazkia dengan tema kartu eksklusif kustomisasi 2 warna."}
                  </p>
                </div>
              </div>

              {/* BOTTOM SECTION: BADGE KOSONG (TEMPAT BADGE YG BELUM KEISI) + ACTION BUTTONS */}
              <div className="px-5 pb-5 pt-2 relative z-10">
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase mb-2.5">
                    <span className="text-slate-500 dark:text-slate-400">BADGE</span>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px]">0 / 5</span>
                  </div>

                  {/* 5 Slot Badge Kosong */}
                  <div className="flex items-center gap-1.5 mb-4" onClick={(e) => e.stopPropagation()}>
                    {[0, 1, 2, 3, 4].map((slotIdx) => (
                      <button
                        key={slotIdx}
                        type="button"
                        onClick={onTriggerUnlock}
                        title="Tempat badge belum terisi"
                        className="w-9 h-9 rounded-full border border-dashed flex items-center justify-center text-xs transition hover:scale-105 cursor-pointer"
                        style={{
                          borderColor: `${primaryColor}55`,
                          backgroundColor: `${primaryColor}10`,
                          color: primaryColor,
                        }}
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
                      className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Mail className="w-4 h-4" /> Hubungi
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFlipped(!isFlipped)}
                      title="Klik untuk membalik kartu"
                      className="w-10 h-10 rounded-xl border flex items-center justify-center transition hover:rotate-90 cursor-pointer shadow-xs"
                      style={{
                        borderColor: `${primaryColor}60`,
                        backgroundColor: `${secondaryColor}80`,
                        color: "#ffffff",
                      }}
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BACK OF CARD (KOSONGAN SESUAI PERMINTAAN USER) ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-[22px] [backface-visibility:hidden] [transform:rotateY(180deg)] p-[2.5px] transition-colors"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor}, ${primaryColor})`,
              boxShadow: `0 12px 30px -10px ${primaryColor}66`,
            }}
          >
            <div
              className="relative w-full h-full rounded-[19.5px] overflow-hidden p-5 flex flex-col justify-between text-white"
              style={{
                background: `linear-gradient(160deg, ${secondaryColor}, #071328)`,
              }}
            >
              {/* Sisi Belakang Kosongan */}
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
                  className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
                  style={{ backgroundColor: primaryColor }}
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

export default CustomStudentCard;
