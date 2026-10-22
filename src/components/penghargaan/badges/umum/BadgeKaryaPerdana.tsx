"use client";

import React from "react";
import { getBadgeById } from "@/data/penghargaanCatalog";
import HexBadgeBase from "../base/HexBadgeBase";
import type { IndividualBadgeProps } from "../registry";

const defaultBadge = getBadgeById(1)!;

export const BadgeKaryaPerdana: React.FC<IndividualBadgeProps> = ({
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
        {/* Exhaust Flame with continuous pulse */}
        <path
          d="M43 75 C43 85, 50 93, 50 93 C50 93, 57 85, 57 75 Z"
          fill="#f97316"
          className={animated && !locked ? "origin-[50px_75px] animate-pulse" : ""}
        />
        <path d="M46.5 75 C46.5 81, 50 86, 50 86 C50 86, 53.5 81, 53.5 75 Z" fill="#fef08a" />
        {/* Rocket Fins */}
        <path d="M37 62 L28 73 L40 71 Z" fill="#ea580c" stroke="#fed7aa" strokeWidth="1.3" />
        <path d="M63 62 L72 73 L60 71 Z" fill="#ea580c" stroke="#fed7aa" strokeWidth="1.3" />
        {/* Rocket Body */}
        <path
          d="M50 22 C39 35, 38 55, 40 72 L60 72 C62 55, 61 35, 50 22 Z"
          fill="#f8fafc"
          stroke="#f59e0b"
          strokeWidth="2.2"
        />
        <path
          d="M50 22 C44.5 30, 43 37, 42 41 L58 41 C57 37, 55.5 30, 50 22 Z"
          fill="#f97316"
        />
        {/* Window */}
        <circle cx="50" cy="52" r="6" fill="#0ea5e9" stroke="#bae6fd" strokeWidth="2.2" />
        {/* Stars */}
        <circle cx="29" cy="38" r="2" fill="#fde047" />
        <circle cx="71" cy="44" r="1.8" fill="#fde08a" />
      </g>
    </HexBadgeBase>
  );
};

export default BadgeKaryaPerdana;
