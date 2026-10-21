export interface CardSkin {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  description: string;
  primaryColor: string; // Accent color (var(--c2) / b)
  secondaryColor: string; // Base header / dark color (var(--c1) / a)
  headerGradient: string;
  headerBorderColor: string;
  avatarRingStyle: string;
  statusDotColor: string;
  buttonTextColor: string;
  backBgColor: string;
  backBorderColor: string;
  previewBg: string;
}

export const CARD_SKINS: CardSkin[] = [
  {
    id: "classic",
    name: "Tazkia Classic",
    tagline: "Identitas resmi kampus STMIK Tazkia",
    badge: "Bawaan",
    description: "Kombinasi solid Deep Navy (#0B1F4A) dengan aksen Vibrant Orange (#FF8A2B).",
    primaryColor: "#FF8A2B",
    secondaryColor: "#0B1F4A",
    headerGradient: "linear-gradient(135deg, #0B1F4A, #16347A)",
    headerBorderColor: "#FF8A2B",
    avatarRingStyle: "#FF8A2B",
    statusDotColor: "#FF8A2B",
    buttonTextColor: "#ffffff",
    backBgColor: "#0B1F4A",
    backBorderColor: "#FF8A2B",
    previewBg: "from-[#0B1F4A] to-[#16347A]",
  },
  {
    id: "bem2026",
    name: "Eksklusif BEM 2026",
    tagline: "Vanguard 26 Royal Gold Edition",
    badge: "MYTHIC GOLD",
    description: "Tema resmi BEM 2026 berbalut Royal Gold, Shimmer Sweep, dan pendaran emas mewah.",
    primaryColor: "#f59e0b",
    secondaryColor: "#071936",
    headerGradient: "linear-gradient(135deg, #071936, #132a56, #2e1f10)",
    headerBorderColor: "#f59e0b",
    avatarRingStyle: "#f59e0b",
    statusDotColor: "#f59e0b",
    buttonTextColor: "#071936",
    backBgColor: "#071936",
    backBorderColor: "#f59e0b",
    previewBg: "from-[#071936] to-[#2e1f10]",
  },
  {
    id: "ristekA",
    name: "Ristek Biru V2 (Quantum)",
    tagline: "Quantum Cyber Architect",
    badge: "SSR CYBER",
    description: "Tema Siber Kuantum dengan aksen Neon Cyan, circuit trace, dan teknologi masa depan.",
    primaryColor: "#00f0ff",
    secondaryColor: "#081B42",
    headerGradient: "linear-gradient(135deg, #071a3d, #0b2866, #0c2e6b)",
    headerBorderColor: "#00f0ff",
    avatarRingStyle: "#00f0ff",
    statusDotColor: "#00f0ff",
    buttonTextColor: "#ffffff",
    backBgColor: "#081B42",
    backBorderColor: "#00f0ff",
    previewBg: "from-[#071a3d] to-[#0c2e6b]",
  },
  {
    id: "ristekB",
    name: "Ristek Biru Ultra (Mecha)",
    tagline: "Mecha Sapphire Overdrive",
    badge: "SSR SAPPHIRE",
    description: "Tema Mecha Sapphire dengan aksen Electric Blue & Oranye Industri berkecepatan tinggi.",
    primaryColor: "#38bdf8",
    secondaryColor: "#081B42",
    headerGradient: "linear-gradient(135deg, #071a3d, #0b2866, #0c2e6b)",
    headerBorderColor: "#38bdf8",
    avatarRingStyle: "#38bdf8",
    statusDotColor: "#38bdf8",
    buttonTextColor: "#ffffff",
    backBgColor: "#081B42",
    backBorderColor: "#38bdf8",
    previewBg: "from-[#071a3d] to-[#0c2e6b]",
  },
  {
    id: "custom",
    name: "Custom Warna",
    tagline: "Kreasikan 2 kombinasi warna pilihanmu",
    badge: "Kustom",
    description: "Bebas atur 2 warna untuk aksen & latar kartu.",
    primaryColor: "#38bdf8",
    secondaryColor: "#0b132b",
    headerGradient: "linear-gradient(135deg, #0b132b, #1c2541)",
    headerBorderColor: "#38bdf8",
    avatarRingStyle: "#38bdf8",
    statusDotColor: "#38bdf8",
    buttonTextColor: "#ffffff",
    backBgColor: "#0b132b",
    backBorderColor: "#38bdf8",
    previewBg: "from-[#0b132b] to-[#1c2541]",
  },
];

export const DEFAULT_TAZKIA_SKIN: CardSkin = CARD_SKINS[0];

export function createCustomSkin(primaryColor?: string, secondaryColor?: string): CardSkin {
  const pri = primaryColor || "#38bdf8";
  const sec = secondaryColor || "#0b132b";
  return {
    id: "custom",
    name: "Custom Warna",
    tagline: "Kreasikan 2 kombinasi warna pilihanmu",
    badge: "Kustom",
    description: "Tema personalisasi bebas dengan 2 warna pilihanmu.",
    primaryColor: pri,
    secondaryColor: sec,
    headerGradient: `linear-gradient(135deg, ${sec}, ${sec}dd)`,
    headerBorderColor: pri,
    avatarRingStyle: pri,
    statusDotColor: pri,
    buttonTextColor: "#ffffff",
    backBgColor: sec,
    backBorderColor: pri,
    previewBg: `from-[${sec}] to-[${pri}]`,
  };
}

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
