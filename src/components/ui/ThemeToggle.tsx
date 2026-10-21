"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center opacity-70 pointer-events-none"
        aria-label="Toggle theme"
      >
        <span className="w-4 h-4 rounded-full bg-muted-foreground/30 animate-pulse" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      whileTap={{ scale: 0.8, rotate: 180 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 relative flex items-center justify-center cursor-pointer shadow-2xs group"
      aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      title={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500 group-hover:rotate-45" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-[#FF8A2B] group-hover:-rotate-12" />
      <span className="sr-only">Toggle theme</span>
    </motion.button>
  );
}
