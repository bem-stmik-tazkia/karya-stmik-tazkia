import React from "react";
import { SkeletonProjectCard, SkeletonBlock } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden bg-muted/30 pt-32 pb-20 border-b-4 border-border">
        <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
          <SkeletonBlock className="h-16 w-3/4 max-w-3xl rounded-2xl mb-6 bg-primary/20" />
          <SkeletonBlock className="h-6 w-5/6 max-w-2xl rounded-lg mb-4 bg-muted/60" />
          <SkeletonBlock className="h-6 w-2/3 max-w-xl rounded-lg mb-10 bg-muted/60" />
          
          <div className="flex gap-4">
            <SkeletonBlock className="h-14 w-40 rounded-xl border-2 border-border bg-primary/30" />
            <SkeletonBlock className="h-14 w-40 rounded-xl border-2 border-border bg-muted/50" />
          </div>
        </div>
      </div>

      {/* Stats Section Skeleton */}
      <div className="container mx-auto px-4 -mt-10 relative z-20 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card border-4 border-border rounded-2xl shadow-[4px_4px_0px_var(--color-border)] p-6 flex flex-col items-center">
              <SkeletonBlock className="w-10 h-10 rounded-xl bg-secondary/20 mb-3" />
              <SkeletonBlock className="h-8 w-16 rounded-lg bg-muted/80 mb-2" />
              <SkeletonBlock className="h-4 w-24 rounded bg-muted/50" />
            </div>
          ))}
        </div>
      </div>

      {/* Featured Projects Skeleton */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <SkeletonBlock className="h-10 w-64 rounded-xl bg-muted/80 mb-2" />
            <SkeletonBlock className="h-4 w-48 rounded bg-muted/50" />
          </div>
          <SkeletonBlock className="h-10 w-32 rounded-xl border-2 border-border hidden sm:block bg-muted" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <SkeletonProjectCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
