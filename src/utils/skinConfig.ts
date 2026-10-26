/**
 * 🎨 Skin Configuration
 * ──────────────────────
 * File ini menyediakan backward-compatible API (CARD_SKINS, getSkinById, dll)
 * yang dipakai oleh SkinPreviewModal dan komponen lainnya.
 *
 * Sekarang otomatis di-generate dari skin registry (skins/registry.ts).
 * Untuk menambah skin baru → cukup buat file di skins/ dan register di registry.
 */

import {
  SKIN_LIST,
  getSkinDefinition,
  createCustomSkinDefinition,
} from "@/components/cards";
import type { SkinDefinition } from "@/components/cards";

// ─── CardSkin Interface (backward compatible) ──────
export interface CardSkin {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  headerGradient: string;
  headerBorderColor: string;
  avatarRingStyle: string;
  statusDotColor: string;
  buttonTextColor: string;
  backBgColor: string;
  backBorderColor: string;
  previewBg: string;
  group?: "umum" | "khusus";
  tier?: "standard" | "rare" | "epic" | "mythic";
  requiredBadgeId?: number;
  unlockRequirement?: string;
}

// ─── Konversi SkinDefinition → CardSkin ────────────
function toCardSkin(skin: SkinDefinition): CardSkin {
  return {
    id: skin.id,
    name: skin.name,
    tagline: skin.tagline,
    badge: skin.badge,
    description: skin.description,
    primaryColor: skin.primaryColor,
    secondaryColor: skin.secondaryColor,
    headerGradient:
      skin.headerGradient ||
      `linear-gradient(135deg, ${skin.secondaryColor}, ${skin.secondaryColor}dd)`,
    headerBorderColor: skin.primaryColor,
    avatarRingStyle: skin.primaryColor,
    statusDotColor: skin.primaryColor,
    buttonTextColor: "#ffffff",
    backBgColor: skin.secondaryColor,
    backBorderColor: skin.primaryColor,
    previewBg:
      skin.previewBg ||
      `from-[${skin.secondaryColor}] to-[${skin.primaryColor}]`,
    group: skin.group,
    tier: skin.tier,
    requiredBadgeId: skin.requiredBadgeId,
    unlockRequirement: skin.unlockRequirement,
  };
}

// ─── Exported Constants & Functions ────────────────

/**
 * Daftar semua skin (otomatis dari registry).
 * Backward compatible — dipakai oleh SkinPreviewModal.
 */
export const CARD_SKINS: CardSkin[] = SKIN_LIST.map(toCardSkin);

/**
 * Skin default Tazkia.
 */
export const DEFAULT_TAZKIA_SKIN: CardSkin = CARD_SKINS[0];

/**
 * Buat CardSkin custom dari 2 warna pilihan user.
 */
export function createCustomSkin(
  primaryColor?: string,
  secondaryColor?: string
): CardSkin {
  const skinDef = createCustomSkinDefinition(primaryColor, secondaryColor);
  return toCardSkin(skinDef);
}

/**
 * Ambil CardSkin berdasarkan ID (backward compatible).
 */
export function getSkinById(id?: string | null): CardSkin {
  if (!id || id === "default" || id === "classic") return CARD_SKINS[0];

  if (id === "custom") {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("tazkia_custom_skin_colors");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.primary && parsed.secondary) {
            return createCustomSkin(parsed.primary, parsed.secondary);
          }
        }
      } catch {
        // fallback
      }
    }
    const customSlot = CARD_SKINS.find((s) => s.id === "custom");
    return customSlot || CARD_SKINS[0];
  }

  const found = CARD_SKINS.find((s) => s.id === id);
  return found || CARD_SKINS[0];
}
