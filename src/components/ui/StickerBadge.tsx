import * as React from "react";
import { cn } from "@/lib/utils";

export interface StickerBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "accent";
  icon?: React.ReactNode;
}

export const StickerBadge = React.forwardRef<HTMLSpanElement, StickerBadgeProps>(
  ({ className, variant = "default", icon, children, ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground border-primary-shadow",
      success: "bg-green-500 text-white border-green-700",
      warning: "bg-accent text-accent-foreground border-accent-shadow",
      destructive: "bg-red-500 text-white border-red-700",
      accent: "bg-secondary text-secondary-foreground border-secondary-shadow",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-bold border-2 shadow-[0_2px_0_0_currentColor] -rotate-2 hover:rotate-0 transition-transform",
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
