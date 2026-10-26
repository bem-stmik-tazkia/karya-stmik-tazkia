"use client";

import React from "react";
import StandardStudentCard from "@/components/cards/base/StandardStudentCard";
import type { SkinDefinition, SkinCardProps } from "../types";

/**
 * 👑 Komponen Kartu Eksklusif: BEM Tazkia 2026
 * ──────────────────────────────────────────────
 * Menghadirkan visual eksklusif Mythic BEM Tazkia 2026 yang bersih,
 * mewah, dan berkelas:
 * - Bingkai emas gradient bersinar (gold border glow) melengkung rapi
 * - Header banner navy Tazkia dengan shimmer sweep emas halus
 * - Floating pill eksekutif "BEM EKSEKUTIF '26" di sisi kanan divider
 * - Avatar dengan cincin emas berputar & lencana kepengurusan 26
 * - Watermark angka 2026 di sudut kanan bawah (tidak menutupi teks bio/skill)
 * - Teks & bio berlatar bersih dengan kontras tinggi (sesuai tema light/dark)
 * - Lingkaran sosial media menyala bercahaya
 * - Bagian belakang kartu (Lemari Penghargaan) elegan beraksen emas
 */
export const BEM2026CardComponent: React.FC<SkinCardProps> = (props) => {
  return (
    <StandardStudentCard
      {...props}
      primaryColor="#f59e0b"
      secondaryColor="#071936"
      outerBorderClassName="p-[2px] rounded-[22px] bg-gradient-to-br from-amber-400 via-yellow-400 via-orange-500 to-amber-500 shadow-[0_12px_32px_rgba(245,158,11,0.35)]"
      watermarkElement={
        <div className="pointer-events-none absolute right-3 bottom-24 opacity-[0.06] dark:opacity-[0.09] z-0 font-black text-7xl tracking-tighter text-amber-500 select-none">
          2026
        </div>
      }
      bannerOverlay={
        <>
          {/* Subtle golden ambient matrix without stray floating circle dots */}
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#f59e0b_1.2px,transparent_1.2px)] [background-size:14px_14px] pointer-events-none" />
          <div className="absolute -right-8 -top-10 w-48 h-48 bg-gradient-to-bl from-amber-400/30 via-orange-500/15 to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-full blur-xl pointer-events-none" />
          <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-200/25 to-transparent -skew-x-12 bem-shimmer-sweep pointer-events-none" />
        </>
      }
      floatingPill={
        <div className="absolute -top-3.5 right-3.5 z-20 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 text-[9.5px] font-black tracking-wider uppercase shadow-md flex items-center gap-1 border border-amber-200 pointer-events-none">
          <span>BEM EKSEKUTIF &apos;26</span>
        </div>
      }
      avatarDecoration={
        <>
          {/* Spinning gold ring */}
          <div className="absolute -inset-[5px] rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-orange-500 animate-spin [animation-duration:8s] opacity-90 blur-[1px] z-0 pointer-events-none" />
          {/* Lencana 26 */}
          <div
            title="Angkatan Kepengurusan BEM 2026"
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-tighter shadow-md border-2 border-white leading-none z-20 pointer-events-none"
          >
            26
          </div>
        </>
      }
      dividerClassName="h-[3.5px] w-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.5)]"
      backContainerClassName="bg-gradient-to-b from-[#0a1e42] via-[#07152f] to-[#030a17]"
      backHeaderTitle={
        <span className="text-amber-300 font-black tracking-wider uppercase text-[10px]">
          LEMARI PENGHARGAAN
        </span>
      }
      backOverlay={
        <>
          <div className="absolute -top-14 -right-14 w-48 h-48 bg-amber-500/25 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-14 -left-14 w-44 h-44 bg-yellow-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:12px_12px]" />
        </>
      }
    />
  );
};

export const SkinBEM2026: SkinDefinition = {
  id: "bem2026",
  name: "BEM Tazkia 2026",
  tagline: "Edisi kehormatan eksklusif pengurus BEM 2026",
  badge: "BEM '26 · Mythic",
  tier: "mythic",
  group: "khusus",
  requiredBadgeId: 15,
  unlockRequirement: "Dikhususkan untuk penerima Lencana Kehormatan Vanguard BEM 2026.",
  description:
    "Skin kehormatan kepengurusan BEM 2026 dengan bingkai emas berkilau, watermark 2026, lencana kepengurusan, dan lemari penghargaan eksklusif.",
  primaryColor: "#f59e0b",
  secondaryColor: "#071936",
  headerGradient: "linear-gradient(135deg, #071936 0%, #132a56 50%, #2e1f10 100%)",
  previewBg: "from-[#071936] via-[#132a56] to-[#2e1f10]",
  CardComponent: BEM2026CardComponent,
};

export default SkinBEM2026;

