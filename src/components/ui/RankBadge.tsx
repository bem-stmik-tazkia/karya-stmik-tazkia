import React from "react";
import { Trophy, Flame, Award } from "lucide-react";

interface RankBadgeProps {
  rank: number;
  className?: string;
}

export function RankBadge({ rank, className = "" }: RankBadgeProps) {
  if (rank < 1 || rank > 3) return null;

  const config = {
    1: {
      number: "#01",
      label: "Utama",
      icon: Trophy,
      badgeClass:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 shadow-amber-500/5",
      iconClass: "text-amber-500",
    },
    2: {
      number: "#02",
      label: "Populer",
      icon: Flame,
      badgeClass:
        "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25 shadow-orange-500/5",
      iconClass: "text-orange-500",
    },
    3: {
      number: "#03",
      label: "Pilihan",
      icon: Award,
      badgeClass:
        "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20 shadow-slate-500/5",
      iconClass: "text-slate-500 dark:text-slate-400",
    },
  }[rank as 1 | 2 | 3];

  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md text-xs font-medium ${config.badgeClass} transition-transform duration-200 select-none ${className}`}
    >
      <Icon className={`w-3.5 h-3.5 shrink-0 ${config.iconClass}`} />
      <span className="font-mono font-bold tracking-tight">{config.number}</span>
      <span className="opacity-70 text-[11px] font-sans">|</span>
      <span className="text-[11px] font-medium">{config.label}</span>
    </div>
  );
}

