"use client";

import React from "react";
import Link from "next/link";
import { Folder, Eye, Heart, ExternalLink } from "lucide-react";
import type { Karya } from "@/types/karya";
import { KARYA_CATEGORIES } from "@/types/karya";
import { ProjectCoverPlaceholder } from "@/components/ui/ProjectCoverPlaceholder";
import { getTechTagColor } from "@/utils/techTagColor";

function getCategoryLabel(category?: string): string {
  if (!category) return "";
  const found = KARYA_CATEGORIES.find(
    (c) =>
      c.value.toLowerCase() === category.toLowerCase() ||
      c.label.toLowerCase() === category.toLowerCase()
  );
  return found ? found.label : category;
}

function getCategoryBadgeClass(category?: string): string {
  const cat = (category || "").toLowerCase();
  if (cat === "research" || cat.includes("riset") || cat.includes("jurnal")) {
    return "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-600";
  }
  if (cat === "technology" || cat.includes("web")) {
    return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600";
  }
  if (cat === "programming" || cat.includes("mobile") || cat.includes("apps")) {
    return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600";
  }
  if (cat === "iot") {
    return "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600";
  }
  if (cat === "multimedia" || cat.includes("desain")) {
    return "bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-600";
  }
  return "bg-primary/10 text-primary border-primary/20";
}

interface MahasiswaDrawerProjectsProps {
  projects: Karya[];
  onClose: () => void;
}

export const MahasiswaDrawerProjects: React.FC<MahasiswaDrawerProjectsProps> = ({
  projects,
  onClose,
}) => {
  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Folder className="w-4 h-4 text-primary" /> Karya ({projects.length})
        </h3>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-3">
          {projects.map((proj) => (
            <Link
              href={`/project/${proj.id}`}
              onClick={onClose}
              key={proj.id}
              className="block bg-card p-3.5 rounded-xl border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 flex gap-3.5 group items-center shadow-xs"
            >
              {proj.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={proj.image_url}
                  alt={proj.title}
                  className="w-18 h-18 object-cover rounded-lg border border-border shrink-0"
                />
              ) : (
                <div className="w-18 h-18 rounded-lg border border-border shrink-0 bg-muted overflow-hidden">
                  <ProjectCoverPlaceholder id={proj.id} title={proj.title} category={proj.category} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs ${getCategoryBadgeClass(proj.category)}`}>
                    {getCategoryLabel(proj.category)}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {proj.title}
                </h4>
                <p className="text-xs font-normal text-muted-foreground line-clamp-1 mt-0.5">
                  {proj.description}
                </p>
                {proj.tech_stack && proj.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {proj.tech_stack.slice(0, 4).map((tech, idx) => {
                      const colorClass = getTechTagColor(tech);
                      return (
                        <span
                          key={`${tech}-${idx}`}
                          className={`text-[9.5px] font-medium px-2 py-0.5 rounded-full border transition-all shadow-2xs ${colorClass}`}
                        >
                          {tech}
                        </span>
                      );
                    })}
                    {proj.tech_stack.length > 4 && (
                      <span
                        title={proj.tech_stack.slice(4).join(", ")}
                        className="text-[9.5px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-mono shadow-2xs"
                      >
                        +{proj.tech_stack.length - 4}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-2 text-[10px] font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-muted-foreground" /> {proj.views ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-500" /> {proj.likes ?? 0}
                  </span>
                  <span className="ml-auto flex items-center gap-0.5 text-primary font-semibold group-hover:underline">
                    Detail <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-muted/50 rounded-xl border border-dashed border-border">
          <p className="text-xs font-normal text-muted-foreground">Belum ada karya yang diunggah.</p>
        </div>
      )}
    </div>
  );
};

