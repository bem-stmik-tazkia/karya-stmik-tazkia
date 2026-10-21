"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BellRing } from "lucide-react";

export function AnnouncementBanner() {
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState("");
  const [version, setVersion] = useState("v1.0.0");
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetch("/api/announcement")
      .then((res) => res.json())
      .then((data) => {
        if (data.active && data.message) {
          const dismissedMessage = localStorage.getItem("dismissed_announcement");
          // Jika pesan berbeda dari yang didismiss, tampilkan lagi
          if (dismissedMessage !== data.message) {
            setActive(true);
            setMessage(data.message);
            setVersion(data.version || "v1.0.0");
            setIsVisible(true);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("dismissed_announcement", message);
    // Beri waktu animasi selesai sebelum menghapus dari DOM (ditangani oleh AnimatePresence)
    setTimeout(() => setActive(false), 300);
  };

  if (loading || !active) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-gradient-to-r from-[#091530] via-[#0F2559] to-[#091530] text-white relative overflow-hidden z-50 shadow-[0_2px_16px_rgba(255,138,43,0.18)]"
        >
          {/* Subtle Orange Laser Accent Line at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF8A2B] to-transparent opacity-90" />

          {/* Centered Content Container */}
          <div className="max-w-[1200px] mx-auto px-8 sm:px-12 py-2 relative flex items-center justify-center">
            {/* Center Content: Pill + Message */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 min-w-0 max-w-full text-center">
              {/* Vibrant Glowing Beacon Pill */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF8A2B] to-[#EA580C] text-white font-mono text-[10px] font-black tracking-wide shrink-0 shadow-sm shadow-orange-500/40 ring-1 ring-white/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                {version}
              </span>

              {/* Message */}
              <p className="font-semibold text-[11px] sm:text-xs text-white/95 dark:text-[#F2F5FA] truncate leading-tight tracking-tight drop-shadow-xs">
                {message}
              </p>
            </div>

            {/* Dismiss Button pinned to the right edge */}
            <button
              onClick={handleDismiss}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0 cursor-pointer"
              aria-label="Tutup pemberitahuan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

