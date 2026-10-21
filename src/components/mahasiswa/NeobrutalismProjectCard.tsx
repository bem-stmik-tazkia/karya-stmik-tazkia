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

        {/* Status Badge (Pending / Pending Edits / Rejected) on top-right of cover */}
        {project.status === "pending" ? (
          <span className="absolute top-3.5 right-3.5 z-10 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/90 backdrop-blur-md text-white border border-blue-400/50 shadow-xs">
            Menunggu (Baru)
          </span>
        ) : project.pending_edits ? (
          <span className="absolute top-3.5 right-3.5 z-10 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/90 backdrop-blur-md text-white border border-amber-400/50 shadow-xs">
            Menunggu (Edit)
          </span>
        ) : project.status === "rejected" ? (
          <span className="absolute top-3.5 right-3.5 z-10 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/90 backdrop-blur-md text-white border border-rose-400/50 shadow-xs">
            Ditolak
          </span>
        ) : null}

        {/* Hover Slide-up 'Lihat detail' pill badge on bottom-right of cover */}
        <Link
          href={`/project/${project.id}`}
          onClick={(e) => e.stopPropagation()}
          className="kt-go hidden md:inline-flex absolute right-3.5 bottom-3.5 z-20 px-4 py-1.5 rounded-full bg-[#FF8A2B] text-[#1A0F05] text-xs sm:text-sm font-bold shadow-md hover:bg-[#ea580c] transition-colors"
        >
          Lihat detail
        </Link>
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
        <div>
          <Link
            href={`/project/${project.id}`}
            onClick={(e) => e.stopPropagation()}
            className="block group/title"
          >
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
                {formatNumber(initialViews)}
              </span>
            </span>

            <button
              type="button"
              onClick={handleToggleLike}
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
              <span className="font-mono tabular-nums">
                {likesCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
