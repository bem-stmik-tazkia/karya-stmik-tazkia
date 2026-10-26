"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Folder,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
} from "lucide-react";
import type { Karya } from "@/types/karya";
import { KARYA_CATEGORIES } from "@/types/karya";
import { formatNumber } from "@/lib/data";
import TechStackTags from "@/components/ui/TechStackTags";
import { ProjectCoverPlaceholder } from "@/components/ui/ProjectCoverPlaceholder";

interface StudentProjectsSectionProps {
  studentName: string;
  studentAvatarUrl?: string | null;
  projects: Karya[];
  filteredProjects: Karya[];
  paginatedProjects: Karya[];
  availableCategories: { label: string; value: string }[];
  activeCategory: string;
  likedKarya: Record<string, boolean>;
  currentPage: number;
  totalPages: number;
  onCategoryChange: (cat: string) => void;
  onPageChange: (page: number) => void;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
}

export default function StudentProjectsSection({
  studentName,
  studentAvatarUrl,
  projects,
  filteredProjects,
  paginatedProjects,
  availableCategories,
  activeCategory,
  likedKarya,
  currentPage,
  totalPages,
  onCategoryChange,
  onPageChange,
  onToggleLike,
}: StudentProjectsSectionProps) {
  const shortName = studentName.split(" ")[0];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            Portofolio Karya
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            <span>Karya oleh {shortName}</span>
            <span className="text-sm text-muted-foreground font-normal">({projects.length})</span>
          </h2>
        </div>
      </div>

      {/* Category Filter */}
      {availableCategories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {availableCategories.map((cat) => (
            <button
              type="button"
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeCategory === cat.value
                  ? "bg-primary text-white shadow-xs font-semibold"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {filteredProjects.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProjects.map((project, index) => {
              const catLabel =
                KARYA_CATEGORIES.find((c) => c.value === project.category)?.label ??
                project.category;
              const isLiked = likedKarya[project.id] ?? false;
              const likesCount = project.likes ?? 0;
              const authorName = project.team?.[0]?.name || studentName;
              const authorInitial = authorName.replace("[", "").charAt(0).toUpperCase();
              const authorAvatar = project.team?.[0]?.avatar || studentAvatarUrl;
              const extraTeamCount = Math.max(0, (project.team?.length ?? 0) - 1);

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  className="h-full"
                >
                  <article className="kt-cardx relative rounded-[20px] border border-border bg-card overflow-hidden flex flex-col h-full group shadow-xs hover:border-[#FF8A2B]">
                    {/* Cover Area with Hover Pill */}
                    <div className="aspect-[16/10] w-full overflow-hidden relative bg-muted group/cover">
                      <Link href={`/project/${project.id}`} className="block w-full h-full">
                        {project.image_url ? (
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                        ) : (
                          <ProjectCoverPlaceholder
                            id={project.id}
                            title={project.title}
                            category={project.category}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                      </Link>

                      {/* Category Badge on top-left of cover */}
                      <span className="absolute top-3.5 left-3.5 z-10 px-3 py-1 rounded-full bg-card/90 backdrop-blur-md border border-border/70 text-foreground text-xs font-semibold shadow-xs">
                        {catLabel}
                      </span>

                      {/* Hover Slide-up 'Lihat detail' pill badge on bottom-right of cover */}
                      <Link
                        href={`/project/${project.id}`}
                        className="kt-go hidden md:inline-flex absolute right-3.5 bottom-3.5 z-20 px-4 py-1.5 rounded-full bg-[#FF8A2B] text-[#1A0F05] text-xs sm:text-sm font-bold shadow-md hover:bg-[#ea580c] transition-colors"
                      >
                        Lihat detail
                      </Link>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                      <div>
                        <Link href={`/project/${project.id}`} className="block group/title">
                          <h3 className="font-heading font-bold text-lg sm:text-xl text-foreground group-hover/title:text-[#FF8A2B] transition-colors line-clamp-1 mb-2">
                            {project.title}
                          </h3>
                        </Link>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4 font-normal">
                          {project.description}
                        </p>

                        {/* Colorful Tech Stack & Tool Chips */}
                        <TechStackTags
                          techs={project.tech_stack ?? []}
                          maxVisible={3}
                          className="mb-4"
                        />
                      </div>

                      {/* Card Footer */}
                      <div className="pt-3.5 border-t border-border flex items-center justify-between mt-auto">
                        {/* Author with initial circle avatar */}
                        <div className="flex items-center gap-2.5 min-w-0 max-w-[55%]">
                          <div className="w-[30px] h-[30px] rounded-full bg-[#FF8A2B] text-[#1A0F05] flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs overflow-hidden">
                            {authorAvatar ? (
                              <img
                                src={authorAvatar}
                                alt={authorName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              authorInitial
                            )}
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
                            <span className="tabular-nums">
                              {formatNumber(project.views ?? 0)}
                            </span>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => onToggleLike(e, project.id)}
                            aria-label="Sukai karya"
                            className={`inline-flex items-center gap-1.5 min-h-[34px] px-3 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                              isLiked
                                ? "border-[#FF8A2B] bg-[#FF8A2B]/15 text-[#FF8A2B]"
                                : "border-border bg-card text-muted-foreground hover:border-[#FF8A2B]/50 hover:text-foreground"
                            }`}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                                isLiked
                                  ? "fill-[#FF8A2B] text-[#FF8A2B]"
                                  : "text-muted-foreground"
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
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-card border border-border text-xs font-medium disabled:opacity-40 hover:bg-muted transition-all shadow-xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`w-9 h-9 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-card border-border text-foreground hover:bg-muted shadow-xs"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-card border border-border text-xs font-medium text-foreground disabled:opacity-40 hover:bg-muted shadow-xs transition-all cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-card border border-border rounded-2xl shadow-xs">
          <p className="text-sm font-medium text-muted-foreground">
            Belum ada karya yang diunggah oleh mahasiswa ini.
          </p>
        </div>
      )}
    </div>
  );
}

