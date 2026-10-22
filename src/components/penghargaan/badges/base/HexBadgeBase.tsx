"use client";

import React, { useId } from "react";
import type { PenghargaanBadge } from "@/data/penghargaanCatalog";

export interface HexBadgeBaseProps {
  badge: PenghargaanBadge;
  size?: "xs" | "sm" | "md" | "lg";
  locked?: boolean;
  animated?: boolean;
  shimmer?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  title?: string;
  tooltip?: string;
  showTooltip?: boolean;
  tooltipAlign?: "center" | "left" | "right";
  children?: React.ReactNode;
}

export const HexBadgeBase: React.FC<HexBadgeBaseProps> = ({
  badge,
  size = "md",
  locked = false,
  animated = true,
  shimmer = false,
  className = "",
  style,
  onClick,
  title,
  tooltip,
  showTooltip = true,
  tooltipAlign = "center",
  children,
}) => {
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
  const isSpecial = badge.tier === "khusus" || badge.group === "terbatas";
  const isSpecialMuter = Boolean(
    badge.hasOrbitAnimation ||
    isGold ||
    isSpecial ||
    badge.id === 4 ||
    badge.id === 9 ||
    badge.id === 13 ||
    badge.id === 14
  );

  const getTierGlow = () => {
    if (locked) return "";
    if (isSpecial) return "drop-shadow-[0_0_16px_rgba(249,115,22,0.8)]";
    if (isGold) return "drop-shadow-[0_0_14px_rgba(245,158,11,0.65)]";
    if (isSilver) return "drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]";
    return "drop-shadow-[0_0_10px_rgba(217,119,6,0.45)]";
  };

  const getTierTagStyle = () => {
    if (isSpecial) {
      return "bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-red-500/20 text-orange-300 border-orange-400/80 shadow-[0_0_10px_rgba(249,115,22,0.3)]";
    }
    if (isGold) {
      return "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-400/80 shadow-[0_0_10px_rgba(245,158,11,0.3)]";
    }
    if (isSilver) {
      return "bg-sky-500/20 text-sky-300 border-sky-400/80 shadow-[0_0_10px_rgba(56,189,248,0.25)]";
    }
    return "bg-amber-900/30 text-amber-300 border-amber-600/80";
  };

  return (
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
      style={style}
      className={`relative group inline-flex items-center justify-center select-none focus:outline-none ${sizeClasses} ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Inner visual container with smooth, crisp hover scale (tanpa animasi naik-turun) */}
      <div
        className={`w-full h-full relative flex items-center justify-center transition-transform duration-200 ease-out transform-gpu [backface-visibility:hidden] [transform:translateZ(0)] ${
          locked
            ? "filter grayscale opacity-55 group-hover:opacity-85 group-hover:grayscale-0"
            : "group-hover:scale-105 active:scale-95"
        }`}
      >
        {/* Outer Animated Glowing Aura & Orbiting Dashed Ring for Special Badges */}
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

        <svg
          viewBox="0 0 100 115"
          className={`w-full h-full relative z-10 ${getTierGlow()}`}
          shapeRendering="geometricPrecision"
        >
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

            {/* Special Gold-Orange Mythic Gradient */}
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

          {/* Inner Content + Center Glow */}
          <g clipPath={`url(#clip-${uid})`}>
            <circle
              cx="50"
              cy="56"
              r="33"
              fill={isSpecial ? "#f97316" : isGold ? "#f59e0b" : isSilver ? "#38bdf8" : "#d97706"}
              opacity="0.14"
            />

            {/* Children Artwork */}
            {children}

            {/* Metallic Shimmer Sweep (when shimmer is enabled) */}
            {!locked && hasShimmer && (
              <g transform="rotate(25 50 57)">
                <rect
                  x="-70"
                  y="-30"
                  width="42"
                  height="180"
                  fill={`url(#shimmer-${uid})`}
                  className="svg-foil-sweep"
                />
              </g>
            )}
          </g>

          {/* Orbiting Perimeter Light Stream ("Muter-Muter" along outer Hexagon Frame) */}
          {!locked && animated && isSpecialMuter && (
            <polygon
              points="50 3, 95 28, 95 87, 50 112, 5 87, 5 28"
              fill="none"
              stroke={isSpecial ? "#ffedd5" : "#fef08a"}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray="24 285"
              className="hex-perimeter-orbit"
            />
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

      {/* Sleek & Compact Info Box on Hover (Pemberitahuan Ringkas Detail Badge) */}
      {showTooltip && badge && (size === "xs" || size === "sm") && (
        <div
          className={`pointer-events-none absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-[80] w-52 sm:w-56 max-w-[240px] p-2.5 rounded-lg bg-slate-950/95 text-white shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-slate-700/80 backdrop-blur-md text-left select-none ${
            tooltipAlign === "left"
              ? "left-0 translate-x-0"
              : tooltipAlign === "right"
              ? "right-0 left-auto translate-x-0"
              : "left-1/2 -translate-x-1/2"
          }`}
        >
          {/* Header Tag (Tier Label tanpa icon sparkle dan tanpa hashtag #) */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1 mb-1.5">
            <span
              className={`px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider rounded border ${getTierTagStyle()}`}
            >
              {badge.group === "terbatas" ? "TERBATAS" : badge.tierLabel}
            </span>
          </div>

          {/* Badge Name (Penuh tanpa truncate) */}
          <h4 className="text-xs font-bold text-white tracking-tight leading-snug mb-0.5">
            {badge.name}
          </h4>

          {/* Symbol (Penuh tanpa truncate) */}
          {badge.symbolLabel && (
            <p className="text-[10px] font-semibold text-amber-400 mb-1 leading-tight">
              Simbol: {badge.symbolLabel}
            </p>
          )}

          {/* Mission / Syarat (Penuh tanpa line-clamp agar tidak terpotong) */}
          <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
            {badge.mission}
          </p>

          {/* Click hint footer */}
          <div className="mt-1.5 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[8.5px] text-slate-400 font-medium">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              {locked ? "🔒 Belum diraih" : "✓ Diraih"}
            </span>
            <span className="text-slate-400">Klik rincian &rarr;</span>
          </div>

          {/* Pointer Arrow */}
          <div
            className={`absolute -bottom-1 w-2 h-2 bg-slate-950 rotate-45 border-r border-b border-slate-700/80 ${
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

export default HexBadgeBase;
