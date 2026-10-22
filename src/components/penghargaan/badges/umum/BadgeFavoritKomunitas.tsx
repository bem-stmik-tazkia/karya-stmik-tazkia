"use client";

import React from "react";
import { getBadgeById } from "@/data/penghargaanCatalog";
import HexBadgeBase from "../base/HexBadgeBase";
import type { IndividualBadgeProps } from "../registry";

const defaultBadge = getBadgeById(5)!;

export const BadgeFavoritKomunitas: React.FC<IndividualBadgeProps> = ({
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
        {/* Outer Aura Ring */}
        <circle
          cx="50"
          cy="55"
          r="26"
          fill="none"
          stroke="#fb7185"
          strokeWidth="1.4"
          strokeDasharray="4 4"
          opacity="0.65"
          className={animated && !locked ? "spin-slow" : ""}
          style={{ transformOrigin: "50px 55px" }}
        />
        {/* Heart Shape */}
        <path
          d="M50 79 C50 79, 26 63, 26 45 C26 35, 34 29, 41.5 29 C46.5 29, 50 33, 50 36 C50 33, 53.5 29, 58.5 29 C66 29, 74 35, 74 45 C74 63, 50 79, 50 79 Z"
          fill="#f43f5e"
          stroke="#ffe4e6"
          strokeWidth="2.4"
        />
        {/* Inner Highlight Heart */}
        <path
          d="M50 70 C50 70, 34 57, 34 45.5 C34 40, 38.5 36.5, 43 36.5 C46 36.5, 48.5 38.5, 50 41 C51.5 38.5, 54 36.5, 57 36.5 C61.5 36.5, 66 40, 66 45.5 C66 57, 50 70, 50 70 Z"
          fill="#fb923c"
          opacity="0.65"
        />
        <circle cx="39" cy="42" r="2.8" fill="#ffffff" opacity="0.85" />
      </g>
    </HexBadgeBase>
  );
};

export default BadgeFavoritKomunitas;
