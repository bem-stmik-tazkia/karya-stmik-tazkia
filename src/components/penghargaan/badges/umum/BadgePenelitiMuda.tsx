"use client";

import React from "react";
import { getBadgeById } from "@/data/penghargaanCatalog";
import HexBadgeBase from "../base/HexBadgeBase";
import type { IndividualBadgeProps } from "../registry";

const defaultBadge = getBadgeById(8)!;

export const BadgePenelitiMuda: React.FC<IndividualBadgeProps> = ({
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
        {/* Research Halo with gentle orbit */}
        <ellipse
          cx="48"
          cy="54"
          rx="26"
          ry="10"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          opacity="0.55"
          transform="rotate(-25 48 54)"
          className={animated && !locked ? "spin-slow" : ""}
          style={{ transformOrigin: "48px 54px" }}
        />
        {/* Silver-Platinum Manuscript Paper */}
        <rect x="31" y="29" width="32" height="48" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2.2" />
        <rect x="34" y="33" width="26" height="40" rx="2" fill="#f8fafc" />
        {/* Top & Bottom Metallic Silver Rollers */}
        <rect x="26" y="27" width="42" height="6.5" rx="3.2" fill="#475569" stroke="#f1f5f9" strokeWidth="1.6" />
        <rect x="26" y="73" width="42" height="6.5" rx="3.2" fill="#475569" stroke="#f1f5f9" strokeWidth="1.6" />
        {/* Academic Lines */}
        <line x1="38" y1="42" x2="55" y2="42" stroke="#0284c7" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="38" y1="50" x2="53" y2="50" stroke="#0284c7" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="38" y1="58" x2="48" y2="58" stroke="#64748b" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="43" cy="66" r="3.2" fill="#f97316" />
        {/* Quill Pen */}
        <path
          d="M71 25 C58 31, 51 47, 47 67 L54 63.5 C64 53, 73 38, 71 25 Z"
          fill="#0ea5e9"
          stroke="#f8fafc"
          strokeWidth="1.8"
        />
        <path d="M71 25 C63 30, 57 40, 53 53 L58 51 C65 43, 71 33, 71 25 Z" fill="#7dd3fc" />
        <line x1="68" y1="29" x2="46" y2="68" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="46" cy="68" r="2" fill="#f97316" />
      </g>
    </HexBadgeBase>
  );
};

export default BadgePenelitiMuda;
