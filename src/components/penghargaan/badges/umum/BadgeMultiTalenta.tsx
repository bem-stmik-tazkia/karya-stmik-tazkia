"use client";

import React from "react";
import { getBadgeById } from "@/data/penghargaanCatalog";
import HexBadgeBase from "../base/HexBadgeBase";
import type { IndividualBadgeProps } from "../registry";

const defaultBadge = getBadgeById(7)!;

export const BadgeMultiTalenta: React.FC<IndividualBadgeProps> = ({
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
        {/* Refracted Multi-Skill Rays */}
        <line x1="58" y1="49" x2="79" y2="38" stroke="#f43f5e" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="62" y1="56" x2="81" y2="56" stroke="#38bdf8" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="58" y1="63" x2="79" y2="74" stroke="#facc15" strokeWidth="3.2" strokeLinecap="round" />
        {/* Incoming Light Beam */}
        <line
          x1="20"
          y1="58"
          x2="39"
          y2="53"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          className={animated && !locked ? "animate-pulse" : ""}
        />
        {/* 3D Prism Triangle */}
        <polygon
          points="50 26, 27 74, 73 74"
          fill="#1e293b"
          stroke="#e2e8f0"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <polygon points="50 26, 27 74, 50 65" fill="#38bdf8" fillOpacity="0.45" />
        <polygon points="50 26, 73 74, 50 65" fill="#818cf8" fillOpacity="0.45" />
        <line x1="50" y1="26" x2="50" y2="65" stroke="#f8fafc" strokeWidth="2" />
      </g>
    </HexBadgeBase>
  );
};

export default BadgeMultiTalenta;
