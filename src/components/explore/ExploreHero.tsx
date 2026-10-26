"use client";

import React from "react";
import Link from "next/link";
import { Search, X, UploadCloud } from "lucide-react";

export const POPULAR_TAGS = [
  "Next.js",
  "Flutter",
  "Python AI",
  "IoT",
  "Figma",
  "Laravel",
  "Riset",
];

interface ExploreHeroProps {
  isLoggedIn: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTag: (tag: string) => void;
}

export default function ExploreHero({
  isLoggedIn,
  searchQuery,
  onSearchChange,
  onSelectTag,
}: ExploreHeroProps) {
  return (
    <section
      id="atas"
      className="w-full border-b border-border bg-slate-50/70 dark:bg-[#0F192D]/70 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-18 pb-10 sm:pb-14 flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-12">
        <div className="max-w-2xl">
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-foreground mb-4">
            Eksplorasi karya{" "}
            <span className="text-[#FF8A2B] dark:text-[#FF8A2B]">STMIK Tazkia</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
            Proyek sistem informasi, mobile apps, riset ilmiah, dan karya multimedia ciptaan mahasiswa
            STMIK Tazkia.
          </p>
        </div>

        <Link
          href={isLoggedIn ? "/submit" : "/login"}
          className="inline-flex items-center gap-2.5 h-[52px] sm:h-[56px] px-7 sm:px-8 rounded-full bg-[#FF8A2B] text-[#1A0F05] font-bold text-sm sm:text-base shadow-[0_5px_0_#B35A12] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_#B35A12] transition-all shrink-0 self-start md:self-auto cursor-pointer"
        >
          <UploadCloud className="w-5 h-5 stroke-[2.2]" />
          <span>Upload karya anda</span>
        </Link>
      </div>

      {/* Search Input & Quick Filter Chips */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-12">
        <div className="relative max-w-3xl">
          <label htmlFor="cari" className="sr-only">
            Cari karya
          </label>
          <Search className="w-5 h-5 text-muted-foreground absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="cari"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari judul karya, teknologi (mis: Next.js, IoT), riset, atau nama mahasiswa..."
            className="w-full h-14 pl-13 pr-12 rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm sm:text-base font-normal shadow-xs focus:outline-hidden focus:border-[#FF8A2B] focus:ring-4 focus:ring-[#FF8A2B]/15 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
          <span className="text-muted-foreground font-semibold mr-1">Populer:</span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectTag(tag)}
              className="px-3 py-1 rounded-full border border-border bg-card/60 hover:bg-card hover:border-[#FF8A2B] text-foreground transition-all cursor-pointer shadow-2xs font-medium"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

