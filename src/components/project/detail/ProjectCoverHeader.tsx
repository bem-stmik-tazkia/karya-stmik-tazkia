"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye, Heart } from "lucide-react";
import type { Karya } from "@/types/karya";
import { formatNumber } from "@/lib/data";
import { ProjectCoverPlaceholder } from "@/components/ui/ProjectCoverPlaceholder";

interface ProjectCoverHeaderProps {
  karya: Karya;
  categoryLabel: string;
  likedLocal: boolean;
  likeCount: number;
  isLiking: boolean;
  onLike: () => void;
}

export default function ProjectCoverHeader({
  karya,
  categoryLabel,
  likedLocal,
  likeCount,
  isLiking,
  onLike,
}: ProjectCoverHeaderProps) {
  return (
    <div className="relative">
      {karya.image_url && (
        <div
          className="absolute -inset-2.5 sm:-inset-4 bg-cover bg-center rounded-3xl blur-2xl opacity-20 dark:opacity-35 -z-10 pointer-events-none transition-opacity"
          style={{ backgroundImage: `url(${karya.image_url})` }}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl overflow-hidden border border-border shadow-xs bg-card relative"
      >
        <div className="aspect-[16/9] relative bg-muted">
          {karya.image_url ? (
            <img src={karya.image_url} alt={karya.title} className="object-cover w-full h-full" />
          ) : (
            <ProjectCoverPlaceholder id={karya.id} title={karya.title} />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />

          {/* Category Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-background/90 backdrop-blur-md text-foreground border border-border/50 shadow-xs">
              {categoryLabel}
            </span>
          </div>

          {/* Interactive Stats Pill */}
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 p-1.5 bg-background/90 backdrop-blur-md border border-border/60 rounded-xl shadow-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Eye className="w-3.5 h-3.5" />
              <span>{formatNumber(karya.views ?? 0)} Views</span>
            </div>

            <div className="w-px h-4 bg-border/60" />

            <button
              type="button"
              onClick={onLike}
              disabled={isLiking}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                likedLocal
                  ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  : "text-muted-foreground hover:bg-muted hover:text-red-500"
              } ${isLiking ? "opacity-70 cursor-wait" : ""}`}
              title={likedLocal ? "Batal suka" : "Sukai karya ini"}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                  likedLocal ? "fill-red-500 text-red-500" : ""
                }`}
              />
              <span>{formatNumber(likeCount)} Suka</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

