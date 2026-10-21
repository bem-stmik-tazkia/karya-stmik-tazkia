"use client";

import React, { useState, useRef } from "react";
import { Cpu, User, RotateCw, Mail, ExternalLink } from "lucide-react";
import { GithubIcon, InstagramIcon } from "../SocialIcons";
import HexBadgeStandard from "@/components/penghargaan/badges/umum/HexBadgeStandard";
import HexBadgeBEM2026 from "@/components/penghargaan/badges/khusus/HexBadgeBEM2026";
import HexBadgeRistekMecha from "@/components/penghargaan/badges/khusus/HexBadgeRistekMecha";
import { HardHatSvg, PickaxeSvg } from "@/components/penghargaan/TazkiaAchievementBadge";
import { StudentCardData } from "../umum/StandardStudentCard";

interface RistekMechaCardProps {
  data?: StudentCardData;
  enableTilt?: boolean;
  onContactClick?: () => void;
  onProfileClick?: () => void;
}

export const RistekMechaCard: React.FC<RistekMechaCardProps> = ({
  data = {
    name: "Arsitek Ristek (Mecha)",
    initials: "RM",
    angkatan: "ANGKATAN 26",
    statusIcon: "⚡",
    status: "Core Architect",
    major: "Teknik Informatika",
    skills: ["Cloud & Security", "Fullstack Eng"],
    bio: "Lead Architect BEM x Ristek 2026 dengan skin Mecha Sapphire Ultra dan lencana 26 neon.",
    roleTitle: "Lead Architect • BEM x Ristek 2026",
    serial: "KTZ-2026-BLD-M26",
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
      opacity: 0.32,
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(56,189,248,0.65), rgba(0,240,255,0.4) 38%, rgba(249,115,22,0.2) 60%, transparent 75%)`,
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
            className={`absolute inset-0 w-full h-full rounded-[22px] [backface-visibility:hidden] p-[3px] bg-gradient-to-tr from-[#38bdf8] via-[#00f0ff] to-[#1d4ed8] forge-border-normal ${onProfileClick ? 'cursor-pointer' : ''}`}
          >
            {/* STROBING TELEMETRY CORNERS */}
            <div className="absolute -top-1 -left-1 w-7 h-7 border-t-[3.5px] border-l-[3.5px] border-[#00f0ff] rounded-tl-xl z-40 pointer-events-none ristek-corner-cyan">
              <span className="absolute -top-0.5 -left-0.5 w-2 h-2 rounded-xs bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 border-t-[3.5px] border-r-[3.5px] border-[#38bdf8] rounded-tr-xl z-40 pointer-events-none forge-corner-amber">
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-xs bg-[#38bdf8] shadow-[0_0_10px_#38bdf8]" />
            </div>
            <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-[3.5px] border-l-[3.5px] border-[#38bdf8] rounded-bl-xl z-40 pointer-events-none forge-corner-amber">
              <span className="absolute -bottom-0.5 -left-0.5 w-2 h-2 rounded-xs bg-[#38bdf8] shadow-[0_0_10px_#38bdf8]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-[3.5px] border-r-[3.5px] border-[#00f0ff] rounded-br-xl z-40 pointer-events-none ristek-corner-cyan">
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-xs bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" />
            </div>

            {/* Top Center Telemetry Strip */}
            <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-14 h-[3.5px] rounded-full bg-[#00f0ff] z-40 pointer-events-none ristek-corner-cyan" />

            {/* Left & Right Telemetry Clusters */}
            <div className="absolute inset-y-24 -left-[3px] flex flex-col justify-between z-40 pointer-events-none">
              <div className="flex flex-col gap-1">
                <span className="w-[4px] h-3.5 rounded-full bg-[#00f0ff] ristek-corner-cyan" />
                <span className="w-[4px] h-3.5 rounded-full bg-[#38bdf8] forge-corner-amber" />
                <span className="w-[4px] h-3.5 rounded-full bg-[#00f0ff] ristek-corner-cyan" />
              </div>
              <span className="w-[4px] h-7 rounded-full bg-[#f97316] ristek-corner-orange" />
            </div>
            <div className="absolute inset-y-24 -right-[3px] flex flex-col justify-between z-40 pointer-events-none">
              <span className="w-[4px] h-7 rounded-full bg-[#f97316] ristek-corner-orange" />
              <div className="flex flex-col gap-1">
                <span className="w-[4px] h-3.5 rounded-full bg-[#00f0ff] ristek-corner-cyan" />
                <span className="w-[4px] h-3.5 rounded-full bg-[#38bdf8] forge-corner-amber" />
                <span className="w-[4px] h-3.5 rounded-full bg-[#00f0ff] ristek-corner-cyan" />
              </div>
            </div>

            {/* Inner Card Content */}
            <div className="relative w-full h-full rounded-[19.5px] overflow-hidden flex flex-col justify-between bg-white dark:bg-[#081B42] text-slate-800 dark:text-slate-100">
              {/* Dynamic Glare */}
              <div
                className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 mix-blend-overlay"
                style={glareStyle}
              />

              {/* Watermark Pickaxe inside Card */}
              <div className="pointer-events-none absolute right-3 bottom-24 opacity-[0.05] dark:opacity-[0.08] z-0 flex flex-col items-end text-sky-500 select-none">
                <PickaxeSvg className="w-24 h-24" />
                <span className="font-mono font-black text-2xl -mt-2 tracking-tighter">MECHA//26</span>
              </div>

              {/* TOP SECTION: BANNER + AVATAR + INFO */}
              <div>
                {/* Header Banner Mecha - Tazkia Deep Navy */}
                <div className="relative h-[104px] w-full bg-gradient-to-r from-[#071a3d] via-[#0b2866] to-[#0c2e6b] overflow-hidden">
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#00f0ff_1.5px,transparent_1.5px),radial-gradient(#3b82f6_1.5px,#020617_1.5px)] [background-size:18px_18px] [background-position:0_0,9px_9px] cyber-grid-pan" />
                  <div className="absolute -right-10 -bottom-14 w-44 h-44 rounded-full border-2 border-dashed border-cyan-400/35 spin-slow pointer-events-none" />
                  <div className="absolute -right-4 -bottom-8 w-32 h-32 rounded-full border border-sky-300/30 spin-reverse-slow pointer-events-none" />
                  <div className="absolute inset-x-10 -bottom-10 h-24 bg-gradient-to-r from-blue-600/40 via-[#00f0ff]/45 to-orange-500/35 blur-2xl animate-pulse" />
                  <div className="absolute inset-0 w-2/3 h-full bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent -skew-x-12 bem-shimmer-sweep pointer-events-none" />

                  {/* Mecha Circuit Path */}
                  <svg className="absolute inset-0 w-full h-full opacity-90" viewBox="0 0 360 112" fill="none">
                    <path d="M115 88 L155 88 L175 64 L245 64 L265 86 L345 86" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />
                    <path d="M115 88 L155 88 L175 64 L245 64 L265 86 L345 86" stroke="#00f0ff" strokeWidth="2.5" strokeDasharray="28 130" className="pcb-packet-flow" />
                    <g transform="translate(210, 64)">
                      <circle cx="0" cy="0" r="8" stroke="#00f0ff" strokeWidth="1.2" strokeOpacity="0.6" />
                      <circle cx="0" cy="0" r="2.5" fill="#f97316" />
                    </g>
                  </svg>

                  {/* Striped Bottom Bar */}
                  <div className="absolute bottom-0 inset-x-0 h-[5px] opacity-90 bg-[repeating-linear-gradient(90deg,#00f0ff,#00f0ff_12px,#020617_12px,#020617_20px,#f97316_20px,#f97316_26px,#020617_26px,#020617_34px)] forge-stripe-slide" />

                  {/* Header Pills */}
                  <div className="relative z-10 flex items-center justify-between px-4 pt-3.5">
                    <span className="text-[11px] font-bold tracking-wide px-3 py-1 rounded-full bg-[#03152e]/85 text-[#00f0ff] border border-cyan-400/45 font-mono shadow-[0_0_10px_rgba(0,240,255,0.25)] backdrop-blur-md">
                      {data.angkatan || "ANGKATAN 26"}
                    </span>
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 bg-[#041836]/90 text-cyan-100 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.2)] backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
                      <span>{data.statusIcon || "⚡"} {data.status || "Core Architect"}</span>
                    </span>
                  </div>
                </div>

                {/* Horizontal Divider + Floating Core Builder Pill */}
                <div className="relative">
                  <div className="h-[4.5px] w-full bg-gradient-to-r from-[#38bdf8] via-[#00f0ff] to-[#f97316] shadow-[0_2px_18px_rgba(0,240,255,0.95)]" />
                  <div className="absolute -top-3.5 right-3.5 z-20 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#00f0ff] via-[#38bdf8] to-[#2563eb] text-slate-950 text-[9.5px] font-mono font-black tracking-wider uppercase shadow-[0_0_18px_rgba(0,240,255,0.85)] flex items-center gap-1.5 border border-white">
                    <HardHatSvg className="w-3.5 h-3.5" />
                    <span>RISTEK 2026</span>
                  </div>
                </div>

                {/* Avatar & Social Row */}
                <div className="px-5 relative flex justify-between items-end -mt-9 mb-2">
                  <div className="relative">
                    <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-[#00f0ff]/45 via-blue-500/35 to-orange-500/45 blur-md animate-pulse" />
                    <div className="absolute -inset-2 rounded-full border-[2.5px] border-dashed border-[#00f0ff] animate-spin [animation-duration:9s] shadow-[0_0_14px_rgba(0,240,255,0.75)]" />
                    <div className="absolute -inset-1 rounded-full border-2 border-dotted border-orange-400 spin-reverse-slow opacity-90" />

                    <div className="relative w-[70px] h-[70px] rounded-full overflow-hidden border-4 border-[#020b1c] ring-2 ring-[#00f0ff] bg-gradient-to-b from-[#07214a] via-[#04132e] to-[#020817] shadow-[0_0_18px_rgba(0,240,255,0.5)] flex items-center justify-center">
                      {data.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.avatarUrl} alt={data.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-2xl bg-gradient-to-br from-[#38bdf8] via-[#00f0ff] to-[#1d4ed8] text-slate-950">
                          {data.initials || "RM"}
                        </div>
                      )}
                    </div>

                    {/* Pill 26 Mecha di bawah Avatar */}
                    <div
                      title="Core Builder Ristek 2026"
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00f0ff] via-sky-400 to-blue-500 text-slate-950 rounded-full px-3 py-0.5 text-[10.5px] font-mono font-black tracking-tighter shadow-[0_0_14px_rgba(0,240,255,1)] border-2 border-white leading-none z-20"
                    >
                      26
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-cyan-500/40 bg-slate-900 text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(0,240,255,0.4)] transition"
                      aria-label="GitHub"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-cyan-500/40 bg-slate-900 text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(0,240,255,0.4)] transition"
                      aria-label="Instagram"
                    >
                      <InstagramIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Student Info */}
                <div className="px-5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-[15px] leading-snug tracking-tight text-[#0f172a] dark:text-white">
                      {data.name}
                    </h3>
                    <span
                      title="Verified Ristek Architect 2026"
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/15 border border-cyan-400/50 text-cyan-500 dark:text-[#00f0ff] shrink-0 shadow-[0_0_8px_rgba(0,240,255,0.3)]"
                    >
                      <PickaxeSvg className="w-3 h-3" />
                    </span>
                  </div>

                  <p className="text-xs flex items-center gap-1.5 mt-0.5 font-medium text-slate-500 dark:text-slate-400">
                    <span className="text-orange-500">🎓</span> {data.major || "Teknik Informatika"}
                  </p>

                  {/* Skill Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(data.skills || ["Cloud & Security", "Fullstack Eng"]).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-sky-50 border-sky-300 text-sky-900 dark:bg-cyan-950/60 dark:border-cyan-400/50 dark:text-cyan-200 shadow-[0_0_8px_rgba(0,240,255,0.15)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Bio */}
                  <p className="text-[11.5px] mt-2 line-clamp-2 leading-relaxed text-slate-600 dark:text-slate-300">
                    {data.bio || "Lead Architect BEM x Ristek 2026 dengan skin Mecha Sapphire Ultra dan lencana 26 neon."}
                  </p>
                </div>
              </div>

              {/* BOTTOM SECTION: BADGES & BUTTONS */}
              <div className="px-4 pb-4 pt-1">
                <div className="border-t border-sky-100 dark:border-cyan-900/50 pt-2">
                  <div className="flex items-center justify-between text-[10.5px] font-bold tracking-wider uppercase mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-500 dark:text-slate-400">BADGE</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-500 dark:text-cyan-300 border border-cyan-400/30">
                        SSR • 26
                      </span>
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">4 / 8</span>
                  </div>

                  {/* Badges Row */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <HexBadgeStandard type="layers" theme="ristekB" tooltip="Badge Standar 1" />
                    <HexBadgeStandard type="26" theme="ristekB" tooltip="Lencana Angkatan 2026" />
                    <HexBadgeBEM2026 hyperMode={true} />
                    <HexBadgeRistekMecha hyperMode={true} />
                    <div className="w-9 h-9 rounded-full border border-dashed border-sky-300 dark:border-cyan-800 text-sky-500 dark:text-cyan-500 flex items-center justify-center text-xs select-none font-mono">
                      +
                    </div>
                  </div>

                  {/* Action Buttons: Hubungi with Conic-Gradient Border */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onContactClick}
                      className="relative flex-1 h-[40px] rounded-xl p-[2px] group overflow-visible transition-transform duration-200 active:scale-95 focus:outline-none cursor-pointer"
                    >
                      <div className="absolute inset-0 rounded-xl overflow-hidden bg-[#0c2d57]">
                        <div className="absolute -inset-[120%] animate-spin [animation-duration:2.8s] bg-[conic-gradient(from_0deg,transparent_0_240deg,#38bdf8_285deg,#ffffff_320deg,#00f0ff_345deg,#38bdf8_360deg)]" />
                      </div>

                      <span className="pointer-events-none absolute -top-[3px] -left-[3px] w-3 h-3 border-t-2 border-l-2 border-[#00f0ff] rounded-tl-[5px] z-30 ristek-corner-cyan" />
                      <span className="pointer-events-none absolute -top-[3px] -right-[3px] w-3 h-3 border-t-2 border-r-2 border-[#38bdf8] rounded-tr-[5px] z-30 forge-corner-amber" />
                      <span className="pointer-events-none absolute -bottom-[3px] -left-[3px] w-3 h-3 border-b-2 border-l-2 border-[#38bdf8] rounded-bl-[5px] z-30 forge-corner-amber" />
                      <span className="pointer-events-none absolute -bottom-[3px] -right-[3px] w-3 h-3 border-b-2 border-r-2 border-[#00f0ff] rounded-br-[5px] z-30 ristek-corner-cyan" />

                      <div className="relative z-10 w-full h-full rounded-[10px] font-bold text-xs flex items-center justify-center gap-2 transition-colors overflow-hidden bg-[#0c2d57] text-cyan-100 hover:bg-[#10386b]">
                        <span className="pointer-events-none absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent -skew-x-12 bem-shimmer-sweep" />
                        <Mail className="w-4 h-4 shrink-0 drop-shadow-[0_0_5px_rgba(0,240,255,0.6)]" />
                        <span className="tracking-wide">Hubungi</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsFlipped(!isFlipped)}
                      title="Klik untuk membalik kartu"
                      className="w-10 h-10 rounded-xl border border-cyan-500/50 bg-slate-900 text-[#00f0ff] hover:border-[#00f0ff] hover:shadow-[0_0_12px_rgba(0,240,255,0.5)] flex items-center justify-center transition cursor-pointer"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BACK OF CARD ================= */}
          <div className="absolute inset-0 w-full h-full rounded-[22px] [backface-visibility:hidden] [transform:rotateY(180deg)] p-[3px] bg-gradient-to-tr from-[#38bdf8] via-[#00f0ff] to-[#1d4ed8] forge-border-normal">
            {/* Telemetry Corners Back */}
            <div className="absolute -top-1 -left-1 w-7 h-7 border-t-[3.5px] border-l-[3.5px] border-[#00f0ff] rounded-tl-xl z-40 pointer-events-none ristek-corner-cyan" />
            <div className="absolute -top-1 -right-1 w-7 h-7 border-t-[3.5px] border-r-[3.5px] border-[#38bdf8] rounded-tr-xl z-40 pointer-events-none forge-corner-amber" />
            <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-[3.5px] border-l-[3.5px] border-[#f97316] rounded-bl-xl z-40 pointer-events-none ristek-corner-orange" />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-[3.5px] border-r-[3.5px] border-[#00f0ff] rounded-br-xl z-40 pointer-events-none ristek-corner-cyan" />

            <div className="relative w-full h-full rounded-[19.5px] overflow-hidden p-5 flex flex-col justify-between bg-gradient-to-b from-[#081B42] via-[#0d2a6b] to-[#081B42] text-white">
              {/* Back Visual FX */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
                <div className="absolute inset-0 opacity-25 bg-[linear-gradient(to_right,#00f0ff_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:20px_20px] cyber-grid-pan" />
                <div className="absolute -right-14 -bottom-14 w-64 h-64 rounded-full border-2 border-dashed border-[#00f0ff]/35 spin-slow" />
                <div className="absolute -right-6 -bottom-6 w-48 h-48 rounded-full border border-sky-400/35 spin-reverse-slow" />
                <div className="absolute right-0 bottom-0 w-48 h-48 bg-[#00f0ff]/15 rounded-full blur-2xl animate-pulse" />
                <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-[#00f0ff]/25 to-transparent back-vertical-scan" />
              </div>

              {/* Back Header */}
              <div className="relative z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-5 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]" />
                    <span className="font-bold text-sm tracking-tight">
                      Karya <span className="text-orange-500">Tazkia</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-sky-500/20 text-sky-200 border border-sky-400/40">
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
                <div className="mt-3 p-3 rounded-xl border border-[#38bdf8]/60 bg-[#041838]/80 backdrop-blur-md shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#38bdf8] bg-[#0B1F4A] text-[#38bdf8] shrink-0 font-mono font-black text-sm shadow-[0_0_12px_rgba(56,189,248,0.6)]">
                      26
                    </div>
                    <div>
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-gradient-to-r from-[#00f0ff] via-[#38bdf8] to-[#2563eb] text-slate-950">
                        V2 ULTRA • MECHA ARCHITECT
                      </span>
                      <h4 className="font-bold text-sm mt-0.5">{data.name}</h4>
                      <p className="text-[11px] text-slate-300">{data.roleTitle || "Lead Architect • BEM x Ristek 2026"}</p>
                    </div>
                  </div>
                </div>

                {/* Achievement Highlight */}
                <div className="mt-3">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Achievement Eksklusif Terpasang
                  </p>
                  <div className="space-y-1.5">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/40 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-amber-400/20 border border-amber-400 flex items-center justify-center font-black text-xs text-amber-300 shrink-0">
                        26
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-300 leading-tight">Achievement BEM 2026</p>
                        <p className="text-[10px] text-slate-300">Lencana Eksklusif Kepemimpinan 2026</p>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl border bg-gradient-to-r from-[#00f0ff]/20 via-blue-600/15 to-orange-500/15 border-[#38bdf8]/60 flex items-center gap-3 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-sky-500/20 border border-sky-400 text-sky-200">
                        <PickaxeSvg className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-sky-200 leading-tight">Mecha Sapphire: BEM x Ristek '26</p>
                        <p className="text-[10px] text-slate-300">Core Builder & Architect Karya Tazkia</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats 3 Grid */}
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="p-1.5 rounded-lg border border-sky-500/30 bg-sky-950/40">
                    <p className="text-xs font-bold text-orange-400">2026</p>
                    <p className="text-[9.5px] text-slate-400 font-mono uppercase">Angkatan</p>
                  </div>
                  <div className="p-1.5 rounded-lg border border-sky-500/30 bg-sky-950/40">
                    <p className="text-xs font-bold text-sky-300">MYTHIC</p>
                    <p className="text-[9.5px] text-slate-400 font-mono uppercase">Skin Tier</p>
                  </div>
                  <div className="p-1.5 rounded-lg border border-sky-500/30 bg-sky-950/40">
                    <p className="text-xs font-bold text-emerald-400">ACTIVE</p>
                    <p className="text-[9.5px] text-slate-400 font-mono uppercase">Status</p>
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
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-cyan-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
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

export default RistekMechaCard;
