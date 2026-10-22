"use client";

import React from "react";
import { getBadgeById } from "@/data/penghargaanCatalog";
import HexBadgeBase from "../base/HexBadgeBase";
import type { IndividualBadgeProps } from "../registry";

const defaultBadge = getBadgeById(10)!;

export const BadgeKreatorWebApp: React.FC<IndividualBadgeProps> = ({
  size = "md",
  locked = false,
  animated = true,
  className = "",
  style,
  onClick,
  title,
  tooltip,
  showTooltip,
  tooltipAlign,
  badge = defaultBadge,
}) => {
  return (
    <HexBadgeBase
      badge={badge}
      size={size}
      locked={locked}
      animated={animated}
      className={className}
      style={style}
      onClick={onClick}
      title={title}
      tooltip={tooltip}
      showTooltip={showTooltip}
      tooltipAlign={tooltipAlign}
    >
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
        <circle
          cx="66"
          cy="76.5"
          r="1.6"
          fill="#f97316"
          className={animated && !locked ? "animate-pulse" : ""}
        />
      </g>
    </HexBadgeBase>
  );
};

export default BadgeKreatorWebApp;
