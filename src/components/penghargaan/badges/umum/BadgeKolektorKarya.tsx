"use client";

import React from "react";
import { getBadgeById } from "@/data/penghargaanCatalog";
import HexBadgeBase from "../base/HexBadgeBase";
import type { IndividualBadgeProps } from "../registry";

const defaultBadge = getBadgeById(2)!;

export const BadgeKolektorKarya: React.FC<IndividualBadgeProps> = ({
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
          className={animated && !locked ? "vertex-sparkle-1" : ""}
        />
      </g>
    </HexBadgeBase>
  );
};

export default BadgeKolektorKarya;
