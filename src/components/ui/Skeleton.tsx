"use client";

import React from "react";
import { cn } from "@/lib/utils";

// 1. Basic Skeleton Block (untuk text, avatar kecil, dll)
export function SkeletonBlock({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// 2. Skeleton khusus untuk Project Card (Explore, Dashboard, dll)
export function SkeletonProjectCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "card-3d overflow-hidden flex flex-col h-full bg-card rounded-3xl border-4 border-border",
        className
      )}
    >
      {/* Thumbnail Area */}
      <div className="aspect-[16/10] w-full relative border-b-4 border-border bg-muted/80 overflow-hidden">
        <SkeletonBlock className="absolute inset-0 rounded-none bg-muted/50" />
        
        {/* Skeleton Badge Kategori */}
        <div className="absolute top-3 right-3">
          <SkeletonBlock className="w-20 h-6 rounded-full border-2 border-border shadow-[2px_2px_0px_rgba(0,0,0,0.3)] bg-primary/20" />
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-5 flex flex-col gap-3">
        {/* Title */}
        <SkeletonBlock className="h-6 w-3/4 rounded-lg bg-muted/70" />
        
        {/* Description Lines */}
        <div className="space-y-2 mt-1">
          <SkeletonBlock className="h-3 w-full rounded bg-muted/50" />
          <SkeletonBlock className="h-3 w-5/6 rounded bg-muted/50" />
        </div>
        
        {/* Author Info */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t-2 border-border/50">
          <SkeletonBlock className="w-6 h-6 rounded-full border-2 border-border bg-secondary/30 shrink-0" />
          <SkeletonBlock className="h-3 w-1/3 rounded bg-muted/70" />
        </div>
      </div>
    </div>
  );
}

// 3. Skeleton khusus untuk Feed Post
export function SkeletonFeedPost({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card border-4 border-border shadow-[4px_4px_0px_var(--color-border)] rounded-[2rem] p-5 sm:p-6 mb-6", className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="w-12 h-12 rounded-xl border-2 border-border bg-secondary/20 shrink-0" />
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-32 rounded bg-muted/70" />
            <SkeletonBlock className="h-3 w-20 rounded bg-muted/50" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        <SkeletonBlock className="h-4 w-full rounded bg-muted/60" />
        <SkeletonBlock className="h-4 w-11/12 rounded bg-muted/60" />
        <SkeletonBlock className="h-4 w-4/5 rounded bg-muted/60" />
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-5">
        <SkeletonBlock className="h-6 w-16 rounded-lg bg-primary/20" />
        <SkeletonBlock className="h-6 w-20 rounded-lg bg-primary/20" />
        <SkeletonBlock className="h-6 w-14 rounded-lg bg-primary/20" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 pt-4 border-t-2 border-border/50">
        <SkeletonBlock className="h-8 w-24 rounded-xl bg-muted/50 border-2 border-border/50" />
        <SkeletonBlock className="h-8 w-24 rounded-xl bg-muted/50 border-2 border-border/50" />
      </div>
    </div>
  );
}

// 4. Skeleton untuk Dashboard Profile Header
export function SkeletonProfileHeader({ className }: { className?: string }) {
  return (
    <div className={cn("mb-12", className)}>
      {/* Cover/Banner */}
      <div className="h-32 sm:h-48 md:h-64 bg-primary/10 rounded-3xl border-4 border-border shadow-[4px_4px_0px_var(--color-border)] relative mb-16 overflow-hidden">
        <SkeletonBlock className="absolute inset-0 bg-primary/20 rounded-none" />
        {/* Avatar */}
        <div className="absolute -bottom-12 left-6 sm:left-10">
          <SkeletonBlock className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] border-4 border-border bg-card shadow-[4px_4px_0px_var(--color-border)]" />
        </div>
      </div>
      
      {/* Profile Info */}
      <div className="px-6 sm:px-10 mt-16 space-y-4 max-w-2xl">
        <SkeletonBlock className="h-8 sm:h-10 w-2/3 rounded-xl bg-muted/80" />
        <SkeletonBlock className="h-4 w-1/2 rounded-md bg-muted/60" />
        <div className="flex gap-3 pt-2">
          <SkeletonBlock className="h-6 w-24 rounded-lg bg-secondary/20" />
          <SkeletonBlock className="h-6 w-24 rounded-lg bg-secondary/20" />
        </div>
      </div>
    </div>
  );
}

// 5. Skeleton Form (untuk halaman Submit Form / Edit)
export function SkeletonForm({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card border-4 border-border rounded-3xl shadow-[8px_8px_0px_var(--color-border)] p-6 md:p-8 space-y-8", className)}>
      <SkeletonBlock className="h-6 w-48 rounded-lg bg-muted/80 mb-4" />
      <div className="space-y-6">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-32 rounded bg-muted/60" />
          <SkeletonBlock className="h-12 w-full rounded-xl bg-muted/40 border-2 border-border" />
        </div>
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-40 rounded bg-muted/60" />
          <SkeletonBlock className="h-32 w-full rounded-xl bg-muted/40 border-2 border-border" />
        </div>
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-36 rounded bg-muted/60" />
          <SkeletonBlock className="h-12 w-full rounded-xl bg-muted/40 border-2 border-border" />
        </div>
      </div>
    </div>
  );
}
