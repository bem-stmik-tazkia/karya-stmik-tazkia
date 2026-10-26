"use client";

import React from "react";
import Link from "next/link";
import { Folder } from "lucide-react";
import { NeobrutalismProjectCard, type ProjectData } from "./NeobrutalismProjectCard";

interface DashboardProjectsSectionProps {
  projects: ProjectData[];
  filteredProjects: ProjectData[];
  categories: string[];
  activeCategory: string;
  isOwnProfile: boolean;
  authorProfile?: any;
  onCategoryChange: (cat: string) => void;
}

export function DashboardProjectsSection({
  projects,
  filteredProjects,
  categories,
  activeCategory,
  isOwnProfile,
  authorProfile,
  onCategoryChange,
}: DashboardProjectsSectionProps) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            Portofolio Karya
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            <span>{isOwnProfile ? "Karya Saya" : "Daftar Karya"}</span>
            <span className="text-sm text-muted-foreground font-normal">
              ({projects.length})
            </span>
          </h2>
        </div>
        {isOwnProfile && (
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-[#ea580c] shadow-xs hover:shadow-md hover:shadow-orange-500/20 transition-all self-start sm:self-auto"
          >
            Upload Karya Baru
          </Link>
        )}
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-primary text-white shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
          <Folder className="w-12 h-12 mx-auto mb-3 opacity-30 text-primary" />
          <p className="text-sm font-medium">
            {activeCategory === "Semua"
              ? "Belum ada karya yang diunggah."
              : `Tidak ada karya dalam kategori "${activeCategory}".`}
          </p>
          {isOwnProfile && (
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-[#ea580c] transition-colors"
            >
              Upload Karya Pertama
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <NeobrutalismProjectCard
              key={project.id}
              project={project}
              authorProfile={authorProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

