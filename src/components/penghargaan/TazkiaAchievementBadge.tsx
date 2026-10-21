"use client";

import React, { useId } from "react";
import type { PenghargaanBadge } from "@/data/penghargaanCatalog";
import { Crown, Zap, Lock, Sparkles } from "lucide-react";

// ==========================================
// CUSTOM BUILDER SVG ICONS (HARD HAT & PICKAXE)
// ==========================================

export const HardHatSvg = ({ className = "w-4 h-4", strokeWidth = 2.2 }: { className?: string; strokeWidth?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z" fill="currentColor" fillOpacity="0.25" />
    <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
    <path d="M4 15v-3a6 6 0 0 1 6-6h0" />
    <path d="M14 6h0a6 6 0 0 1 6 6v3" />
  </svg>
);

export const PickaxeSvg = ({ className = "w-4 h-4", strokeWidth = 2.2 }: { className?: string; strokeWidth?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 3.5C18 5 20.5 8.5 21 12.5c-2.5-1.5-5.5-2-8.5-1.5L9 7.5c.5-3 0-6-1.5-8.5 4 .5 7.5 3 9 6.5Z" fill="currentColor" fillOpacity="0.25" />
    <path d="M14 10 3.5 20.5a1.41 1.41 0 0 1-2-2L12 8" />
    <path d="m15 6 3 3" />
  </svg>
);

export const BuilderComboSvg = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 20 19 5" />
    <path d="M15 4c2.5 1 4.5 3 5 5.5" />
    <path d="M20 20 5 5" />
    <path d="M9 4C6.5 5 4.5 7 4 9.5" />
    <circle cx="12" cy="12" r="3.5" fill="#091526" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// ============================================================================
// EXCLUSIVE ANIMATED BADGE 1: BEM 2026 ("VANGUARD 26" ROYAL GOLD)
// ============================================================================
export const HexBadgeBEM2026 = ({
  size = "sm",
  locked = false,
  hyperMode = false,
  onClick,
}: {
  size?: "xs" | "sm" | "md" | "lg";
  locked?: boolean;
  hyperMode?: boolean;
  onClick?: () => void;
}) => {
  const isLarge = size === "lg";
  const isMd = size === "md";
  const isXs = size === "xs";
  const uid = isLarge ? "bem-lg" : isMd ? "bem-md" : isXs ? "bem-xs" : "bem-sm";

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
        className={`relative flex items-center justify-center transition-all duration-300 focus:outline-none ${
          onClick ? "cursor-pointer" : ""
        } ${
          isLarge
            ? "w-36 h-40 sm:w-44 sm:h-48"
            : isMd
            ? "w-20 h-23 sm:w-24 sm:h-28"
            : isXs
            ? "w-8 h-9 hover:scale-115"
            : "w-10 h-11 hover:scale-120"
        } ${locked ? "grayscale opacity-55" : hyperMode ? "badge-levitate-fast" : "badge-levitate"}`}
      >
        {/* 1. Outer Breathing Golden Aura + Rotating Halo Ring */}
        {!locked && (
          <>
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/60 via-yellow-300/50 to-orange-500/60 blur-md ${
                hyperMode ? "animate-ping [animation-duration:1.8s]" : "animate-pulse"
              } ${isLarge ? "scale-105" : "scale-95"}`}
            />
            <div
              className={`absolute ${
                isLarge ? "-inset-2 border-2" : "-inset-1 border"
              } rounded-full border-dashed border-amber-300/85 pointer-events-none ${
                hyperMode ? "spin-fast" : "spin-slow"
              }`}
            />
          </>
        )}

        {/* 2. Animated SVG Hexagon with Orbiting Gold Energy & Diagonal Foil Shimmer */}
        <svg
          viewBox="0 0 100 115"
          className={`w-full h-full relative z-10 ${
            !locked ? "drop-shadow-[0_0_12px_rgba(245,158,11,0.75)]" : ""
          }`}
        >
          <defs>
            <linearGradient id={`bemGoldGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>
            <linearGradient id={`bemInnerNavy-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#271705" />
            </linearGradient>
            <linearGradient id={`bemFoilSweep-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(254,240,138,0.65)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <clipPath id={`bemHexClip-${uid}`}>
              <polygon points="50 2, 96 27, 96 88, 50 113, 4 88, 4 27" />
            </clipPath>
          </defs>

          {/* Base Hexagon Body */}
          <polygon
            points="50 2, 96 27, 96 88, 50 113, 4 88, 4 27"
            fill={`url(#bemInnerNavy-${uid})`}
            stroke={`url(#bemGoldGrad-${uid})`}
            strokeWidth="7"
          />

          {/* Animated Metallic Foil Shimmer inside Clipped Hexagon */}
          {!locked && (
            <g clipPath={`url(#bemHexClip-${uid})`}>
              {/* Rotating Inner Sunburst Rays */}
              <circle
                cx="50"
                cy="52"
                r="38"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="12"
                strokeDasharray="6 10"
                opacity="0.14"
                className="origin-[50px_52px] spin-slow"
              />
              {/* Diagonal Glossy Light Sweep */}
              <rect
                x="-60"
                y="-20"
                width="45"
                height="160"
                fill={`url(#bemFoilSweep-${uid})`}
                transform="rotate(25 50 57)"
                className={hyperMode ? "svg-foil-sweep-fast" : "svg-foil-sweep"}
              />
            </g>
          )}

          {/* Inner Dashed Crest Track */}
          <polygon
            points="50 12, 87 33, 87 82, 50 103, 13 82, 13 33"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.8"
            strokeDasharray="6 4"
            className={!locked ? "badge-dash-march" : ""}
          />

          {/* Orbiting Golden Energy Stream Along Outer Perimeter */}
          {!locked && (
            <polygon
              points="50 2, 96 27, 96 88, 50 113, 4 88, 4 27"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="28 280"
              className={hyperMode ? "hex-perimeter-orbit-fast" : "hex-perimeter-orbit"}
            />
          )}

          {/* Blinking Corner Star Vertices */}
          <circle cx="50" cy="11" r="3" fill="#fef08a" className={!locked ? "vertex-sparkle-1" : ""} />
          <circle cx="87" cy="33" r="2.5" fill="#fbbf24" className={!locked ? "vertex-sparkle-2" : ""} />
          <circle cx="13" cy="33" r="2.5" fill="#fbbf24" className={!locked ? "vertex-sparkle-3" : ""} />

          {/* Bottom Ribbon */}
          <path d="M20 80 L80 80 L74 94 L26 94 Z" fill={`url(#bemGoldGrad-${uid})`} />
          <text
            x="50"
            y="90"
            textAnchor="middle"
            fill="#091526"
            fontSize="9.5"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            BEM 2026
          </text>
        </svg>

        {/* 3. Center Animated Crown + Glowing '26' Core */}
        <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center ${
          isLarge ? "-mt-4" : isMd ? "-mt-3" : "-mt-2"
        } pointer-events-none`}>
          {locked ? (
            <Lock className={`${isLarge ? "w-12 h-12" : isMd ? "w-7 h-7" : "w-4 h-4"} text-slate-400`} />
          ) : (
            <div className="flex flex-col items-center leading-none">
              <Crown
                className={`${
                  isLarge ? "w-8 h-8 mb-0.5" : isMd ? "w-5 h-5 mb-0.5" : "w-2.5 h-2.5 -mb-0.5"
                } text-amber-300 fill-amber-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)] badge-crown-bob`}
              />
              <span
                className={`${
                  isLarge ? "text-4xl" : isMd ? "text-2xl" : isXs ? "text-[10px]" : "text-[11px]"
                } font-black tracking-tighter bg-gradient-to-b from-yellow-100 via-amber-300 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(251,191,36,0.95)] badge-core-pulse`}
              >
                26
              </span>
            </div>
          )}
        </div>

        {/* 4. Floating Sparkle Particles Outside Vertices */}
        {!locked && (
          <>
            <span className="absolute -top-1 -right-0.5 w-2 h-2 bg-yellow-300 rounded-full animate-ping z-20" />
            <span className="absolute -top-1 -right-0.5 w-2 h-2 bg-amber-200 rounded-full shadow-[0_0_8px_#fde047] z-20" />
            <span className="absolute -bottom-0.5 -left-1 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping [animation-delay:600ms] z-20" />
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EXCLUSIVE ANIMATED BADGE 2: BEM x RISTEK 2026 (CYBER SAPPHIRE & MECHA ULTRA)
// ============================================================================
export const HexBadgeRistek2026 = ({
  size = "sm",
  locked = false,
  variant = "A", // 'A' (Quantum Blue V2) | 'B' (Mecha Sapphire Ultra V2)
  customIcon,
  hyperMode = false,
  onClick,
}: {
  size?: "xs" | "sm" | "md" | "lg";
  locked?: boolean;
  variant?: "A" | "B";
  customIcon?: "hardhat" | "pickaxe" | "combo";
  hyperMode?: boolean;
  onClick?: () => void;
}) => {
  const isLarge = size === "lg";
  const isMd = size === "md";
  const isXs = size === "xs";
  const isB = variant === "B";
  const activeIcon = customIcon || (isB ? "pickaxe" : "hardhat");
  const uid = `${variant}-${isLarge ? "lg" : isMd ? "md" : isXs ? "xs" : "sm"}`;

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
        className={`relative flex items-center justify-center transition-all duration-300 focus:outline-none ${
          onClick ? "cursor-pointer" : ""
        } ${
          isLarge
            ? "w-36 h-40 sm:w-44 sm:h-48"
            : isMd
            ? "w-20 h-23 sm:w-24 sm:h-28"
            : isXs
            ? "w-8 h-9 hover:scale-115"
            : "w-10 h-11 hover:scale-120"
        } ${locked ? "grayscale opacity-55" : hyperMode ? "badge-levitate-fast" : "badge-levitate-delayed"}`}
      >
        {/* 1. Strobing Neon Plasma Backlight + Dual Counter-Rotating Reactor Rings */}
        {!locked && (
          <>
            <div
              className={`absolute inset-0 rounded-full blur-md ${
                isB
                  ? "bg-gradient-to-tr from-blue-500/70 via-cyan-400/60 to-orange-500/65"
                  : "bg-gradient-to-tr from-cyan-400/70 via-blue-500/55 to-orange-500/60"
              } ${hyperMode ? "ristek-plasma-aura-fast" : "ristek-plasma-aura"} ${
                isLarge ? "scale-110" : "scale-100"
              }`}
            />

            {/* Outer Counter-Rotating Cyber Ring */}
            <div
              className={`absolute ${
                isLarge ? "-inset-2.5 border-2" : "-inset-1 border"
              } rounded-full border-dashed ${
                isB ? "border-sky-400/80" : "border-cyan-400/80"
              } pointer-events-none ${hyperMode ? "spin-fast" : "spin-slow"}`}
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
            !locked
              ? isB
                ? "drop-shadow-[0_0_14px_rgba(59,130,246,0.85)]"
                : "drop-shadow-[0_0_14px_rgba(6,182,212,0.85)]"
              : ""
          }`}
        >
          <defs>
            <linearGradient id={`ristekGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="45%" stopColor={isB ? "#3b82f6" : "#0ea5e9"} />
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
                stroke={isB ? "#38bdf8" : "#22d3ee"}
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
            stroke={isB ? "#60a5fa" : "#22d3ee"}
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
          <path d="M15 79 L85 79 L79 94 L21 94 Z" fill={isB ? "#2563eb" : "#06b6d4"} />
          <text
            x="50"
            y="89.5"
            textAnchor="middle"
            fill={isB ? "#ffffff" : "#020617"}
            fontSize="8"
            fontWeight="900"
            fontFamily="monospace"
          >
            {isB ? "SAPPHIRE '26" : "RISTEK 2026"}
          </text>
        </svg>

        {/* 3. Center Animated Builder Icon + Glowing '26' Core (Sama seperti BEM) */}
        <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center ${
          isLarge ? "-mt-4" : isMd ? "-mt-3" : "-mt-2"
        } pointer-events-none`}>
          {locked ? (
            <Lock className={`${isLarge ? "w-12 h-12" : isMd ? "w-7 h-7" : "w-4 h-4"} text-slate-400`} />
          ) : (
            <div className="flex flex-col items-center leading-none">
              {activeIcon === "hardhat" && (
                <HardHatSvg
                  className={`${
                    isLarge ? "w-8 h-8 mb-0.5" : isMd ? "w-5 h-5 mb-0.5" : "w-2.5 h-2.5 -mb-0.5"
                  } text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.9)] badge-crown-bob`}
                />
              )}
              {activeIcon === "pickaxe" && (
                <PickaxeSvg
                  className={`${
                    isLarge ? "w-8 h-8 mb-0.5" : isMd ? "w-5 h-5 mb-0.5" : "w-2.5 h-2.5 -mb-0.5"
                  } text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.9)] badge-crown-bob`}
                />
              )}
              {activeIcon === "combo" && (
                <BuilderComboSvg
                  className={`${
                    isLarge ? "w-8 h-8 mb-0.5" : isMd ? "w-5 h-5 mb-0.5" : "w-2.5 h-2.5 -mb-0.5"
                  } text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.9)] badge-crown-bob`}
                />
              )}
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
            <span className="absolute -top-1 -left-0.5 w-2 h-2 bg-cyan-400 rounded-full animate-ping z-20" />
            <span className="absolute -top-1 -left-0.5 w-2 h-2 bg-cyan-300 rounded-full shadow-[0_0_8px_#00f0ff] z-20" />
            <span className="absolute -bottom-0.5 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-ping [animation-delay:450ms] z-20" />
            <span className="absolute -bottom-0.5 -right-1 w-1.5 h-1.5 bg-orange-300 rounded-full shadow-[0_0_8px_#f97316] z-20" />
          </>
        )}
      </div>
    </div>
  );
};

