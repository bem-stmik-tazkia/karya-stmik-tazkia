"use client";

import React from "react";
import Link from "next/link";
import { FiGithub, FiExternalLink, FiHeart, FiEye } from "react-icons/fi";
import { ProjectCoverPlaceholder } from "@/components/ui/ProjectCoverPlaceholder";

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  cover_image?: string;
  category?: string;
  tech_stack?: string[];
  tags?: string[];
  github_url?: string;
  demo_url?: string;
  drive_url?: string;
  figma_url?: string;
  youtube_url?: string;
  likes_count?: number;
  views_count?: number;
  pending_edits?: any;
  status?: string;
}

// Peta warna badge per-kategori, konsisten dengan ProjectCoverPlaceholder
const CATEGORY_BADGE: Record<string, string> = {
  Technology: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600",
  Programming: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600",
  Research: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-600",
  IoT: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600",
  Multimedia: "bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-600",
};

const CATEGORY_LABEL: Record<string, string> = {
  Technology: "Aplikasi Web",
  Programming: "Aplikasi Mobile",
  Research: "Riset & Jurnal",
  IoT: "Proyek IoT",
  Multimedia: "Desain & Multimedia",
};

function getCategoryStyle(category?: string): string {
  if (!category) return "bg-muted text-muted-foreground border-border";
  const key = Object.keys(CATEGORY_BADGE).find(k => k.toLowerCase() === category.toLowerCase());
  return key ? CATEGORY_BADGE[key] : "bg-muted text-muted-foreground border-border";
}

function getCategoryLabel(category?: string): string {
  if (!category) return "";
  const key = Object.keys(CATEGORY_LABEL).find(k => k.toLowerCase() === category.toLowerCase());
  return key ? CATEGORY_LABEL[key] : category;
}

export function NeobrutalismProjectCard({ project }: { project: ProjectData }) {
  return (
    <div 
      onClick={(e) => {
        // Find if the click is on an anchor or button inside
        const target = e.target as HTMLElement;
        if (!target.closest('a') && !target.closest('button')) {
          window.location.href = `/project/${project.id}`;
        }
      }}
      className="card-3d bg-card border-4 border-border rounded-3xl overflow-hidden h-full flex flex-col group relative cursor-pointer"
    >
      <div className="flex flex-col flex-1">
        {/* Cover Image / Placeholder */}
        <div className="relative w-full aspect-video bg-muted border-b-4 border-border overflow-hidden">
          {project.cover_image ? (
            <img
              src={project.cover_image}
              alt={project.title}
              className="w-full h-full object-contain bg-muted dark:bg-card p-2 group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <ProjectCoverPlaceholder
              id={project.id}
              title={project.title}
              category={project.category}
            />
          )}

          {/* Category badge overlaid on cover */}
          {project.category && (
            <div className="absolute top-3 left-3 z-10">
              <span
                className={`font-black text-[10px] px-2.5 py-1 rounded-xl border-2 uppercase tracking-wide shadow-sm ${getCategoryStyle(project.category)}`}
              >
                {getCategoryLabel(project.category)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-5 pt-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-black text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
              {project.title}
            </h3>
            {project.status === "pending" ? (
              <span className="shrink-0 bg-blue-100 text-blue-800 border-2 border-blue-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg whitespace-nowrap">
                Menunggu (Baru)
              </span>
            ) : project.pending_edits ? (
              <span className="shrink-0 bg-yellow-100 text-yellow-800 border-2 border-yellow-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg whitespace-nowrap">
                Menunggu (Edit)
              </span>
            ) : project.status === "rejected" ? (
              <span className="shrink-0 bg-red-100 text-red-800 border-2 border-red-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg whitespace-nowrap">
                Ditolak
              </span>
            ) : null}
          </div>
          <p className="text-sm font-medium text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">
            {project.description}
          </p>

          {/* Tech Stack */}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tech_stack.slice(0, 4).map((tech, i) => (
                <span key={i} className="px-2 py-0.5 bg-muted border-2 border-border rounded-lg text-[10px] font-black text-foreground">
                  {tech}
                </span>
              ))}
              {project.tech_stack.length > 4 && (
                <span className="px-2 py-0.5 bg-muted border-2 border-border rounded-lg text-[10px] font-black text-muted-foreground">
                  +{project.tech_stack.length - 4} lagi
                </span>
              )}
            </div>
          )}
        </div>
        {/* Footer: Stats + Links */}
        <div className="px-5 pb-5 mt-auto">
          <div className="flex items-center justify-between pt-3 border-t-2 border-border/50">
          {/* Stats */}
          <div className="flex gap-3 text-muted-foreground font-bold text-xs">
            <div className="flex items-center gap-1 hover:text-red-500 transition-colors">
              <FiHeart size={12} />
              <span>{project.likes_count || 0}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-primary transition-colors">
              <FiEye size={12} />
              <span>{project.views_count || 0}</span>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex gap-1.5">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-muted border-2 border-border flex items-center justify-center text-foreground hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_var(--color-border)] hover:bg-[#24292e] hover:text-white hover:border-[#24292e] transition-all"
                title="Source Code"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                <FiGithub size={13} />
              </a>
            )}
            {project.demo_url ? (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-primary text-white border-2 border-border flex items-center justify-center hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_var(--color-border)] transition-all"
                title="Demo Langsung"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                <FiExternalLink size={13} />
              </a>
            ) : (
              <Link
                href={`/project/${project.id}`}
                className="w-8 h-8 rounded-xl bg-primary text-white border-2 border-border flex items-center justify-center hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_var(--color-border)] transition-all"
                title="Lihat Detail"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                <FiExternalLink size={13} />
              </Link>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
