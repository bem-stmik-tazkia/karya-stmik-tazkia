"use client";

import React from "react";
import { getBadgeById } from "@/data/penghargaanCatalog";
import HexBadgeBase from "../base/HexBadgeBase";
import type { IndividualBadgeProps } from "../registry";

const defaultBadge = getBadgeById(14)!;

export const BadgePeloporTazkia: React.FC<IndividualBadgeProps> = ({
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
        {/* Flame */}
        <path
          d="M50 19 C50 19, 68 32, 63 49 C61 56, 54 60, 50 60 C46 60, 39 56, 37 49 C34 37, 44 29, 44 29 C44 29, 43 37, 46 39 C45 30, 50 19, 50 19 Z"
          fill="#f97316"
          stroke="#fef08a"
          strokeWidth="2"
          className={animated && !locked ? "animate-pulse" : ""}
        />
        <path d="M50 31 C50 31, 58 40, 56 50 C55 54, 50 57, 50 57 C50 57, 45 54, 44 50 C42 40, 50 31, 50 31 Z" fill="#fde047" />
        {/* Torch Crown Rim */}
        <path d="M36 59 H64 L59.5 66.5 H40.5 Z" fill="#fbbf24" stroke="#fffbeb" strokeWidth="1.6" />
        {/* Torch Handle */}
        <polygon points="42.5 66.5, 57.5 66.5, 53 89, 47 89" fill="#d97706" stroke="#fef08a" strokeWidth="2" />
        {/* Orbiting Sparks ("Muter-Muter" around Torch Flame) */}
        <g
          className={animated && !locked ? "spin-slow" : ""}
          style={{ transformOrigin: "50px 48px" }}
        >
          <circle cx="30" cy="37" r="2.4" fill="#fde047" />
          <circle cx="70" cy="37" r="2.4" fill="#fde047" />
          <circle cx="50" cy="22" r="1.8" fill="#f97316" />
        </g>
      </g>
    </HexBadgeBase>
  );
};

export default BadgePeloporTazkia;
