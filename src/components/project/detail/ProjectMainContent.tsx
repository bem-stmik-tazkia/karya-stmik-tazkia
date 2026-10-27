"use client";

import React from "react";
import { motion } from "framer-motion";
import { Code, Share2, Eye } from "lucide-react";
import type { Karya } from "@/types/karya";
import { getTechIconUrl, TechIcon } from "../techIcons";

interface ProjectMainContentProps {
  karya: Karya;
  isResearch: boolean;
  linkConfig: { label: string; icon: React.ReactNode };
  onShare: () => void;
  onSelectImage: (imgUrl: string) => void;
}

export default function ProjectMainContent({
  karya,
  isResearch,
  linkConfig,
  onShare,
  onSelectImage,
}: ProjectMainContentProps) {
  const features = karya.features ?? [];
  const gallery = karya.gallery ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-card border border-border shadow-xs rounded-2xl p-6 sm:p-8"
    >
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
        {karya.title}
      </h1>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        {karya.live_url && (
          <a
            href={karya.live_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-[#ea580c] shadow-xs hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            {linkConfig.icon}
            <span>{linkConfig.label}</span>
          </a>
        )}
        {karya.github_url && (
          <a
            href={karya.github_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-card border border-border text-foreground font-semibold text-sm hover:bg-muted hover:border-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-xs"
          >
            <Code className="w-4 h-4 text-primary" />
            <span>Repositori GitHub</span>
          </a>
        )}
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-muted/60 border border-border text-muted-foreground hover:text-foreground font-semibold text-sm hover:bg-muted hover:border-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-xs cursor-pointer"
          title="Bagikan link karya"
        >
          <Share2 className="w-4 h-4" />
          <span>Bagikan</span>
        </button>
      </div>

      {/* Description */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-primary block shrink-0" />
          {isResearch ? "Abstrak Riset" : "Deskripsi Proyek"}
        </h2>
        <p className="leading-relaxed text-muted-foreground text-sm sm:text-base font-normal whitespace-pre-wrap">
          {karya.description}
        </p>
      </div>

      {/* Tech Stack */}
      {(karya.tech_stack ?? []).length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <h2 className="text-base sm:text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-primary block shrink-0" />
            {isResearch ? "Metodologi & Tools" : "Tools & Teknologi"}
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {(karya.tech_stack ?? []).map((tech) => {
              const iconUrl = getTechIconUrl(tech);
              const isSimple = iconUrl?.startsWith("https://cdn.simpleicons.org") ?? false;
              return (
                <div
                  key={tech}
                  className="flex items-center gap-2 rounded-lg bg-muted/60 border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-muted transition-all"
                >
                  {iconUrl ? (
                    <TechIcon url={iconUrl} tech={tech} isSimple={isSimple} />
                  ) : (
                    <Code className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                  <span>{tech}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Features / Temuan */}
      {features.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <h2 className="text-base sm:text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-primary block shrink-0" />
            {isResearch ? "Poin Penemuan" : "Fitur Utama"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {features.map((feat: any, i: number) => (
              <div
                key={i}
                className="bg-muted/40 rounded-xl p-4 border border-border/80 hover:border-primary/40 transition-all"
              >
                <div className="w-6 h-6 rounded-md bg-primary/10 text-primary font-bold text-xs flex items-center justify-center mb-2.5">
                  {i + 1}
                </div>
                <h4 className={`font-semibold text-foreground text-sm ${(feat.description || feat.desc) ? "mb-1" : ""}`}>
                  {feat.title || "Poin"}
                </h4>
                {(feat.description || feat.desc) && (
                  <p className="text-xs text-muted-foreground font-normal leading-relaxed">
                    {feat.description || feat.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery & Documentation */}
      {gallery.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <h2 className="text-base sm:text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-primary block shrink-0" />
            Dokumentasi &amp; Galeri
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gallery.map((item: any, i: number) => {
              const imgUrl = typeof item === "string" ? item : item.url;
              return (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border border-border bg-muted group hover:border-primary/40 transition-all"
                >
                  <button
                    type="button"
                    onClick={() => onSelectImage(imgUrl)}
                    className="overflow-hidden relative w-full block text-left outline-none cursor-zoom-in"
                  >
                    <img
                      src={imgUrl}
                      alt={
                        typeof item === "object" && item.caption
                          ? item.caption
                          : `Dokumentasi ${i + 1}`
                      }
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center pointer-events-none">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 backdrop-blur-sm rounded-full p-2.5 shadow-sm">
                        <Eye className="text-foreground w-4 h-4" />
                      </div>
                    </div>
                  </button>
                  {typeof item === "object" && item.caption && (
                    <div className="p-3 bg-card border-t border-border">
                      <p className="text-xs text-muted-foreground">{item.caption}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

