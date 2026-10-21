"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import confetti from "canvas-confetti";

interface LikeButtonProps {
  id: string;
  initialLiked: boolean;
  likesCount: number;
  onToggle: (e: React.MouseEvent, id: string) => Promise<void> | void;
  size?: "sm" | "md" | "lg";
  className?: string;
  showCount?: boolean;
}

export function LikeButton({
  id,
  initialLiked,
  likesCount,
  onToggle,
  size = "md",
  className = "",
  showCount = true,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [count, setCount] = useState(likesCount);
  const [isPopping, setIsPopping] = useState(false);

  // Sync with prop changes if parent updates
  React.useEffect(() => {
    setIsLiked(initialLiked);
  }, [initialLiked]);

  React.useEffect(() => {
    setCount(likesCount);
  }, [likesCount]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));

    if (nextLiked) {
      setIsPopping(true);

      // Trigger micro particle burst around the button
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      try {
        confetti({
          particleCount: 16,
          spread: 45,
          startVelocity: 14,
          ticks: 40,
          origin: { x, y },
          colors: ["#f97316", "#fb923c", "#ea580c", "#ef4444", "#f43f5e"],
          disableForReducedMotion: true,
          scalar: 0.7,
        });
      } catch {
        // Safe fallback if canvas is not ready
      }

      setTimeout(() => setIsPopping(false), 500);
    }

    try {
      await onToggle(e, id);
    } catch {
      // Revert if failed
      setIsLiked(!nextLiked);
      setCount((prev) => Math.max(0, prev + (nextLiked ? -1 : 1)));
    }
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isLiked ? "Batal menyukai karya ini" : "Sukai karya ini"}
      aria-pressed={isLiked}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isLiked
          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
          : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
      } ${className}`}
    >
      <motion.div
        animate={
          isPopping
            ? {
                scale: [1, 1.45, 0.85, 1.15, 1],
                rotate: [0, -12, 12, -6, 0],
              }
            : { scale: 1 }
        }
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative flex items-center justify-center shrink-0"
      >
        <Heart
          className={`${iconSizes[size]} transition-colors duration-200 ${
            isLiked
              ? "fill-rose-500 text-rose-500 stroke-rose-500"
              : "text-current"
          }`}
        />
      </motion.div>

      {showCount && (
        <span className="font-mono text-xs tabular-nums font-semibold tracking-tight">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={count}
              initial={{ y: isLiked ? 6 : -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: isLiked ? -6 : 6, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="inline-block"
            >
              {count}
            </motion.span>
          </AnimatePresence>
        </span>
      )}
    </button>
  );
}

