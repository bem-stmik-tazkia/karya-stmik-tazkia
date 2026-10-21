"use client";

import React, { useState } from "react";
import type { Karya } from "@/types/karya";
import {
  Globe,
  Smartphone,
  Cpu,
  BookOpen,
  Palette,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

interface FloatingHeroCardsProps {
  karyaList?: Karya[];
  onSelectCategory?: (category: string) => void;
}

interface CategoryCardItem {
  id: string;
  tag: string;
  title: string;
  desc: string;
  categoryKey: string;
  coverTheme: "web" | "mobile" | "iot" | "riset" | "desain";
}

const CATEGORIES_DATA: CategoryCardItem[] = [
  {
    id: "web",
    tag: "WEBSITE",
    title: "Website",
    desc: "Sistem informasi, web app, & portal kampus",
    categoryKey: "Technology",
    coverTheme: "web",
  },
  {
    id: "mobile",
    tag: "MOBILE",
    title: "Mobile Apps",
    desc: "Aplikasi Android, iOS, & solusi mobile",
    categoryKey: "Programming",
    coverTheme: "mobile",
  },
  {
    id: "iot",
    tag: "IOT",
    title: "IoT & Robotika",
    desc: "Hardware cerdas, sensor ESP32, & robotika",
    categoryKey: "IoT",
    coverTheme: "iot",
  },
  {
    id: "riset",
    tag: "RISET",
    title: "Riset / Jurnal",
    desc: "Karya ilmiah, paper penelitian, & jurnal akademik",
    categoryKey: "Research",
    coverTheme: "riset",
  },
  {
    id: "desain",
    tag: "DESAIN & LAINNYA",
    title: "Desain & Lainnya",
    desc: "UI/UX design, grafis, video, & multimedia",
    categoryKey: "Multimedia",
    coverTheme: "desain",
  },
];

// ── Pure Category Visual Cover (Menampilkan Kategori Karya, Bukan Proyek Orang Tertentu) ──
function CategoryCoverVisual({
  theme,
}: {
  theme: "web" | "mobile" | "iot" | "riset" | "desain";
}) {
  switch (theme) {
    case "web":
      return (
        <div className="w-full h-full bg-[#101D38] p-5 flex flex-col justify-between rounded-[14px] border border-[#20365F] relative overflow-hidden">
          {/* Browser Window Header */}
          <div className="flex items-center gap-1.5 pb-2.5 border-b border-[#1E345D]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="ml-2 font-mono text-[10px] text-[#8FA5C8] bg-[#0A1326] px-2 py-0.5 rounded">
              karyatazkia.ac.id/web
            </span>
          </div>

          {/* Central Visual Icon & Layout */}
          <div className="my-auto flex flex-col items-center justify-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-[#FF8A2B]/15 border border-[#FF8A2B]/40 flex items-center justify-center text-[#FF8A2B] shadow-lg shadow-orange-500/10">
              <Globe className="w-8 h-8 stroke-[1.8]" />
            </div>
            <span className="font-heading font-bold text-sm text-[#F2F5FA]">
              Web &amp; Sistem Informasi
            </span>
          </div>

          {/* Bottom Tags */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1E345D] text-[10px] font-mono text-[#8FA5C8]">
            <span className="text-[#FF8A2B]">React • Next.js • Laravel</span>
            <span>Portal</span>
          </div>
        </div>
      );

    case "mobile":
      return (
        <div className="w-full h-full bg-[#0E1A33] p-5 flex flex-col items-center justify-between rounded-[14px] border border-[#20365F] relative overflow-hidden">
          {/* Header Badge */}
          <div className="w-full flex justify-between items-center text-[10px] font-mono text-[#60A5FA]">
            <span>MOBILE ECOSYSTEM</span>
            <span className="bg-[#132854] px-2 py-0.5 rounded text-[#94A9C9]">Android • iOS</span>
          </div>

          {/* Center Phone Frame Graphic */}
          <div className="my-auto flex flex-col items-center justify-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-[#60A5FA] shadow-lg shadow-blue-500/10">
              <Smartphone className="w-8 h-8 stroke-[1.8]" />
            </div>
            <span className="font-heading font-bold text-sm text-[#F2F5FA]">
              Aplikasi Mobile Kampus
            </span>
          </div>

          {/* Bottom Tags */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-[#1E345D] text-[10px] font-mono text-[#8FA5C8]">
            <span className="text-[#60A5FA]">Flutter • Kotlin • Swift</span>
            <span>Mobile App</span>
          </div>
        </div>
      );

    case "iot":
      return (
        <div className="w-full h-full bg-[#0A1428] p-5 flex flex-col justify-between rounded-[14px] border border-[#20365F] relative overflow-hidden">
          {/* Header */}
          <div className="w-full flex justify-between items-center text-[10px] font-mono text-[#38BDF8]">
            <span>HARDWARE &amp; EMBEDDED</span>
            <span className="bg-[#0D1F38] px-2 py-0.5 rounded text-[#94A9C9]">ESP32 • Sensor</span>
          </div>

          {/* Center Chip & Icon Graphic */}
          <div className="my-auto flex flex-col items-center justify-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-[#38BDF8] shadow-lg shadow-cyan-500/10">
              <Cpu className="w-8 h-8 stroke-[1.8]" />
            </div>
            <span className="font-heading font-bold text-sm text-[#F2F5FA]">
              Internet of Things &amp; Robotika
            </span>
          </div>

          {/* Bottom Tags */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-[#1E345D] text-[10px] font-mono text-[#8FA5C8]">
            <span className="text-[#38BDF8]">Arduino • Microcontroller</span>
            <span>Smart Device</span>
          </div>
        </div>
      );

    case "riset":
      return (
        <div className="w-full h-full bg-[#111A30] p-5 flex flex-col justify-between rounded-[14px] border border-[#20365F] relative overflow-hidden">
          {/* Header */}
          <div className="w-full flex justify-between items-center text-[10px] font-mono text-[#A78BFA]">
            <span>AKADEMIK &amp; RISET</span>
            <span className="bg-[#19223D] px-2 py-0.5 rounded text-[#94A9C9]">Peer-Reviewed</span>
          </div>

          {/* Center Academic Book Icon */}
          <div className="my-auto flex flex-col items-center justify-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/40 flex items-center justify-center text-[#A78BFA] shadow-lg shadow-violet-500/10">
              <BookOpen className="w-8 h-8 stroke-[1.8]" />
            </div>
            <span className="font-heading font-bold text-sm text-[#F2F5FA]">
              Karya Ilmiah &amp; Publikasi
            </span>
          </div>

          {/* Bottom Tags */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-[#1E345D] text-[10px] font-mono text-[#8FA5C8]">
            <span className="text-[#A78BFA]">Paper • Jurnal • Skripsi</span>
            <span>Penelitian</span>
          </div>
        </div>
      );

    case "desain":
      return (
        <div className="w-full h-full bg-[#181329] p-5 flex flex-col justify-between rounded-[14px] border border-[#30234D] relative overflow-hidden">
          {/* Header */}
          <div className="w-full flex justify-between items-center text-[10px] font-mono text-[#FB923C]">
            <span>KREATIF &amp; MULTIMEDIA</span>
            <span className="bg-[#231A3D] px-2 py-0.5 rounded text-[#94A9C9]">UI/UX • Grafis</span>
          </div>

          {/* Center Palette Graphic */}
          <div className="my-auto flex flex-col items-center justify-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/40 flex items-center justify-center text-[#FB923C] shadow-lg shadow-orange-500/10">
              <Palette className="w-8 h-8 stroke-[1.8]" />
            </div>
            <span className="font-heading font-bold text-sm text-[#F2F5FA]">
              Desain &amp; Media Kreatif
            </span>
          </div>

          {/* Bottom Tags */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-[#291F40] text-[10px] font-mono text-[#8FA5C8]">
            <span className="text-[#FB923C]">Figma • Motion • Branding</span>
            <span>Karya Desain</span>
          </div>
        </div>
      );
  }
}

export function FloatingHeroCards({
  karyaList = [],
  onSelectCategory,
}: FloatingHeroCardsProps) {
  const [front, setFront] = useState(0);

  const total = CATEGORIES_DATA.length; // 5

  const prev = () => setFront((prev) => (prev + total - 1) % total);
  const next = () => setFront((prev) => (prev + 1) % total);

  const handleCardClick = (pos: number, index: number, catKey: string) => {
    if (pos === 0) {
      next();
    } else {
      setFront(index);
    }
    if (onSelectCategory) {
      onSelectCategory(catKey);
    }
  };

  const frontNo = "0" + (front + 1);

  return (
    <div className="w-full max-w-[480px] mx-auto select-none">
      {/* ── INTERACTIVE 5-CATEGORY CARD STACK FRAME ── */}
      <div className="relative h-[410px] sm:h-[420px] w-full max-w-[290px] xs:max-w-[320px] sm:max-w-[340px] mx-auto sm:ml-0">
        {CATEGORIES_DATA.map((card, i) => {
          const pos = (i - front + total) % total;
          const isFront = pos === 0;

          const categoryCount = karyaList.filter(
            (k) => k.category === card.categoryKey
          ).length;

          return (
            <div
              key={card.id}
              className={`kt-stack kt-pos-${pos <= 2 ? pos : "rest"} absolute top-[44px] left-0 w-full max-w-[290px] xs:max-w-[320px] sm:max-w-[340px] box-border p-[14px] rounded-[22px] bg-white dark:bg-[#121B2E] border ${
                isFront
                  ? "border-[#FF8A2B] shadow-xl shadow-orange-500/10 ring-1 ring-[#FF8A2B]/30"
                  : "border-slate-200 dark:border-[#22304A] shadow-md dark:shadow-none"
              }`}
              style={{
                pointerEvents: pos <= 2 ? "auto" : "none",
              }}
            >
              <button
                type="button"
                onClick={() => handleCardClick(pos, i, card.categoryKey)}
                aria-label={
                  isFront
                    ? `Kategori ${card.title}, klik untuk kategori berikutnya`
                    : `Bawa kategori ${card.title} ke depan`
                }
                className="all-unset block w-full cursor-pointer text-left focus:outline-none"
              >
                {/* Visual Cover Box Khusus Kategori */}
                <div className="h-[200px] rounded-[14px] bg-[#1B2B4B] overflow-hidden relative shadow-inner">
                  <CategoryCoverVisual theme={card.coverTheme} />
                </div>

                {/* Info Kategori (Bukan Proyek Orang Tertentu) */}
                <div className="pt-4 px-1 pb-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#FF8A2B] tracking-wider uppercase">
                      {card.tag}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-[#1E3A8A] bg-blue-50 border border-blue-200 dark:text-[#A9B6CC] dark:bg-[#1A2B4B] dark:border-[#233A66] px-2.5 py-0.5 rounded-full">
                      {categoryCount > 0 ? `${categoryCount}+ Karya` : "Tersedia"}
                    </span>
                  </div>

                  <div className="font-heading font-extrabold text-[24px] text-slate-900 dark:text-[#F2F5FA] leading-[1.2] my-1.5 line-clamp-1">
                    {card.title}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-[#A9B6CC] line-clamp-1 m-0">
                    {card.desc}
                  </p>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* ── NAVIGATION CONTROLS (Navy & Orange + 01 / 05) ── */}
      <div className="flex items-center justify-center sm:justify-start gap-3.5 mt-5 pl-1">
        {/* Left Arrow Button (True Tazkia Navy Blue) */}
        <button
          type="button"
          onClick={prev}
          aria-label="Kategori sebelumnya"
          className="w-12 h-12 rounded-xl border border-[#1E3A8A] bg-[#1E3A8A] text-white hover:bg-[#1E40AF] hover:border-[#1E40AF] dark:border-[#33456A] dark:bg-[#121B2E] dark:text-[#F2F5FA] dark:hover:border-[#FF8A2B] dark:hover:text-[#FF8A2B] cursor-pointer flex items-center justify-center active:scale-95 transition-all shadow-md shadow-blue-900/20"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
        </button>

        {/* Right Arrow Button (Vivid Tazkia Orange) */}
        <button
          type="button"
          onClick={next}
          aria-label="Kategori berikutnya"
          className="w-12 h-12 rounded-xl border border-[#FF8A2B] bg-[#FF8A2B] text-white dark:text-[#1A0F05] cursor-pointer flex items-center justify-center hover:bg-[#ea580c] active:scale-95 transition-all shadow-md shadow-orange-500/25"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Counter (01 / 05) */}
        <span className="font-mono text-[13px] font-bold text-[#1E3A8A] dark:text-[#A9B6CC] tracking-widest ml-1 select-none">
          {frontNo} / 05
        </span>
      </div>
    </div>
  );
}
