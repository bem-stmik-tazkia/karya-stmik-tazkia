"use client";

import React from "react";
import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import type { Karya } from "@/types/karya";
import { KARYA_CATEGORIES } from "@/types/karya";
import { formatNumber } from "@/lib/data";
import { CuratorMedalBadge } from "@/components/home/CuratorMedalBadge";
import { ProjectCoverPlaceholder } from "@/components/ui/ProjectCoverPlaceholder";
import TechStackTags from "@/components/ui/TechStackTags";

interface ExploreSpotlightSectionProps {
  spotlightKarya: Karya[];
  likedKarya: Record<string, boolean>;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
}

export default function ExploreSpotlightSection({
  spotlightKarya,
  likedKarya,
  onToggleLike,
}: ExploreSpotlightSectionProps) {
  if (spotlightKarya.length < 3) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 pb-2">
      <div className="font-mono text-xs sm:text-sm font-bold text-[#FF8A2B] tracking-wider uppercase mb-1">
        KARYA TERBAIK
      </div>
      <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-foreground mb-6 sm:mb-8">
        Sorotan pilihan kurator
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {spotlightKarya.map((item, idx) => {
          const rank = (idx + 1) as 1 | 2 | 3;
          const isLiked = likedKarya[item.id];
          const likesCount = item.likes ?? 0;
          const categoryLabel =
            KARYA_CATEGORIES.find((c) => c.value === item.category)?.label ?? item.category;

          const authorName = item.team?.[0]?.name || "Karya Tazkia";
          const authorInitial = authorName.replace("[", "").charAt(0).toUpperCase();
          const extraTeamCount = Math.max(0, (item.team?.length ?? 0) - 1);

          return (
            <article
              key={`spotlight-${item.id}`}
              className="kt-cardx relative rounded-[20px] border border-border bg-card overflow-hidden flex flex-col group h-full shadow-xs hover:border-[#FF8A2B]"
            >
              {/* Cover Area with Hover Pill */}
              <div className="aspect-[16/10] w-full overflow-hidden relative bg-muted group/cover">
                <Link href={`/project/${item.id}`} className="block w-full h-full">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <ProjectCoverPlaceholder
                      id={item.id}
                      title={item.title}
                      category={item.category}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                </Link>

                {/* Rosette Medal Ribbon Badge Top-Left */}
                <div className="absolute top-3.5 left-3.5 z-20 pointer-events-none">
                  <CuratorMedalBadge rank={rank} delayIndex={idx} size={18} />
                </div>

                {/* Category Badge Top-Right */}
                <span className="absolute top-3.5 right-3.5 z-10 px-3 py-1 rounded-full bg-card/90 backdrop-blur-md border border-border/70 text-foreground text-xs font-semibold shadow-xs">
                  {categoryLabel}
                </span>

                {/* Hover Slide-up 'Lihat detail' pill button on bottom-right of cover */}
                <Link
                  href={`/project/${item.id}`}
                  className="kt-go hidden md:inline-flex absolute right-3.5 bottom-3.5 z-20 px-4 py-1.5 rounded-full bg-[#FF8A2B] text-[#1A0F05] text-xs sm:text-sm font-bold shadow-md hover:bg-[#ea580c] transition-colors"
                >
                  Lihat detail
                </Link>
              </div>

              {/* Card Content */}
              <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                <div>
                  <Link href={`/project/${item.id}`} className="block group/title">
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-foreground group-hover/title:text-[#FF8A2B] transition-colors line-clamp-1 mb-2">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4 font-normal">
                    {item.description}
                  </p>

                  <TechStackTags techs={item.tech_stack ?? []} maxVisible={3} className="mb-4" />
                </div>

                {/* Card Footer */}
                <div className="pt-3.5 border-t border-border flex items-center justify-between mt-auto">
                  {/* Author with initial circle avatar */}
                  <div className="flex items-center gap-2.5 min-w-0 max-w-[55%]">
                    <div className="w-[30px] h-[30px] rounded-full bg-[#FF8A2B] text-[#1A0F05] flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs">
                      {authorInitial}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                      {authorName}
                    </span>
                    {extraTeamCount > 0 && (
                      <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded-md font-semibold text-muted-foreground shrink-0">
                        +{extraTeamCount}
                      </span>
                    )}
                  </div>

                  {/* Views & Like Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="tabular-nums">{formatNumber(item.views ?? 0)}</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => onToggleLike(e, item.id)}
                      aria-label="Sukai karya"
                      className={`inline-flex items-center gap-1.5 min-h-[34px] px-3 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        isLiked
                          ? "border-[#FF8A2B] bg-[#FF8A2B]/15 text-[#FF8A2B]"
                          : "border-border bg-card text-muted-foreground hover:border-[#FF8A2B]/50 hover:text-foreground"
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                          isLiked ? "fill-[#FF8A2B] text-[#FF8A2B]" : "text-muted-foreground"
                        }`}
                      />
                      <span className="font-mono tabular-nums">{likesCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

