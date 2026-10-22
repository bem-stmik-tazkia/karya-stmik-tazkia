"use client";

import React from "react";
import StandardStudentCard from "../umum/StandardStudentCard";
import type { SkinDefinition, SkinCardProps } from "./types";

/**
 * 🎓 Komponen Kartu: Tazkia Classic (Official Campus Edition)
 * ─────────────────────────────────────────────────────────
 * Skin bawaan resmi STMIK Tazkia dengan aksen Deep Navy & Vibrant Orange.
 */
export const ClassicCardComponent: React.FC<SkinCardProps> = (props) => {
  return (
    <StandardStudentCard
      {...props}
      primaryColor="#FF8A2B"
      secondaryColor="#0B1F4A"
      outerBorderClassName="p-[1.5px] bg-gradient-to-br from-orange-400/30 via-slate-300 dark:via-slate-700 to-orange-500/30 shadow-[0_10px_28px_rgba(255,138,43,0.18)]"
      watermarkElement={
        <div className="pointer-events-none absolute right-2 bottom-20 opacity-[0.04] dark:opacity-[0.07] z-0 font-black text-6xl tracking-tighter text-orange-500 select-none">
          TAZKIA
        </div>
      }
      bannerOverlay={
        <>
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1.2px,transparent_1.2px)] [background-size:14px_14px] pointer-events-none" />
          <div className="absolute -right-8 -top-10 w-44 h-44 bg-gradient-to-bl from-orange-400/20 via-sky-500/15 to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 bem-shimmer-sweep pointer-events-none" />
        </>
      }
      dividerClassName="h-[3.5px] w-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 shadow-[0_2px_10px_rgba(255,138,43,0.4)]"
      backOverlay={
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#FF8A2B_1px,transparent_1px)] [background-size:14px_14px]" />
      }
    />
  );
};

export const SkinClassic: SkinDefinition = {
  id: "classic",
  name: "Tazkia Classic",
  tagline: "Identitas resmi kampus STMIK Tazkia",
  badge: "Bawaan",
  tier: "standard",
  group: "umum",
  description:
    "Kombinasi solid Deep Navy (#0B1F4A) dengan aksen Vibrant Orange (#FF8A2B). Skin default semua mahasiswa.",
  primaryColor: "#FF8A2B",
  secondaryColor: "#0B1F4A",
  headerGradient: "linear-gradient(135deg, #0B1F4A 0%, #16347A 60%, #1e4599 100%)",
  previewBg: "from-[#0B1F4A] to-[#16347A]",
  CardComponent: ClassicCardComponent,
};

export default SkinClassic;

