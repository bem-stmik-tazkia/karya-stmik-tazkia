"use client";

import React, { useId } from "react";

export interface HexBadgeBEM2026Props {
  size?: "xs" | "sm" | "md" | "lg";
  locked?: boolean;
  hyperMode?: boolean;
  animated?: boolean;
  onClick?: () => void;
  title?: string;
  tooltip?: string;
  showTooltip?: boolean;
  tooltipAlign?: "center" | "left" | "right";
}

export const HexBadgeBEM2026: React.FC<HexBadgeBEM2026Props> = ({
  size = "sm",
  locked = false,
  hyperMode = false,
  animated = true,
  onClick,
  title,
  tooltip,
  showTooltip = true,
  tooltipAlign = "center",
}) => {
  const rawId = useId();
  const uid = `bem-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // Animasi otomatis berjalan kontinu saat lencana tidak terkunci (locked = false)
  const isAnimated = !locked && animated !== false;

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
      {/* Keyframes CSS mandiri agar semua animasi berjalan langsung tanpa perlu dipicu event klik/hover */}
      <style>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes foilSweep {
          0% { transform: translateX(-40px) rotate(25deg); }
          45%, 100% { transform: translateX(160px) rotate(25deg); }
        }
        @keyframes dashMarch {
          to { stroke-dashoffset: -24; }
        }
        @keyframes perimeterOrbit {
          to { stroke-dashoffset: -306; }
        }
        @keyframes crownBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        @keyframes corePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes sparkleBlink {
          0%, 100% { opacity: 0.25; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.25); }
        }
        .spin-slow { animation: spinSlow 18s linear infinite; }
        .spin-fast { animation: spinSlow 5s linear infinite; }
        .svg-foil-sweep { animation: foilSweep 4.2s ease-in-out infinite; }
        .svg-foil-sweep-fast { animation: foilSweep 1.8s ease-in-out infinite; }
        .badge-dash-march { animation: dashMarch 3s linear infinite; }
        .hex-perimeter-orbit { animation: perimeterOrbit 4s linear infinite; }
        .hex-perimeter-orbit-fast { animation: perimeterOrbit 1.4s linear infinite; }
        .badge-crown-bob { animation: crownBob 2.4s ease-in-out infinite; }
        .badge-core-pulse { animation: corePulse 2.4s ease-in-out infinite; }
        .vertex-sparkle-1 { animation: sparkleBlink 2s ease-in-out infinite; transform-origin: 50px 2.5px; }
        .vertex-sparkle-2 { animation: sparkleBlink 2s ease-in-out infinite 0.6s; transform-origin: 94px 27.5px; }
        .vertex-sparkle-3 { animation: sparkleBlink 2s ease-in-out infinite 1.2s; transform-origin: 6px 27.5px; }
      `}</style>

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
          !isLarge ? "hover:scale-105" : ""
        } ${locked ? "grayscale opacity-55" : isAnimated ? "badge-float" : ""}`}
      >
        {/* 1. Outer Breathing Golden Aura + Rotating Halo Ring */}
        {isAnimated && (
          <>
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/50 via-yellow-300/40 to-orange-500/50 blur-md ${
                hyperMode ? "animate-ping [animation-duration:1.8s]" : "animate-pulse"
              } ${isLarge ? "scale-100" : "scale-90"}`}
            />
            <div
              className={`absolute ${
                isLarge ? "-inset-2 border-[1.5px]" : "-inset-1 border"
              } rounded-full border-dashed border-amber-300/80 pointer-events-none ${
                hyperMode ? "animate-[spin_4s_linear_infinite]" : "animate-[spin_12s_linear_infinite]"
              }`}
            />
          </>
        )}

        {/* 2. Clean Tactile Vector Hexagon (Modern Discord/GitHub/Valorant UI Style) */}
        <svg
          viewBox="0 0 100 115"
          className={`w-full h-full relative z-10 ${
            !locked ? "drop-shadow-[0_4px_10px_rgba(245,158,11,0.4)]" : ""
          }`}
        >
          <defs>
            {/* Clean Modern Metallic Gold (Warm & Crisp, Not Over-rendered) */}
            <linearGradient id={`bemRimGold-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="28%" stopColor="#fbbf24" />
              <stop offset="65%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Inner Rim Subtle Recessed Bevel */}
            <linearGradient id={`bemRecessBevel-${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* Deep Matte Royal Navy Core */}
            <linearGradient id={`bemCoreNavy-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#172554" />
              <stop offset="55%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>

            {/* Subtle Top Ambient Glow inside the Navy Plate */}
            <radialGradient id={`bemTopGlow-${uid}`} cx="50%" cy="22%" r="55%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>

            {/* Crisp Anodized Gold Pill Gradient */}
            <linearGradient id={`bemPillGold-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* Foil Shimmer Sweep */}
            <linearGradient id={`bemFoilSweep-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(254,240,138,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            {/* Rounded Outer & Inner Hexagon Clips */}
            <clipPath id={`bemHexClip-${uid}`}>
              <path d="M 46.5 4 L 89.5 28.8 A 6.5 6.5 0 0 1 93 34.5 L 93 80.5 A 6.5 6.5 0 0 1 89.5 86.2 L 53.5 111 A 6.5 6.5 0 0 1 46.5 111 L 10.5 86.2 A 6.5 6.5 0 0 1 7 80.5 L 7 34.5 A 6.5 6.5 0 0 1 10.5 28.8 L 46.5 4 A 6.5 6.5 0 0 1 53.5 4 Z" />
            </clipPath>
            <clipPath id={`bemInnerClip-${uid}`}>
              <polygon
                points="50 10.5, 85.5 31, 85.5 84, 50 104.5, 14.5 84, 14.5 31"
                strokeLinejoin="round"
              />
            </clipPath>
          </defs>

          {/* ========================================== */}
          {/* A. CLEAN ROUNDED HEXAGON CHASSIS           */}
          {/* ========================================== */}
          {/* 1. Outer Metallic Gold Rim */}
          <polygon
            points="50 3.5, 93 28.5, 93 86.5, 50 111.5, 7 86.5, 7 28.5"
            fill={`url(#bemRimGold-${uid})`}
            stroke={`url(#bemRimGold-${uid})`}
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* 2. Subtle Crisp Outer Edge Highlight */}
          <polygon
            points="50 3.5, 93 28.5, 93 86.5, 50 111.5, 7 86.5, 7 28.5"
            fill="none"
            stroke="#fef9c3"
            strokeWidth="0.75"
            strokeLinejoin="round"
            opacity="0.7"
          />

          {/* 3. Recessed Inner Bevel Step (Gives clean depth without messy facets) */}
          <polygon
            points="50 10, 86.5 31, 86.5 84, 50 105, 13.5 84, 13.5 31"
            fill={`url(#bemCoreNavy-${uid})`}
            stroke={`url(#bemRecessBevel-${uid})`}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* 4. Top Soft Ambient Spotlight */}
          <polygon
            points="50 11, 85.5 31.5, 85.5 83.5, 50 104, 14.5 83.5, 14.5 31.5"
            fill={`url(#bemTopGlow-${uid})`}
          />

          {/* ========================================== */}
          {/* B. INNER GEOMETRIC ACCENTS & SHIMMER       */}
          {/* ========================================== */}
          {isAnimated && (
            <g clipPath={`url(#bemInnerClip-${uid})`}>
              {/* Subtle Geometric Tech Ring */}
              <circle
                cx="50"
                cy="51"
                r="28"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="0.75"
                strokeDasharray="3 5"
                opacity="0.22"
                className="origin-[50px_51px] spin-slow"
              />
              {/* Clean Top-Left Glossy Cut (Tactile Glass Feel) */}
              <polygon
                points="10 10, 75 10, 35 75, 10 75"
                fill="#ffffff"
                opacity="0.03"
              />
              {/* Diagonal Glossy Light Sweep */}
              <rect
                x="-60"
                y="-20"
                width="36"
                height="160"
                fill={`url(#bemFoilSweep-${uid})`}
                transform="rotate(25 50 57)"
                className={hyperMode ? "svg-foil-sweep-fast" : "svg-foil-sweep"}
              />
            </g>
          )}

          {/* Inner Dashed Crest Track */}
          <polygon
            points="50 16, 80.5 33.5, 80.5 81.5, 50 99, 19.5 81.5, 19.5 33.5"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4.5 4"
            opacity="0.85"
            className={isAnimated ? "badge-dash-march" : ""}
          />

          {/* Orbiting Golden Energy Stream Along Outer Perimeter */}
          {isAnimated && (
            <polygon
              points="50 3.5, 93 28.5, 93 86.5, 50 111.5, 7 86.5, 7 28.5"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="24 280"
              className={hyperMode ? "hex-perimeter-orbit-fast" : "hex-perimeter-orbit"}
            />
          )}

          {/* ========================================== */}
          {/* C. MODERN TAPERED PILL PLATE ("BEM 2026")  */}
          {/* ========================================== */}
          {/* Crisp Drop Shadow under Plate */}
          <path
            d="M 21 79.5 L 79 79.5 L 74.5 93.5 L 25.5 93.5 Z"
            fill="#020617"
            opacity="0.7"
          />
          {/* Main Tapered Trapezoid Plate */}
          <path
            d="M 20.5 77.5 L 79.5 77.5 L 75 91.5 L 25 91.5 Z"
            fill={`url(#bemPillGold-${uid})`}
            stroke="#fef08a"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          {/* Subtle Top Inner Highlight on Plate */}
          <line
            x1="22.5"
            y1="79"
            x2="77.5"
            y2="79"
            stroke="#ffffff"
            strokeWidth="0.7"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* Crisp Sans-Serif "BEM 2026" Label */}
          <text
            x="50"
            y="87.2"
            textAnchor="middle"
            fill="#091124"
            fontSize="8.5"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.7"
          >
            BEM 2026
          </text>

          {/* ========================================== */}
          {/* D. SIGNATURE EDGE GLINT & CORNER DOTS      */}
          {/* ========================================== */}
          <circle cx="50" cy="16" r="1.8" fill="#fef08a" className={isAnimated ? "vertex-sparkle-1" : ""} />
          <circle cx="80.5" cy="33.5" r="1.6" fill="#fbbf24" className={isAnimated ? "vertex-sparkle-2" : ""} />
          <circle cx="19.5" cy="33.5" r="1.6" fill="#fbbf24" className={isAnimated ? "vertex-sparkle-3" : ""} />

          {/* Iconic Bottom-Right White Specular Glint Bar */}
          <line
            x1="56"
            y1="108"
            x2="86"
            y2="90.5"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>

        {/* 3. Center Clean Geometric Crown + Bold Modern Sans '26' */}
        <div
          className={`absolute inset-0 z-20 flex flex-col items-center justify-center ${
            isLarge ? "-mt-5" : isMd ? "-mt-3.5" : "-mt-2"
          } pointer-events-none`}
        >
          <div className="flex flex-col items-center leading-none">
            {/* Clean Modern Vector Crown (Sharp, Iconic) */}
            <svg
              viewBox="0 0 32 24"
              className={`${
                isLarge
                  ? "w-9 h-7 mb-0.5"
                  : isMd
                  ? "w-5 h-4 mb-0.5"
                  : isXs
                  ? "w-2.5 h-2 -mb-0.5"
                  : "w-3 h-2.5 -mb-0.5"
              } overflow-visible drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] ${
                isAnimated ? "badge-crown-bob" : ""
              }`}
            >
              <defs>
                <linearGradient id={`cleanCrown-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <path
                d="M 3 16 L 1.5 6.5 L 10 11.5 L 16 3 L 22 11.5 L 30.5 6.5 L 29 16 Z"
                fill={`url(#cleanCrown-${uid})`}
                stroke="#fef9c3"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <rect
                x="3.5"
                y="18.5"
                width="25"
                height="3"
                rx="1.5"
                fill={`url(#cleanCrown-${uid})`}
              />
            </svg>

            {/* Bold Geometric Sans-Serif '26' */}
            <span
              className={`${
                isLarge
                  ? "text-[40px]"
                  : isMd
                  ? "text-[23px]"
                  : isXs
                  ? "text-[10px]"
                  : "text-[12px]"
              } font-black tracking-tight font-sans bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent [filter:drop-shadow(0_2px_0px_rgba(69,26,3,0.95))_drop-shadow(0_4px_8px_rgba(0,0,0,0.6))] ${
                isAnimated ? "badge-core-pulse" : ""
              }`}
            >
              26
            </span>
          </div>
        </div>

        {/* 3b. Standard Circular Lock Overlay when in Locked State */}
        {locked && (
          <svg
            viewBox="0 0 100 115"
            className="absolute inset-0 w-full h-full z-30 pointer-events-none"
          >
            <rect
              x="0"
              y="0"
              width="100"
              height="115"
              fill="#020617"
              opacity="0.45"
              clipPath={`url(#bemHexClip-${uid})`}
            />
            <circle cx="50" cy="57" r="14" fill="#0f172a" stroke="#94a3b8" strokeWidth="2" />
            <rect x="44" y="55" width="12" height="9" rx="2" fill="#e2e8f0" />
            <path
              d="M46.5 55 V51.5 C46.5 49.5, 53.5 49.5, 53.5 51.5 V55"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2.2"
            />
          </svg>
        )}
      </div>

      {/* Sleek & Compact Tooltip on Card Hover */}
      {showTooltip && (size === "xs" || size === "sm") && (
        <div
          className={`pointer-events-none absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-[80] w-52 sm:w-56 max-w-[240px] p-2.5 rounded-lg bg-gradient-to-br from-slate-950 via-[#1a180d] to-slate-950 text-white shadow-[0_8px_24px_rgba(245,158,11,0.35)] border border-amber-400/60 text-left select-none ${
            tooltipAlign === "left"
              ? "left-0 translate-x-0"
              : tooltipAlign === "right"
              ? "right-0 left-auto translate-x-0"
              : "left-1/2 -translate-x-1/2"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1 mb-1.5">
            <span className="px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 text-slate-950 rounded">
              TERBATAS
            </span>
          </div>
          <p className="text-xs font-bold text-amber-200 mb-0.5 leading-snug">
            {title || "Vanguard BEM 2026"}
          </p>
          <p className="text-[10px] font-semibold text-amber-400 mb-1 leading-tight">
            Simbol: Garuda Emas & Crown 26
          </p>
          <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
            {tooltip || "Golden Halo Orbit & inti 26 berdenyut."}
          </p>
          <div className="mt-1.5 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[8.5px] text-slate-400 font-medium">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              {locked ? "🔒 Belum diraih" : "✓ Diraih"}
            </span>
            <span className="text-slate-400">Klik rincian &rarr;</span>
          </div>
          <div
            className={`absolute -bottom-1 w-2 h-2 bg-[#1a180d] rotate-45 border-r border-b border-amber-400/60 ${
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

export default HexBadgeBEM2026;
