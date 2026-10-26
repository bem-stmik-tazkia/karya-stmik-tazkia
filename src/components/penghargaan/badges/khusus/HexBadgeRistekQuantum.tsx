"use client";

import React, { useId } from "react";

export interface HexBadgeRistekQuantumProps {
  size?: "xs" | "sm" | "md" | "lg";
  locked?: boolean;
  hyperMode?: boolean;
  animated?: boolean;
  onClick?: () => void;
  title?: string;
  tooltip?: string;
  showTooltip?: boolean;
  tooltipAlign?: "center" | "left" | "right";
  badgeTitle?: string;
  badgeNumber?: string;
}

/**
 * ⚡ HexBadgeRistekQuantum
 * ─────────────────────────────────────────────────────────────
 * Medali Heksagon Kehormatan Ristek Quantum Cyber 2026.
 * Didesain eksklusif & istimewa dengan identitas Cyber-Quantum sejati:
 * - Dual Rotating Holographic HUD / Radar Rings
 * - Active Laser Scanline Sweep
 * - Inlaid PCB Circuit Matrix & Carbon Fiber Chasis
 * - Mecha Cyber Helmet & Glowing Sci-Fi '26'
 * - Glassmorphic Hologram Banner "RISTEK 2026"
 * Ukuran dan proporsi 100% presisi dengan Vanguard BEM 2026 (viewBox 0 0 100 115).
 */
