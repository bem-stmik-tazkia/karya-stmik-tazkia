"use client";

import React from "react";
import { getBadgeById } from "@/data/penghargaanCatalog";
import HexBadgeBase from "../base/HexBadgeBase";
import type { IndividualBadgeProps } from "../registry";

const defaultBadge = getBadgeById(9)!;

export const BadgeInovasiBerdampak: React.FC<IndividualBadgeProps> = ({
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
          className={animated && !locked ? "spin-slow" : ""}
          style={{ transformOrigin: "49px 55px" }}
        >
          <circle cx="72" cy="44" r="4.2" fill="#f97316" stroke="#fef08a" strokeWidth="1.6" />
          <circle cx="26" cy="66" r="3.2" fill="#fde047" />
        </g>
        <circle cx="49" cy="55" r="3.2" fill="#22c55e" stroke="#dcfce7" strokeWidth="1.3" />
      </g>
    </HexBadgeBase>
  );
};

export default BadgeInovasiBerdampak;
