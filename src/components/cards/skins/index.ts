// ─── Skin System ───────────────────────────────────
// Setiap skin = 1 file. Registry = pusat pendaftaran.

// Types
export type { SkinDefinition, SkinCardProps, StudentCardData } from "./types";

// Individual Skins (Umum & Khusus)
export { SkinClassic, ClassicCardComponent } from "./umum/SkinClassic";
export { SkinCustom, createCustomSkinDefinition } from "./umum/SkinCustom";
export { SkinBEM2026, BEM2026CardComponent } from "./khusus/SkinBEM2026";

// Registry & Helpers
export {
  SKIN_REGISTRY,
  SKIN_LIST,
  getSkinDefinition,
  getPublicSkins,
  getAllSkins,
  isSkinUnlocked,
} from "./registry";

