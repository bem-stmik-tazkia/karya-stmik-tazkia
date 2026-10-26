import { PENGHARGAAN_CATALOG, type PenghargaanBadge } from "./penghargaanCatalog";

export type ExclusiveRewardType = "skin_and_badge" | "badge_only" | "skin_only";
export type ExclusivePreviewType = "card" | "badge";

export interface ExclusiveRewardItem {
  id: string;
  name: string;
  category: "skin" | "badge";
  type: ExclusiveRewardType;
  previewType: ExclusivePreviewType;
  badgeId: number;
  skinId?: string;
  tierLabel: string;
  tierEmoji?: string;
  tagColor: string;
  accentColor: string;
  badgeCode: string;
  description: string;
  notePlaceholder: string;
  privilegeDetails?: string[];
}

export const EXCLUSIVE_REWARDS_CATALOG: ExclusiveRewardItem[] = [
  // ══════════════════════════════════════════════════════════════
  // KATEGORI 1: SKIN KARTU MAHASISWA 3D (CARD SKINS)
  // Mengubah tampilan kartu mahasiswa secara interaktif 3D
  // ══════════════════════════════════════════════════════════════
  {
    id: "reward_bem_2026",
    name: "Skin BEM Tazkia 2026",
    category: "skin",
    type: "skin_only",
    previewType: "card",
    badgeId: 101,
    skinId: "bem2026",
    tierLabel: "MYTHIC SKIN",
    tierEmoji: "",
    tagColor: "from-amber-400 via-amber-500 to-yellow-500 text-slate-950",
    accentColor: "#F59E0B",
    badgeCode: "skin_bem2026",
    description: "Tema Skin Kartu Emas BEM 2026 eksklusif fungsionaris & pengurus BEM STMIK Tazkia. Membuka tema Skin Kartu 3D di Lemari Tema Kartu.",
    notePlaceholder: "Amanah Kabinet BEM STMIK Tazkia 2026 - Departemen / Jabatan...",
    privilegeDetails: [
      "Hak akses tema Skin Kartu BEM 2026 (Gold Glow) di Lemari Tema Kartu.",
      "Dapat langsung digunakan sebagai tema kartu 3D profil mahasiswa.",
      "Pemberitahuan resmi dan tombol klaim instan di Kotak Pesan & profil.",
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // KATEGORI 2: LENCANA KEHORMATAN KAMPUS (ACHIEVEMENT BADGES)
  // Medali heksagon kehormatan resmi yang disematkan di rak profil
  // ══════════════════════════════════════════════════════════════
  {
    id: "reward_bem_badge",
    name: "Lencana Vanguard BEM 2026",
    category: "badge",
    type: "badge_only",
    previewType: "badge",
    badgeId: 15,
    skinId: undefined,
    tierLabel: "LENCANA KHUSUS",
    tierEmoji: "👑",
    tagColor: "from-amber-400 to-yellow-500 text-slate-950",
    accentColor: "#F59E0B",
    badgeCode: "bem_2026",
    description: "Lencana kehormatan resmi kabinet & pengurus BEM STMIK Tazkia 2026 sebagai simbol kepemimpinan dan integritas kampus.",
    notePlaceholder: "Amanah Kabinet BEM STMIK Tazkia 2026 - Departemen / Jabatan...",
    privilegeDetails: [
      "Lencana Kehormatan Vanguard BEM 2026 tersemat permanen di rak profil.",
      "Dapat dipajang di 5 slot sorotan utama kartu mahasiswa.",
      "Tanda kehormatan resmi fungsionaris & kabinet pengurus BEM.",
    ],
  },
  {
    id: "reward_pelopor_tazkia",
    name: "Lencana Pelopor Tazkia",
    category: "badge",
    type: "badge_only",
    previewType: "badge",
    badgeId: 14,
    skinId: undefined,
    tierLabel: "LENCANA KHUSUS",
    tierEmoji: "🎖️",
    tagColor: "from-orange-500 to-amber-500 text-white",
    accentColor: "#EA580C",
    badgeCode: "pelopor_tazkia",
    description: "Apresiasi khusus kampus bagi mahasiswa pelopor yang memberikan kontribusi perintis, kepemimpinan inisiatif, atau prestasi teladan institusi.",
    notePlaceholder: "Apresiasi atas dedikasi perintis proyek / inisiatif kampus...",
    privilegeDetails: [
      "Lencana Kehormatan Pelopor Tazkia tersemat permanen di rak profil.",
      "Dapat dipajang di 5 slot sorotan utama kartu mahasiswa.",
      "Tampil di daftar talenta unggulan mahasiswa kampus.",
    ],
  },
  {
    id: "reward_ristek_quantum",
    name: "Lencana Ristek Quantum Cyber",
    category: "badge",
    type: "badge_only",
    previewType: "badge",
    badgeId: 16,
    skinId: undefined,
    tierLabel: "LENCANA KHUSUS",
    tierEmoji: "⚡",
    tagColor: "from-cyan-500 to-blue-600 text-white",
    accentColor: "#06B6D4",
    badgeCode: "ristek_quantum_2026",
    description: "Penghargaan kehormatan bidang riset teknologi mutakhir, arsitektur cyber, atau kompetisi sains dan teknologi institusi maupun nasional.",
    notePlaceholder: "Penghargaan atas riset / kompetisi teknologi inovatif...",
    privilegeDetails: [
      "Lencana Kehormatan Ristek Quantum Cyber terpasang di profil.",
      "Dapat dipajang di 5 slot sorotan utama kartu mahasiswa.",
      "Tanda kehormatan periset dan pegiat teknologi STMIK Tazkia.",
    ],
  },
];

/** Daftar skin kartu eksklusif saja */
export const EXCLUSIVE_SKIN_REWARDS = EXCLUSIVE_REWARDS_CATALOG.filter(
  (r) => r.category === "skin" || !!r.skinId
);

/** Daftar lencana kehormatan eksklusif saja */
export const EXCLUSIVE_BADGE_REWARDS = EXCLUSIVE_REWARDS_CATALOG.filter(
  (r) => r.category === "badge" && !r.skinId
);

export function getExclusiveRewardById(id: string): ExclusiveRewardItem | undefined {
  return EXCLUSIVE_REWARDS_CATALOG.find((r) => r.id === id);
}

export function getExclusiveRewardByBadgeId(badgeId: number): ExclusiveRewardItem | undefined {
  return EXCLUSIVE_REWARDS_CATALOG.find((r) => r.badgeId === badgeId);
}

export function getExclusiveRewardBySkinId(skinId: string): ExclusiveRewardItem | undefined {
  return EXCLUSIVE_REWARDS_CATALOG.find((r) => r.skinId === skinId);
}

export function getBadgeForReward(reward: ExclusiveRewardItem): PenghargaanBadge {
  const found = PENGHARGAAN_CATALOG.find((b) => b.id === reward.badgeId);
  if (found) return found;
  return PENGHARGAAN_CATALOG[0];
}
