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
    id: "custom",
    name: "Custom Warna",
    tagline: "Kreasikan 2 kombinasi warna pilihanmu",
    badge: "Kustom",
    description: "Bebas atur 2 warna untuk aksen & latar kartu (bawaan warna resmi Tazkia).",
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
];

export const DEFAULT_TAZKIA_SKIN: CardSkin = CARD_SKINS[0];

export function createCustomSkin(primaryColor?: string, secondaryColor?: string): CardSkin {
  const pri = primaryColor || "#FF8A2B";
  const sec = secondaryColor || "#0B1F4A";
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
