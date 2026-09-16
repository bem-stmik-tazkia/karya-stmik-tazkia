import React from "react";
import { SkeletonProfileHeader, SkeletonProjectCard, SkeletonFeedPost, SkeletonBlock } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8 relative animate-in fade-in duration-500">
      <SkeletonProfileHeader />

      {/* Tabs Skeleton */}
      <div className="flex justify-center border-b-4 border-border mb-8">
        <div className="flex gap-4">
          <SkeletonBlock className="w-32 h-12 rounded-t-xl border-t-4 border-l-4 border-r-4 border-border bg-card" />
          <SkeletonBlock className="w-32 h-12 rounded-t-xl border-t-2 border-l-2 border-r-2 border-border bg-muted/30 opacity-50" />
          <SkeletonBlock className="w-32 h-12 rounded-t-xl border-t-2 border-l-2 border-r-2 border-border bg-muted/30 opacity-50" />
        </div>
      </div>

      {/* Karya Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <SkeletonProjectCard key={i} />
        ))}
      </div>
    </div>
  );
}
