"use client";

import React, { useId } from "react";
import { Zap, Lock } from "lucide-react";
import { HardHatSvg, PickaxeSvg } from "@/components/penghargaan/TazkiaAchievementBadge";

interface HexBadgeRistekMechaProps {
  size?: "xs" | "sm" | "md" | "lg";
  locked?: boolean;
  hyperMode?: boolean;
  onClick?: () => void;
  title?: string;
  tooltip?: string;
  showTooltip?: boolean;
  tooltipAlign?: "center" | "left" | "right";
}

export const HexBadgeRistekMecha: React.FC<HexBadgeRistekMechaProps> = ({
  size = "sm",
  locked = false,
  hyperMode = false,
  onClick,
  title,
  tooltip,
  showTooltip = true,
  tooltipAlign = "center",
}) => {
  const rawId = useId();
  const uid = `mecha-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const isLarge = size === "lg";
  const isMd = size === "md";
  const isXs = size === "xs";
  const sizeClass = isLarge
    ? "w-36 h-40 sm:w-44 sm:h-48"
    : isMd
    ? "w-20 h-23 sm:w-24 sm:h-28"
    : isXs
    ? "w-8 h-9"
    : "w-10 h-11";

  return (
    <div className="relative group inline-block select-none">
      <div
        role={onClick ? "button" : "presentation"}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        className={`relative flex items-center justify-center transition-transform duration-200 ease-out transform-gpu [backface-visibility:hidden] [transform:translateZ(0)] focus:outline-none ${
          onClick ? "cursor-pointer" : ""
        } ${sizeClass} ${
          !isLarge ? "hover:scale-105 active:scale-95" : ""
        } ${locked ? "grayscale opacity-55" : ""}`}
      >
        {/* 1. Strobing Neon Plasma Backlight + Dual Counter-Rotating Reactor Rings */}
        {!locked && (
          <>
            <div
              className={`absolute inset-0 rounded-full blur-md bg-gradient-to-tr from-blue-500/70 via-cyan-400/60 to-orange-500/65 ${
                hyperMode ? "ristek-plasma-aura-fast" : "ristek-plasma-aura"
              } ${isLarge ? "scale-110" : "scale-100"}`}
            />
            {/* Outer Counter-Rotating Cyber Ring */}
            <div
              className={`absolute ${
                isLarge ? "-inset-2.5 border-2" : "-inset-1 border"
              } rounded-full border-dashed border-sky-400/80 pointer-events-none ${
                hyperMode ? "spin-fast" : "spin-slow"
              }`}
            />
            {/* Second Reverse-Spinning Orange Tech Ring */}
            <div
              className={`absolute ${
                isLarge ? "-inset-1 border" : "-inset-0.5 border"
              } rounded-full border-dotted border-orange-400/75 pointer-events-none spin-reverse-slow`}
            />
          </>
        )}

        {/* 2. Animated SVG Hexagon with Laser Scanline, Radar Sweep & Strobing Perimeter */}
        <svg
          viewBox="0 0 100 115"
          className={`w-full h-full relative z-10 ${
            !locked ? "drop-shadow-[0_0_14px_rgba(59,130,246,0.85)]" : ""
          }`}
        >
          <defs>
            <linearGradient id={`ristekGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="45%" stopColor="#3b82f6" />
              <stop offset="80%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id={`ristekCore-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#041329" />
              <stop offset="55%" stopColor="#082042" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id={`ristekLaser-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(34,211,238,0)" />
              <stop offset="50%" stopColor="rgba(34,211,238,0.65)" />
              <stop offset="100%" stopColor="rgba(249,115,22,0)" />
            </linearGradient>
            <clipPath id={`ristekHexClip-${uid}`}>
              <polygon points="50 2, 96 27, 96 88, 50 113, 4 88, 4 27" />
            </clipPath>
          </defs>

          {/* Outer Hexagon Base */}
          <polygon
            points="50 2, 96 27, 96 88, 50 113, 4 88, 4 27"
            fill={`url(#ristekCore-${uid})`}
            stroke={`url(#ristekGrad-${uid})`}
            strokeWidth="7"
          />

          {/* Clipped Interior Cyber Radar & Vertical Laser Scanline */}
          {!locked && (
            <g clipPath={`url(#ristekHexClip-${uid})`}>
              {/* Rotating HUD Radar Ring Inside Badge */}
              <circle
                cx="50"
                cy="48"
                r="26"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="10 6 3 6"
                opacity="0.35"
                className="origin-[50px_48px] spin-reverse-slow"
              />
              {/* Vertical Cyber Laser Scanline Sweeping Up & Down */}
              <rect
                x="0"
                y="-20"
                width="100"
                height="24"
                fill={`url(#ristekLaser-${uid})`}
                className={hyperMode ? "svg-laser-scan-fast" : "svg-laser-scan"}
              />
            </g>
          )}

          {/* Inner Animated Dashed Circuit Track */}
          <polygon
            points="50 12, 87 33, 87 82, 50 103, 13 82, 13 33"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2"
            strokeDasharray="10 4"
            className={!locked ? "badge-dash-march-reverse" : ""}
          />

          {/* Dual High-Speed Plasma Packets Orbiting Hexagon Perimeter */}
          {!locked && (
            <>
              <polygon
                points="50 2, 96 27, 96 88, 50 113, 4 88, 4 27"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="24 284"
                className={hyperMode ? "hex-perimeter-orbit-fast" : "hex-perimeter-orbit"}
              />
              <polygon
                points="50 2, 96 27, 96 88, 50 113, 4 88, 4 27"
                fill="none"
                stroke="#f97316"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="18 290"
                strokeDashoffset="150"
                className={hyperMode ? "hex-perimeter-orbit-fast" : "hex-perimeter-orbit"}
              />
            </>
          )}

          {/* Blinking Electric Nodes at Hexagon Vertices */}
          <circle cx="50" cy="12" r="3.2" fill="#00f0ff" className={!locked ? "vertex-sparkle-1" : ""} />
          <circle cx="87" cy="33" r="3" fill="#f97316" className={!locked ? "vertex-sparkle-2" : ""} />
          <circle cx="13" cy="33" r="3" fill="#f97316" className={!locked ? "vertex-sparkle-3" : ""} />
          <circle cx="87" cy="82" r="2.5" fill="#00f0ff" className={!locked ? "vertex-sparkle-3" : ""} />
          <circle cx="13" cy="82" r="2.5" fill="#00f0ff" className={!locked ? "vertex-sparkle-2" : ""} />

          {/* Bottom Builder '26 Tag */}
          <path d="M15 79 L85 79 L79 94 L21 94 Z" fill="#2563eb" />
          <text
            x="50"
            y="89.5"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="8.5"
            fontWeight="900"
            fontFamily="monospace"
          >
            SAPPHIRE '26
          </text>
        </svg>

        {/* 3. Center Animated Topi Hardhat Icon + Glowing '26' Core (Kaya BEM) */}
        <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center ${
          isLarge ? "-mt-4" : isMd ? "-mt-3" : "-mt-2"
        } pointer-events-none`}>
          {locked ? (
            <Lock className={`${isLarge ? "w-12 h-12" : isMd ? "w-7 h-7" : "w-4 h-4"} text-slate-400`} />
          ) : (
            <div className="flex flex-col items-center leading-none">
              <HardHatSvg
                className={`${
                  isLarge ? "w-8 h-8 mb-0.5" : isMd ? "w-5 h-5 mb-0.5" : "w-2.5 h-2.5 -mb-0.5"
                } text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.9)] badge-crown-bob`}
              />
              <span
                className={`${
                  isLarge ? "text-4xl" : isMd ? "text-2xl" : isXs ? "text-[10px]" : "text-[11px]"
                } font-black tracking-tighter bg-gradient-to-b from-white via-cyan-200 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,240,255,0.95)] badge-core-pulse`}
              >
                26
              </span>
            </div>
          )}
        </div>

        {/* 4. Strobing Corner Sparks Outside Badge */}
        {!locked && (
          <>
            <span className="absolute -top-1 -left-0.5 w-2 h-2 bg-cyan-400 rounded-full animate-ping z-20 pointer-events-none" />
            <span className="absolute -top-1 -left-0.5 w-2 h-2 bg-cyan-300 rounded-full shadow-[0_0_8px_#00f0ff] z-20 pointer-events-none" />
            <span className="absolute -bottom-0.5 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-ping [animation-delay:450ms] z-20 pointer-events-none" />
            <span className="absolute -bottom-0.5 -right-1 w-1.5 h-1.5 bg-orange-300 rounded-full shadow-[0_0_8px_#f97316] z-20 pointer-events-none" />
          </>
        )}
      </div>

      {/* Sleek & Compact Tooltip on Card Hover */}
      {showTooltip && (size === "xs" || size === "sm") && (
        <div
          className={`pointer-events-none absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-[80] w-52 sm:w-56 max-w-[240px] p-2.5 rounded-lg bg-slate-950/95 text-white shadow-[0_8px_24px_rgba(59,130,246,0.4)] border border-sky-400/70 text-left select-none ${
            tooltipAlign === "left"
              ? "left-0 translate-x-0"
              : tooltipAlign === "right"
              ? "right-0 left-auto translate-x-0"
              : "left-1/2 -translate-x-1/2"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1 mb-1.5">
            <span className="px-2 py-0.5 text-[8.5px] font-bold text-slate-950 rounded bg-gradient-to-r from-sky-400 via-blue-500 to-orange-400">
              MECHA MYTHIC
            </span>
          </div>
          <p className="text-xs font-bold flex items-center gap-1 text-sky-200 mb-0.5 leading-snug">
            <PickaxeSvg className="w-3 h-3 text-orange-400 shrink-0" />
            Mecha Sapphire Builder '26
          </p>
          <p className="text-[10px] font-semibold text-sky-300 mb-1 leading-tight">
            Simbol: Mecha Chassis & Power Core
          </p>
          <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
            Plasma Perimeter Orbit & Dual Reactor Rings.
          </p>
          <div className="mt-1.5 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[8.5px] text-slate-400 font-medium">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              {locked ? "🔒 Belum diraih" : "✓ Diraih"}
            </span>
            <span className="text-slate-400">Klik rincian &rarr;</span>
          </div>
          <div
            className={`absolute -bottom-1 w-2 h-2 bg-slate-950 rotate-45 border-r border-b border-sky-400/70 ${
              tooltipAlign === "left"
                ? "left-3.5"
                : tooltipAlign === "right"
                ? "right-3.5 left-auto"
                : "left-1/2 -translate-x-1/2"
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default HexBadgeRistekMecha;

