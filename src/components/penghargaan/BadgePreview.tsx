"use client";

import React from "react";
import { PENGHARGAAN_CATALOG, type PenghargaanBadge } from "@/data/penghargaanCatalog";
import { TazkiaAchievementHexBadge } from "./TazkiaAchievementBadge";

export interface BadgePreviewProps {
  badgeId?: number;
  badge?: PenghargaanBadge;
  size?: "xs" | "sm" | "md" | "lg";
  locked?: boolean;
  animated?: boolean;
  shimmer?: boolean;
  className?: string;
  onClick?: () => void;
  showTooltip?: boolean;
}

/**
 * 🎖️ BadgePreview
 * ─────────────────────────────────────────────────────────────
 * Komponen mandiri untuk pratinjau Medali Heksagon Penghargaan / Lencana.
 * Dapat dipanggil langsung dari Admin Master, Modal Penghargaan,
 * atau katalog tanpa terikat dengan modul mahasiswa.
 */
export const BadgePreview: React.FC<BadgePreviewProps> = ({
  badgeId,
  badge,
  size = "lg",
  locked = false,
  animated = true,
  shimmer = true,
  className = "",
  onClick,
  showTooltip = true,
}) => {
  const resolvedBadge: PenghargaanBadge | undefined =
    badge || (badgeId ? PENGHARGAAN_CATALOG.find((b) => b.id === badgeId) : undefined);

  if (!resolvedBadge) {
    return (
      <div className="w-20 h-20 rounded-2xl border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
        Lencana tidak ditemukan
      </div>
    );
  }

  return (
    <div className={className}>
      <TazkiaAchievementHexBadge
        badge={resolvedBadge}
        size={size}
        locked={locked}
        animated={animated}
        shimmer={shimmer}
        onClick={onClick}
        showTooltip={showTooltip}
      />
    </div>
  );
};

export default BadgePreview;

