/**
 * 🎨 Skin: Custom Warna
 * ──────────────────────
 * Skin kustom yang memungkinkan mahasiswa memilih 2 warna sendiri
 * (warna aksen + warna latar header). Warna default = warna Tazkia Classic.
 *
 * File ini berisi:
 * - Config default (warna Tazkia)
 * - Factory function `createCustomSkinDefinition()` untuk generate skin
 *   dengan warna pilihan user
 */

import type { SkinDefinition } from "./types";

/**
 * Config default skin Custom (sebelum user ubah warna).
 * Warna awal = sama seperti Tazkia Classic.
 */
export const SkinCustom: SkinDefinition = {
  id: "custom",
  name: "Custom Warna",
  tagline: "Kreasikan 2 kombinasi warna pilihanmu",
  badge: "Kustom",
  tier: "standard",
  group: "umum",
  description:
    "Bebas atur 2 warna untuk aksen & latar kartu. Warna bawaan = warna resmi Tazkia.",

  // Warna default (sama seperti Classic)
  primaryColor: "#FF8A2B",
  secondaryColor: "#0B1F4A",

  // Preview metadata
  headerGradient: "linear-gradient(135deg, #0B1F4A, #16347A)",
  previewBg: "from-[#0B1F4A] to-[#16347A]",

  // Tidak perlu CardComponent → otomatis pakai StudentCardBase
};

/**
 * Factory: buat SkinDefinition Custom dengan warna user.
 * Dipakai oleh StudentCardRenderer ketika skinId === "custom".
 */
export function createCustomSkinDefinition(
  primaryColor?: string,
  secondaryColor?: string
): SkinDefinition {
  const pri = primaryColor || "#FF8A2B";
  const sec = secondaryColor || "#0B1F4A";

  return {
    ...SkinCustom,
    primaryColor: pri,
    secondaryColor: sec,
    headerGradient: `linear-gradient(135deg, ${sec}, ${sec}dd)`,
    previewBg: `from-[${sec}] to-[${pri}]`,
  };
}

export default SkinCustom;

