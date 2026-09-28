"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BypassIndicator() {
  const [isBypassActive, setIsBypassActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Cek apakah cookie maintenance_bypass ada
    const hasBypass = document.cookie.includes("maintenance_bypass=");
    setIsBypassActive(hasBypass);
  }, []);

  const handleRemoveBypass = async () => {
    await fetch("/api/maintenance/bypass", {
      method: "DELETE",
    });
    // Hapus dari state dan reload halaman
    setIsBypassActive(false);
    window.location.reload();
  };

  if (!isBypassActive) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999]">
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="flex items-center bg-destructive/10 border-2 border-destructive backdrop-blur-md px-4 py-2 rounded-2xl shadow-[4px_4px_0px_var(--color-destructive)] overflow-hidden cursor-default transition-all duration-300"
      >
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          <span className="font-black text-xs uppercase tracking-wider">
            Mode Bypass
          </span>
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.button
              initial={{ width: 0, opacity: 0, marginLeft: 0 }}
              animate={{ width: "auto", opacity: 1, marginLeft: 12 }}
              exit={{ width: 0, opacity: 0, marginLeft: 0 }}
              onClick={handleRemoveBypass}
              className="flex items-center gap-1.5 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase hover:bg-destructive/90 transition-colors whitespace-nowrap"
            >
              <LogOut className="w-3 h-3" />
              Matikan
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
