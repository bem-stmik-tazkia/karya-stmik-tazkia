"use client";

import React from "react";
import { getBadgeById } from "@/data/penghargaanCatalog";
import HexBadgeBase from "../base/HexBadgeBase";
import type { IndividualBadgeProps } from "../registry";

const defaultBadge = getBadgeById(6)!;

export const BadgeSinergiKolaborasi: React.FC<IndividualBadgeProps> = ({
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
        {/* Connecting Triangle & Center Lines */}
        <line x1="50" y1="29" x2="29" y2="69" stroke="#f59e0b" strokeWidth="2.8" />
        <line x1="50" y1="29" x2="71" y2="69" stroke="#f59e0b" strokeWidth="2.8" />
        <line x1="29" y1="69" x2="71" y2="69" stroke="#f59e0b" strokeWidth="2.8" />
        <line x1="50" y1="29" x2="50" y2="56" stroke="#fed7aa" strokeWidth="2" />
        <line x1="29" y1="69" x2="50" y2="56" stroke="#fed7aa" strokeWidth="2" />
        <line x1="71" y1="69" x2="50" y2="56" stroke="#fed7aa" strokeWidth="2" />
        {/* Central Hub with breathing pulse */}
        <circle
          cx="50"
          cy="56"
          r="6.5"
          fill="#f97316"
          stroke="#ffffff"
          strokeWidth="2.2"
          className={animated && !locked ? "animate-pulse" : ""}
        />
        {/* 3 Outer Nodes */}
        <circle cx="50" cy="29" r="7" fill="#fbbf24" stroke="#fffbeb" strokeWidth="2.2" />
        <circle cx="29" cy="69" r="7" fill="#fb923c" stroke="#fffbeb" strokeWidth="2.2" />
        <circle cx="71" cy="69" r="7" fill="#fb923c" stroke="#fffbeb" strokeWidth="2.2" />
      </g>
    </HexBadgeBase>
  );
};

export default BadgeSinergiKolaborasi;
