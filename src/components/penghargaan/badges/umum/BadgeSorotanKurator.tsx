"use client";

import React from "react";
import { getBadgeById } from "@/data/penghargaanCatalog";
import HexBadgeBase from "../base/HexBadgeBase";
import type { IndividualBadgeProps } from "../registry";

const defaultBadge = getBadgeById(4)!;

export const BadgeSorotanKurator: React.FC<IndividualBadgeProps> = ({
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
        {/* Spotlight Beams */}
        <polygon points="22 86, 42 32, 58 32, 35 86" fill="#fde047" opacity="0.22" />
        <polygon points="78 86, 58 32, 42 32, 65 86" fill="#fde047" opacity="0.22" />
        {/* Orbiting Sparkles around the Gold Star ("Muter-Muter") */}
        <g
          className={animated && !locked ? "spin-slow" : ""}
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
    </HexBadgeBase>
  );
};

export default BadgeSorotanKurator;
