"use client";

import { getTechTagColor } from "@/utils/techTagColor";

interface TechStackTagsProps {
  /** Daftar tech stack / tools */
  techs: string[];
  /** Berapa tag yang ditampilkan sebelum +N (default: 3) */
  maxVisible?: number;
  /** Ukuran font dan padding; "sm" untuk card kecil, "md" untuk detail */
  size?: "sm" | "md";
  /** Tambahan className untuk container */
  className?: string;
}

export default function TechStackTags({
  techs,
  maxVisible = 3,
  size = "sm",
  className = "",
}: TechStackTagsProps) {
  if (!techs || techs.length === 0) return null;

  const visible = techs.slice(0, maxVisible);
  const hiddenCount = techs.length - maxVisible;

  const sizeClass =
    size === "md"
      ? "px-3 py-1 text-xs"
      : "px-2.5 py-0.5 text-[11px]";

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {visible.map((tech) => (
        <span
          key={tech}
          className={`inline-flex items-center rounded-lg border-2 font-bold leading-tight ${sizeClass} ${getTechTagColor(tech)}`}
        >
          {tech}
        </span>
      ))}

      {hiddenCount > 0 && (
        <span
          className={`inline-flex items-center rounded-lg border-2 border-border bg-muted text-muted-foreground font-black leading-tight ${sizeClass}`}
          title={techs.slice(maxVisible).join(", ")}
        >
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}
