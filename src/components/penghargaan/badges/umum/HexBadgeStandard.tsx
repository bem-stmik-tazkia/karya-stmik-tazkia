"use client";

import React from "react";
import { Layers, Shield } from "lucide-react";

interface HexBadgeStandardProps {
  type?: "layers" | "shield" | "26";
  theme?: "standard" | "classic" | "bem2026" | "ristekA" | "ristekB" | "custom";
  size?: "xs" | "sm" | "md" | "lg";
  tooltip?: string;
  onClick?: () => void;
}

export const HexBadgeStandard: React.FC<HexBadgeStandardProps> = ({
  type = "layers",
  theme = "standard",
  size = "sm",
  tooltip,
  onClick,
}) => {
  const is26 = type === "26";
  const isBEM = theme === "bem2026";
  const isRistekA = theme === "ristekA";
  const isRistekB = theme === "ristekB";

  const sizeClass =
    size === "xs"
      ? "w-8 h-9"
      : size === "sm"
      ? "w-10 h-11"
      : size === "md"
      ? "w-20 h-23 sm:w-24 sm:h-28"
      : "w-36 h-40 sm:w-44 sm:h-48";

  const getStrokeColor = () => {
    if (!is26) return "#334155";
    if (isBEM) return "#f59e0b";
    if (isRistekA) return "#22d3ee";
    if (isRistekB) return "#3b82f6";
    return "#f59e0b";
  };

  return (
    <div className="relative group inline-block select-none">
      <div
        role={onClick ? "button" : "presentation"}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        className={`${sizeClass} flex items-center justify-center transition-transform duration-300 hover:scale-115 focus:outline-none ${
          onClick ? "cursor-pointer" : ""
        }`}
      >
        <svg viewBox="0 0 100 115" className="w-full h-full drop-shadow-xs">
          <polygon
            points="50 3, 95 28, 95 87, 50 112, 5 87, 5 28"
            fill="#0c2442"
            stroke={getStrokeColor()}
            strokeWidth={is26 ? "6.5" : "5.5"}
          />
          <polygon
            points="50 12, 87 33, 87 82, 50 103, 13 82, 13 33"
            fill="#112e51"
            stroke={is26 ? getStrokeColor() : "#1e3a5f"}
            strokeOpacity={is26 ? "0.4" : "1"}
            strokeWidth="2"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {type === "layers" && <Layers className="w-4 h-4 text-slate-300" />}
          {type === "shield" && <Shield className="w-4 h-4 text-slate-300" />}
          {is26 && (
            <div className="flex flex-col items-center justify-center leading-none">
              <span
                className={`text-[12px] font-black tracking-tighter ${
                  isRistekA
                    ? "text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] font-mono"
                    : isRistekB
                    ? "text-sky-300 drop-shadow-[0_0_5px_rgba(56,189,248,0.8)] font-mono"
                    : "text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]"
                }`}
              >
                26
              </span>
              <span className="text-[6px] font-extrabold uppercase tracking-widest text-slate-300 mt-0.5">
                TAZKIA
              </span>
            </div>
          )}
        </div>
      </div>
      {tooltip && (
        <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg border border-slate-700">
          {tooltip}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700" />
        </div>
      )}
    </div>
  );
};

export default HexBadgeStandard;

