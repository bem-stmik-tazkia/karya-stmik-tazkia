"use client";

import React from "react";
import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import type { Karya } from "@/types/karya";
import { KARYA_CATEGORIES } from "@/types/karya";
import { formatNumber } from "@/lib/data";
import { ProjectCoverPlaceholder } from "@/components/ui/ProjectCoverPlaceholder";

interface RelatedProjectsSectionProps {
  relatedKarya: Karya[];
  category: string;
  categoryLabel: string;
}

export default function RelatedProjectsSection({
  relatedKarya,
  category,
  categoryLabel,
}: RelatedProjectsSectionProps) {
  if (relatedKarya.length === 0) return null;

  return (
    <div className="mt-16 pt-10 border-t border-border">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            Karya Terkait
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Karya {categoryLabel} Lainnya
          </h2>
        </div>
        <Link
          href={`/explore?category=${category}`}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Lihat Kategori →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedKarya.map((k) => (
          <div key={k.id}>
            <Link href={`/project/${k.id}`} className="block h-full group">
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-xl hover:shadow-orange-500/5 hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full">
                <div className="aspect-[16/10] w-full overflow-hidden relative bg-muted">
                  {k.image_url ? (
                    <img
                      src={k.image_url}
                      alt={k.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <ProjectCoverPlaceholder id={k.id} title={k.title} />
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-background/85 backdrop-blur-md text-foreground border border-border/50 shadow-xs">
                      {KARYA_CATEGORIES.find((c) => c.value === k.category)?.label ?? k.category}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1.5">
                      {k.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                      {k.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                      <Eye className="w-3.5 h-3.5" />
                      {formatNumber(k.views ?? 0)}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500/20" />
                      {formatNumber(k.likes ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

