import * as React from "react";
import { cn } from "@/lib/utils";

export interface StickerBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "accent";
  icon?: React.ReactNode;
}

export const StickerBadge = React.forwardRef<HTMLSpanElement, StickerBadgeProps>(
  ({ className, variant = "default", icon, children, ...props }, ref) => {
    const variants = {
      default: "bg-primary/10 text-primary border border-primary/20",
      success: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
      warning: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
      destructive: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
      accent: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors",
          variants[variant],
          className
        )}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </span>
    );
  }
);
StickerBadge.displayName = "StickerBadge";
