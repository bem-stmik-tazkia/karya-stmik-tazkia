"use client";

import React from "react";
import { getTechTagColor } from "@/utils/techTagColor";
import { getKTITool } from "@/lib/ktiTools";

interface TechStackTagsProps {
  /** Daftar tech stack / tools */
  techs: string[];
  /** Berapa tag yang ditampilkan sebelum +N (default: 3) */
  maxVisible?: number;
  /** Ukuran font dan padding; "sm" untuk card kecil, "md" untuk detail */
  size?: "sm" | "md";
  /** Tambahan className untuk container */
  className?: string;
  pill?: boolean;
}

export default function TechStackTags({
  techs,
  maxVisible = 3,
  size = "sm",
  className = "",
  pill = true,
}: TechStackTagsProps) {
  if (!techs || techs.length === 0) return null;

  const visible = techs.slice(0, maxVisible);
  const hiddenCount = techs.length - maxVisible;

  const sizeClass =
    size === "md"
      ? "px-2.5 py-1 text-xs"
      : "px-2.5 py-0.5 text-[11px]";

  const radiusClass = pill ? "rounded-full" : "rounded-md";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {visible.map((tech) => {
        const kti = getKTITool(tech);
        const Icon = kti?.icon;
        const colorClass = getTechTagColor(tech);

        return (
          <span
            key={tech}
            className={`inline-flex items-center gap-1.5 ${radiusClass} border font-medium leading-tight shadow-2xs transition-colors ${sizeClass} ${colorClass}`}
          >
            {Icon ? (
              <Icon
                className="w-3 h-3 shrink-0"
                style={{ color: kti.color }}
                aria-hidden="true"
              />
            ) : null}
            <span>{tech}</span>
          </span>
        );
      })}

      {hiddenCount > 0 && (
        <span
          className={`inline-flex items-center ${radiusClass} border border-border bg-muted/80 text-muted-foreground font-mono font-semibold leading-tight ${sizeClass}`}
          title={techs.slice(maxVisible).join(", ")}
        >
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}
