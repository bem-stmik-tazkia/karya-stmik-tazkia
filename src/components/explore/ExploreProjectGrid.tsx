"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, Heart, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import type { Karya } from "@/types/karya";
import { KARYA_CATEGORIES } from "@/types/karya";
import { formatNumber } from "@/lib/data";
import { SkeletonProjectCard } from "@/components/ui/Skeleton";
import { ProjectCoverPlaceholder } from "@/components/ui/ProjectCoverPlaceholder";
import TechStackTags from "@/components/ui/TechStackTags";

interface ExploreProjectGridProps {
  loading: boolean;
  paginatedKarya: Karya[];
  likedKarya: Record<string, boolean>;
  currentPage: number;
  totalPages: number;
  totalFiltered: number;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
}

export default function ExploreProjectGrid({
  loading,
  paginatedKarya,
  likedKarya,
  currentPage,
  totalPages,
  totalFiltered,
  onToggleLike,
  onPageChange,
  onResetFilters,
}: ExploreProjectGridProps) {
  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonProjectCard key={i} />
          ))}
        </motion.div>
      ) : totalFiltered > 0 ? (
        <>
          <motion.div
            key="content"
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
          >
            {paginatedKarya.map((item) => {
              const isLiked = likedKarya[item.id];
              const likesCount = item.likes ?? 0;
              const categoryLabel =
                KARYA_CATEGORIES.find((c) => c.value === item.category)?.label ?? item.category;

              const authorName = item.team?.[0]?.name || "Karya Tazkia";
              const authorInitial = authorName.replace("[", "").charAt(0).toUpperCase();
              const extraTeamCount = Math.max(0, (item.team?.length ?? 0) - 1);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  key={item.id}
                  className="h-full"
                >
                  <article className="kt-cardx relative rounded-[20px] border border-border bg-card overflow-hidden flex flex-col h-full group shadow-xs hover:border-[#FF8A2B]">
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

                      {/* Category Badge on top-left of cover */}
                      <span className="absolute top-3.5 left-3.5 z-10 px-3 py-1 rounded-full bg-card/90 backdrop-blur-md border border-border/70 text-foreground text-xs font-semibold shadow-xs">
                        {categoryLabel}
                      </span>

                      {/* Hover Slide-up 'Lihat detail' pill badge on bottom-right of cover */}
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

                        {/* Views & Like Button in Pill style */}
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
                </motion.div>
              );
            })}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="mt-12 flex justify-center items-center gap-2"
              role="navigation"
              aria-label="Halaman"
            >
              <button
                type="button"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 min-h-[44px] px-4 rounded-full bg-card border border-border text-xs sm:text-sm font-semibold text-foreground disabled:opacity-40 hover:bg-muted transition-all cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`min-w-[44px] min-h-[44px] rounded-full border text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center ${
                    currentPage === page
                      ? "bg-[#FF8A2B] text-[#1A0F05] border-[#FF8A2B] font-bold shadow-xs"
                      : "bg-card border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 min-h-[44px] px-4 rounded-full bg-card border border-border text-xs sm:text-sm font-semibold text-foreground disabled:opacity-40 hover:bg-muted transition-all cursor-pointer shadow-xs"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-dashed border-border rounded-[20px] p-10 sm:p-14 text-center max-w-lg mx-auto my-12 bg-card/40"
        >
          <div className="w-12 h-12 rounded-full bg-[#FF8A2B]/10 text-[#FF8A2B] flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 font-heading">
            Belum ada karya yang cocok
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm mb-6 leading-relaxed">
            Coba pilih kategori lain atau gunakan kata kunci pencarian yang berbeda.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FF8A2B] text-[#1A0F05] text-xs sm:text-sm font-bold shadow-xs hover:bg-[#ea580c] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Pencarian</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

