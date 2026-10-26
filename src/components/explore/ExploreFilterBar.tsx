"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { KARYA_CATEGORIES } from "@/types/karya";

interface ExploreFilterBarProps {
  activeCategory: string;
  categoryCounts: Record<string, number>;
  totalResults: number;
  hasActiveFilters: boolean;
  sortBy: "newest" | "likes" | "views" | "az";
  onCategoryChange: (cat: string) => void;
  onSortChange: (sort: "newest" | "likes" | "views" | "az") => void;
  onResetFilters: () => void;
}

export default function ExploreFilterBar({
  activeCategory,
  categoryCounts,
  totalResults,
  hasActiveFilters,
  sortBy,
  onCategoryChange,
  onSortChange,
  onResetFilters,
}: ExploreFilterBarProps) {
  return (
    <div>
      {/* Category Filter Pills with Live Item Counts */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-8">
        {KARYA_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.value;
          const count = categoryCounts[cat.value] ?? 0;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onCategoryChange(cat.value)}
              className={`min-h-[44px] px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-[#FF8A2B] text-[#1A0F05] border border-[#FF8A2B] font-bold shadow-xs"
                  : "bg-card border border-border text-foreground hover:border-[#FF8A2B]/50 hover:bg-muted/40"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`font-mono text-xs ml-0.5 px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-black/15 text-[#1A0F05]" : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results Info Bar & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="text-sm sm:text-base text-muted-foreground">
            Menampilkan{" "}
            <strong className="text-foreground font-bold">{totalResults}</strong> karya
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs sm:text-sm text-[#FF8A2B] hover:underline font-semibold cursor-pointer ml-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label htmlFor="urut" className="text-xs sm:text-sm text-muted-foreground font-medium">
            Urutkan
          </label>
          <select
            id="urut"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#FF8A2B]/30 focus:border-[#FF8A2B] outline-none cursor-pointer transition-all shadow-2xs"
          >
            <option value="newest">Terbaru</option>
            <option value="views">Terpopuler</option>
            <option value="likes">Paling disukai</option>
            <option value="az">Nama (A - Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