interface BadgeSymbolArtworkProps {
  symbolKey: string;
  animated?: boolean;
}

export const BadgeSymbolArtwork: React.FC<BadgeSymbolArtworkProps> = ({ symbolKey, animated = true }) => {
  switch (symbolKey) {
    // #1: Karya Perdana — Roket Meluncur
    case "rocket":
      return (
        <g>
          {/* Exhaust Flame */}
          <path
            d="M43 75 C43 85, 50 93, 50 93 C50 93, 57 85, 57 75 Z"
            fill="#f97316"
            className="origin-[50px_75px] animate-pulse"
          />
          <path d="M46.5 75 C46.5 81, 50 86, 50 86 C50 86, 53.5 81, 53.5 75 Z" fill="#fef08a" />
          {/* Rocket Fins */}
          <path d="M37 62 L28 73 L40 71 Z" fill="#ea580c" stroke="#fed7aa" strokeWidth="1.3" />
          <path d="M63 62 L72 73 L60 71 Z" fill="#ea580c" stroke="#fed7aa" strokeWidth="1.3" />
          {/* Rocket Body */}
          <path
            d="M50 22 C39 35, 38 55, 40 72 L60 72 C62 55, 61 35, 50 22 Z"
            fill="#f8fafc"
            stroke="#f59e0b"
            strokeWidth="2.2"
          />
          <path
            d="M50 22 C44.5 30, 43 37, 42 41 L58 41 C57 37, 55.5 30, 50 22 Z"
            fill="#f97316"
          />
          {/* Window */}
          <circle cx="50" cy="52" r="6" fill="#0ea5e9" stroke="#bae6fd" strokeWidth="2.2" />
          {/* Stars */}
          <circle cx="29" cy="38" r="2" fill="#fde047" />
          <circle cx="71" cy="44" r="1.8" fill="#fde08a" />
        </g>
      );

    // #2: Kolektor Karya — Arsip Berlian
    case "diamond_archive":
      return (
        <g>
          {/* Back Left & Right Mini Gems */}
          <polygon
            points="32 45, 43 36, 50 45, 39 60"
            fill="#38bdf8"
            opacity="0.65"
            stroke="#bae6fd"
            strokeWidth="1.3"
          />
          <polygon
            points="68 45, 57 36, 50 45, 61 60"
            fill="#38bdf8"
            opacity="0.65"
            stroke="#bae6fd"
            strokeWidth="1.3"
          />
          {/* Main Center Brilliant Diamond */}
          <polygon
            points="35 47, 65 47, 73 58, 50 85, 27 58"
            fill="#0284c7"
            stroke="#e2e8f0"
            strokeWidth="2.2"
          />
          <polygon points="35 47, 65 47, 59 58, 41 58" fill="#7dd3fc" />
          <polygon points="41 58, 59 58, 50 85" fill="#38bdf8" />
          <line x1="27" y1="58" x2="73" y2="58" stroke="#f8fafc" strokeWidth="1.6" />
          {/* Top Crown Sparkle */}
          <path
            d="M50 24 L52.2 31.5 L60 33.8 L52.2 36 L50 43.5 L47.8 36 L40 33.8 L47.8 31.5 Z"
            fill="#ffffff"
          />
        </g>
      );

    // #3: Terverifikasi Kampus — Perisai Bercentang
    case "shield_check":
      return (
        <g>
          {/* Outer Shield */}
          <path
            d="M50 24 L73 33 V55 C73 72, 60 83, 50 88 C40 83, 27 72, 27 55 V33 Z"
            fill="#0f294a"
            stroke="#e2e8f0"
            strokeWidth="2.6"
          />
          <path
            d="M50 30 L67.5 36.5 V54 C67.5 67, 58 76, 50 81 C42 76, 32.5 67, 32.5 54 V36.5 Z"
            fill="#0284c7"
            fillOpacity="0.38"
            stroke="#7dd3fc"
            strokeWidth="1.4"
          />
          {/* Bold Checkmark */}
          <path
            d="M40 55 L47 62.5 L61 45"
            fill="none"
            stroke="#ffffff"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M40 55 L47 62.5 L61 45"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );

    // #4: Sorotan Kurator — Bintang Sorot Emas
    case "spotlight_star":
      return (
        <g>
          {/* Spotlight Beams */}
          <polygon points="22 86, 42 32, 58 32, 35 86" fill="#fde047" opacity="0.22" />
          <polygon points="78 86, 58 32, 42 32, 65 86" fill="#fde047" opacity="0.22" />
          {/* Orbiting Sparkles around the Gold Star ("Muter-Muter") */}
          <g
            className={animated ? "spin-slow" : ""}
            style={{ transformOrigin: "50px 48px" }}
          >
            <circle cx="28" cy="35" r="2.2" fill="#fde047" />
            <circle cx="72" cy="62" r="2.2" fill="#fde047" />
            <circle cx="50" cy="18" r="2.5" fill="#ffffff" />
          </g>
          {/* Radiant 5-Point Gold Star */}
          <polygon
            points="50 23, 57 42, 76 43, 61 55, 66 74, 50 63, 34 74, 39 55, 24 43, 43 42"
            fill="#f59e0b"
            stroke="#fef08a"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <polygon
            points="50 31, 54.5 44, 67.5 45, 57 53, 60.5 66, 50 58, 39.5 66, 43 53, 32.5 45, 45.5 44"
            fill="#fef08a"
          />
        </g>
      );

    // #5: Favorit Komunitas — Hati Berpendar
    case "glowing_heart":
      return (
        <g>
          {/* Outer Aura Ring */}
          <circle
            cx="50"
            cy="55"
            r="26"
            fill="none"
            stroke="#fb7185"
            strokeWidth="1.4"
            strokeDasharray="4 4"
            opacity="0.65"
          />
          {/* Heart Shape */}
          <path
            d="M50 79 C50 79, 26 63, 26 45 C26 35, 34 29, 41.5 29 C46.5 29, 50 33, 50 36 C50 33, 53.5 29, 58.5 29 C66 29, 74 35, 74 45 C74 63, 50 79, 50 79 Z"
            fill="#f43f5e"
            stroke="#ffe4e6"
            strokeWidth="2.4"
          />
          {/* Inner Highlight Heart */}
          <path
            d="M50 70 C50 70, 34 57, 34 45.5 C34 40, 38.5 36.5, 43 36.5 C46 36.5, 48.5 38.5, 50 41 C51.5 38.5, 54 36.5, 57 36.5 C61.5 36.5, 66 40, 66 45.5 C66 57, 50 70, 50 70 Z"
            fill="#fb923c"
            opacity="0.65"
          />
          <circle cx="39" cy="42" r="2.8" fill="#ffffff" opacity="0.85" />
        </g>
      );

    // #6: Sinergi Kolaborasi — Node Jaringan Terhubung
    case "network_nodes":
      return (
        <g>
          {/* Connecting Triangle & Center Lines */}
          <line x1="50" y1="29" x2="29" y2="69" stroke="#f59e0b" strokeWidth="2.8" />
          <line x1="50" y1="29" x2="71" y2="69" stroke="#f59e0b" strokeWidth="2.8" />
          <line x1="29" y1="69" x2="71" y2="69" stroke="#f59e0b" strokeWidth="2.8" />
          <line x1="50" y1="29" x2="50" y2="56" stroke="#fed7aa" strokeWidth="2" />
          <line x1="29" y1="69" x2="50" y2="56" stroke="#fed7aa" strokeWidth="2" />
          <line x1="71" y1="69" x2="50" y2="56" stroke="#fed7aa" strokeWidth="2" />
          {/* Central Hub */}
          <circle cx="50" cy="56" r="6.5" fill="#f97316" stroke="#ffffff" strokeWidth="2.2" />
          {/* 3 Outer Nodes */}
          <circle cx="50" cy="29" r="7" fill="#fbbf24" stroke="#fffbeb" strokeWidth="2.2" />
          <circle cx="29" cy="69" r="7" fill="#fb923c" stroke="#fffbeb" strokeWidth="2.2" />
          <circle cx="71" cy="69" r="7" fill="#fb923c" stroke="#fffbeb" strokeWidth="2.2" />
        </g>
      );

    // #7: Multi-Talenta — Prisma Kristal 3D
    case "crystal_prism":
      return (
        <g>
          {/* Refracted Multi-Skill Rays */}
          <line x1="58" y1="49" x2="79" y2="38" stroke="#f43f5e" strokeWidth="3.2" strokeLinecap="round" />
          <line x1="62" y1="56" x2="81" y2="56" stroke="#38bdf8" strokeWidth="3.2" strokeLinecap="round" />
          <line x1="58" y1="63" x2="79" y2="74" stroke="#facc15" strokeWidth="3.2" strokeLinecap="round" />
          {/* Incoming Light Beam */}
          <line x1="20" y1="58" x2="39" y2="53" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" />
          {/* 3D Prism Triangle */}
          <polygon
            points="50 26, 27 74, 73 74"
            fill="#1e293b"
            stroke="#e2e8f0"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <polygon points="50 26, 27 74, 50 65" fill="#38bdf8" fillOpacity="0.45" />
          <polygon points="50 26, 73 74, 50 65" fill="#818cf8" fillOpacity="0.45" />
          <line x1="50" y1="26" x2="50" y2="65" stroke="#f8fafc" strokeWidth="2" />
        </g>
      );

    // #8: Peneliti Muda — Gulungan Naskah & Pena Perak-Siber
    case "silver_scroll":
      return (
        <g>
          {/* Research Halo */}
          <ellipse
            cx="48"
            cy="54"
            rx="26"
            ry="10"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="3 3"
            opacity="0.55"
            transform="rotate(-25 48 54)"
          />
          {/* Silver-Platinum Manuscript Paper */}
          <rect x="31" y="29" width="32" height="48" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2.2" />
          <rect x="34" y="33" width="26" height="40" rx="2" fill="#f8fafc" />
          {/* Top & Bottom Metallic Silver Rollers */}
          <rect x="26" y="27" width="42" height="6.5" rx="3.2" fill="#475569" stroke="#f1f5f9" strokeWidth="1.6" />
          <rect x="26" y="73" width="42" height="6.5" rx="3.2" fill="#475569" stroke="#f1f5f9" strokeWidth="1.6" />
          {/* Academic Lines */}
          <line x1="38" y1="42" x2="55" y2="42" stroke="#0284c7" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="38" y1="50" x2="53" y2="50" stroke="#0284c7" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="38" y1="58" x2="48" y2="58" stroke="#64748b" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="43" cy="66" r="3.2" fill="#f97316" />
          {/* Quill Pen */}
          <path
            d="M71 25 C58 31, 51 47, 47 67 L54 63.5 C64 53, 73 38, 71 25 Z"
            fill="#0ea5e9"
            stroke="#f8fafc"
            strokeWidth="1.8"
          />
          <path d="M71 25 C63 30, 57 40, 53 53 L58 51 C65 43, 71 33, 71 25 Z" fill="#7dd3fc" />
          <line x1="68" y1="29" x2="46" y2="68" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="46" cy="68" r="2" fill="#f97316" />
        </g>
      );

    // #9: Inovasi Berdampak — Globe Sinyal Orbit
    case "live_signal_globe":
      return (
        <g>
          {/* Outer Pulsing Waves */}
          <path d="M63 26 A15 15 0 0 1 75 38" fill="none" stroke="#fde047" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M66 21 A21 21 0 0 1 80 35" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
          {/* Digital Globe Core */}
          <circle cx="49" cy="55" r="18" fill="#0f294a" stroke="#38bdf8" strokeWidth="2.2" />
          <ellipse cx="49" cy="55" rx="9" ry="18" fill="none" stroke="#38bdf8" strokeWidth="1.3" opacity="0.75" />
          <line x1="31" y1="55" x2="67" y2="55" stroke="#38bdf8" strokeWidth="1.3" opacity="0.75" />
          <path d="M34 46 Q49 50 64 46" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.65" />
          <path d="M34 64 Q49 60 64 64" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.65" />
          {/* Golden Orbiting Signal Ring */}
          <ellipse
            cx="49"
            cy="55"
            rx="27"
            ry="9.5"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2.6"
            transform="rotate(-24 49 55)"
          />
          {/* Orbiting Satellite Nodes revolving around the globe ("Muter-Muter") */}
          <g
            className={animated ? "spin-slow" : ""}
            style={{ transformOrigin: "49px 55px" }}
          >
            <circle cx="72" cy="44" r="4.2" fill="#f97316" stroke="#fef08a" strokeWidth="1.6" />
            <circle cx="26" cy="66" r="3.2" fill="#fde047" />
          </g>
          <circle cx="49" cy="55" r="3.2" fill="#22c55e" stroke="#dcfce7" strokeWidth="1.3" />
        </g>
      );

    // #10: Kreator Web & Aplikasi — Browser Window + Mobile App + </>
    case "web_app_portal":
      return (
        <g>
          {/* Main Web Browser Window */}
          <rect x="24" y="30" width="44" height="34" rx="4" fill="#0f294a" stroke="#e2e8f0" strokeWidth="2.2" />
          <line x1="24" y1="38" x2="68" y2="38" stroke="#94a3b8" strokeWidth="1.5" />
          {/* Traffic Light Dots */}
          <circle cx="29" cy="34" r="1.5" fill="#f97316" />
          <circle cx="33.5" cy="34" r="1.5" fill="#facc15" />
          <circle cx="38" cy="34" r="1.5" fill="#38bdf8" />
          {/* Code Brackets </> inside Web Window */}
          <path d="M37 47 L32 51.5 L37 56" fill="none" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M51 47 L56 51.5 L51 56" fill="none" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="46" y1="45.5" x2="42" y2="57.5" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" />
          {/* Overlapping Mobile App Frame */}
          <rect x="56" y="46" width="20" height="35" rx="3.5" fill="#1e293b" stroke="#f8fafc" strokeWidth="2.2" />
          <line x1="63" y1="50" x2="69" y2="50" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="60" y="54" width="12" height="18" rx="1.5" fill="#0284c7" fillOpacity="0.45" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="66" cy="76.5" r="1.6" fill="#f97316" />
        </g>
      );

    // #11: Kreator Desain & Kreatif — Vector Pen Tool & Bezier Curve
    case "design_pen_vector":
      return (
        <g>
          {/* Bezier Curve Path */}
          <path d="M27 68 C27 40, 73 40, 73 68" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeDasharray="3 2" />
          <line x1="32" y1="35" x2="68" y2="35" stroke="#f97316" strokeWidth="1.8" />
          {/* Bezier Anchor Nodes */}
          <rect x="47" y="32" width="6" height="6" rx="1" fill="#ffffff" stroke="#0284c7" strokeWidth="1.8" />
          <circle cx="32" cy="35" r="3" fill="#f97316" stroke="#fffbeb" strokeWidth="1.2" />
          <circle cx="68" cy="35" r="3" fill="#f97316" stroke="#fffbeb" strokeWidth="1.2" />
          {/* Pen Nib */}
          <polygon points="50 38, 63 58, 56 76, 44 76, 37 58" fill="#0f294a" stroke="#e2e8f0" strokeWidth="2.4" strokeLinejoin="round" />
          <polygon points="50 38, 59 57, 50 72, 41 57" fill="#0284c7" fillOpacity="0.45" />
          <line x1="50" y1="38" x2="50" y2="56" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="50" cy="58" r="3.2" fill="#f97316" stroke="#ffffff" strokeWidth="1.2" />
          <rect x="42" y="76" width="16" height="5" rx="1.5" fill="#cbd5e1" />
        </g>
      );

    // #12: Inovator IoT — Chip Mikrokontroler & Sinyal Sensor
    case "iot_microchip":
      return (
        <g>
          {/* Wireless Signal Arcs */}
          <path d="M42 27 A12 12 0 0 1 58 27" fill="none" stroke="#f97316" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M37 22 A19 19 0 0 1 63 22" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          {/* Microchip Pins */}
          {[39, 46, 54, 61].map((pos) => (
            <React.Fragment key={pos}>
              <line x1="25" y1={pos + 8} x2="33" y2={pos + 8} stroke="#cbd5e1" strokeWidth="2.6" strokeLinecap="round" />
              <line x1="67" y1={pos + 8} x2="75" y2={pos + 8} stroke="#cbd5e1" strokeWidth="2.6" strokeLinecap="round" />
              <line x1={pos} y1="33" x2={pos} y2="41" stroke="#cbd5e1" strokeWidth="2.6" strokeLinecap="round" />
              <line x1={pos} y1="75" x2={pos} y2="83" stroke="#cbd5e1" strokeWidth="2.6" strokeLinecap="round" />
            </React.Fragment>
          ))}
          {/* Chip Body */}
          <rect x="33" y="41" width="34" height="34" rx="5" fill="#0f294a" stroke="#e2e8f0" strokeWidth="2.4" />
          <rect x="39" y="47" width="22" height="22" rx="3" fill="#0284c7" fillOpacity="0.35" stroke="#38bdf8" strokeWidth="1.6" />
          <circle cx="50" cy="58" r="5.5" fill="#f97316" stroke="#fef08a" strokeWidth="1.8" />
          <circle cx="50" cy="58" r="2" fill="#ffffff" />
        </g>
      );

    // #13: Master 5 Kategori — Pentagon 5-Sudut Terhubung
    case "pentagon_master":
      return (
        <g>
          {/* Outer Pentagon Web */}
          <polygon
            points="50 25, 76 44, 66 75, 34 75, 24 44"
            fill="#1e3a8a"
            fillOpacity="0.35"
            stroke="#fbbf24"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          {/* Inner Star Spokes */}
          <line x1="50" y1="25" x2="50" y2="53" stroke="#fde047" strokeWidth="1.6" opacity="0.8" />
          <line x1="76" y1="44" x2="50" y2="53" stroke="#fde047" strokeWidth="1.6" opacity="0.8" />
          <line x1="66" y1="75" x2="50" y2="53" stroke="#fde047" strokeWidth="1.6" opacity="0.8" />
          <line x1="34" y1="75" x2="50" y2="53" stroke="#fde047" strokeWidth="1.6" opacity="0.8" />
          <line x1="24" y1="44" x2="50" y2="53" stroke="#fde047" strokeWidth="1.6" opacity="0.8" />
          {/* Revolving 5-Category Connector Halo ("Muter-Muter") */}
          <g
            className={animated ? "spin-slow" : ""}
            style={{ transformOrigin: "50px 53px" }}
          >
            <circle cx="50" cy="25" r="4.5" fill="#f97316" stroke="#fef08a" strokeWidth="1.8" />
            <circle cx="76" cy="44" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.6" />
            <circle cx="66" cy="75" r="4.5" fill="#a855f7" stroke="#ffffff" strokeWidth="1.6" />
            <circle cx="34" cy="75" r="4.5" fill="#22c55e" stroke="#ffffff" strokeWidth="1.6" />
            <circle cx="24" cy="44" r="4.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.6" />
          </g>
          {/* Center Golden Core */}
          <circle cx="50" cy="53" r="10" fill="#f59e0b" stroke="#fef08a" strokeWidth="2.2" />
          <polygon points="50 46, 52.2 51, 57.5 51.5, 53.5 55, 54.8 60, 50 57, 45.2 60, 46.5 55, 42.5 51.5, 47.8 51" fill="#fffbeb" />
        </g>
      );

    // #14: Pelopor Tazkia — Obor Api Abadi
    case "eternal_torch":
      return (
        <g>
          {/* Flame */}
          <path
            d="M50 19 C50 19, 68 32, 63 49 C61 56, 54 60, 50 60 C46 60, 39 56, 37 49 C34 37, 44 29, 44 29 C44 29, 43 37, 46 39 C45 30, 50 19, 50 19 Z"
            fill="#f97316"
            stroke="#fef08a"
            strokeWidth="2"
          />
          <path d="M50 31 C50 31, 58 40, 56 50 C55 54, 50 57, 50 57 C50 57, 45 54, 44 50 C42 40, 50 31, 50 31 Z" fill="#fde047" />
          {/* Torch Crown Rim */}
          <path d="M36 59 H64 L59.5 66.5 H40.5 Z" fill="#fbbf24" stroke="#fffbeb" strokeWidth="1.6" />
          {/* Torch Handle */}
          <polygon points="42.5 66.5, 57.5 66.5, 53 89, 47 89" fill="#d97706" stroke="#fef08a" strokeWidth="2" />
          {/* Orbiting Sparks ("Muter-Muter" around Torch Flame) */}
          <g
            className={animated ? "spin-slow" : ""}
            style={{ transformOrigin: "50px 48px" }}
          >
            <circle cx="30" cy="37" r="2.4" fill="#fde047" />
            <circle cx="70" cy="37" r="2.4" fill="#fde047" />
            <circle cx="50" cy="22" r="1.8" fill="#f97316" />
          </g>
        </g>
      );

    // #15: Vanguard BEM 2026 — Mahkota Emas & Angkatan 26
    case "bem_crown_26":
      return (
        <g>
          {/* Royal Crown */}
          <path
            d="M32 38 L37 49 L50 33 L63 49 L68 38 L65 54 L35 54 Z"
            fill="#fde047"
            stroke="#f59e0b"
            strokeWidth="1.8"
          />
          <circle cx="32" cy="38" r="2.2" fill="#fff" />
          <circle cx="50" cy="33" r="2.5" fill="#fff" />
          <circle cx="68" cy="38" r="2.2" fill="#fff" />
          {/* 26 Core Text */}
          <text
            x="50"
            y="74"
            textAnchor="middle"
            fill="#fef08a"
            stroke="#d97706"
            strokeWidth="0.8"
            fontSize="18"
            fontWeight="900"
            fontFamily="sans-serif"
            letterSpacing="-1"
          >
            26
          </text>
          {/* Sparkles / Orbiting Stars */}
          <g className={animated ? "spin-slow" : ""} style={{ transformOrigin: "50px 52px" }}>
            <circle cx="28" cy="46" r="2" fill="#fde047" />
            <circle cx="72" cy="46" r="2" fill="#fde047" />
            <circle cx="50" cy="22" r="2.2" fill="#fef08a" />
          </g>
          {/* Bottom Banner Ribbon */}
          <path d="M26 80 L74 80 L70 90 L30 90 Z" fill="#d97706" />
          <text x="50" y="87.5" textAnchor="middle" fill="#fef08a" fontSize="7" fontWeight="900" fontFamily="sans-serif">
            BEM 2026
          </text>
        </g>
      );

    // #16: Ristek Quantum Cyber — Hardhat & Circuit Trace
    case "ristek_quantum":
      return (
        <g>
          {/* Builder Hardhat */}
          <path
            d="M32 50 C32 36, 68 36, 68 50 L72 52 C72 55, 68 56, 50 56 C32 56, 28 55, 28 52 Z"
            fill="#00f0ff"
            stroke="#e0f2fe"
            strokeWidth="1.8"
          />
          <path d="M47 36 V48 M53 36 V48" stroke="#0284c7" strokeWidth="2" />
          {/* Circuit Trace & Energy Nodes */}
          <path d="M24 64 H38 L44 72 H56 L62 64 H76" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="4 2" />
          <circle cx="44" cy="72" r="2.5" fill="#f97316" />
          <circle cx="56" cy="72" r="2.5" fill="#00f0ff" />
          {/* Rotating Quantum Energy Node */}
          <g className={animated ? "spin-slow" : ""} style={{ transformOrigin: "50px 48px" }}>
            <circle cx="50" cy="24" r="2.2" fill="#00f0ff" />
            <circle cx="76" cy="48" r="2.2" fill="#38bdf8" />
            <circle cx="24" cy="48" r="2.2" fill="#f97316" />
          </g>
          {/* Bottom Tag */}
          <path d="M25 80 L75 80 L70 90 L30 90 Z" fill="#0891b2" />
          <text x="50" y="87.5" textAnchor="middle" fill="#cffafe" fontSize="7" fontWeight="900" fontFamily="monospace">
            QUANTUM '26
          </text>
        </g>
      );

    // #17: Ristek Mecha Sapphire — Pickaxe & Radar HUD
    case "ristek_mecha":
      return (
        <g>
          {/* Pickaxe Head */}
          <path
            d="M34 38 C42 32, 58 32, 66 38 L62 42 C56 38, 44 38, 38 42 Z"
            fill="#38bdf8"
            stroke="#bae6fd"
            strokeWidth="1.8"
          />
          {/* Pickaxe Handle */}
          <path d="M50 38 L50 66" stroke="#f97316" strokeWidth="3.2" strokeLinecap="round" />
          {/* Rotating HUD Radar Ring */}
          <circle
            cx="50"
            cy="52"
            r="19"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="6 4"
            className={animated ? "spin-slow" : ""}
            style={{ transformOrigin: "50px 52px" }}
          />
          <circle cx="50" cy="52" r="3.2" fill="#f97316" />
          {/* Tech Vertices */}
          <circle cx="34" cy="38" r="2" fill="#00f0ff" />
          <circle cx="66" cy="38" r="2" fill="#00f0ff" />
          {/* Bottom Tag */}
          <path d="M24 80 L76 80 L71 90 L29 90 Z" fill="#1d4ed8" />
          <text x="50" y="87.5" textAnchor="middle" fill="#eff6ff" fontSize="7" fontWeight="900" fontFamily="monospace">
            MECHA '26
          </text>
        </g>
      );

    default:
      return null;
  }
};

export interface TazkiaAchievementHexBadgeProps {
  badge: PenghargaanBadge;
  size?: "xs" | "sm" | "md" | "lg";
  locked?: boolean;
  animated?: boolean;
  shimmer?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const TazkiaAchievementHexBadge: React.FC<TazkiaAchievementHexBadgeProps> = ({
  badge,
  size = "md",
  locked = false,
  animated = true,
  shimmer = false,
  className = "",
  style,
  onClick,
}) => {
  if (
    badge.id === 15 ||
    badge.code === "bem_2026" ||
    badge.symbolKey === "bem_crown_26" ||
    badge.symbolKey === "bem2026"
  ) {
    return (
      <HexBadgeBEM2026
        size={size}
        locked={locked}
        onClick={onClick}
      />
    );
  }

  if (
    badge.id === 16 ||
    badge.code === "ristek_quantum_2026" ||
    badge.symbolKey === "ristek_quantum" ||
    badge.symbolKey === "ristekA"
  ) {
    return (
      <HexBadgeRistek2026
        variant="A"
        size={size}
        locked={locked}
        onClick={onClick}
      />
    );
  }

  if (
    badge.id === 17 ||
    badge.code === "ristek_mecha_2026" ||
    badge.symbolKey === "ristek_mecha" ||
    badge.symbolKey === "ristekB"
  ) {
    return (
      <HexBadgeRistek2026
        variant="B"
        size={size}
        locked={locked}
        onClick={onClick}
      />
    );
  }

  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  const hasShimmer = Boolean(shimmer || badge.hasShimmer);

  const sizeClasses = {
    xs: "w-8 h-9",
    sm: "w-11 h-12",
    md: "w-20 h-23 sm:w-24 sm:h-28",
    lg: "w-36 h-40 sm:w-44 sm:h-48",
  }[size];

  const isSilver = badge.tier === "perak";
  const isGold = badge.tier === "emas";
  const isSpecial = badge.tier === "khusus";
  const isSpecialMuter = Boolean(
    badge.hasOrbitAnimation ||
    isGold ||
    isSpecial ||
    badge.id === 4 ||
    badge.id === 9 ||
    badge.id === 13 ||
    badge.id === 14 ||
    badge.id === 15 ||
    badge.id === 16 ||
    badge.id === 17 ||
    badge.code === "sorotan_kurator" ||
    badge.code === "inovasi_berdampak" ||
    badge.code === "master_5_kategori" ||
    badge.code === "pelopor_tazkia" ||
    badge.code === "bem_2026" ||
    badge.code === "ristek_quantum_2026" ||
    badge.code === "ristek_mecha_2026"
  );

  const getTierGlow = () => {
    if (locked) return "";
    if (isSpecial) return "drop-shadow-[0_0_16px_rgba(249,115,22,0.8)]";
    if (isGold) return "drop-shadow-[0_0_14px_rgba(245,158,11,0.65)]";
    if (isSilver) return "drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]";
    return "drop-shadow-[0_0_10px_rgba(217,119,6,0.45)]";
  };

  return (
    <div
      role={onClick ? "button" : "presentation"}
      onClick={onClick}
      style={style}
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-200 ${sizeClasses} ${
        onClick ? "cursor-pointer" : ""
      } ${
        locked
          ? "filter grayscale opacity-55 hover:opacity-85 hover:grayscale-0"
          : animated
          ? "hover:scale-105 active:scale-95"
          : "hover:scale-105 active:scale-95"
      } ${className}`}
    >
      {/* Outer Animated Glowing Aura & Orbiting Dashed Ring for Special Badges (Pelopor & Berdampak) */}
      {!locked && animated && isSpecialMuter && (
        <>
          <div
            className={`absolute inset-0 rounded-full ${size === "xs" ? "blur-xs opacity-75" : "blur-md"} pointer-events-none ${
              isSpecial
                ? "bg-gradient-to-tr from-orange-500/55 via-amber-400/50 to-yellow-300/55 animate-pulse"
                : "bg-gradient-to-tr from-amber-500/40 via-yellow-300/35 to-orange-400/40 animate-pulse"
            }`}
          />
          <div
            className={`absolute -inset-1 rounded-full border border-dashed pointer-events-none spin-slow ${
              isSpecial ? "border-orange-400/85" : "border-yellow-300/85"
            }`}
          />
        </>
      )}

      <svg viewBox="0 0 100 115" className={`w-full h-full relative z-10 ${getTierGlow()}`}>
        <defs>
          {/* Bronze Metallic Gradient */}
          <linearGradient id={`grad-perunggu-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="40%" stopColor="#d97706" />
            <stop offset="75%" stopColor="#9a3412" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Silver Metallic Gradient */}
          <linearGradient id={`grad-perak-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>

          {/* Gold Metallic Gradient */}
          <linearGradient id={`grad-emas-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>

          {/* Pioneer Special Gold-Orange Mythic Gradient */}
          <linearGradient id={`grad-khusus-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="30%" stopColor="#f97316" />
            <stop offset="65%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>

          {/* Inner Navy Core Background */}
          <linearGradient id={`core-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isSpecial ? "#1e1b4b" : isGold ? "#172554" : "#0f2544"} />
            <stop offset="60%" stopColor="#091526" />
            <stop offset="100%" stopColor={isSpecial ? "#2e1005" : isGold ? "#231707" : "#060f1d"} />
          </linearGradient>

          {/* Foil Shimmer Gradient */}
          <linearGradient id={`shimmer-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          <clipPath id={`clip-${uid}`}>
            <polygon points="50 3, 95 28, 95 87, 50 112, 5 87, 5 28" />
          </clipPath>
        </defs>

        {/* Outer Hexagon Frame */}
        <polygon
          points="50 3, 95 28, 95 87, 50 112, 5 87, 5 28"
          fill={`url(#core-${uid})`}
          stroke={`url(#grad-${badge.tier}-${uid})`}
          strokeWidth={isSpecial || isGold ? "7" : "6"}
        />

        {/* Inner Hexagon Crest Ring */}
        <polygon
          points="50 12, 87 33, 87 82, 50 103, 13 82, 13 33"
          fill="none"
          stroke={`url(#grad-${badge.tier}-${uid})`}
          strokeWidth="1.6"
          strokeDasharray={isSpecial ? "8 3" : isGold ? "5 3" : "none"}
          strokeOpacity="0.65"
        />

        {/* Inner Glow + Clean Centered Artwork + Foil Sweep */}
        <g clipPath={`url(#clip-${uid})`}>
          <circle
            cx="50"
            cy="56"
            r="33"
            fill={isSpecial ? "#f97316" : isGold ? "#f59e0b" : isSilver ? "#38bdf8" : "#d97706"}
            opacity="0.14"
          />

          {/* Pure Symbol Artwork */}
          <BadgeSymbolArtwork
            symbolKey={badge.symbolKey}
            animated={!locked && animated && isSpecialMuter}
          />

          {/* Diagonal Metallic Shimmer Sweep (Only for badges with explicit shimmer enabled) */}
          {!locked && hasShimmer && (
            <g transform="rotate(25 50 57)">
              <rect
                x="-70"
                y="-30"
                width="42"
                height="180"
                fill={`url(#shimmer-${uid})`}
                className="foil-sweep-anim"
              >
                <animate
                  attributeName="x"
                  from="-70"
                  to="130"
                  dur="3.2s"
                  repeatCount="indefinite"
                />
              </rect>
            </g>
          )}
        </g>

        {/* Orbiting Perimeter Light Stream ("Muter-Muter" on Hexagon Frame for Pelopor & Berdampak) */}
        {!locked && animated && isSpecialMuter && (
          <polygon
            points="50 3, 95 28, 95 87, 50 112, 5 87, 5 28"
            fill="none"
            stroke={isSpecial ? "#ffedd5" : "#fef08a"}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeDasharray="24 285"
            className="hex-orbit-anim"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="309"
              to="0"
              dur="2.8s"
              repeatCount="indefinite"
            />
          </polygon>
        )}

        {/* Lock Overlay when in Locked State */}
        {locked && (
          <g>
            <rect x="0" y="0" width="100" height="115" fill="#020617" opacity="0.45" clipPath={`url(#clip-${uid})`} />
            <circle cx="50" cy="57" r="14" fill="#0f172a" stroke="#94a3b8" strokeWidth="2" />
            <rect x="44" y="55" width="12" height="9" rx="2" fill="#e2e8f0" />
            <path d="M46.5 55 V51.5 C46.5 49.5, 53.5 49.5, 53.5 51.5 V55" fill="none" stroke="#e2e8f0" strokeWidth="2.2" />
          </g>
        )}
      </svg>
    </div>
  );
};

export default TazkiaAchievementHexBadge;

// Modular Badges Export (Umum & Khusus)
export { HexBadgeStandard } from "./badges/umum/HexBadgeStandard";
export { HexBadgeBEM2026 as HexBadgeBEM2026Exclusive } from "./badges/khusus/HexBadgeBEM2026";
export { HexBadgeRistekQuantum } from "./badges/khusus/HexBadgeRistekQuantum";
export { HexBadgeRistekMecha } from "./badges/khusus/HexBadgeRistekMecha";

