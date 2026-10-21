"use client";

import React, { useId } from "react";
import { Crown, Sparkles, Lock } from "lucide-react";

interface HexBadgeBEM2026Props {
  size?: "xs" | "sm" | "md" | "lg";
  locked?: boolean;
  hyperMode?: boolean;
  onClick?: () => void;
}

export const HexBadgeBEM2026: React.FC<HexBadgeBEM2026Props> = ({
  size = "sm",
  locked = false,
  hyperMode = false,
  onClick,
}) => {
  const rawId = useId();
  const uid = `bem-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

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
        className={`relative flex items-center justify-center transition-all duration-300 focus:outline-none ${
          onClick ? "cursor-pointer" : ""
        } ${sizeClass} ${
          !isLarge ? "hover:scale-125" : ""
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
              } rounded-full border-dashed border-amber-300/75 pointer-events-none ${
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
            <span className="absolute -top-1 -right-0.5 w-2 h-2 bg-yellow-300 rounded-full animate-ping z-20 pointer-events-none" />
            <span className="absolute -top-1 -right-0.5 w-2 h-2 bg-amber-200 rounded-full shadow-[0_0_8px_#fde047] z-20 pointer-events-none" />
            <span className="absolute -bottom-0.5 -left-1 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping [animation-delay:600ms] z-20 pointer-events-none" />
          </>
        )}
      </div>

      {/* Rich Animated Tooltip on Card Hover */}
      {(size === "xs" || size === "sm") && (
        <div className="pointer-events-none absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 w-64 p-3 rounded-xl bg-gradient-to-br from-slate-950 via-[#1a180d] to-slate-950 text-white shadow-[0_10px_30px_rgba(245,158,11,0.35)] border border-amber-400/60">
          <div className="flex items-center justify-between mb-1">
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 text-slate-950 rounded flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 fill-slate-950" /> ANIMATED MYTHIC
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-400">BEM '26</span>
          </div>
          <p className="text-xs font-bold text-amber-200">Vanguard BEM 2026</p>
          <p className="text-[10.5px] text-slate-300 leading-snug mt-0.5 font-sans">
            Dilengkapi efek <strong>Golden Halo Orbit</strong>, sapuan cahaya <strong>Metallic Foil</strong>, & inti <strong>26</strong> berdenyut.
          </p>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a180d] rotate-45 border-r border-b border-amber-400/60" />
        </div>
      )}
    </div>
  );
};

export default HexBadgeBEM2026;

