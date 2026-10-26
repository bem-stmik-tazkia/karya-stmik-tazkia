"use client";

import React from "react";
import type { PenghargaanBadge } from "@/data/penghargaanCatalog";

// Badges Umum (1-14)
import BadgeKaryaPerdana from "./umum/BadgeKaryaPerdana";
import BadgeKolektorKarya from "./umum/BadgeKolektorKarya";
import BadgeTerverifikasi from "./umum/BadgeTerverifikasi";
import BadgeSorotanKurator from "./umum/BadgeSorotanKurator";
import BadgeFavoritKomunitas from "./umum/BadgeFavoritKomunitas";
import BadgeSinergiKolaborasi from "./umum/BadgeSinergiKolaborasi";
import BadgeMultiTalenta from "./umum/BadgeMultiTalenta";
import BadgePenelitiMuda from "./umum/BadgePenelitiMuda";
import BadgeInovasiBerdampak from "./umum/BadgeInovasiBerdampak";
import BadgeKreatorWebApp from "./umum/BadgeKreatorWebApp";
import BadgeKreatorDesain from "./umum/BadgeKreatorDesain";
import BadgeInovatorIoT from "./umum/BadgeInovatorIoT";
import BadgeMaster5Kategori from "./umum/BadgeMaster5Kategori";
import BadgePeloporTazkia from "./umum/BadgePeloporTazkia";

// Badges Khusus (15-16)
import HexBadgeBEM2026 from "./khusus/HexBadgeBEM2026";
import HexBadgeRistekQuantum from "./khusus/HexBadgeRistekQuantum";

export interface IndividualBadgeProps {
  badge?: PenghargaanBadge;
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

export type BadgeComponent = React.FC<IndividualBadgeProps>;

export const BADGE_COMPONENTS: Record<number, BadgeComponent> = {
  1: BadgeKaryaPerdana,
  2: BadgeKolektorKarya,
  3: BadgeTerverifikasi,
  4: BadgeSorotanKurator,
  5: BadgeFavoritKomunitas,
  6: BadgeSinergiKolaborasi,
  7: BadgeMultiTalenta,
  8: BadgePenelitiMuda,
  9: BadgeInovasiBerdampak,
  10: BadgeKreatorWebApp,
  11: BadgeKreatorDesain,
  12: BadgeInovatorIoT,
  13: BadgeMaster5Kategori,
  14: BadgePeloporTazkia,
  15: HexBadgeBEM2026 as any,
  16: HexBadgeRistekQuantum as any,
};

export const BADGE_BY_CODE: Record<string, BadgeComponent> = {
  karya_perdana: BadgeKaryaPerdana,
  kolektor_karya: BadgeKolektorKarya,
  terverifikasi_kampus: BadgeTerverifikasi,
  sorotan_kurator: BadgeSorotanKurator,
  favorit_komunitas: BadgeFavoritKomunitas,
  sinergi_kolaborasi: BadgeSinergiKolaborasi,
  multi_talenta: BadgeMultiTalenta,
  peneliti_muda: BadgePenelitiMuda,
  inovasi_berdampak: BadgeInovasiBerdampak,
  kreator_web_app: BadgeKreatorWebApp,
  kreator_desain: BadgeKreatorDesain,
  inovator_iot: BadgeInovatorIoT,
  master_5_kategori: BadgeMaster5Kategori,
  pelopor_tazkia: BadgePeloporTazkia,
  bem_2026: HexBadgeBEM2026 as any,
  ristek_quantum_2026: HexBadgeRistekQuantum as any,
};

export const BADGE_BY_SYMBOL: Record<string, BadgeComponent> = {
  rocket: BadgeKaryaPerdana,
  diamond_archive: BadgeKolektorKarya,
  shield_check: BadgeTerverifikasi,
  spotlight_star: BadgeSorotanKurator,
  glowing_heart: BadgeFavoritKomunitas,
  network_nodes: BadgeSinergiKolaborasi,
  crystal_prism: BadgeMultiTalenta,
  silver_scroll: BadgePenelitiMuda,
  live_signal_globe: BadgeInovasiBerdampak,
  web_app_portal: BadgeKreatorWebApp,
  design_pen_vector: BadgeKreatorDesain,
  iot_microchip: BadgeInovatorIoT,
  pentagon_master: BadgeMaster5Kategori,
  eternal_torch: BadgePeloporTazkia,
  bem_crown_26: HexBadgeBEM2026 as any,
  ristek_quantum: HexBadgeRistekQuantum as any,
};

export function getBadgeComponent(badge: PenghargaanBadge): BadgeComponent {
  if (BADGE_COMPONENTS[badge.id]) return BADGE_COMPONENTS[badge.id];
  if (badge.code && BADGE_BY_CODE[badge.code]) return BADGE_BY_CODE[badge.code];
  if (badge.symbolKey && BADGE_BY_SYMBOL[badge.symbolKey]) return BADGE_BY_SYMBOL[badge.symbolKey];
  return BadgeKaryaPerdana;
}
