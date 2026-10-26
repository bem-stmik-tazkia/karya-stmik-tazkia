// Base Card Engine (Standard Student Card)
export { StandardStudentCard } from "./base/StandardStudentCard";
export type { StudentCardData } from "./base/StandardStudentCard";

// Switcher & Renderer
export { StudentCardRenderer } from "./StudentCardRenderer";
export { CardSkinPreview } from "./CardSkinPreview";
export { GithubIcon, InstagramIcon, LinkedinIcon } from "./SocialIcons";

// Skin System (1 skin = 1 file)
export type { SkinDefinition, SkinCardProps } from "./skins";
export {
  SKIN_REGISTRY,
  SKIN_LIST,
  getSkinDefinition,
  getPublicSkins,
  getAllSkins,
  isSkinUnlocked,
  createCustomSkinDefinition,
} from "./skins";
