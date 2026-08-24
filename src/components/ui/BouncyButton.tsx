import * as React from "react";
import { cn } from "@/lib/utils";

export interface BouncyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "muted";
}

export const BouncyButton = React.forwardRef<HTMLButtonElement, BouncyButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "btn-3d px-6 py-3 rounded-2xl font-bold text-lg inline-flex items-center justify-center",
          {
            "btn-3d-primary": variant === "primary",
            "btn-3d-secondary": variant === "secondary",
            "btn-3d-muted": variant === "muted",
          },
          className
        )}
        {...props}
      />
    );
  }
);
BouncyButton.displayName = "BouncyButton";
