"use client";

import React from "react";
import { getBadgeById } from "@/data/penghargaanCatalog";
import HexBadgeBase from "../base/HexBadgeBase";
import type { IndividualBadgeProps } from "../registry";

const defaultBadge = getBadgeById(12)!;

export const BadgeInovatorIoT: React.FC<IndividualBadgeProps> = ({
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
        {/* Wireless Signal Arcs with gentle pulse */}
        <path
          d="M42 27 A12 12 0 0 1 58 27"
          fill="none"
          stroke="#f97316"
          strokeWidth="2.4"
          strokeLinecap="round"
          className={animated && !locked ? "animate-pulse" : ""}
        />
        <path
          d="M37 22 A19 19 0 0 1 63 22"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          className={animated && !locked ? "animate-pulse [animation-delay:300ms]" : ""}
        />
        {/* Microchip Pins */}
        {[39, 46, 54, 61].map((pos) => (
          <React.Fragment key={pos}>
            <line x1="25" y1={pos + 8} x2="33" y2={pos + 8} stroke="#cbd5e1" strokeWidth="2.6" strokeLinecap="round" />
            <line x1="67" y1={pos + 8} x2="75" y2={pos + 8} stroke="#cbd5e1" strokeWidth="2.6" strokeLinecap="round" />
            <line x1={pos} y1="33" x2={pos} y2="41" stroke="#cbd5e1" strokeWidth="2.6" strokeLinecap="round" />
            <line x1={pos} y1="75" x2={pos} y2="83" stroke="#cbd5e1" strokeWidth="2.6" strokeLinecap="round" />
          </React.Fragment>
        ))}
        {/* Chip Body */}
        <rect x="33" y="41" width="34" height="34" rx="5" fill="#0f294a" stroke="#e2e8f0" strokeWidth="2.4" />
        <rect x="39" y="47" width="22" height="22" rx="3" fill="#0284c7" fillOpacity="0.35" stroke="#38bdf8" strokeWidth="1.6" />
        <circle cx="50" cy="58" r="5.5" fill="#f97316" stroke="#fef08a" strokeWidth="1.8" />
        <circle cx="50" cy="58" r="2" fill="#ffffff" />
      </g>
    </HexBadgeBase>
  );
};

export default BadgeInovatorIoT;
