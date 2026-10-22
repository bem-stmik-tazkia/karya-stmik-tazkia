// ─── Skin System ───────────────────────────────────
// Setiap skin = 1 file. Registry = pusat pendaftaran.

// Types
export type { SkinDefinition, SkinCardProps, StudentCardData } from "./types";

// Individual Skins
export { SkinClassic, ClassicCardComponent } from "./SkinClassic";
export { SkinCustom, createCustomSkinDefinition } from "./SkinCustom";
export { SkinBEM2026, BEM2026CardComponent } from "./SkinBEM2026";

// Registry & Helpers
export {
  SKIN_REGISTRY,
  SKIN_LIST,
  getSkinDefinition,
  getPublicSkins,
  getAllSkins,
} from "./registry";

