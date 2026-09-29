import { Monitor, Smartphone, BookOpen, Cpu, Palette, Code2, Globe, Rocket, Layers, Fingerprint } from "lucide-react";

interface ProjectCoverPlaceholderProps {
  id: string;
  title: string;
  category?: string;
}

// Peta kategori → warna + ikon yang khas
const CATEGORY_CONFIG: Record<string, { gradient: string; iconBg: string; label: string; icons: any[] }> = {
  Technology: {
    gradient: "from-blue-600 via-blue-500 to-indigo-600",
    iconBg: "bg-blue-400/30",
    label: "Web",
    icons: [Monitor, Globe, Code2],
  },
  Programming: {
    gradient: "from-emerald-500 via-green-500 to-teal-600",
    iconBg: "bg-emerald-400/30",
    label: "Mobile",
    icons: [Smartphone, Layers, Code2],
  },
  Research: {
    gradient: "from-amber-500 via-orange-500 to-orange-600",
    iconBg: "bg-amber-400/30",
    label: "Riset",
    icons: [BookOpen, Fingerprint, Layers],
  },
  IoT: {
    gradient: "from-purple-600 via-violet-500 to-purple-600",
    iconBg: "bg-purple-400/30",
    label: "IoT",
    icons: [Cpu, Rocket, Layers],
  },
  Multimedia: {
    gradient: "from-pink-500 via-rose-500 to-pink-600",
    iconBg: "bg-pink-400/30",
    label: "Kreatif",
    icons: [Palette, Layers, Rocket],
  },
};

// Fallback gradients untuk kategori yang tidak dikenal
const FALLBACK_GRADIENTS = [
  "from-blue-600 via-blue-500 to-indigo-600",
  "from-violet-600 via-purple-500 to-purple-600",
  "from-emerald-500 via-green-500 to-teal-600",
  "from-rose-500 via-pink-500 to-pink-600",
  "from-amber-500 via-orange-500 to-orange-600",
  "from-cyan-500 via-blue-400 to-blue-600",
];

const FALLBACK_ICONS = [Code2, Monitor, Cpu, Fingerprint, Rocket, Layers];

export function ProjectCoverPlaceholder({ id, title, category }: ProjectCoverPlaceholderProps) {
  // Use title + id for better hash variation
  const hashString = title + id;
  const hash = hashString.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Normalize category key (strip spaces, case-insensitive)
  const normalizedCategory = Object.keys(CATEGORY_CONFIG).find(
    (k) => category && k.toLowerCase() === category.toLowerCase()
  );

  const config = normalizedCategory ? CATEGORY_CONFIG[normalizedCategory] : null;
  const gradient = config
    ? config.gradient
    : FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length];

  const iconPool = config ? config.icons : FALLBACK_ICONS;
  const MainIcon = iconPool[hash % iconPool.length];
  const SecondIcon = iconPool[(hash + 1) % iconPool.length];

  // Get initials: first character of first word, first character of last word
  const words = title.split(" ").filter(Boolean);
  const initials = words.length === 1 
    ? words[0].slice(0, 2).toUpperCase() 
    : (words[0][0] + words[words.length - 1][0]).toUpperCase();

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${gradient} relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      {/* Large decorative icon (bottom-right) */}
      <SecondIcon
        className="absolute -bottom-3 -right-3 w-20 h-20 text-white/15 rotate-12"
        strokeWidth={1}
      />

      {/* Top-left small glow */}
      <div className="absolute -top-6 -left-6 w-20 h-20 bg-white/15 rounded-full blur-xl" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-1.5">
        {/* Icon circle */}
        <div className={`w-14 h-14 rounded-2xl ${config?.iconBg ?? "bg-white/20"} backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-xl`}>
          <MainIcon className="w-7 h-7 text-white" strokeWidth={2} />
        </div>
        {/* Initials */}
        <span className="text-xs font-black text-white/80 tracking-widest uppercase mt-0.5 px-2 py-0.5 rounded-full bg-black/20">
          {initials}
        </span>
      </div>

      {/* Category label bottom */}
      {config && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">
            {config.label}
          </span>
        </div>
      )}
    </div>
  );
}
