"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Eye } from "lucide-react";
import { ProjectCoverPlaceholder } from "@/components/ui/ProjectCoverPlaceholder";
import TechStackTags from "@/components/ui/TechStackTags";
import { KARYA_CATEGORIES } from "@/types/karya";
import { formatNumber, toggleKaryaLike } from "@/lib/data";
import { getDeviceId } from "@/utils/identity";
import { supabase } from "@/lib/supabase";

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  cover_image?: string;
  image_url?: string;
  category?: string;
  tech_stack?: string[];
  tags?: string[];
  github_url?: string;
  demo_url?: string;
  drive_url?: string;
  figma_url?: string;
  youtube_url?: string;
  likes_count?: number;
  likes?: number;
  views_count?: number;
  views?: number;
  pending_edits?: any;
  status?: string;
  team?: Array<{ name: string; avatar?: string; user_id?: string; role?: string }>;
}

export function NeobrutalismProjectCard({
  project,
  authorProfile,
}: {
  project: ProjectData;
  authorProfile?: any;
}) {
  const router = useRouter();
  const coverUrl = project.cover_image || project.image_url;
  const initialLikes = project.likes_count ?? project.likes ?? 0;
  const initialViews = project.views_count ?? project.views ?? 0;

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const likedSaved = localStorage.getItem(`liked_${project.id}`) === "true";
      setIsLiked(likedSaved);
    }
  }, [project.id]);

  useEffect(() => {
    setLikesCount(project.likes_count ?? project.likes ?? 0);
  }, [project.likes_count, project.likes]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking) return;

    setIsLiking(true);
    const wasLiked = isLiked;
    const nextLiked = !wasLiked;

    // Optimistic UI update
    setIsLiked(nextLiked);
    setLikesCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      const deviceId = getDeviceId();
      const actionToTake = wasLiked ? "unlike" : "like";

      const confirmedLiked = await toggleKaryaLike(project.id, deviceId, userId, actionToTake);
      setIsLiked(confirmedLiked);
      if (confirmedLiked) {
        localStorage.setItem(`liked_${project.id}`, "true");
      } else {
        localStorage.removeItem(`liked_${project.id}`);
      }
    } catch (err) {
      console.error("Toggle like error:", err);
      // Revert if error
      setIsLiked(wasLiked);
      setLikesCount((prev) => Math.max(0, prev + (wasLiked ? 1 : -1)));
    } finally {
      setIsLiking(false);
    }
  };

  const categoryLabel =
    KARYA_CATEGORIES.find(
      (c) =>
        c.value.toLowerCase() === (project.category || "").toLowerCase() ||
        c.label.toLowerCase() === (project.category || "").toLowerCase()
    )?.label ?? (project.category || "Karya");

  const authorName =
    project.team?.[0]?.name || authorProfile?.full_name || "Karya Tazkia";
  const authorInitial = authorName.replace("[", "").charAt(0).toUpperCase();
  const authorAvatar = project.team?.[0]?.avatar || authorProfile?.avatar_url;
  const extraTeamCount = Math.max(0, (project.team?.length ?? 0) - 1);

  return (
    <article
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest("a") && !target.closest("button")) {
          router.push(`/project/${project.id}`);
        }
      }}
      className="kt-cardx relative rounded-[20px] border border-border bg-card overflow-hidden flex flex-col h-full group shadow-xs hover:border-[#FF8A2B] cursor-pointer"
    >
      {/* Cover Area with Hover Pill */}
      <div className="aspect-[16/10] w-full overflow-hidden relative bg-muted group/cover">
        <Link
          href={`/project/${project.id}`}
          className="block w-full h-full"
          onClick={(e) => e.stopPropagation()}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
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
          {categoryLabel}
        </span>

        {/* Floating like & view on top-right */}
        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-xs font-mono font-semibold shadow-xs border border-white/10">
            <Eye className="w-3.5 h-3.5 text-white/80" />
            <span>{formatNumber(initialViews)}</span>
          </div>
          <button
            type="button"
            onClick={handleToggleLike}
            disabled={isLiking}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-mono font-semibold shadow-xs transition-all cursor-pointer ${
              isLiked
                ? "bg-rose-500 text-white shadow-rose-500/25 border border-rose-400"
                : "bg-black/40 text-white/90 hover:bg-black/60 border border-white/10"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-white text-white" : ""}`} />
            <span>{formatNumber(likesCount)}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link
            href={`/project/${project.id}`}
            className="block group/title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base sm:text-lg font-bold text-foreground group-hover/title:text-[#FF8A2B] transition-colors line-clamp-1 mb-1.5">
              {project.title}
            </h3>
          </Link>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {project.description}
          </p>
        </div>

        {/* Tech Stack & Author */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
          {/* Tech Stack Badges */}
          <div className="flex-1 min-w-0">
            <TechStackTags
              techs={project.tech_stack || project.tags || []}
              maxVisible={2}
            />
          </div>

          {/* Author avatar & initial */}
          <div className="flex items-center gap-1.5 shrink-0">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-6 h-6 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-[10px] font-bold">
                {authorInitial}
              </div>
            )}
            {extraTeamCount > 0 && (
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                +{extraTeamCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
