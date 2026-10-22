"use client";

import React from "react";
import { getBadgeById } from "@/data/penghargaanCatalog";
import HexBadgeBase from "../base/HexBadgeBase";
import type { IndividualBadgeProps } from "../registry";

const defaultBadge = getBadgeById(11)!;

export const BadgeKreatorDesain: React.FC<IndividualBadgeProps> = ({
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
        <circle
          cx="50"
          cy="58"
          r="3.2"
          fill="#f97316"
          stroke="#ffffff"
          strokeWidth="1.2"
          className={animated && !locked ? "animate-pulse" : ""}
        />
        <rect x="42" y="76" width="16" height="5" rx="1.5" fill="#cbd5e1" />
      </g>
    </HexBadgeBase>
  );
};

export default BadgeKreatorDesain;
