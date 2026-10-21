"use client";

import React, { useState, useRef } from "react";
import { Crown, Sparkles, User, RotateCw, Mail, ExternalLink } from "lucide-react";
import { GithubIcon, InstagramIcon } from "../SocialIcons";
import HexBadgeStandard from "@/components/penghargaan/badges/umum/HexBadgeStandard";
import HexBadgeBEM2026 from "@/components/penghargaan/badges/khusus/HexBadgeBEM2026";
import { StudentCardData } from "../umum/StandardStudentCard";

interface BEM2026StudentCardProps {
  data?: StudentCardData;
  enableTilt?: boolean;
  onContactClick?: () => void;
  onProfileClick?: () => void;
}

export const BEM2026StudentCard: React.FC<BEM2026StudentCardProps> = ({
  data = {
    name: "Pengurus Eksekutif BEM",
    initials: "BM",
    angkatan: "ANGKATAN 26",
    statusIcon: "🚀",
    status: "Open for Collab",
    major: "Sistem Informasi",
    skills: ["Leadership", "Manajemen Organisasi"],
    bio: "Pengurus aktif Badan Eksekutif Mahasiswa periode 2026 dengan lencana 26 emas eksklusif.",
    roleTitle: "Badan Eksekutif Mahasiswa 2026",
    serial: "KTZ-2026-BEM-026",
  },
  enableTilt = true,
  onContactClick,
  onProfileClick,
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
      opacity: 0.28,
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(253,224,71,0.55), rgba(249,115,22,0.2) 45%, transparent 70%)`,
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
      className="relative w-full h-[495px] select-none"
    >
      {/* 3D Flip Container */}
      <div className="relative h-full w-full [perspective:1200px]">
        <div
          className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* ================= FRONT OF CARD ================= */}
          <div 
            onClick={onProfileClick}
            className={`absolute inset-0 w-full h-full rounded-[22px] [backface-visibility:hidden] p-[2px] bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 shadow-[0_12px_32px_rgba(245,158,11,0.28)] ${onProfileClick ? 'cursor-pointer' : ''}`}
          >
            <div className="relative w-full h-full rounded-[19.5px] overflow-hidden flex flex-col justify-between bg-white dark:bg-[#0b1325] text-slate-800 dark:text-slate-100">
              {/* Dynamic Mouse Glare */}
              <div
                className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 mix-blend-overlay"
                style={glareStyle}
              />

              {/* Watermark 2026 */}
              <div className="pointer-events-none absolute right-3 bottom-24 opacity-[0.05] dark:opacity-[0.08] z-0 font-black text-7xl tracking-tighter text-amber-500 select-none">
                2026
              </div>

              {/* TOP SECTION: BANNER + FLOATING PILL + AVATAR + INFO */}
              <div>
                {/* Header Banner BEM */}
                <div className="relative h-[104px] w-full bg-gradient-to-r from-[#071936] via-[#132a56] to-[#2e1f10] overflow-hidden">
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#f59e0b_1.2px,transparent_1.2px)] [background-size:14px_14px] animate-pulse" />
                  <div className="absolute -right-8 -top-10 w-44 h-44 bg-gradient-to-bl from-amber-400/35 via-orange-500/20 to-transparent rounded-full blur-xl animate-pulse" />
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-200/25 to-transparent -skew-x-12 bem-shimmer-sweep pointer-events-none" />
                  <span className="absolute left-12 bottom-3 w-1.5 h-1.5 rounded-full bg-amber-300 float-sparkle-1" />
                  <span className="absolute left-1/2 top-6 w-2 h-2 rounded-full bg-yellow-200 float-sparkle-2" />
                  <span className="absolute right-20 bottom-4 w-1.5 h-1.5 rounded-full bg-orange-300 float-sparkle-3" />

                  <div className="relative z-10 flex items-center justify-between px-4 pt-3.5">
                    <span className="text-[11px] font-bold tracking-wide px-3 py-1 rounded-full bg-amber-950/60 text-amber-200 border border-amber-400/30 backdrop-blur-md">
                      {data.angkatan || "ANGKATAN 26"}
                    </span>
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 bg-[#1b3252]/90 text-amber-100 border border-amber-400/20 backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      <span>{data.statusIcon || "🚀"} {data.status || "Open for Collab"}</span>
                    </span>
                  </div>
                </div>

                {/* Horizontal Divider Line + Floating Pill */}
                <div className="relative">
                  <div className="h-[4px] w-full bg-gradient-to-r from-amber-300 via-orange-500 to-amber-300 shadow-[0_2px_10px_rgba(245,158,11,0.5)]" />
                  <div className="absolute -top-3 right-3.5 z-20 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 text-[9.5px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1 border border-amber-200">
                    <Crown className="w-3 h-3 fill-slate-950" /> BEM EKSEKUTIF '26
                  </div>
                </div>

                {/* Avatar & Social Row */}
                <div className="px-5 relative flex justify-between items-end -mt-9 mb-2">
                  <div className="relative">
                    {/* Spinning Gold Ring */}
                    <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-orange-500 animate-spin [animation-duration:8s] opacity-90 blur-[1px]" />
                    <div className="relative w-[70px] h-[70px] rounded-full overflow-hidden border-4 border-amber-100 bg-gradient-to-b from-slate-800 to-slate-900 shadow-lg flex items-center justify-center">
                      {data.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.avatarUrl} alt={data.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-2xl bg-amber-500 text-slate-950">
                          {data.initials || "BM"}
                        </div>
                      )}
                    </div>

                    {/* Badge 26 di bawah Avatar */}
                    <div
                      title="Angkatan Kepengurusan BEM 2026"
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-tighter shadow-md border-2 border-white leading-none z-20"
                    >
                      26
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

                {/* Student Info */}
                <div className="px-5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-[16px] leading-snug tracking-tight text-[#0f172a] dark:text-white">
                      {data.name}
                    </h3>
                    <span title="Verified BEM 2026" className="text-amber-500 shrink-0">
                      <Sparkles className="w-4 h-4 fill-amber-400" />
                    </span>
                  </div>

                  <p className="text-xs flex items-center gap-1.5 mt-1 font-medium text-slate-500 dark:text-slate-400">
                    <span className="text-orange-500">🎓</span> {data.major || "Sistem Informasi"}
                  </p>

                  {/* Skill Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(data.skills || ["Leadership", "Manajemen Organisasi"]).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/50 dark:border-amber-500/40 dark:text-amber-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Bio */}
                  <p className="text-xs mt-3 line-clamp-2 leading-relaxed text-slate-600 dark:text-slate-300">
                    {data.bio || "Pengurus aktif Badan Eksekutif Mahasiswa periode 2026 dengan lencana 26 emas eksklusif."}
                  </p>
                </div>
              </div>

              {/* BOTTOM SECTION: BADGES & BUTTONS */}
              <div className="px-4 pb-4 pt-1">
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase mb-2.5 text-slate-500 dark:text-slate-400">
                    <span>BADGE</span>
                    <span>3 / 8</span>
                  </div>

                  {/* Row of Hexagonal Badges */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <HexBadgeStandard type="layers" theme="bem2026" tooltip="Badge Standar 1" />
                    <HexBadgeStandard type="26" theme="bem2026" tooltip="Lencana Angkatan 2026" />
                    <HexBadgeBEM2026 hyperMode={true} />
                    {[1, 2].map((_, i) => (
                      <div
                        key={i}
                        className="w-9 h-9 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs text-slate-400 select-none font-mono"
                      >
                        +
                      </div>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={onContactClick}
                      className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#ea580c] hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer font-black"
                    >
                      <Mail className="w-4 h-4 fill-slate-950" /> Hubungi
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFlipped(!isFlipped)}
                      title="Klik untuk membalik kartu"
                      className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:border-amber-500 hover:text-amber-500 transition cursor-pointer"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BACK OF CARD ================= */}
          <div className="absolute inset-0 w-full h-full rounded-[22px] [backface-visibility:hidden] [transform:rotateY(180deg)] p-[2px] bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 shadow-[0_12px_32px_rgba(245,158,11,0.28)]">
            <div className="relative w-full h-full rounded-[19.5px] overflow-hidden p-5 flex flex-col justify-between bg-[#09152b] text-white">
              {/* Back Visual FX */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
                <div className="absolute inset-0 opacity-30 bg-[linear-gradient(125deg,#09152b_0%,#3b260b_35%,#784b12_50%,#3b260b_65%,#09152b_100%)] bg-[length:250%_250%] back-holo-wave" />
                <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full border border-dashed border-amber-400/25 spin-slow" />
                <div className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-amber-300/15 to-transparent -skew-x-12 bem-shimmer-sweep" />
              </div>

              {/* Back Header */}
              <div className="relative z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                    <span className="font-bold text-sm tracking-tight">
                      Karya <span className="text-orange-500">Tazkia</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                      ID PASS '26
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFlipped(false)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>

                {/* ID Badge Card */}
                <div className="mt-3 p-3 rounded-xl border border-amber-500/50 bg-amber-950/50 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-amber-400 bg-slate-900 text-amber-300 shrink-0 font-mono font-black text-sm shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                      26
                    </div>
                    <div>
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                        PENGURUS BEM 2026
                      </span>
                      <h4 className="font-bold text-sm mt-1">{data.name}</h4>
                      <p className="text-[11px] text-slate-300">{data.roleTitle || "Badan Eksekutif Mahasiswa 2026"}</p>
                    </div>
                  </div>
                </div>

                {/* Achievement Highlight */}
                <div className="mt-4">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Achievement Eksklusif Terpasang
                  </p>
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/40 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400 flex items-center justify-center font-black text-xs text-amber-300 shrink-0">
                      26
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-300">Achievement BEM 2026</p>
                      <p className="text-[10.5px] text-slate-300">Lencana Eksklusif Kepemimpinan 2026</p>
                    </div>
                  </div>
                </div>

                {/* Stats 3 Grid */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="p-2 rounded-lg border border-white/10 bg-white/5">
                    <p className="text-xs font-bold text-orange-400">2026</p>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">Angkatan</p>
                  </div>
                  <div className="p-2 rounded-lg border border-white/10 bg-white/5">
                    <p className="text-xs font-bold text-amber-300">MYTHIC</p>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">Skin Tier</p>
                  </div>
                  <div className="p-2 rounded-lg border border-white/10 bg-white/5">
                    <p className="text-xs font-bold text-emerald-400">ACTIVE</p>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">Status</p>
                  </div>
                </div>
              </div>

              {/* Back Footer Actions */}
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
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
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

export default BEM2026StudentCard;
