"use client";

import React from "react";
import type { PenghargaanBadge } from "@/data/penghargaanCatalog";
import {
  getBadgeComponent,
  HexBadgeBEM2026,
  HexBadgeRistekQuantum,
} from "./badges";

// Export SVG Icons from base
export { HardHatSvg, PickaxeSvg, BuilderComboSvg } from "./badges/base/BuilderSvgIcons";

// Backward compatibility alias for Ristek variants
export const HexBadgeRistek2026 = ({
  variant = "A",
  size = "sm",
  locked = false,
  hyperMode = false,
  onClick,
}: {
  variant?: "A" | "B";
  size?: "xs" | "sm" | "md" | "lg";
  locked?: boolean;
  hyperMode?: boolean;
  onClick?: () => void;
}) => {
  return (
    <HexBadgeRistekQuantum
      size={size}
      locked={locked}
      hyperMode={hyperMode}
      onClick={onClick}
    />
  );
};

export interface TazkiaAchievementHexBadgeProps {
  badge: PenghargaanBadge;
  size?: "xs" | "sm" | "md" | "lg";
  locked?: boolean;
  animated?: boolean;
  shimmer?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  title?: string;
  tooltip?: string;
  showTooltip?: boolean;
  tooltipAlign?: "center" | "left" | "right";
}

/**
 * Universal Achievement Badge Component (Dispatcher / Facade)
 *
 * Masing-masing badge diisolasi dalam filenya sendiri (1 badge = 1 file di src/components/penghargaan/badges/umum/ dan khusus/).
 * Setiap badge memiliki styling, SVG path, dan animasi independen yang berjalan mulus terus-menerus tanpa saling mengganggu.
 */
export const TazkiaAchievementHexBadge: React.FC<TazkiaAchievementHexBadgeProps> = ({
  badge,
  size = "md",
  locked = false,
  animated = true,
  shimmer = false,
  className = "",
  style,
  onClick,
  title,
  tooltip,
  showTooltip = true,
  tooltipAlign = "center",
}) => {
  if (!badge) return null;

  const BadgeComponent = getBadgeComponent(badge);

  return (
    <BadgeComponent
      badge={badge}
      size={size}
      locked={locked}
      animated={animated}
      shimmer={shimmer}
      className={className}
      style={style}
      onClick={onClick}
      title={title}
      tooltip={tooltip}
      showTooltip={showTooltip}
      tooltipAlign={tooltipAlign}
    />
  );
};

export default TazkiaAchievementHexBadge;

// Re-export Modular Badges & Registry
export { HexBadgeBEM2026 as HexBadgeBEM2026Exclusive } from "./badges";
export * from "./badges";
