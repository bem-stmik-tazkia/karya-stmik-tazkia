"use client";

import React from "react";
import Link from "next/link";

export interface LogoIconProps {
  className?: string;
  variant?: "auto" | "light" | "dark";
  showShadow?: boolean;
}

export function LogoIcon({
  className = "w-10 h-8.5",
  variant = "auto",
  showShadow = false,
}: LogoIconProps) {
  const kFillClass =
    variant === "light"
      ? "fill-[#131F33]"
      : variant === "dark"
      ? "fill-white"
      : "fill-[#131F33] dark:fill-white";

  return (
    <svg
      className={`shrink-0 transition-transform duration-300 ${className}`}
      viewBox="0 0 160 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo Monogram KT STMIK Tazkia"
    >
      {showShadow && (
        <defs>
          <filter id="ktShadowLight" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.16" />
          </filter>
        </defs>
      )}
      <g filter={showShadow ? "url(#ktShadowLight)" : undefined} transform="translate(1.5, 1)">
        {/* 1. Pil Vertikal Orange */}
        <rect
          x="10"
          y="10"
          width="28"
          height="108"
          rx="14"
          fill="#FF7F0A"
        />

        {/* 2. Huruf K (Navy Blue di mode terang, Putih di mode gelap) */}
        {/* Batang Vertikal K */}
        <rect
          className={`${kFillClass} transition-colors duration-200`}
          x="54"
          y="26"
          width="17"
          height="78"
        />
        {/* Lengan Diagonal Atas K */}
        <polygon
          className={`${kFillClass} transition-colors duration-200`}
          points="67,63 105,26 126,26 80,72"
        />
        {/* Kaki Diagonal Bawah K */}
        <polygon
          className={`${kFillClass} transition-colors duration-200`}
          points="75,58 128,104 107,104 65,68"
        />

        {/* 3. Huruf T Interlock (Orange) */}
        {/* Sayap Kiri Atas T */}
        <path
          d="M 90 26 L 99 26 L 83 42 L 77 42 C 77 32 82 26 90 26 Z"
          fill="#FF7F0A"
        />
        {/* Sayap Kanan Atas T + Batang Vertikal T */}
        <path
          d="M 131 26 L 147 26 C 147 35 141 42 132 42 L 122 42 L 122 92 C 122 99 116 104 106 104 L 106 56 L 131 26 Z"
          fill="#FF7F0A"
        />
      </g>
    </svg>
  );
}

export interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showSlogan?: boolean;
  sloganClassName?: string;
  iconOnly?: boolean;
  href?: string | null;
  variant?: "auto" | "light" | "dark";
  showShadow?: boolean;
}

const sizeConfig = {
  xs: {
    icon: "w-6.5 h-5.5 sm:w-7 sm:h-6",
    title: "text-sm sm:text-base tracking-tight",
    slogan: "text-[9px] leading-tight",
    gap: "gap-1.5 sm:gap-2",
    wordGap: "ml-1.5 sm:ml-2",
  },
  sm: {
    icon: "w-8.5 h-7.5 sm:w-10 sm:h-8.5",
    title: "text-[18px] xs:text-[19px] sm:text-[22px] tracking-tight",
    slogan: "text-[10px] sm:text-[11px] leading-tight",
    gap: "gap-2.5 sm:gap-3.5",
    wordGap: "ml-2 sm:ml-2.5",
  },
  md: {
    icon: "w-10 h-8.5 sm:w-12 sm:h-10",
    title: "text-xl sm:text-[26px] tracking-tight",
    slogan: "text-[10px] sm:text-[11px] leading-tight",
    gap: "gap-3 sm:gap-4",
    wordGap: "ml-2 sm:ml-2.5",
  },
  lg: {
    icon: "w-13 h-11 sm:w-16 sm:h-13.5",
    title: "text-2xl sm:text-4xl tracking-tight",
    slogan: "text-xs sm:text-sm leading-tight",
    gap: "gap-3.5 sm:gap-5",
    wordGap: "ml-2.5 sm:ml-3",
  },
  xl: {
    icon: "w-18 h-15 sm:w-24 sm:h-20",
    title: "text-3xl sm:text-5xl lg:text-6xl tracking-tight",
    slogan: "text-sm sm:text-base leading-tight",
    gap: "gap-4 sm:gap-6",
    wordGap: "ml-3 sm:ml-4",
  },
};

export function Logo({
  className = "",
  size = "sm",
  showSlogan = false,
  sloganClassName = "",
  iconOnly = false,
  href = "/",
  variant = "auto",
  showShadow = false,
}: LogoProps) {
  const cfg = sizeConfig[size] || sizeConfig.sm;

  const karyaTextClass =
    variant === "light"
      ? "text-[#131F33]"
      : variant === "dark"
      ? "text-white"
      : "text-[#131F33] dark:text-white";

  const sloganTextClass =
    variant === "light"
      ? "text-slate-600"
      : variant === "dark"
      ? "text-slate-300"
      : "text-slate-600 dark:text-slate-300";

  const content = (
    <div className={`inline-flex items-center ${cfg.gap} group select-none ${className}`}>
      <LogoIcon
        className={`${cfg.icon} group-hover:scale-105`}
        variant={variant}
        showShadow={showShadow}
      />

      {!iconOnly && (
        <div className="flex flex-col justify-center min-w-0">
          <div
            className={`font-['Montserrat',sans-serif] font-extrabold leading-none flex items-center ${cfg.title} ${
              showShadow ? "drop-shadow-xs" : ""
            }`}
          >
            <span className={`${karyaTextClass} transition-colors duration-200`}>Karya</span>
            <span className={`text-[#FF7F0A] ${cfg.wordGap} transition-colors duration-200`}>Tazkia</span>
          </div>

          {showSlogan && (
            <span
              className={`font-['Montserrat',sans-serif] font-normal tracking-wide mt-1 truncate transition-colors duration-200 ${cfg.slogan} ${sloganTextClass} ${sloganClassName}`}
            >
              Kreativitas &amp; Inspirasi Tanpa Batas
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-hidden inline-flex items-center shrink-0"
        title="Karya Tazkia — Official Campus Showcase"
      >
        {content}
      </Link>
    );
  }

  return content;
}

