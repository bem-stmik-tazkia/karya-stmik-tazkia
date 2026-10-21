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
        className="flex items-center bg-rose-500/10 border border-rose-500/30 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg overflow-hidden cursor-default transition-all duration-200"
      >
        <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400">
          <AlertTriangle className="w-4 h-4 animate-pulse shrink-0" />
          <span className="font-semibold text-xs tracking-wide">
            Mode Bypass
          </span>
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.button
              initial={{ width: 0, opacity: 0, marginLeft: 0 }}
              animate={{ width: "auto", opacity: 1, marginLeft: 10 }}
              exit={{ width: 0, opacity: 0, marginLeft: 0 }}
              onClick={handleRemoveBypass}
              className="flex items-center gap-1.5 bg-rose-600 text-white px-2.5 py-1 rounded-full font-medium text-xs hover:bg-rose-700 transition-colors whitespace-nowrap shadow-xs"
            >
              <LogOut className="w-3 h-3" />
              <span>Matikan</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
