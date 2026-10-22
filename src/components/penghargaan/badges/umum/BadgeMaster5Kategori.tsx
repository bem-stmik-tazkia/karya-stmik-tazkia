"use client";

import React from "react";
import { getBadgeById } from "@/data/penghargaanCatalog";
import HexBadgeBase from "../base/HexBadgeBase";
import type { IndividualBadgeProps } from "../registry";

const defaultBadge = getBadgeById(13)!;

export const BadgeMaster5Kategori: React.FC<IndividualBadgeProps> = ({
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
          className={animated && !locked ? "spin-slow" : ""}
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
    </HexBadgeBase>
  );
};

export default BadgeMaster5Kategori;