export const HexBadgeRistekQuantum: React.FC<HexBadgeRistekQuantumProps> = ({
  size = "sm",
  locked = false,
  hyperMode = false,
  animated = true,
  onClick,
  title,
  tooltip,
  showTooltip = true,
  tooltipAlign = "center",
  badgeTitle = "RISTEK 2026",
  badgeNumber = "26",
}) => {
  const rawId = useId();
  const uid = `ristek-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // Animasi otomatis berjalan saat tidak terkunci
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
      {/* CSS Animasi Khusus & Font Sci-Fi */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;800;900&family=Rajdhani:wght@700&display=swap');

        @keyframes spinSlow-${uid} {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinRev-${uid} {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes laserSweep-${uid} {
          0% { transform: translateY(0px); opacity: 0; }
          15% { opacity: 0.95; }
          85% { opacity: 0.95; }
          100% { transform: translateY(58px); opacity: 0; }
        }
        @keyframes pulseConduit-${uid} {
          0%, 100% { opacity: 0.65; filter: drop-shadow(0 0 2px #00f0ff); }
          50% { opacity: 1; filter: drop-shadow(0 0 7px #00f0ff); }
        }
        @keyframes dashMarch-${uid} {
          to { stroke-dashoffset: -24; }
        }
        @keyframes perimeterOrbit-${uid} {
          to { stroke-dashoffset: -306; }
        }
        @keyframes helmBob-${uid} {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        @keyframes corePulse-${uid} {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes sparkleBlink-${uid} {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes floatParticle-${uid} {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
          50% { transform: translateY(-4px) scale(1.15); opacity: 1; }
        }

        .anim-spin-slow-${uid} { animation: spinSlow-${uid} 24s linear infinite; }
        .anim-spin-rev-${uid} { animation: spinRev-${uid} 18s linear infinite; }
        .anim-laser-sweep-${uid} { animation: laserSweep-${uid} 3.2s ease-in-out infinite; }
        .anim-pulse-conduit-${uid} { animation: pulseConduit-${uid} 2.2s ease-in-out infinite; }
        .anim-dash-march-${uid} { animation: dashMarch-${uid} 1.8s linear infinite; }
        .anim-perimeter-orbit-${uid} { animation: perimeterOrbit-${uid} 2.4s linear infinite; }
        .anim-helm-bob-${uid} { animation: helmBob-${uid} 2.6s ease-in-out infinite; }
        .anim-core-pulse-${uid} { animation: corePulse-${uid} 2.4s ease-in-out infinite; }
        .anim-sparkle-1-${uid} { animation: sparkleBlink-${uid} 2s ease-in-out infinite; transform-origin: 50px 15px; }
        .anim-sparkle-2-${uid} { animation: sparkleBlink-${uid} 2s ease-in-out infinite 0.7s; transform-origin: 82px 34px; }
        .anim-sparkle-3-${uid} { animation: sparkleBlink-${uid} 2s ease-in-out infinite 1.3s; transform-origin: 18px 34px; }
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
        {/* 1. Outer Cosmic Nebula Aura + Rotating Cyber Halo */}
        {isAnimated && (
          <>
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-600/45 via-sky-400/40 to-blue-600/45 blur-md ${
                hyperMode ? "animate-ping [animation-duration:1.8s]" : "animate-pulse"
              } ${isLarge ? "scale-105" : "scale-95"}`}
            />
            <div
              className={`absolute ${
                isLarge ? "-inset-2.5 border-[1.5px]" : "-inset-1.5 border"
              } rounded-full border-dashed border-cyan-400/70 pointer-events-none ${
                hyperMode ? "animate-[spin_4s_linear_infinite]" : "animate-[spin_14s_linear_infinite]"
              }`}
            />
          </>
        )}

        {/* 2. Vector Hexagon Canvas (ViewBox 0 0 100 115 - Presisi Sempurna dengan BEM 2026) */}
        <svg
          viewBox="0 0 100 115"
          className={`w-full h-full relative z-10 overflow-visible ${
            !locked ? "drop-shadow-[0_4px_14px_rgba(6,182,212,0.5)]" : ""
          }`}
        >
          <defs>
            {/* Filter Glow Cyan */}
            <filter id={`neonGlow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Filter Glint Halus */}
            <filter id={`softGlow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradien Rim Mecha Titanium-Cyan */}
            <linearGradient id={`mechaRimGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0faff" />
              <stop offset="18%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#0284c7" />
              <stop offset="70%" stopColor="#082f49" />
              <stop offset="100%" stopColor="#00e5ff" />
            </linearGradient>

            {/* Gradien Bevel Gelap Taktil */}
            <linearGradient id={`mechaBevelGrad-${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="35%" stopColor="#0369a1" />
              <stop offset="75%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020813" />
            </linearGradient>

            {/* Gradien Inti Obsidian Cyber Matrix */}
            <radialGradient id={`coreMatrixBg-${uid}`} cx="50%" cy="48%" r="60%">
              <stop offset="0%" stopColor="#0d2b45" />
              <stop offset="60%" stopColor="#051424" />
              <stop offset="100%" stopColor="#02070f" />
            </radialGradient>

            {/* Gradien Plat Kaca Hologram RISTEK 2026 */}
            <linearGradient id={`glassBannerGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.45)" />
              <stop offset="50%" stopColor="rgba(2, 132, 199, 0.35)" />
              <stop offset="100%" stopColor="rgba(3, 73, 110, 0.55)" />
            </linearGradient>

            {/* Laser Scanline Beam Gradient */}
            <linearGradient id={`laserBeamGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="20%" stopColor="rgba(0, 245, 255, 0.4)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.95)" />
              <stop offset="80%" stopColor="rgba(0, 245, 255, 0.4)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Pola Karbon Fiber Halus */}
            <pattern id={`carbonPat-${uid}`} width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" fill="#040c14" />
              <rect x="0" y="0" width="2" height="2" fill="#081827" />
              <rect x="2" y="2" width="2" height="2" fill="#081827" />
            </pattern>

            {/* Pola Sirkuit PCB Mikro */}
            <pattern id={`pcbGrid-${uid}`} width="24" height="24" patternUnits="userSpaceOnUse">
              <g stroke="#00e5ff" strokeWidth="0.5" fill="none" opacity="0.22">
                <path d="M 0 6 L 8 6 L 12 10 L 24 10" />
                <path d="M 6 0 L 6 12 L 10 16 L 10 24" />
                <path d="M 18 0 L 18 8 L 22 12" />
                <circle cx="8" cy="6" r="0.9" fill="#00e5ff" />
                <circle cx="10" cy="16" r="0.9" fill="#00e5ff" />
                <circle cx="18" cy="8" r="0.8" fill="#00e5ff" />
              </g>
            </pattern>

            {/* Hexagon Clips */}
            <clipPath id={`hexClip-${uid}`}>
              <path d="M 46.5 4 L 89.5 28.8 A 6.5 6.5 0 0 1 93 34.5 L 93 80.5 A 6.5 6.5 0 0 1 89.5 86.2 L 53.5 111 A 6.5 6.5 0 0 1 46.5 111 L 10.5 86.2 A 6.5 6.5 0 0 1 7 80.5 L 7 34.5 A 6.5 6.5 0 0 1 10.5 28.8 L 46.5 4 A 6.5 6.5 0 0 1 53.5 4 Z" />
            </clipPath>
            <clipPath id={`innerCoreClip-${uid}`}>
              <polygon
                points="50 10.5, 86 31, 86 83.5, 50 104, 14 83.5, 14 31"
                strokeLinejoin="round"
              />
            </clipPath>
          </defs>

          {/* ======================================================== */}
          {/* A. DUAL COUNTER-ROTATING RADAR & HUD CONCENTRIC RINGS   */}
          {/* ======================================================== */}
          {isAnimated && (
            <g className="pointer-events-none">
              {/* Outer HUD Ring (Putaran Lambat Searah Jarum Jam) */}
              <circle
                cx="50"
                cy="57.5"
                r="49"
                fill="none"
                stroke="#00f2fe"
                strokeWidth="0.85"
                strokeDasharray="4 8 16 8 2 8 24 12"
                opacity="0.6"
                className={`anim-spin-slow-${uid} origin-[50px_57.5px]`}
              />

              {/* Inner HUD Ring (Putaran Berlawanan Arah Jarum Jam) */}
              <circle
                cx="50"
                cy="57.5"
                r="44"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="0.65"
                strokeDasharray="8 14 2 14 18 10"
                opacity="0.45"
                className={`anim-spin-rev-${uid} origin-[50px_57.5px]`}
              />

              {/* Glowing Cyber Photon Sparks */}
              <g className="origin-[50px_57.5px] anim-spin-slow-${uid}">
                <circle cx="50" cy="7.5" r="1.2" fill="#ffffff" filter={`url(#softGlow-${uid})`} />
                <circle cx="97.5" cy="57.5" r="1.2" fill="#00ffff" filter={`url(#softGlow-${uid})`} />
                <circle cx="50" cy="107.5" r="1.2" fill="#ffffff" filter={`url(#softGlow-${uid})`} />
                <circle cx="2.5" cy="57.5" r="1.2" fill="#00ffff" filter={`url(#softGlow-${uid})`} />
              </g>
            </g>
          )}

          {/* ======================================================== */}
          {/* B. MECHA ARMOR CHASSIS (TITANIUM CYBER HEXAGON)         */}
          {/* ======================================================== */}
          {/* 1. Outer Mecha Armor Rim (Identik Ukuran BEM 2026: 50 3.5, 93 28.5...) */}
          <polygon
            points="50 3.5, 93 28.5, 93 86.5, 50 111.5, 7 86.5, 7 28.5"
            fill={`url(#mechaRimGrad-${uid})`}
            stroke={`url(#mechaRimGrad-${uid})`}
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* 2. Outer Specular Edge Chamfer Highlight */}
          <polygon
            points="50 3.5, 93 28.5, 93 86.5, 50 111.5, 7 86.5, 7 28.5"
            fill="none"
            stroke="#f0fdff"
            strokeWidth="0.8"
            strokeLinejoin="round"
            opacity="0.8"
          />

          {/* 3. Recessed Inner Carbon Bevel Step */}
          <polygon
            points="50 10, 86.5 31, 86.5 84, 50 105, 13.5 84, 13.5 31"
            fill={`url(#carbonPat-${uid})`}
            stroke={`url(#mechaBevelGrad-${uid})`}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* 4. Deep Obsidian Core Plate with PCB Matrix Grid */}
          <g clipPath={`url(#innerCoreClip-${uid})`}>
            {/* Latar Layar Inti Matrix */}
            <polygon
              points="50 10, 86.5 31, 86.5 84, 50 105, 13.5 84, 13.5 31"
              fill={`url(#coreMatrixBg-${uid})`}
            />

            {/* Pola Sirkuit PCB Aktif */}
            <polygon
              points="50 10, 86.5 31, 86.5 84, 50 105, 13.5 84, 13.5 31"
              fill={`url(#pcbGrid-${uid})`}
              opacity="0.85"
            />

            {/* Cincin Target Radar Pusat */}
            <circle
              cx="50"
              cy="50"
              r="29"
              fill="none"
              stroke="#00f2fe"
              strokeWidth="0.6"
              strokeDasharray="2 4"
              opacity="0.35"
              className={`anim-spin-slow-${uid} origin-[50px_50px]`}
            />
            <circle
              cx="50"
              cy="50"
              r="21"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="0.5"
              strokeDasharray="6 8"
              opacity="0.4"
              className={`anim-spin-rev-${uid} origin-[50px_50px]`}
            />

            {/* Glowing Laser Scanline Sweep Vertikal */}
            {isAnimated && (
              <g className={`anim-laser-sweep-${uid}`}>
                <rect
                  x="12"
                  y="22"
                  width="76"
                  height="3.5"
                  fill={`url(#laserBeamGrad-${uid})`}
                  filter={`url(#softGlow-${uid})`}
                />
              </g>
            )}
          </g>

          {/* ======================================================== */}
          {/* C. CYBER CONDUIT CHANNELS & ORBITING ENERGY STREAM      */}
          {/* ======================================================== */}
          {/* Inner Dashed Neon Circuit Track */}
          <polygon
            points="50 16, 80.5 33.5, 80.5 81.5, 50 99, 19.5 81.5, 19.5 33.5"
            fill="none"
            stroke="#00ffff"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 3.5"
            opacity="0.85"
            className={isAnimated ? `anim-dash-march-${uid}` : ""}
            filter={`url(#softGlow-${uid})`}
          />

          {/* Orbiting Quantum Photon Stream Along Outer Perimeter */}
          {isAnimated && (
            <polygon
              points="50 3.5, 93 28.5, 93 86.5, 50 111.5, 7 86.5, 7 28.5"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="26 278"
              className={`anim-perimeter-orbit-${uid}`}
              filter={`url(#neonGlow-${uid})`}
            />
          )}

          {/* 6 Mecha Corner Anchor Rivets */}
          <circle cx="50" cy="6" r="1.2" fill="#02131f" stroke="#38bdf8" strokeWidth="0.8" />
          <circle cx="90.5" cy="29.5" r="1.2" fill="#02131f" stroke="#38bdf8" strokeWidth="0.8" />
          <circle cx="90.5" cy="85.5" r="1.2" fill="#02131f" stroke="#38bdf8" strokeWidth="0.8" />
          <circle cx="50" cy="109" r="1.2" fill="#02131f" stroke="#38bdf8" strokeWidth="0.8" />
          <circle cx="9.5" cy="85.5" r="1.2" fill="#02131f" stroke="#38bdf8" strokeWidth="0.8" />
          <circle cx="9.5" cy="29.5" r="1.2" fill="#02131f" stroke="#38bdf8" strokeWidth="0.8" />

          {/* 2 Symmetrical Quantum Energy Indicators (Flank Nodes) */}
          <g>
            <circle cx="14" cy="57.5" r="1.8" fill="#00ffff" filter={`url(#neonGlow-${uid})`} />
            <circle cx="86" cy="57.5" r="1.8" fill="#00ffff" filter={`url(#neonGlow-${uid})`} />
          </g>

          {/* ======================================================== */}
          {/* D. GLASSMORPHIС TAPERED BANNER ("RISTEK 2026")          */}
          {/* ======================================================== */}
          {/* Drop Shadow Plat */}
          <path
            d="M 18 79.5 L 82 79.5 L 77.5 93.5 L 22.5 93.5 Z"
            fill="#020617"
            opacity="0.85"
          />

          {/* Plat Kaca Trapesium Glassmorphic */}
          <path
            d="M 17.5 77.5 L 82.5 77.5 L 78 91.5 L 22 91.5 Z"
            fill={`url(#glassBannerGrad-${uid})`}
            stroke="#38bdf8"
            strokeWidth="1"
            strokeLinejoin="round"
            style={{ backdropFilter: "blur(4px)" }}
          />

          {/* Garis Kilau Refleksi Kaca */}
          <line
            x1="19.5"
            y1="78.8"
            x2="80.5"
            y2="78.8"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path d="M 23 79 L 28 79 L 25 90 L 20 90 Z" fill="#ffffff" opacity="0.15" />
          <path d="M 72 79 L 77 79 L 74 90 L 69 90 Z" fill="#ffffff" opacity="0.12" />

          {/* 4 Sekrup Baut Logam pada Sudut Plat */}
          <circle cx="21" cy="80.5" r="0.9" fill="#021727" stroke="#38bdf8" strokeWidth="0.5" />
          <circle cx="79" cy="80.5" r="0.9" fill="#021727" stroke="#38bdf8" strokeWidth="0.5" />
          <circle cx="24.5" cy="88.5" r="0.9" fill="#021727" stroke="#38bdf8" strokeWidth="0.5" />
          <circle cx="75.5" cy="88.5" r="0.9" fill="#021727" stroke="#38bdf8" strokeWidth="0.5" />

          {/* Label Teks "RISTEK 2026" - Font Orbitron / Sci-Fi */}
          <text
            x="50"
            y="87.5"
            textAnchor="middle"
            fill="#00f2fe"
            fontSize="7.5"
            fontWeight="900"
            letterSpacing="0.9"
            fontFamily="'Orbitron', monospace, system-ui, sans-serif"
            filter={`url(#softGlow-${uid})`}
          >
            {badgeTitle}
          </text>
          <text
            x="50"
            y="87.5"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="7.5"
            fontWeight="900"
            letterSpacing="0.9"
            fontFamily="'Orbitron', monospace, system-ui, sans-serif"
            opacity="0.8"
          >
            {badgeTitle}
          </text>

          {/* ======================================================== */}
          {/* E. SIGNATURE SPECULAR GLINT & CORNER SPARKLES           */}
          {/* ======================================================== */}
          <circle cx="50" cy="16" r="1.8" fill="#e0faff" className={isAnimated ? `anim-sparkle-1-${uid}` : ""} />
          <circle cx="80.5" cy="33.5" r="1.6" fill="#38bdf8" className={isAnimated ? `anim-sparkle-2-${uid}` : ""} />
          <circle cx="19.5" cy="33.5" r="1.6" fill="#38bdf8" className={isAnimated ? `anim-sparkle-3-${uid}` : ""} />

          {/* Specular White Glint Bar Bawah Kanan */}
          <line
            x1="56"
            y1="108"
            x2="86"
            y2="90.5"
            stroke="#ffffff"
            strokeWidth="3.2"
            strokeLinecap="round"
            opacity="0.95"
          />
        </svg>

        {/* 3. Centerpiece: Cyber Mecha Visor + Glowing Sci-Fi '26' */}
        <div
          className={`absolute inset-0 z-20 flex flex-col items-center justify-center ${
            isLarge ? "-mt-5" : isMd ? "-mt-3.5" : "-mt-2"
          } pointer-events-none`}
        >
          <div className="flex flex-col items-center leading-none">
            {/* Helm Mecha Cyberpunk Futuristik (Tajam, Geometris, Berkelas) */}
            <svg
              viewBox="0 0 34 24"
              className={`${
                isLarge
                  ? "w-10 h-7 mb-0.5"
                  : isMd
                  ? "w-5.5 h-4 mb-0.5"
                  : isXs
                  ? "w-2.5 h-2 -mb-0.5"
                  : "w-3.5 h-2.5 -mb-0.5"
              } overflow-visible drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${
                isAnimated ? `anim-helm-bob-${uid}` : ""
              }`}
            >
              <defs>
                <linearGradient id={`mechaHelmGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#7dd3fc" />
                  <stop offset="70%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#03496e" />
                </linearGradient>
                <linearGradient id={`visorGlowGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="50%" stopColor="#00ffff" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>

              {/* Aura Belakang Helm */}
              <ellipse cx="17" cy="12" rx="14" ry="9" fill="#00e5ff" opacity="0.25" filter={`url(#softGlow-${uid})`} />

              {/* Rangka Helm Mecha Utama */}
              <path
                d="M 5 17 L 3 14 L 6 7 C 9 3, 25 3, 28 7 L 31 14 L 29 17 Z"
                fill={`url(#mechaHelmGrad-${uid})`}
                stroke="#e0faff"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />

              {/* Cheek Armor Plates Samping */}
              <path d="M 3 14 L 8 16 L 8 18 L 4 18 Z" fill="#021c30" stroke="#38bdf8" strokeWidth="0.6" />
              <path d="M 31 14 L 26 16 L 26 18 L 30 18 Z" fill="#021c30" stroke="#38bdf8" strokeWidth="0.6" />

              {/* Laser Visor Slot Horizontal (Eye Visor Mecha) */}
              <polygon
                points="7 12.5, 27 12.5, 25 15.5, 9 15.5"
                fill="#030b14"
                stroke="#00ffff"
                strokeWidth="0.8"
              />
              <line
                x1="8.5"
                y1="14"
                x2="25.5"
                y2="14"
                stroke={`url(#visorGlowGrad-${uid})`}
                strokeWidth="1.2"
                strokeLinecap="round"
                className={`anim-pulse-conduit-${uid}`}
              />

              {/* Crest Antenna Mecha Atas */}
              <polygon points="15.5 1.5, 18.5 1.5, 18 5, 16 5" fill="#00ffff" stroke="#ffffff" strokeWidth="0.5" />
              <line x1="17" y1="5" x2="17" y2="10" stroke="#00ffff" strokeWidth="1" strokeLinecap="round" />
            </svg>

            {/* Angka Bold "26" Futuristik (Font Orbitron Neon Cyan) */}
            <span
              className={`${
                isLarge
                  ? "text-[40px]"
                  : isMd
                  ? "text-[23px]"
                  : isXs
                  ? "text-[10px]"
                  : "text-[12px]"
              } font-black tracking-tight font-sans bg-gradient-to-b from-white via-cyan-100 to-sky-400 bg-clip-text text-transparent [filter:drop-shadow(0_2px_0px_rgba(2,44,68,0.95))_drop-shadow(0_4px_12px_rgba(0,229,255,0.75))] ${
                isAnimated ? `anim-core-pulse-${uid}` : ""
              }`}
              style={{ fontFamily: "'Orbitron', monospace, sans-serif" }}
            >
              {badgeNumber}
            </span>
          </div>
        </div>

        {/* 3b. Circular Lock Overlay when in Locked State */}
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
              opacity="0.5"
              clipPath={`url(#hexClip-${uid})`}
            />
            <circle cx="50" cy="57" r="14" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
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
          className={`pointer-events-none absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-[80] w-52 sm:w-56 max-w-[240px] p-2.5 rounded-lg bg-gradient-to-br from-slate-950 via-[#051525] to-slate-950 text-white shadow-[0_8px_24px_rgba(6,182,212,0.45)] border border-cyan-400/60 text-left select-none ${
            tooltipAlign === "left"
              ? "left-0 translate-x-0"
              : tooltipAlign === "right"
              ? "right-0 left-auto translate-x-0"
              : "left-1/2 -translate-x-1/2"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1 mb-1.5">
            <span className="px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 rounded">
              TERBATAS
            </span>
          </div>
          <p className="text-xs font-bold text-cyan-200 mb-0.5 leading-snug">
            {title || "Lencana Ristek Quantum Cyber"}
          </p>
          <p className="text-[10px] font-semibold text-cyan-400 mb-1 leading-tight">
            Simbol: Quantum Radar & Mecha Helm '26
          </p>
          <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
            {tooltip || "Dual HUD Radar berputar, Laser Scanline & inti '26'."}
          </p>
          <div className="mt-1.5 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[8.5px] text-slate-400 font-medium">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              {locked ? "🔒 Belum diraih" : "✓ Diraih"}
            </span>
            <span className="text-slate-400">Klik rincian &rarr;</span>
          </div>
          <div
            className={`absolute -bottom-1 w-2 h-2 bg-[#051525] rotate-45 border-r border-b border-cyan-400/60 ${
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

export default HexBadgeRistekQuantum;
