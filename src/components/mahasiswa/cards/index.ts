// Skin Cards (Default / Classic & Custom Warna)
export { StandardStudentCard } from "./umum/StandardStudentCard";
export type { StudentCardData } from "./umum/StandardStudentCard";
export { CustomStudentCard } from "./umum/CustomStudentCard";

// Switcher & Icons
export { StudentCardRenderer } from "./StudentCardRenderer";
export { GithubIcon, InstagramIcon, LinkedinIcon } from "./SocialIcons";

// Skin System (1 skin = 1 file)
export type { SkinDefinition, SkinCardProps } from "./skins";
export {
  SKIN_REGISTRY,
  SKIN_LIST,
  getSkinDefinition,
  getPublicSkins,
  getAllSkins,
} from "./skins";
