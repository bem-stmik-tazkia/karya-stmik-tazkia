"use client";

import React from "react";
import Link from "next/link";
import { FiGithub, FiExternalLink, FiHeart, FiEye, FiFolder } from "react-icons/fi";

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
  likes_count?: number;
  views_count?: number;
}

export function NeobrutalismProjectCard({ project }: { project: ProjectData }) {
  return (
    <div className="card-3d bg-card border-4 border-border rounded-3xl overflow-hidden h-full flex flex-col group relative">
      {/* Category Badge */}
      {project.category && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-primary text-white font-black text-xs px-3 py-1.5 rounded-xl border-2 border-border shadow-[2px_2px_0px_var(--color-border)] uppercase tracking-wide">
            {project.category}
          </span>
        </div>
      )}

      {/* Cover Image */}
      <div className="relative w-full aspect-video bg-muted border-b-4 border-border overflow-hidden">
        {project.cover_image ? (
          <img
            src={project.cover_image}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 group-hover:scale-105 transition-transform duration-500">
            <FiFolder size={64} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-black text-xl text-foreground line-clamp-1 mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-sm font-bold text-muted-foreground line-clamp-2 mb-4 flex-1">
          {project.description}
        </p>

        {/* Tech Stack */}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {project.tech_stack.slice(0, 4).map((tech, i) => (
              <span key={i} className="px-2 py-1 bg-surface-variant border-2 border-border rounded-lg text-[10px] font-black text-foreground">
                {tech}
              </span>
            ))}
            {project.tech_stack.length > 4 && (
              <span className="px-2 py-1 bg-muted border-2 border-border rounded-lg text-[10px] font-black text-muted-foreground">
                +{project.tech_stack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t-4 border-border/30 mt-auto">
          {/* Stats */}
          <div className="flex gap-3 text-muted-foreground font-black text-xs">
            <div className="flex items-center gap-1 hover:text-red-500 transition-colors">
              <FiHeart size={14} />
              <span>{project.likes_count || 0}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-primary transition-colors">
              <FiEye size={14} />
              <span>{project.views_count || 0}</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-2">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-card border-2 border-border flex items-center justify-center text-foreground hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_var(--color-border)] transition-all"
                title="Lihat Source Code"
              >
                <FiGithub size={14} />
              </a>
            )}
            {project.demo_url ? (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-primary text-white border-2 border-border flex items-center justify-center hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_var(--color-border)] transition-all"
                title="Lihat Demo"
              >
                <FiExternalLink size={14} />
              </a>
            ) : (
              // Link to detail page if no direct demo, or just use detail page link
              <Link
                href={`/karya/${project.id}`}
                className="w-8 h-8 rounded-xl bg-primary text-white border-2 border-border flex items-center justify-center hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_var(--color-border)] transition-all"
                title="Lihat Detail"
              >
                <FiExternalLink size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
