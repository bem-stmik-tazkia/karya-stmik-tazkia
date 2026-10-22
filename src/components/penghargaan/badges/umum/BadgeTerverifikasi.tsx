"use client";

import React from "react";
import { getBadgeById } from "@/data/penghargaanCatalog";
import HexBadgeBase from "../base/HexBadgeBase";
import type { IndividualBadgeProps } from "../registry";

const defaultBadge = getBadgeById(3)!;

export const BadgeTerverifikasi: React.FC<IndividualBadgeProps> = ({
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
        {/* Outer Shield */}
        <path
          d="M50 24 L73 33 V55 C73 72, 60 83, 50 88 C40 83, 27 72, 27 55 V33 Z"
          fill="#0f294a"
          stroke="#e2e8f0"
          strokeWidth="2.6"
        />
        <path
          d="M50 30 L67.5 36.5 V54 C67.5 67, 58 76, 50 81 C42 76, 32.5 67, 32.5 54 V36.5 Z"
          fill="#0284c7"
          fillOpacity="0.38"
          stroke="#7dd3fc"
          strokeWidth="1.4"
        />
        {/* Bold Checkmark */}
        <path
          d="M40 55 L47 62.5 L61 45"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M40 55 L47 62.5 L61 45"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </HexBadgeBase>
  );
};

export default BadgeTerverifikasi;
